(function () {
    'use strict';

    // Custom event raised after the fragment is appended to the DOM.
    WinJS.Application.addEventListener('fragmentappended', function handler(e) {
        if (e.location === '/html/homePage.html') { fragmentLoad(e.fragment, e.state); }
    });

    function fragmentLoad(elements, options) {
        WinJS.UI.processAll(elements)
            .then(function () {
                // TODO: Initialize the fragment here.
            });
    }

    WinJS.Namespace.define('homePage', {
        fragmentLoad: fragmentLoad,
    });
})();


$(document).ready(function () {

    if (IS.isLoggedIn()) {
        $('.homePage').hide();

        //TODO: goto dashboard
    }

    var iPackage = 0;
    var scope1 = "email,user_relationships,user_location,user_hometown,user_birthday";
    var scope2 = scope1 + ",user_activities,user_education_history,read_stream,user_interests,user_likes,user_photos";
    var scope3 = scope2 + ",sms,offline_access,user_videos";

    $('#register1').click(function () {
        iPackage = 1;
        launchFacebookWebAuth(scope1);
    });
    $('#register2').click(function () {
        iPackage = 2;
        launchFacebookWebAuth(scope2);
    });
    $('#register3').click(function () {
        iPackage = 3;
        launchFacebookWebAuth(scope3);
    });

    function launchFacebookWebAuth(scope) {
        var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=";
        var clientID = "159444727449256";
        var callbackURL = "https://www.facebook.com/connect/login_success.html";
        facebookURL += clientID + "&redirect_uri=" + encodeURIComponent(callbackURL) +
 "&scope=" + scope +"&display=popup&response_type=token";

        try {
            var startURI = new Windows.Foundation.Uri(facebookURL);
            var endURI = new Windows.Foundation.Uri(callbackURL);

            Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
			Windows.Security.Authentication.Web.WebAuthenticationOptions.default,
			startURI,
			endURI).then(callbackFacebookWebAuth, callbackFacebookWebAuthError);
        }
        catch (err) {	/*Error launching WebAuth"*/	return; }
    }

    function callbackFacebookWebAuth(result) {
        var FacebookReturnedToken = result.responseData;
        var response = "Status returned by WebAuth broker: " + result.responseStatus + "\r\n";
        if (result.responseStatus == 2) {
            response += "Error returned: " + result.responseErrorDetail + "\r\n";
            $('#fbResponse').html("<strong>Oh snap! An error occured :( Try again please.</strong>");
        } else if (result.responseStatus == 0) {
            //success
            //IS.createAccount(iPackage, FacebookReturnedToken);
            sToken = getParameterByName("access_token", FacebookReturnedToken);
            $('#fbResponse').html(FacebookReturnedToken + " <br><br> >>> " + sToken);
        }
    }

    function callbackFacebookWebAuthError(err) {
        var error = "Error returned by WebAuth broker. Error Number: " + err.number + " Error Message: " + err.message + "\r\n";
    }

    function getParameterByName(sParam, FacebookReturnedToken) {

        var match = RegExp('[#&]' + sParam + '=([^&]*)')
                    .exec(FacebookReturnedToken);

        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));

    }


});