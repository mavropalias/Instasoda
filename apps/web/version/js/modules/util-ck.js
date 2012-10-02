/*
Functions overview
=================

> notify:
Create a toast notification

> handleFavourite:  
Add/remove a person to the user's favourites

> addOrRemoveLikeFromSearchOptions: 
Adds or removes a like from the user's search options

> addOrRemoveLikeAndRate: 
Adds or removes a like with a rating

> navigateTo: 
Navigates to a page

> prepareApp: 
Prepares App

> facebookAuth: 
Attempts to auth a FB user

> login: 
Attempts to log the user into the system

> createAccount: 
Create a new user account by connecting to Facebook

> logout: 
Logs the user out of the system & clears localStorage

> nullOrEmpty: 
Checks if a property is null, empty or undefined. If so, returns true

> saveUser: 
Saves the User model to the API

> getCommonLikes: 
Returns common likes between User and another user

> parseLikes: 
Parses a user's likes and extends model with favs, dislikes and categories

> setupPage: 
Do various admin tasks after loading a page

> showMetabar
Shows or hides the metabar

> setupUser: 
Sets user settings (username, sex prefs, etc)

> pageFlip: 
Creates a page flip animation between two containers

> l: 
Shortcut for console.log()

*//**
 * Create a toast notification.
 * @param {String} message
 */function l(e){console.log(e)}IS.notify=function(e,t,n){function i(e){$(".notification").length?$("body > .notification").each(function(){$(this).animate({top:"+=80px"},500,function(){s(e)})}):s(e)}function s(e){$(e).appendTo("body").fadeIn(200,"easeInOutQuint",function(){var e=$(this);e.addClass("active");setTimeout(function(){e.css({opacity:0,filter:"opacity(0)"}).delay(600).queue(function(){e.remove();$(this).dequeue()})},5e3)})}var r={title:e,subtitle:t,message:n};IS.notificationsArray.push(r);console.log("Pushed new notification");setTimeout(function(){var e=$("#tplNotification").html(),t=Mustache.to_html(e,IS.notificationsArray.shift());i(t)},3e3*IS.notificationsArray.length)};IS.handleFavourite=function(e,t,n){socket.emit("handleFavourite",{userId:user.get("_id"),userToFav:e,favType:n},function(r,i){if(!r)if(!user.get("favs")){user.set({favs:[e]});store.set("user",user);console.log("- added new user to favourites (first fav)")}else{var s=user.get("favs"),o=s.indexOf(e);if(n=="add"){s.push(e);user.set({favs:s});store.set("user",user);$("#handleFavourite").text("- Favourite");IS.notify("New favourite!",null,t+" added to your favourites.");console.log("- added new user to favourites")}else{s.splice(o,1);user.set({favs:s});store.set("user",user);$("#handleFavourite").text("+ Favourite");IS.notify("Removed favourite!",null,t+" removed from your favourites.");console.log("- removed user from favourites")}}else IS.notify(r,null,t+" could not be added to your favorites :(")})};IS.addOrRemoveLikeFromSearchOptions=function(e,t){var n=user.get("so").l?user.get("so").l:[];if(!_.any(n,function(t){return t._id==e})&&n.length<10){console.log(" - adding search like");n.push({_id:e,n:t});user.get("so").l=n;user.trigger("newSearchLike",e)}else if(!!user.get("so").l){console.log(" - removing search like");user.get("so").l=_.reject(user.get("so").l,function(t){return t._id==e});user.trigger("removedSearchLike",e)}};IS.addOrRemoveLikeAndRate=function(e,t,n,r,i){var s=user.get("l"),o=_.find(s,function(t){return t._id==e});if(!o){console.log(" - adding new like with rating of "+n);var a=new Date,f=a.getMonth()+1;f<10&&(f="0"+f);var l=a.getDate();l<10&&(l="0"+l);var c=a.getFullYear();s.push({_id:e.toString(),n:t,c:r,t:c+f+l,r:n});user.set("l",s);IS.saveUser();i()}else if(o.r!=n){console.log(" - changing like's rating to "+n);var u=_.reject(s,function(t){return t._id==e});o.r=n;u.push(o);user.set("l",u);IS.saveUser();i()}else{console.log(" - removing like");var u=_.reject(s,function(t){return t._id==e});user.set("l",u);IS.saveUser();i()}};IS.navigateTo=function(e){console.log("> navigateTo "+e);router.navigate(e,{trigger:!0,replace:!0})};IS.prepareApp=function(e,t){console.log("> Preparing app");if(e)IS.facebookAuth(function(e,n){if(!e){console.log("> Attempting to login the user");IS.login(IS.fbToken,n[0].third_party_id,function(e){if(!e){console.log("> SUCCESS! User is logged in");appReady=!0;IS.userIsOnline(!0);metabarView=new MetabarView({el:$("#metabar")[0],model:user});if(t)t();else{IS.navigateTo("");router.welcome()}}else{console.log("> FAIL: Need to create new account");IS.createAccount(IS.fbToken,n[0].third_party_id,function(e,t){if(!e){console.log("> SUCCESS! Account created");appReady=!0;IS.userIsOnline(!0);metabarView=new MetabarView({el:$("#metabar")[0],model:user});navigationView.render();IS.navigateTo("");router.welcome()}else{console.log("> ERROR: "+t);appReady=!1;IS.logout()}})}})}else{console.log("> User is not ready");appReady=!1;IS.logout()}});else if(!IS.nullOrEmpty(store.get("user"))){IS.fbToken=store.get("user").fTkn;IS.login(IS.fbToken,store.get("user")._id,function(e,n){if(!e){console.log("> SUCCESS! User is logged in");appReady=!0;IS.userIsOnline(!0);metabarView=new MetabarView({el:$("#metabar")[0],model:user});if(t)t();else{IS.navigateTo("");router.welcome()}}else{console.log("> FAIL: Need to create new account");IS.createAccount(IS.fbToken,n[0].third_party_id,function(e,t){if(!e){console.log("> SUCCESS! Account created");appReady=!0;IS.userIsOnline(!0);metabarView=new MetabarView({el:$("#metabar")[0],model:user});navigationView.render();IS.navigateTo("");router.welcome()}else{console.log("> ERROR: "+t);appReady=!1;IS.logout()}})}})}else t()};IS.facebookAuth=function(e){console.log("> Doing Facebook auth");FB.getLoginStatus(function(t){if(!t.authResponse)FB.login(function(t){IS.facebookAuth(e)},{scope:"email,user_relationships,user_location,user_hometown,user_birthday,user_activities,user_education_history,user_interests,user_likes,user_photos"});else if(t.status==="connected"){console.log("> User is logged into Facebook and has authenticated the application");IS.fbToken=t.authResponse.accessToken;IS.fbTokenExpires=t.authResponse.expiresIn;if(IS.fbTokenExpires>0){console.log("> Facebook token expires in "+IS.fbTokenExpires/60+" minutes");console.log(">   -> "+IS.fbToken);FB.api({method:"fql.query",query:"SELECT third_party_id FROM user WHERE uid=me()"},function(t){console.log("> Got user details from FB");e(null,t)})}else{console.log("- Facebook token has expired");FB.logout();e("Facebook token has expired")}}else if(t.status==="not_authorized"){console.log("> User is logged into Facebook but has not authenticated the application");e("User is logged into Facebook but has not authenticated the application")}else{console.log("> User is not logged into Facebook at this time");e("User is not logged into Facebook at this time")}})};IS.login=function(e,t,n){if(user.get("_id")){console.log("- user is logged in");n(null,"success")}else{console.log("- reading local storage");user.set(store.get("user"));if(user.get("_id")){console.log("- found user in local storage");user.fetch({data:{fTkn:e},error:function(e,t){console.log("- login error: "+t.error);alert("Could not sync your account from server!");IS.logout()},success:function(e,t){console.log("- got an API response");if(typeof e.attributes._id!="undefined"&&typeof t.error=="undefined"){store.set("user",user);navigationView.render()}else{console.log("- "+t.error);alert("Could not sync your account from server!");IS.logout()}}});user.set({fTkn:e});store.set("user",user);navigationView.render();n(null)}else{console.log("- trying the API: "+t);user.set({_id:t,fTkn:e});user.fetch({data:{fTkn:e},error:function(e,t){console.log("- login error: "+t.error);n(!0,t.error)},success:function(e,t){console.log("- got an API response");if(typeof e.attributes._id!="undefined"&&typeof t.error=="undefined"){store.set("user",user);navigationView.render();n(null,"success")}else{console.log("- "+t.error);n(!0,t.error)}}})}}};IS.createAccount=function(e,t,n){console.log("- creating account");user.set({_id:null,fTid:t,fTkn:e});user.save({error:function(e,t){console.log("- login error: "+t.error);n(!0,t.error)}},{success:function(e,t){console.log("- got an API response");if(typeof e.attributes._id!="undefined"&&typeof t.error=="undefined"){store.set("user",user);n(null,"success")}else{console.log("- "+t.error);n(!0,t.error)}}})};IS.userIsOnline=function(e){l("> Online status for user is: "+e);socket.emit("userIsOnline",{_id:user.get("_id"),fTkn:user.get("fTkn"),isOnline:e})};IS.logout=function(e){IS.userIsOnline(!1);user.clear({silent:!0});store.clear();navigationView.render();metabarView.render();appReady=!1;if(!e){router.navigate("",{trigger:!0});router.welcome()}};IS.nullOrEmpty=function(e){return typeof e=="undefined"?!0:e==""||e==null?!0:!1};IS.saveUser=function(){user.save();store.set("user",user)};IS.getCommonLikes=function(e){var t=_.pluck(user.get("l"),"_id");e=_.pluck(e,"_id");var n=_.intersection(t,e);return _.sortBy(_.map(n,function(e){var t=_.find(user.get("l"),function(t){return t._id==e});return t}),function(e){return e.r})};IS.parseLikes=function(e,t){var n=[],r=[],i=[],s=[],o=[],u=[];$.each(t,function(e,s){t[e].r===1?r.push(t[e]):t[e].r===2?n.push(t[e]):t[e].r===3&&i.push(t[e])});s=_.uniq(_.pluck(n,"c").sort(),!0);o=_.uniq(_.pluck(r,"c").sort(),!0);u=_.uniq(_.pluck(i,"c").sort(),!0);e.set({likeCategories:s});e.set({dislikeCategories:o});e.set({favsCategories:u});e.set({likeCategoriesCount:s.length});e.set({dislikeCategoriesCount:o.length});e.set({favsCategoriesCount:u.length});e.set({likes:n});e.set({dislikes:r});e.set({favourites:i});e.set({likesCount:n.length});e.set({dislikesCount:r.length});e.set({favouritesCount:i.length})};IS.setupPage=function(e){$("#content").attr("class",e);if(e!=="viewprofile"){$("nav a").removeClass("current");$("#nav_"+e).addClass("current")}IS.nullOrEmpty(user.get("_id"))||IS.setupUser();IS.nullOrEmpty(user.get("_id"))?IS.showMetabar(!1):IS.showMetabar(!0);var t=$("#content .mainContent");t.slimScroll({height:"100%",allowPageScroll:!1,alwaysVisible:!1,railVisible:!0,start:"top",size:"10px"})};IS.showMetabar=function(e){e?$("#metabar").addClass("visible"):$("#metabar").removeClass("visible")};IS.setupUser=function(e){var t=user.get("u"),n=user.get("m"),r=user.get("w"),i=user.get("ff"),s=user.get("fd");if(IS.nullOrEmpty(t)||IS.nullOrEmpty(i)&&IS.nullOrEmpty(s)||IS.nullOrEmpty(r)&&IS.nullOrEmpty(n)){IS.nullOrEmpty(t)?nextView=new SettingsUsernameView({model:user}):IS.nullOrEmpty(i)&&IS.nullOrEmpty(s)?nextView=new SettingsFindTypeView({model:user}):IS.nullOrEmpty(r)&&IS.nullOrEmpty(n)&&(nextView=new SettingsGenderPrefsView({model:user}));if(e){$(nextView.el).appendTo("body").show();setTimeout(function(){IS.pageFlip(e.$el,nextView.$el)},0)}else $(nextView.el).appendTo("body").fadeIn()}else if(e){$("<section/>",{id:"settingsDone"}).html($("#tplSettingsDone").html()).addClass("settings").appendTo("body");$("#settingsButtonDone").click(function(){IS.navigateTo("");router.welcome();$("#settingsDone").fadeOut(400,function(){$(this).remove()})});setTimeout(function(){IS.pageFlip(e.$el,$("#settingsDone"))},0)}};IS.pageFlip=function(e,t){var n=$(window).width();$("#tplPageFlipPlaceholder").clone().attr("id","pageFlipPlaceholder").appendTo("body");$(e).children().clone().appendTo("#pageFlipPlaceholder .pageA, #pageFlipPlaceholder .pageApartialInner");$(t).children().clone().appendTo("#pageFlipPlaceholder .pageB, #pageFlipPlaceholder .pageBpartialInner");$("#pageFlipPlaceholder .pageA").css({left:"-"+n/2+"px",width:n+"px"});$("#pageFlipPlaceholder .pageB").css({width:n+"px"});$("#pageFlipPlaceholder .pageA, #pageFlipPlaceholder .pageApartialInner, #pageFlipPlaceholder .pageB, #pageFlipPlaceholder .pageBpartialInner").children().show();$("#pageFlipPlaceholder").show();setTimeout(function(){$("#pageFlipPlaceholder .pageFlip").addClass("pageFlipped")},0);setTimeout(function(){$(e).css("z-index","998");$(t).css("z-index","999").show();$(e).remove();$("#pageFlipPlaceholder").remove()},1500)};