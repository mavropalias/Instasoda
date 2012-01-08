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
            $('section[role="main"]').hide();
        });
    }

    WinJS.Namespace.define('homePage', {
        fragmentLoad: fragmentLoad,
    });

})();


$(document).ready(function () {

    // =======================================
    // INIT APP
    // =======================================

        if (IS.login()) {
            if (IS.accountIsComplete()) {
                IS.navigateTo('#search', 'Search');
            } else {
                IS.navigateTo('#settings', 'My profile');
            }
        } else {
            IS.navigateTo('#registerAccount', 'Welcome to Instasoda!')
        }


    // =======================================
    // PUSH NOTIFICATIONS
    // =======================================

        // Initialize Push Notifications
        var pushNotifications = Windows.Networking.PushNotifications;
        var promise = pushNotifications.PushNotificationChannelManager.createPushNotificationChannelForApplicationAsync();

        // Callback to register the channel url
        promise.then(function (ch) {
            var uri = ch.uri;
            var expiry = ch.expirationTime;
            updateChannelUri(uri, expiry);
        });

        function updateChannelUri(channel, channelExpiration) {
            if (channel) {
                var serverUrl = "http://www.instasoda.com/api/notifications.php";
                var payload = {
                    Expiry: channelExpiration.toString(),
                    URI: channel
                };
                var xhr = new WinJS.xhr({
                    type: "POST",
                    url: serverUrl,
                    headers: { "Content-Type": "application/json; charset=urf-8" },
                    data: JSON.stringify(payload)
                }).then(function (req) {
                    storeServerUrl(serverUrl)
                    // Appending the response we got from the XHRequest to
                    // the .titleArea element to see what it is we got back!
                    // This is for testing purposes.
                    //$(".titleArea").text(req.response);
                });
            }
        }

        // Store the channel url
        function storeServerUrl(serverUrl) {
            var valueToStore = serverUrl;
            if (valueToStore !== "") {
                localStorage.setItem("serverUrl", valueToStore);
            }
        }

        // Retrieve channel url
        function retrieveServerUrl() {
            var storedValue = localStorage.getItem("serverUrl");
            if (storedValue && storedValue !== "") {
                id("serverUrlField").value = storedValue;
            }
        }


    // =======================================
    // REGISTER USER
    // =======================================

        var iPackage = 0;
        var scope1 = "email,user_relationships,user_location,user_hometown,user_birthday";
        var scope2 = scope1 + ",user_activities,user_education_history,read_stream,user_interests,user_likes,user_photos,offline_access";

        $('#register1').click(function () {
            iPackage = 1;
            launchFacebookWebAuth(scope1);
        });
        $('#register2').click(function () {
            iPackage = 2;
            launchFacebookWebAuth(scope2);
        });

        function launchFacebookWebAuth(scope) {
            var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=";
            var clientID = "159444727449256";
            var callbackURL = "https://www.facebook.com/connect/login_success.html";
            facebookURL += clientID + "&redirect_uri=" + encodeURIComponent(callbackURL) + "&scope=" + scope + "&display=popup&response_type=token";

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

                // success - the user has given permission and we now have a url with the token
                // parse token value from FacebookReturnedToken
                sToken = getParameterByName("access_token", FacebookReturnedToken);

                // create the user account
                try {
                    IS.createAccount(iPackage, sToken, function (success, jData) {
                        if (success) {
                            $('#saveProfileButton').fadeIn();
                            $('#working').fadeOut();
                        } else {
                            $('#fbResponse').html("error: " + jData.status);
                        }
                    });
                    IS.navigateTo('#settings', 'My profile');
                } catch (e) {
                    $('#fbResponse').html("error:  " + e);
                }
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

    // =======================================
    // SEARCH FILTER
    // =======================================
        $("#ageRange").slider({
            range: true,
            min: 18,
            max: 99,
            values: [26, 91],
            slide: function (event, ui) {
                $("#ageNum").val(ui.values[0] + " - " + ui.values[1] + " years old");
            }
        });
        $("#ageNum").val($("#ageRange").slider("values", 0) + " - " + $("#ageRange").slider("values", 1) + " years old");

        $('#doSearch').click(function () {
            IS.navigateTo('#search', 'Search results');
        });
});