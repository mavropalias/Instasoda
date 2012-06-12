/**
 * Navigates to a page.
 * @param {String} path
 */
IS.navigateTo = function(path) {
  router.navigate(path, {trigger: true});
}

/**
 * Attempts to auth a FB user.
 */
IS.facebookAuth = function(){
  if(!!store.get("user") && store.get("user").hasOwnProperty('fTkn')) {
    welcomeView.facebookAuth();
  }
}

/**
 * Attempts to log the user into the system.
 * If it fails, it means that the user needs to register a new account.
 * @param {String} Facebook token
 * @param {String} Facebook third_party_id
 * @param {Function} Callback
 * @return {Bool} true/false
 */
IS.login = function(fTkn, fTid, cb) {
  // first check if the user is already logged in
  // --------------------------------------------
  if (user.get('_id')) {
    console.log('- user is logged in');
    cb(null, "success");
  } else {
    // try to read locally saved data to read the login status
    // -------------------------------------------------------
    console.log('- reading local storage');
    user.set(store.get("user"));

    if (user.get('_id')) {
      console.log('- found user in local storage');
      
      // TODO sync data from API
      
      user.set({ 'fTkn': fTkn });
      store.set("user", user);
      
      cb(null);
    } else {
      console.log('- trying the API: ' + fTid);
      
      user.set({
        '_id': fTid,
        'fTkn': fTkn
      });
      
      // connect to the API server and fetch the user
      // --------------------------------------------
      user.fetch(
        { 
          data: {
            'fTkn': fTkn
          }
        , 
          error: function(model, response) {
            //TODO: properly handle errors
            //a false might only mean that the API server is N/A
            console.log('- login error: ' + response.error);
            cb(true, response.error);
          }
        ,
          success: function(model, response) {
            // Ajax call was successful
            // ------------------------
            console.log('- got an API response');
            // Now check if the account was created
            // ------------------------------------
            if ((typeof model.attributes._id !== 'undefined') && (typeof response.error === 'undefined')) {                    
              // store the user details locally
              // ------------------------------
              store.set("user", user);

              // callback success
              // ----------------
              cb(null, "success");
            }
            // FAIL
            // ----
            else {
              console.log('- ' + response.error);
              cb(true, response.error);
            }
          }
        }
      );
    }
  }
}

/**
 * Create a new user account by connecting to Facebook.
 * @param {Integer} package 1=basic, 2=standard, 3=complete
 * @param {String} facebookToken
 * @param {Function} callback
 * @return {Object} Returns an object {'s': 'success/fail'}
 */
IS.createAccount = function(fbToken, fTid, cb) {
  console.log('- creating account');
  user.set({
    '_id': null,
    'fTid': fTid,
    'fTkn': fbToken
  });

  user.save({
    error: function(model, response) {
      //TODO: properly handle errors
      //a false might only mean that the API server is N/A
      console.log('- login error: ' + response.error);
      cb(true, response.error);
    }
  }, {
    success: function(model, response) {
      // Ajax call was successful
      // ------------------------
      console.log('- got an API response');
      // Now check if the account was created
      // ------------------------------------
      if ((typeof model.attributes._id !== 'undefined') && (typeof response.error === 'undefined')) {                    
        // store the user details locally
        // ------------------------------
        store.set("user", user);

        // callback success
        // ----------------
        cb(null, "success");
      }
      // FAIL
      // ----
      else {
        console.log('- ' + response.error);
        cb(true, response.error);
      }
    }
  });
}

/**
 * Logs the user out of the system.
 */
IS.logout = function() {
  user.clear({ silent: true }); // clear local Backbone model
  store.clear(); // clear localStorage
  navigationView.render(); // update nav menu
  chatView.render(); // update footer/chat view
  router.navigate("", {trigger: true}); // redirect to homepage
}

/**
 * Checks if a property is null or empty "". If so, returns true.
 */
IS.nullOrEmpty = function(property) {
  if(property == '' || property == null || typeof property == 'undefined' ) return true;
  else return false;
}

// =========================================================================
// Beta message view
// =========================================================================
var BetaView = Backbone.View.extend({
  // initialize
  initialize: function() {
    _.bindAll(this);
  },
  
  // render
  render: function() {
    console.log('  ~ rendering beta view');
    var template = $('#tplBeta').html();
    $(this.el).html(template);
  }
});