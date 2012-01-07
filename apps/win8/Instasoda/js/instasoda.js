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

            var sApi = "http://instasoda.com/api/";
            var sApiPhotos = "http://instasoda.com/api/photos/";
            jQuery.support.cors = true;
            Backbone.emulateHTTP = true;


        // ===================================================
        // ===================================================
        // = Models
        // ===================================================
        // ===================================================

            // User - the person using the app
            var User = Backbone.Model.extend({
                defaults: {
                    username: 'new user',
                    picsCount: 0
                },
                url: sApi + 'user.php'
            });

            // Users - all other Instasoda users
            var Users = Backbone.Model.extend({ });


        // ===================================================
        // ===================================================
        // = Collections
        // ===================================================
        // ===================================================

            // UsersCollection - a collection of Users
            var UsersCollection = Backbone.Collection.extend({
                url: sApi + 'users.php'
            });


        // ===================================================
        // ===================================================
        // = Views
        // ===================================================
        // ===================================================

            // UserSettingsView - the settings page of the person using the app
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
                    var i = 0;

                        // enable clicking on photos to view them
                        if (this.model.get('photos') != null && this.model.get('photos') != "") {
                            var images = this.model.get('photos').split(',');
                            for (i; i < (images.length - 1); i++) {
                                $('#userPictures').append("<li class='userPicture' data-filename='" + sApiPhotos + images[i] + "'><img src='" + sApiPhotos + images[i] + "' height=150></li>");
                            }
                        }

                        // check the men/women checkboxes if needed
                        if (this.model.get('interestedInMen') == '1') {
                            $('input[name=interestedInMen]').prop("checked", true);
                        }
                        if (this.model.get('interestedInWomen') == '1') {
                            $('input[name=interestedInWomen]').prop("checked", true);
                        }

                    // update picsCount
                    this.model.set({ picsCount: i });

                    return this;
                },

                viewPhoto: function(e) {
                    var filename = $(e.currentTarget).data("filename");

                    //TODO: convert the following code into a template
                    $('#photoView').html('<div class="isColumn1 isRow1"><img src="' + filename + '"></div>');
                    IS.navigateTo('#photoView', 'Photo');
                    $('#photoView').one('click', function () {
                        IS.navigateTo('#settings', 'My profile');
                    });
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
                            //$('#userPictures').append('<li class="userPicture"><img height=150 src="' + URL.createObjectURL(file) + '"></li>');
                        
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

            // UsersView - a basic view of a user appearing in the search results / matches
            var UsersView = Backbone.View.extend({
                className: 'userPreview',
                events: {
                    "click a": "clicked"
                },

                clicked: function (e) {
                    e.preventDefault();
                    var name = this.model.get("name");
                    //alert(name);
                },

                render: function () {
                    var template = $('#tplUsersView').html();
                    WinJS.Utilities.setInnerHTMLUnsafe(this.el, Mustache.to_html(template, this.model.toJSON()));
                }
            });

            // UsersListView - contains a list of UsersView items, used for search results / matches
            var UsersListView = Backbone.View.extend({
                initialize: function () {
                    _.bindAll(this);
                    this.collection.bind('reset', this.render);
                    //this.render();
                },

                renderItem: function (model) {
                    var usersView = new UsersView({ model: model });
                    usersView.render();
                    //WinJS.Utilities.setInnerHTMLUnsafe(this.el, $(usersView.el).html());
                    $(this.el).append(usersView.el);
                },

                render: function () {
                    //this.collection.each(this.renderItem);
                    this.collection.each(function (a, b, c) {
                        //parse photos string and convert it to json
                        var imagesArray = new Array();
                        if (a.get('photos') != "" && a.get('photos') != null) {
                            var images = a.get('photos').split(',');
                            for (var i = 0; i < (images.length - 1); i++) {
                                imagesArray[i] = sApiPhotos + images[i];

                                // set 'main' photo
                                if (i === 0) a.set({ 'profilePhoto': sApiPhotos + images[i] });
                            }
                        }
                        a.set({ 'photosArray': imagesArray });
                        //a.renderItem;
                    });
                    this.collection.each(this.renderItem);
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

            // Backbone models
            var user = new User();
            var users = new Users();

            // Backbone collections
            var usersCollection = new UsersCollection({
                model: users
            });

            // Backbone views
                // profile page
                var userSettingsView = new UserSettingsView({
                    model: user,
                    el: $('#settings')[0]
                });
                // search results
                var usersListView = new UsersListView({
                    collection: usersCollection,
                    el: $('#searchResults')[0]
                });

        // test
                usersCollection.fetch({
                    success: function (e) {
                        var asd = e;
                    },
                    error: function (e, a, b) {
                        var asd = e;
                    }

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

            /**
            * Navigates to a new page
            * @param {String} page the new page to display (.class or #id)
            * @param {String} title title of the new page
            */
            this.navigateTo = function (page, title) {

                // find visible section(s)
                oldPage = $('section[role=main]').filter(':visible');
                newPage = $(page);

                // hide the visible section(s) and animate in the new one
                oldPage.addClass('isAnimated hasEasing isNotVisible subtractLeftMargin');
                setTimeout(function () {
                    // hide old page
                    oldPage.hide()
                              .removeClass('isAnimated hasEasing isNotVisible subtractLeftMargin');

                    // show new page
                    newPage.addClass('addLeftMargin isNotVisible')
                             .addClass('isAnimated hasEasing')
                             .show()
                             .removeClass('addLeftMargin isNotVisible')
                             .removeClass('isAnimated hasEasing');
                }, 500);

                // set new page title
                $('header[role=banner] .titleArea > h1').fadeOut(200, function () {
                    $(this).text(title).fadeIn(200);
                });
            }


            /**
            * Returns the value of a user attribute
            * @param {String} attr the attribute to return
            * @return {String} the value of the attribute
            */
            this.getUserAttr = function (attr) {
                return user.get(attr);
            }
    }
});