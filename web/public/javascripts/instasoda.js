var IS = new function() {
    this.publicVar = 'public';
    var privateVar = 'private';

    // private methods
	    var testMethod = function() {
	    }
    
    //public methods
	    this.test = function() {
	        alert('boo');
	    }
	    
	    this.login = function() {
	    }
	    
	    this.logout = function() {
	    }
	    
	    this.getLoginStatus = function() {
	    }
	    
	    this.getSession = function() {
	    }
	    
	    this.getAuthResponse = function() {
	    }
}

IS.test();