/*
 * Copyright (c) 2010, HipSnip Ltd
 */
package com.hipsnip.plugins.facebook;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.Iterator;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Intent;
import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

import com.facebook.android.Facebook;
import com.facebook.android.AsyncFacebookRunner;
import com.facebook.android.Facebook.DialogListener;
import com.facebook.android.DialogError;
import com.facebook.android.FacebookError;
import com.facebook.android.Util;

public class FacebookAuth extends Plugin {

	private Facebook mFb;
	public String callback;
	public String[] permissions = new String[] {};

	/**
	 * Executes the request and returns PluginResult.
	 *
	 * @param action 		The action to execute.
	 * @param args 			JSONArry of arguments for the plugin.
	 * @param callbackId	The callback id used when calling back into JavaScript.
	 * @return 				A PluginResult object with a status and message.
	 */
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		callback = callbackId;
		System.out.println("execute: "+ action);

		String first;

		try {
			first = args.getString(0);
		} catch (JSONException e) {
			first = "";
			Log.w("PhoneGapLog", "No arguments in execute");
		}

		if (action.equals("authorize")) {
			this.authorize(first); // first arg is APP_ID
		} else if (action.equals("reauthorize")) {
			this.reauthorize(first); // first arg is APP_ID
		} else if (action.equals("request")) {
			this.getResponse(first); // first arg is path
		} else if (action.equals("getAccess")) {
			this.getAccess();
		} else if (action.equals("setPermissions")) {
			this.setPermissions(args);
		} else if (action.equals("logout")) {
			this.logout();
		} else if (action.equals("dialog")) {
			JSONObject params = null;
			try {
				params = args.getJSONObject(1);
			} catch (JSONException e) {
				params = new JSONObject();
			}
			
			this.dialog(first, params); // first arg is action
		} 

