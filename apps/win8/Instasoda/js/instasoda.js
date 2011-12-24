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
            tagName: 'div',
            id: 'userSettingsView2',
            initialize: function (options) {
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.render();
            },
            render: function () {
                //TODO: render view template
                //$(this.el).html(this.template(this.model.toJSON()));
                //$('#userSettingsView').html(this.model.toJSON());
                //$(this.el).html(this.model.get('username'));
                //this.el.innerHTML = this.model.get('username') + "<br>" + this.model.get('gender') + "<br>" + this.model.get('age') + "<br>" + this.model.get('fbLocation');
                //$('#settings').html(this.el);

                var template = $('#tplSettings').html();
                $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
                $('#settings').html(this.el);
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
                window.localStorage.sVarName = JSON.stringify(jData);
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
                if (typeof window.localStorage.sVarName !== 'undefined') {
                    return JSON.parse(window.localStorage.sVarName);
                }
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