// Config
// =============================================================================
  
  var sApi = "http://api.instasoda.com:8080/api/user/"; //##apiUrl## 
  jQuery.support.cors = true;

// Create the IS namespace
// =============================================================================

  var IS = {};


  IS.facebookAuth = function(){
    //console.log('> facebookAuth');
    var self = this;

    FB.getLoginStatus(function(res) {
      //console.log('> getLoginStatus');
      var button = document.getElementById('fb-auth');
      if (!res.authResponse) {
        //console.log('> user is not connected to the app or logged out');
        //user is not connected to the app or logged out        
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
                //console.log('> Attempting to login the user');

                // register for beta
                IS.createAccount(fbToken, res[0].third_party_id, function (err, res) {
                  if(!err) {
                    //console.log('> SUCCESS! Account created');
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
          //console.log('> User is logged into Facebook but has not authenticated the application');
        } else {
          //console.log('> User is not logged into Facebook at this time');
        }
      }
    });  
  }

IS.createAccount = function(fbToken, fTid, cb) {
  //console.log('> createAccount');

  if ($.browser.msie && window.XDomainRequest) { // IE
    var xdr = new XDomainRequest();
    var data = '?fTid=' + fTid + '&fTkn=' + fbToken;

    xdr.open("get", sApi + data);
    xdr.send();
    xdr.onload = function() {
      $('#signupStatus > .message > .working, #signupStatus .status').fadeOut(400, function() {
        $('#signupStatus .status').text("SUCCESS!");
        $('#signupStatus > .message > .success, #signupStatus .status').fadeIn();
      });
    };
    xdr.onsuccess = function() {
      //alert('success');
    };
    xdr.onerror = function() {
      $('#signupStatus .status').text("OH NO! An error occured :( Please try again!");
      console.log(xdr.responseText);
    };
  } else { // other browsers
    var register = $.post(sApi, {
      '_id': null,
      'fTid': fTid,
      'fTkn': fbToken
    })
    .success(function() {
      $('#signupStatus > .message > .working, #signupStatus .status').fadeOut(400, function() {
        $('#signupStatus .status').text("SUCCESS!");
        $('#signupStatus > .message > .success, #signupStatus .status').fadeIn();
      });
    })
    .error(function(a,b,c) {
      $('#signupStatus .status').text("OH NO! An error occured :( Please try again!");
    })
    .complete(function() { 
    });
  }
}