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

        var sApi = "http://localhost:8080/api/";
        var sApiPhotos = "http://localhost:8080/api/photos/";
        var sApiSecretKey = "aG35svDHJURCG35253dCFDC69fvsf3fhg0f";
        var sApiSecretKeyGet = "?skey=" + sApiSecretKey;
        jQuery.support.cors = true;
        //Backbone.emulateHTTP = true;


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
            url: sApi + 'users/' + this.id + sApiSecretKeyGet
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
            url: sApi + 'users/all' + sApiSecretKeyGet
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
                $(this.el).html(Mustache.to_html(template, this.model.toJSON()));

                // temp hardcoded UI manipulation:
                var i = 0;

                // add photos
                if (this.model.get('photos') != null && this.model.get('photos') != "") {
                    var images = this.model.get('photos').split(',');
                    for (i; i < (images.length - 1); i++) {
                        $('#userPictures').append("<li class='userPicture' data-filename='" + sApiPhotos + images[i] + "' data-filenameshort='" + images[i] + "'><img src='" + sApiPhotos + images[i] + "' height=150></li>");
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

                // resize containers
                calculateLikesAndPicsDimensions(this.model.get('fbLikesCount'), this.model.get('picsCount'));

                return this;
            },

            viewPhoto: function(e) {
                var filename = $(e.currentTarget).data('filename');

                //TODO: convert the following code into a template
                $('#photoView').html('<div class="isColumn1 isRow1"><button onclick="IS.deletePhoto(\'' + $(e.currentTarget).data('filenameshort') + '\');">Delete photo</button><br /><img src="' + filename + '"></div>');
                IS.navigateTo('#photoView', 'Photo');
                $('#photoView img').one('click', function () {
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
                            xhr.open('POST', sApi + 'photo.php?a=1&token=' + fbThirdPartyId + '&t=' + file.fileType + '&skey=' + sApiSecretKey, true);
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
                        //$('#userPictures').append("error");
                    }
                });
            }
        });

        // UsersView - a basic view of a user appearing in the search results / matches
        var UsersView = Backbone.View.extend({
            className: 'userPreview',
            tagName: 'li',
            events: {
                "click .userPreviewPhoto": "viewProfile"
            },

            viewProfile: function (e) {
                //$('#usersProfile').html(Mustache.to_html(template, this.model.toJSON()));

                var usersFullView = new UsersFullView({
                    model: this.model,
                    el: $('#usersProfile')[0]
                });
                usersFullView.render();
                IS.navigateTo('#usersProfile', this.model.get('username') + "'s profile");
            },

            render: function () {
                var template = $('#tplUsersPreview').html();
                $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
            }
        });

        // UsersFullView - a complete view of a user's profile
        var UsersFullView = Backbone.View.extend({
            events: {
                'click .userPicture': 'viewPhoto'
            },

            initialize: function () {
                _.bindAll(this);
                this.model.bind('change', this.render);

                // set model interestedIn
                if (this.model.get('interestedInMen') == '1' && this.model.get('interestedInWomen') != '1') {
                    this.model.set({ 'interestedIn': 'Men' });
                } else if (this.model.get('interestedInMen') == '1' && this.model.get('interestedInWomen') == '1') {
                    this.model.set({ 'interestedIn': 'Men & Women' });
                } else if (this.model.get('interestedInMen') != '1' && this.model.get('interestedInWomen') == '1') {
                    this.model.set({ 'interestedIn': 'Women' });
                } else {
                    this.model.set({ 'interestedIn': 'No preference' });
                }
            },

            viewPhoto: function (e) {
                var filename = $(e.currentTarget).data("filename");

                //TODO: convert the following code into a template
                var that = this;
                $('#photoView').html('<div class="isColumn1 isRow1"><img src="' + filename + '"></div>');
                IS.navigateTo('#photoView', this.model.get('username') + "'s photo");
                /*$('#photoView').one('click', function () {
                    IS.navigateTo('#usersProfile', that.model.get('username') + "'s profile");
                    //IS.navigateBack();
                });*/
            },

            render: function () {
                // update template
                var template = $('#tplUsersProfile').html();
                WinJS.Utilities.setInnerHTMLUnsafe(this.el, Mustache.to_html(template, this.model.toJSON()));


                // temp hardcoded UI manipulation:
                var i = 0;

                // add photos
                if (this.model.get('photos') != null && this.model.get('photos') != "") {
                    var images = this.model.get('photos').split(',');
                    for (i; i < (images.length - 1); i++) {
                        $('#userPhotos').append("<li class='userPicture' data-filename='" + sApiPhotos + images[i] + "'><img src='" + sApiPhotos + images[i] + "' height=150></li>");
                    }
                }

                // update picsCount
                this.model.set({ picsCount: i });

                // resize containers
                calculateLikesAndPicsDimensions(this.model.get('fbLikesCount'), this.model.get('picsCount'), true);
            }
        });

        // UsersListView - contains a list of UsersView items, used for search results / matches
        var UsersListView = Backbone.View.extend({
            initialize: function () {
                _.bindAll(this);
                this.collection.bind('reset', this.render);
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

        /**
        * Calculate width of Likes' and Pics' containers
        * @param {Integer} iLikesCount
        * @return {Integer} iPicsCount
        */
        var calculateLikesAndPicsDimensions = function (iLikesCount, iPicsCount, bOtherUserProfile) {
            var iWindowHeight = $(window).height();
            var iHeaderHeight = $(".homePage > header").height() + 60; // 60 is the top margin that we have to calculate too.

            if (!(iLikesCount > 0 && iPicsCount > 0)) {
                iLikesCount = user.get('fbLikesCount');
                iPicsCount = user.get('picsCount');
            }

            iMaxLikesRows = (iWindowHeight - iHeaderHeight) / 100;
            iLikesWrapperWidth = (iLikesCount / iMaxLikesRows) * 120;
            iMaxPicsRows = (iWindowHeight - iHeaderHeight) / 240;
            iPicsWrapperWidth = ((iPicsCount / iMaxPicsRows) * 240) + 116 + 62; //116 is the padding-right of the container - I have no idea why 62 is also needed!

            // The 720 below is the minimum width that each block (likes/profile pics) occupies
            // Doing this so we won't end up with a 1-pic-width / 1-like-width column if the profile pics are too few.
            if (bOtherUserProfile === true && iPicsWrapperWidth > 300) {
                $(".profilePicsDataSmall").css({ 'width': iPicsWrapperWidth + 'px' });
            } else if (iPicsWrapperWidth > 720) {
                $(".profilePicsData").css({ 'width': iPicsWrapperWidth + 'px' });
            }
            if (iLikesWrapperWidth > 720) {
                $(".facebookLikesData").css({ 'width': iLikesWrapperWidth + 'px' });
            }
        }


        /**
        * Calculate width of search results
        * @param {Integer} iProfileCount the number of users in the searc results
        */
        var calculateSearchResultsDimensions = function (iProfileCount) {
            var iWindowHeight = $(window).height();
            var iWindowWidth = $(window).width();
            var iHeaderHeight = $(".homePage > header").height() + 60; // 60 is the top margin that we have to calculate too.

            iMaxProfileRows = (iWindowHeight - iHeaderHeight) / 210;
            iProfilesWrapperWidth = (iProfileCount / iMaxProfileRows) * 350;

            // The 720 below is the minimum width that each block (likes/profile pics) occupies
            // Doing this so we won't end up with a 1-pic-width / 1-like-width column if the profile pics are too few.
            if (iProfilesWrapperWidth > 720) {
                if (iProfilesWrapperWidth < iWindowWidth) {
                    $("#searchResults").css({ 'width': iWindowWidth - 200 });
                } else {
                    $("#searchResults").css({ 'width': iProfilesWrapperWidth });
                }
            }
        }


        // ===================================================
        // ===================================================
        // = Private variables
        // ===================================================
        // ===================================================

        var isLoggedIn = false;
        var navHistoryPage = new Array();
        var navHistoryTitle = new Array();

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

        // Fetch all IS users
        usersCollection.fetch({
            success: function (e) {
                calculateSearchResultsDimensions(e.length);
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
        this.navigateBack = function () {
            if (navHistoryPage.length > 0) {
                IS.navigateTo(navHistoryPage.pop(), navHistoryTitle.pop(), false);
            }
        }

        /**
        * Navigates to a new page
        * @param {String} page the new page to display (.class or #id)
        * @param {String} title title of the new page
        */
        this.navigateTo = function (page, title, track) {
            var preDelay = 0;

            var oldPage = $('section[role=main]').filter(':visible');
            var newPage = $(page);

            // track nav history
            if (oldPage.attr('id') != 'photoView' && oldPage.attr('id') != 'registerAccount' && oldPage.attr('id') != null && track !== false && navHistoryPage[navHistoryPage.length - 1] != ('#' + oldPage.attr('id'))) {
                navHistoryPage.push('#' + oldPage.attr('id'));
                navHistoryTitle.push($('header[role=banner] .titleArea > h1').text());

                // show back button for the first time
                if (navHistoryPage.length === 1) $('#backButton').fadeIn();
            }

            // do UI pre-processing
            if (page == '#settings') {
                calculateLikesAndPicsDimensions();
                $('#saveProfileButton').show();
                $('#working').hide();
                $('#settings .facebookLikesData').removeClass('isAnimated').addClass('isNotVisible').hide().addClass('isAnimated');
                setTimeout(function () { $('#settings, .facebookLikesData').show().removeClass('isNotVisible') }, 1000);
            } else if (page == '#usersProfile') {
                $('#usersProfile .facebookLikesData').removeClass('isAnimated').addClass('isNotVisible').hide().addClass('isAnimated');
                setTimeout(function () { $('#usersProfile, .facebookLikesData').show().removeClass('isNotVisible') }, 1000);
            }
            if (oldPage.attr('id') == 'settings') {
                $('#settings .facebookLikesData').addClass('isNotVisible');
                setTimeout(function () { $('#settings .facebookLikesData').hide() }, 500);
                preDelay += 600;
            } else if (oldPage.attr('id') == 'usersProfile') {
                $('#usersProfile .facebookLikesData').addClass('isNotVisible');
                setTimeout(function () { $('#usersProfile .facebookLikesData').hide() }, 500);
                preDelay += 600;
            }

            // wait for preDelay and do the transition
            setTimeout(function() {
                // hide the visible section(s) and animate in the new one
                oldPage.addClass('isAnimated hasEasing isNotVisible subtractLeftMargin');
                setTimeout(function () {
                    // hide old page
                    oldPage.hide().removeClass('isAnimated hasEasing isNotVisible subtractLeftMargin');

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

                // update preDelay
                preDelay += 1100;

                // do UI post-processing after preDelay
                setTimeout(function () {
                    if (page == '#settings') {
                        $('#settings .facebookLikesData').removeClass('isNotVisible');
                    } else if (page == '#usersProfile') {
                        $('#usersProfile .facebookLikesData').removeClass('isNotVisible');
                    }
                }, preDelay);
            }, preDelay);
        }

        /**
        * Returns the value of a user attribute
        * @param {String} attr the attribute to return
        * @return {String} the value of the attribute
        */
        this.getUserAttr = function (attr) {
            return user.get(attr);
        }

        /**
        * Deletes a user photo
        * @param {String} photo
        */
        this.deletePhoto = function (imgFile) {
            var fbThirdPartyId = user.get('fbThirdPartyId');

            // split photos string to array and remove image
            var images = user.get('photos').split(',');
            var arrayPos = $.inArray(imgFile, images);
            if (arrayPos != -1) {
                images.splice(arrayPos, 1);
            }

            // rebuild string and save user
            var imgStr = "";
            for (var i = 0; i < (images.length - 1); i++) {
                imgStr += images[i] + ',';
            }
            user.set({ 'photos': imgStr });
            user.save(
                {
                    error: function (model, response) {
                        //TODO: properly handle errors
                        IS.navigateBack();
                    }
                },
                {
                    success: function (model, response) {
                        // SUCCESS
                        if (response.status == "success") {
                            saveLocally("user", user);
                            IS.navigateBack();
                        }
                        // FAIL
                        else {
                            //TODO: properly handle errors
                            IS.navigateBack();
                        }
                    }
                }
            );
        }
    }
});