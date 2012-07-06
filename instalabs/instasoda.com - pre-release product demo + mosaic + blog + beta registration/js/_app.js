// Config
// =============================================================================
  
  var sApi = "http://localhost:8080/api/user/"; //##apiUrl## - 23.23.87.218
  jQuery.support.cors = true;

// Create the IS namespace
// =============================================================================

  var IS = {};


  IS.facebookAuth = function(){
    var self = this;

    FB.getLoginStatus(function(res) {
      var button = document.getElementById('fb-auth');
      if (!res.authResponse) {
        //user is not connected to the app or logged out
        //button.innerHTML = 'Login with Facebook';
        
          FB.login(function(response) { 
            // FB.Event.subscribe('auth.statusChange') will take care of the rest
            self.facebookAuth();
          },
          {
            scope:'email,user_relationships,user_location,user_hometown,user_birthday,'
            + 'user_activities,user_education_history,read_stream,user_interests,'
            + 'user_likes,user_photos'
          });    
        
      } else {
        if (res.status === 'connected') {
          //console.log('> User is logged into Facebook and has authenticated the application');            
          
          // get facebook token data
          var fbToken = res.authResponse.accessToken;
          var fbTokenExpires = res.authResponse.expiresIn;
                      
          // Check if token is still valid
          if(fbTokenExpires > 0) {
            //console.log('> Facebook token expires in ' + (fbTokenExpires / 60) + ' minutes');
            //console.log('>   -> ' + fbToken);
            // get third_party_id from Facebook and login the user
            FB.api(
              {
                method: 'fql.query',
                query: 'SELECT third_party_id FROM user WHERE uid=me()'
              },
              function(res) {
                console.log('> Attempting to login the user');

                // register for beta
                IS.createAccount(fbToken, res[0].third_party_id, function (err, res) {
                  if(!err) {
                    console.log('> SUCCESS! Account created');
                    alert("thanks!");
                  } else {
                    console.log('> ERROR: ' + res);
                    //todo handle error
                  }
                });
              }
            );
          } else {
            alert('Your Facebook token has expired. Please reload the page and try again!');
            FB.logout();
          }
        } else if (res.status === 'not_authorized') {
          console.log('> User is logged into Facebook but has not authenticated the application');
          //IS.navigateTo('');
        } else {
          console.log('> User is not logged into Facebook at this time');
          //IS.navigateTo('');
        }
      }
    });  
  }

IS.createAccount = function(fbToken, fTid, cb) {

  var register = $.post(sApi, {
    '_id': null,
    'fTid': fTid,
    'fTkn': fbToken
  })
  .success(function() { })
  .error(function() {
    $('#signupStatus .status').text("OH NO! An error occured :( Please try again!");
  })
  .complete(function() { 
    $('#signupStatus .status').text("SUCCESS!");
  });

  //console.log('- creating account');
  /*user.set({
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
  });*/
}