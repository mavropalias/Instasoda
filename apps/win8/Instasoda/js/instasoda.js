// ===================================================
// ===================================================
// = Instasoda client library
// = > requires jQuery 1.7+
// = > requires Backbone.js
// = > requires Mustache.js
// ===================================================
// ===================================================

var IS = new function () {

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
            initialize: function(options) {
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.render();
            },
            render: function () {
                //TODO: render view template
                //$(this.el).html(this.template(this.model.toJSON()));
                //$('#userSettingsView').html(this.model.toJSON());
                //$(this.el).html(this.model.get('username'));
                this.el.innerHTML = this.model.get('username');
                $('#userSettingsView').html(this.el);
                
            }
        });

    // ===================================================
    // ===================================================
    // = Private variables
    // ===================================================
    // ===================================================
        
        var username = "";
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
        * @param {Object} data
        * @return {Bool} success
        */
        var updateLocally = function (sVarName, jData) {
            if (!!window.localStorage) {
                window.localStorage.sVarName = JSON.stringify(jData);
                return true;
            } else {
                //TODO: alternative storage solution, when localStorage is not available
                throw("Local storage is not available");
            }
        }


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
        * Logs the user in the system.
        * @param {String} username
        * @param {String} password
        * @param {Function} [callback]
        * @return {Object} Returns an object {'s': 'success/fail'}
        */
        this.login = function (sUsername, sPassword, sCallback) {
            username = sUsername;
            isLoggedIn = true;
            if (sCallback) {
                sCallback({ 's': 'success' });
            } else {
                return { 's': 'success' };
            }
        }

        /**
        * Logs the user out of the system.
        * @param {Function} [callback]
        * @return {Object}	Returns an object {'s': 'success/fail'}
        */
        this.logout = function (sCallback) {
            isLoggedIn = false;

            if (sCallback) {
                sCallback({ 's': 'success' });
            } else {
                return { 's': 'success' };
            }
        }

        /**
	    * Returns the login status of the user.
	    * @return {Bool}	If the user is logged-in it returns true, otherwise false.
	    */
        this.isLoggedIn = function () {
            return isLoggedIn;

        }

        /**
	    * Returns the username of the currently logged-in user.
	    * @return {String}	The username.
	    */
        this.username = function () {
            return username;
        }

   

}