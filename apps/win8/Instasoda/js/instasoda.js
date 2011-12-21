// ===================================================
// ===================================================
// = Instasoda client library
// = > requires jQuery 1.7+
// ===================================================
// ===================================================

var IS = new function () {

    // ===================================================
    // ===================================================
    // = Settings
    // ===================================================
    // ===================================================

    jQuery.support.cors = true;

    // ===================================================
    // ===================================================
    // = Private variables
    // ===================================================
    // ===================================================

    var sApi = "http://www.instasoda.com/api/";
    var username = "";
    var isLoggedIn = false;
    var activityFeedPage = 0;


    // ===================================================
    // ===================================================
    // = Private methods
    // ===================================================
    // ===================================================

    var testMethod = function () {}


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

        var user = {
            'isPackage': iPackage,
            'fbToken': sFacebookToken
        };

        // store the user details locally
        if (!!window.localStorage) {
            window.localStorage.user = JSON.stringify(user);
        } else {
            //TODO: alternative storage solution, when localStorage is not available
            callback(false, "Local storage is not available");
        }

        // connect to the API server and create the account
        $.ajax({
            type: 'GET',
            url: sApi + "register.php",
            data: {
                "package": user.isPackage,
                "fbToken": user.fbToken
            },
            dataType: "json",
            success: function (data) {
                if (data.status == "success") {
                    //SUCCESS
                    callback(true, "success");
                }
                else {
                    //FAIL
                    callback(false, data.status);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //TODO: properly handle ajax error
                callback(false, "Ajax error: " + errorThrown);
            }

        });
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

    /**
	* Returns the user's notifications.
	* @param {Object}	[callback]
	* @return {Object}
	*/
    this.getNotifications = function (sCallback) {
        var jNotifications =
        {
            "notifications":
	                  [
            {
                "date": "3 hours ago",
                "title": "Jill, 29",
                "message": "She joined Instasoda near you.",
                "image": "/api/images/1.png",
                "compatibility": 47
            },
            {
                "date": "4 hours ago",
                "title": "Kate, 26",
                "message": "She checked you out a few hours ago.",
                "image": "/api/images/2.png",
                "compatibility": 68
            },
            {
                "date": "12 hours ago",
                "title": "Nancy, 27",
                "message": "She wants to meet you.",
                "image": "/api/images/3.png",
                "compatibility": 73
            },
            {
                "date": "15 hours ago",
                "title": "Dianna, 28",
                "message": "She joined Instasoda near you.",
                "image": "/api/images/4.png",
                "compatibility": 92
            }
	                  ]
        };

        if (sCallback) {
            sCallback(jNotifications);
        } else {
            return jNotifications;
        }
    }

    /**
	* Returns the user's activity feed (30 items at a time).
	* @param (Bool)	[more]	When true, returns the next 30 items.
	* @param {Object}	[callback]
	* @return {Object}
	*/
    this.getActivityFeed = function (bMore, sCallback) {
        activityFeedPage = 1;
        var jActivity =
        {
            "recent_updates":
	                  [
            {
                "date": "3 hours ago",
                "title": "Jill, 29",
                "message": "She joined Instasoda near you.",
                "image": "/api/images/1.png",
                "compatibility": 47
            },
            {
                "date": "4 hours ago",
                "title": "Kate, 26",
                "message": "She checked you out a few hours ago.",
                "image": "/api/images/2.png",
                "compatibility": 68
            },
            {
                "date": "12 hours ago",
                "title": "Nancy, 27",
                "message": "She wants to meet you.",
                "image": "/api/images/3.png",
                "compatibility": 73
            },
            {
                "date": "15 hours ago",
                "title": "Dianna, 28",
                "message": "She joined Instasoda near you.",
                "image": "/api/images/4.png",
                "compatibility": 92
            }
	                  ]
        };

        if (sCallback) {
            sCallback(jActivity);
        } else {
            return jActivity;
        }
    }

    /**
	* Returns an array of users.
	* @param (JSON)	options	Options to customise the user array
	* @param {Object}	[callback]
	* @return {Object}
	*/
    this.getUsers = function (iNumUsers, jOptions, sCallback) {

        //TODO


        if (sCallback) {
            sCallback(jUsers);
        } else {
            return jUsers;
        }
    }

}