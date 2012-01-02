// ===================================================
// ===================================================
// = Instasoda client library
// = > requires jQuery 1.7+
// = > requires Backbone.js
// = > requires Mustache.js
// ===================================================
// ===================================================

var IS;
$(document).ready(function () {
    IS = new function () {

        // ===================================================
        // ===================================================
        // = Settings
        // ===================================================
        // ===================================================

        var sApi = "http://www.instasoda.com/api/";
        var sApiPhotos = "http://www.instasoda.com/api/photos/";
        jQuery.support.cors = true;
        Backbone.emulateHTTP = true;


        // ===================================================
        // ===================================================
        // = Models
        // ===================================================
        // ===================================================

        var User = Backbone.Model.extend({
            defaults: {
                username: 'new user'
            },
            url: sApi + 'user.php',
        });


        // ===================================================
        // ===================================================
        // = Views
        // ===================================================
        // ===================================================

        var UserSettingsView = Backbone.View.extend({
            
            events: {
                'click #saveProfileButton': 'save',
                'click #addPhoto': 'addPhoto',
                'click .userPicture': 'viewPhoto'
            },

            initialize: function (options) {
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.render();
            },

            render: function () {
                var template = $('#tplSettings').html();
                WinJS.Utilities.setInnerHTMLUnsafe(this.el, Mustache.to_html(template, this.model.toJSON()));

                // temp hardcoded UI manipulation:
                if (this.model.get('photos') != null && this.model.get('photos') != "") {
                    var images = this.model.get('photos').split(',');
                    for (var i = 0; i < (images.length - 1); i++) {
                        $('#userPictures').append("<li class='userPicture' data-filename='" + sApiPhotos + images[i] + "'><img src='" + sApiPhotos + images[i] + "' height=100></li>");
                    }
                }
                if (this.model.get('interestedInMen') == '1') {
                    $('input[name=interestedInMen]').prop("checked", true);
                }
                if (this.model.get('interestedInWomen') == '1') {
                    $('input[name=interestedInWomen]').prop("checked", true);
                }

                return this;
            },

            viewPhoto: function() {
                var filename = $(e.currentTarget).data("filename");
            },

            save: function () {
                // fetch form data
                var userData = {
                    'username': $('#settings input[name=username]').val(),
                    'aboutMe': $('#settings #aboutMe').html(),
                    'interestedInMen': (($('#settings input[name=interestedInMen]:checked').length > 0) ? true : false),
                    'interestedInWomen': (($('#settings input[name=interestedInWomen]:checked').length > 0) ? true : false)
                }

                this.model.set(userData);
                this.model.save(
                    {
                        error: function (model, response) {
                            //TODO: properly handle errors
                            //callback(false, "Ajax error: " + response.status);
                        }
                    },
                    {
                        success: function (model, response) {
                            // SUCCESS
                            if (response.status == "success") {
                                saveLocally("user", user);
                                $('#saveProfileButton').fadeIn();
                                $('#working').fadeOut();
                            }
                            // FAIL
                            else {
                                //callback(false, response.status);
                            }
                        }
                    }
                );
            },

            addPhoto: function () {
                var fbThirdPartyId = this.model.get('fbThirdPartyId');
                var that = this;

                // create a FileOpenPicker object for the image file picker button
                var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
                openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail; //show images in thumbnail mode
                openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary; // start browsing in My Pictures library
                openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]); // show only image files
                openPicker.pickSingleFileAsync().then(function (file) {
                    // Ensure picked file is valid and usable
                    if (file) {
                        // append picture in the page
                        //$('#userPictures').append('<li class="userPicture"><img height=100 src="' + URL.createObjectURL(file) + '"></li>');
                        
                        // upload the image
                        file.openAsync(Windows.Storage.FileAccessMode.read).then(function (stream) {
                            var blob = msWWA.createBlobFromRandomAccessStream(file.contentType, stream);
                            var xhr = new XMLHttpRequest();
                            xhr.open('POST', sApi + 'photo.php?a=1&token=' + fbThirdPartyId + '&t=' + file.fileType, true);
                            xhr.onload = function (e) {
                                var imageData = JSON.parse(e.currentTarget.response);
                                that.model.set(imageData);
                                that.model.save(
                                    {
                                        error: function (model, response) {
                                            //TODO: properly handle errors
                                            //callback(false, "Ajax error: " + response.status);
                                        }
                                    },
                                    {
                                        success: function (model, response) {
                                            // SUCCESS
                                            if (response.status == "success") {
                                                saveLocally("user", user);
                                                $('#saveProfileButton').fadeIn();
                                                $('#working').fadeOut();
                                            }
                                            // FAIL
                                            else {
                                                //callback(false, response.status);
                                            }
                                        }
                                    }
                                );
                            };
                            xhr.send(blob);
                        });                        
                    } else {
                        // File not valid
                        $('#userPictures').append("error");
                    }
                });
            }
        });


        // ===================================================
        // ===================================================
        // = Private methods
        // ===================================================
        // ===================================================

        /**
            * Store data locally, using one of the following methods:
            * 1. localStorage
            * 2. local DB
            * 3. Cookies
            * @param {String} varName
            * @param {Object} data
            * @return {Bool} success
            */
        var saveLocally = function (sVarName, jData) {
            if (!!window.localStorage) {
                window.localStorage.setItem(sVarName, JSON.stringify(jData));
                return true;
            } else {
                //TODO: alternative storage solution, when localStorage is not available
                throw("Local storage is not available");
            }
        }

        /**
            * Update data that have been saved locally.
            * @param {String} varName
            * @return {Object} object
            */
        var readLocally = function (sVarName) {
            if (!!window.localStorage) {
                //if (typeof window.localStorage.sVarName !== 'undefined') {
                    return JSON.parse(window.localStorage.getItem(sVarName));
                //}
            } else {
                //TODO: alternative storage solution, when localStorage is not available
                throw("Local storage is not available");
            }
        }


        // ===================================================
        // ===================================================
        // = Private variables
        // ===================================================
        // ===================================================

        var isLoggedIn = false;
        var activityFeedPage = 0;

        // models
        var user = new User();

        // views
        var userSettingsView = new UserSettingsView({
            model: user,
            el: $('#settings')[0]
        });


        // ===================================================
        // ===================================================
        // = Public methods
        // ===================================================
        // ===================================================

        /**
            * Create a new user account by connecting to Facebook.
            * @param {Integer} package 1=basic, 2=standard, 3=complete
            * @param {String} facebookToken
            * @param {Function} callback
            * @return {Object} Returns an object {'s': 'success/fail'}
            */
        this.createAccount = function (iPackage, sFacebookToken, callback) {

            user.set({
                'package': iPackage,
                'fbToken': sFacebookToken
            });

            user.save(
                {
                    error: function (model, response) {
                        //TODO: properly handle errors
                        callback(false, "Ajax error: " + response.status);
                    }
                },
                {
                    success: function (model, response) {
                        // SUCCESS
                        if (response.status == "success") {
                            user.set({ loggedIn: '1' });
                            // store the user details locally
                            saveLocally("user", user);
                            // callback success
                            callback(true, "success");
                        }
                        // FAIL
                        else {
                            callback(false, response.status);
                        }
                    }
                }
            );
        }

        /**
            * Update user's data.
            * @param {Object} jUserData the data to update
            * @param {Function} callback
            * @return {Object} Returns an object {'s': 'success/fail'}
            */
        this.updateUserData = function (jUserData, callback) {

            user.set(jUserData);

            user.save(
            {
                error: function (model, response) {
                    //TODO: properly handle errors
                    callback(false, "Ajax error: " + response.status);
                }
            },
            {
                success: function (model, response) {
                    // SUCCESS
                    if (response.status == "success") {
                        // store the user details locally
                        saveLocally("user", user);
                        // callback success
                        callback(true, "success");
                    }
                    // FAIL
                    else {
                        callback(false, response.status);
                    }
                }
            }
            );
        }

        /**
            * Attempts to log the user into the system.
            * If it fails, it means that the user need to register a new account.
            * @return {Bool} true/false
            */
        this.login = function () {
            // first check if the user is already logged in
            if (user.get('loggedIn') == '1') {
                return true;
            } else {
                //try to read locally saved data to read the login status
                user.set(readLocally("user"));

                if (user.get('loggedIn') == "1") {
                    return true;
                } else {
                    // connect to the API server and login the user
                    user.fetch(
                    {
                        error: function (model, response) {
                            //TODO: properly handle errors
                            //a false might only mean that the API server is N/A
                            return false;
                        }
                    },
                    {
                        success: function (model, response) {
                            // SUCCESS
                            if (response.status == "success") {
                                user.set({ loggedIn: '1' });
                                saveLocally("user", user);
                                return true;
                            }
                            // FAIL
                            else {
                                return false;
                            }
                        }
                    }
                        );
                }
            }
        }

        /**
            * Logs the user out of the system.
            * @return {Bool} true/false
            */
        this.logout = function () {
            if (user.get('loggedIn') == '1') {
                user.set({ loggedIn: '0' });
            }
            return true;
        }

        /**
            * Verifies that the user has completed the registration
            * process successfully, and has a complete account.
            * @return {Bool} true/false
            */
        this.accountIsComplete = function () {
            return false;
        }


    }
});