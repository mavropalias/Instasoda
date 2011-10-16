var IS = new function() {
    
    // Private variables
	var username = '';
	var apiKey = 'af98y34ubliuyasv097hb34uig';
	var isLoggedIn = false;
	var activityFeedPage = 0;
    
    // Public variables
	// this.publicVar = 'public';    

    // ***************************************************
    // Private methods
    // ***************************************************

		var testMethod = function() {

		}
	    
	// ***************************************************
    // Public methods
    // ***************************************************	  
		
		/**
		 * Logs the user in the system.
		 * @param {String} username
		 * @param {String} password
		 * @param {Function} [callback]
		 * @return {Object} Returns an object {'s': 'success/fail'}
		 */
	    this.login = function(sUsername, sPassword, sCallback) {
	    	username = sUsername;
	    	isLoggedIn = true;
	    	if (sCallback) {
	    		sCallback({'s': 'success'});
    		} else {
	    		return {'s': 'success'};
	    	}
	    }
	    
		/**
		* Logs the user out of the system.
		* @param {Function} [callback]
		* @return {Object}	Returns an object {'s': 'success/fail'}
		*/
	    this.logout = function(sCallback) {
	    	isLoggedIn = false;

	    	if (sCallback) {
	    		sCallback({'s': 'success'});
	    	} else {
	    		return {'s': 'success'};
	    	}
	    }
	    
		/**
		* Returns the login status of the user.
		* @return {Bool}	If the user is logged-in it returns true, otherwise false.
		*/
	    this.isLoggedIn = function() {
	    	return isLoggedIn;
	    	
	    }
	    
		/**
		* Returns the username of the currently logged-in user.
		* @return {String}	The username.
		*/
	    this.username = function() {
	    	return username;
	    }
	    
		/**
		* Returns the user's notifications. 
		* @param {Object}	[callback]
		* @return {Object}	
		*/
	    this.getNotifications = function(sCallback) {
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
	    this.getActivityFeed = function(bMore, sCallback) {
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
    
}