		PluginResult r = new PluginResult(PluginResult.Status.NO_RESULT);
		r.setKeepCallback(true);
		return r;
	}

	public void getAccess(){
		JSONObject json = new JSONObject();
		try {
			json.put("token", this.mFb.getAccessToken());
			json.put("expires", this.mFb.getAccessExpires());
		} catch (JSONException e) {
		}

		this.success(new PluginResult(PluginResult.Status.OK, json), this.callback);
	}
	
	public void onActivityResult(int requestCode, int resultCode, Intent intent) {
		this.mFb.authorizeCallback(requestCode, resultCode, intent);
		this.getResponse("me");
	}

	public void getResponse(final String path){
		Log.d("PhoneGapLog", "onActivityResult FacebookAuth");
		try {
			String response = this.mFb.request(path);
			JSONObject json = Util.parseJson(response);

			this.success(new PluginResult(PluginResult.Status.OK, json), this.callback);

		} catch (java.net.MalformedURLException e) {
			this.error(new PluginResult(PluginResult.Status.ERROR), this.callback);
		} catch (java.io.IOException e) {
			this.error(new PluginResult(PluginResult.Status.ERROR), this.callback);
		} catch (JSONException e) {
			Log.w("Facebook-Example", "JSON Error in response");
		} catch (FacebookError e) {
			Log.w("Facebook-Example", "Facebook Error: " + e.getMessage());
		}
	}
	/**
	 * Identifies if action to be executed returns a value and should be run synchronously.
	 *
	 * @param action	The action to execute
	 * @return			T=returns value
	 */
	public boolean isSynch(String action) {
		return false;
	}

	/**
	 * Called by AccelBroker when listener is to be shut down.
	 * Stop listener.
	 */
	public void onDestroy() {
	}

	//--------------------------------------------------------------------------
	// LOCAL METHODS
	//--------------------------------------------------------------------------

	/**
	 * Set the permissions we will request from Facebook
	 *
	 * @return				true if ok, or print a stack trace
	 */
	public void setPermissions(JSONArray args) {
		Log.d("PhoneGapLog", "setPermissions");
		permissions = new String[args.length()];
		for(int i = 0; i < args.length(); i++) {
			try {
				permissions[i] = args.getString(i);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		this.success(new PluginResult(PluginResult.Status.OK, true), this.callback);
	}
	
	public void logout() {
		Log.d("PhoneGapLog", "logout");
		final FacebookAuth fba = this;
		try {
			fba.mFb.logout(fba.ctx);
			SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(fba.ctx);
			prefs.edit().putLong("access_expires", -1).commit();
			prefs.edit().putString("access_token", null).commit();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		this.success(new PluginResult(PluginResult.Status.OK), this.callback);
	}

	/**
	 * Display a new browser with the specified URL.
	 *
	 * @return				"" if ok, or error message.
	 */
	public void authorize(final String appid) {
		Log.d("PhoneGapLog", "authorize");
		final FacebookAuth fba = this;
		Runnable runnable = new Runnable() {
			public void run() {
				if (fba.mFb == null) {
					fba.mFb = new Facebook(appid);
					fba.mFb.setPlugin(fba);
				}
				fba.mFb.authorize((Activity) fba.ctx, fba.permissions, new AuthorizeListener(fba));
			};
		};
		this.ctx.runOnUiThread(runnable);
	}
	
	/**
	 * Display a Facebook Dialog with specified action.
	 *
	 * @return				"" if ok, or error message.
	 */
	public void dialog(final String action, JSONObject parameters) {
		Log.d("PhoneGapLog", "authorize");
		final FacebookAuth fba = this;
		
		Bundle collect = new Bundle();
		Iterator<String> iter = parameters.keys();
		while (iter.hasNext()) {
			String key = iter.next();
			try {
				collect.putString(key, parameters.getString(key));
			} catch (JSONException e) {
				Log.w("PhoneGapLog", "Nonstring parameter provided to dialog discarded");
			}
		}
		
		final Bundle paramBundle = new Bundle(collect);
		Runnable runnable = new Runnable() {
			public void run() {
				fba.mFb.dialog(fba.ctx, action, paramBundle, new UIDialogListener(fba));
			};
		};
		this.ctx.runOnUiThread(runnable);
	}

	/**
	 * Validate an existing token and expiration, and use them for the Facebook
	 * session, rather than re-authenticating the app (which presents a rather
	 * user experience in mobile).
	 *
	 * @return				true if ok, or print a stack trace
	 */
	public void reauthorize(final String appid) {
		Log.d("PhoneGapLog", "reauthorize");
		final FacebookAuth fba = this;
		SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(fba.ctx);
		String access_token = prefs.getString("access_token", null);
		Long expires = prefs.getLong("access_expires", -1);

		if (fba.mFb == null) {
			fba.mFb = new Facebook(appid);
			fba.mFb.setPlugin(fba);
		}
		if (access_token != null && expires != -1) {
			fba.mFb.setAccessToken(access_token);
			fba.mFb.setAccessExpires(expires);
		}
		this.success(new PluginResult(PluginResult.Status.OK, fba.mFb.isSessionValid()), this.callback);
	}

	class AuthorizeListener implements DialogListener {
		final FacebookAuth fba;

		public AuthorizeListener(FacebookAuth fba){
			super();
			this.fba = fba;
		}

		public void onComplete(Bundle values) {
			//  Handle a successful login
			
			String token = this.fba.mFb.getAccessToken();
			long token_expires = this.fba.mFb.getAccessExpires();
			SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(this.fba.ctx);
			prefs.edit().putLong("access_expires", token_expires).commit();
			prefs.edit().putString("access_token", token).commit();

			Log.d("PhoneGapLog",values.toString());
			this.fba.getResponse("me");
		}

		public void onFacebookError(FacebookError e) {
			e.printStackTrace();
		}

		public void onError(DialogError e) {
			e.printStackTrace();
		}

		public void onCancel() {
		}
	}
	
	class UIDialogListener implements DialogListener {
		final FacebookAuth fba;

		public UIDialogListener(FacebookAuth fba){
			super();
			this.fba = fba;
		}

		public void onComplete(Bundle values) {
			//  Handle a successful dialog
			Log.d("PhoneGapLog",values.toString());
			this.fba.success(new PluginResult(PluginResult.Status.OK), this.fba.callback);
		}

		public void onFacebookError(FacebookError e) {
			e.printStackTrace();
		}

		public void onError(DialogError e) {
			e.printStackTrace();
		}

		public void onCancel() {
		}
	}


}
