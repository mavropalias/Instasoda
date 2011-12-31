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

    // =======================================
    // INIT APP
    // =======================================

        $('section[role="main"]').hide();

        if (IS.login()) {
            if (IS.accountIsComplete()) {
                $('#dashboard').show();
            } else {
                showSettingsPage();
            }
        } else {
            $('#registerAccount').show();
        }

    // =======================================
    // SETTINGS PAGE
    // =======================================

        function showSettingsPage() {

            // hide other pages
            $('section[role="main"]').hide();

            // show settings
            animateContentIn($('#settings'));
            $('#saveProfileButton').show();
            $('#working').hide();

            // create a FileOpenPicker object for the image file picker button
            var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
            openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail; //show images in thumbnail mode
            openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary; // start browsing in My Pictures library
            openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]); // show only image files
            
            // add click handler for the image file picker button
            $('#addPictures').click(function () {
                openPicker.pickSingleFileAsync().then(function (file) {
                    // Ensure picked file is valid and usable
                    if (file) {
                        // append picture in the page
                        
                        //$('#userPictures').append('<img scr="' + file.folderRelativeId + '\\' + file.fileName + '">' + file.folderRelativeId + '\\' + file.fileName);
                        //$('#userPictures').append('<img scr="' + URL.createObjectURL(file) + '">');
                        $('#userPictures').append('<li class="userPicture"><img height=100 src="' + URL.createObjectURL(file) + '"></li>');
                    } else {
                        // File not valid
                        $('#userPictures').append("error");
                    }
                });
            });

            // add click handler for the 'Save profile' button
            $('#saveProfileButton').click(function () {
                // fetch form data
                var userData = {
                    'username': $('#settings input[name=username]').val(),
                    'aboutMe': $('#settings #aboutMe').html(),
                    'interestedInMen': (($('#settings input[name=interestedInMen]:checked').length > 0) ? true : false),
                    'interestedInWomen': (($('#settings input[name=interestedInWomen]:checked').length > 0) ? true : false)
                }

                IS.updateUserData(userData, function (success, message) {
                    if (success) {
                        $('#saveProfileButton').fadeIn();
                        $('#working').fadeOut();
                    }
                    else {
                        $('#saveProfileButton').fadeIn();
                        $('#working').html(message);
                    }
                });
            });
        }


    // =======================================
    // REGISTER USER
    // =======================================

        var iPackage = 0;
        var scope1 = "email,user_relationships,user_location,user_hometown,user_birthday";
        var scope2 = scope1 + ",user_activities,user_education_history,read_stream,user_interests,user_likes,user_photos";
        var scope3 = scope2 + ",sms,offline_access,user_videos";

        $('#register1').click(function () {
            //iPackage = 1;
            //launchFacebookWebAuth(scope1);
            animateContentInOut($('#registerAccount'), $('#dashboard'))
        });
        $('#register2').click(function () {
            iPackage = 2;
            launchFacebookWebAuth(scope2);
        });
        $('#register3').click(function () {
            iPackage = 3;
            launchFacebookWebAuth(scope3);
        });

        function animateContentInOut(animateOut, animateIn) {
            animateOut.addClass('isAnimated hasEasing isNotVisible hasNoLeftPadding');
            setTimeout(function () {
                animateOut.hide()
                          .removeClass('isAnimated hasEasing isNotVisible hasNoLeftPadding');
                animateIn.addClass('addExtraLeftPadding isNotVisible')
                         .addClass('isAnimated hasEasing')
                         .show()
                         .removeClass('addExtraLeftPadding isNotVisible')
                         .removeClass('isAnimated hasEasing');
            }, 500);

           /* if (animateAfter != false) {
                animateAfter.hide()

                setTimeout(function () {
                    animateAfter.addClass('addExtraLeftPadding isNotVisible')
                                .addClass('isAnimated hasEasing')
                                .show()
                                .removeClass('addExtraLeftPadding isNotVisible')
                                .removeClass('isAnimated hasEasing')
                }, 1000)
            }*/
        }

        function animateContentIn(animateIn) {
            animateIn.addClass('addExtraLeftPadding isNotVisible')
                        .addClass('isAnimated hasEasing')
                        .show()
                        .removeClass('addExtraLeftPadding isNotVisible')
                        .removeClass('isAnimated hasEasing');
        }

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
                    animateContentInOut($('#registerAccount'), $('#settings'));
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
});