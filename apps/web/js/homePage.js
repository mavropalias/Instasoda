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
            $('nav a').show();
            $('nav #navRegister').hide();
            $('header[role=banner] h2').remove();
        } else {
            IS.navigateTo('#registerAccount', 'Welcome to Instasoda!')
        }


 

    // =======================================
    // REGISTER USER
    // =======================================

        var iPackage = 0;
        var scope = "email,user_relationships,user_location,user_hometown,user_birthday,user_activities,user_education_history,user_interests,user_likes,user_photos";

        $('#register1').click(function () {
            iPackage = 1;
            launchFacebookWebAuth(scope);
        });
        $('#register2').click(function () {
            iPackage = 2;
            launchFacebookWebAuth(scope);
        });

        function launchFacebookWebAuth(scope) {
          alert('asd');
           /* var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=";
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
            catch (err) {		return; }*/
        }

        function callbackFacebookWebAuth(result) {
            /*var FacebookReturnedToken = result.responseData;
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
                            $('#appbar button').show();
                            $('#appbar #navRegister').hide();
                            $('header[role=banner] h2').fadeOut();
                        } else {
                            $('#fbResponse').html("error: " + jData.status);
                        }
                    });
                    IS.navigateTo('#settings', 'My profile');
                } catch (e) {
                    $('#fbResponse').html("error:  " + e);
                }
            }*/
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

                // small easter egg :)
                if (ui.values[1] == 99) {
                    $("#ageNum").val(ui.values[0] + " - " + ui.values[1] + " years old (wow!)");
                }
            }
        });
        $("#ageNum").val($("#ageRange").slider("values", 0) + " - " + $("#ageRange").slider("values", 1) + " years old");

        $('#doSearch').click(function () {
            IS.navigateTo('#search', 'Search results');
        });

        $('#buttonAddLikes').click(function () {
            IS.navigateTo('#beta', 'Almost there!');
        });


    // =======================================
    // BACK BUTTON
    // =======================================

        $('#backButton').on('click', function (e) {
            IS.navigateBack();
        });
});