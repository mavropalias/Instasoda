// =========================================================================
// WelcomeView
// =========================================================================
var WelcomeView = Backbone.View.extend({
  // settings
  id: 'welcome',
  
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #fb-auth': 'facebookAuth',
    'click .instantProfiles': 'featureInstantProfiles'
  },
  
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering welcome view');
    var template = $('#tplWelcome').html();
    $(this.el).html(template);
  },
  
  // featureInstantProfiles
  // -----------------------------------------------------------------------
  featureInstantProfiles: function() {
    var _this = this;
    
    var frameRate = 50;
    var cssTransitionDelay = 400;
    var counter = 0;
    var boxSize = 80;
    var winWidth = $(window).width();
    var winHeight = $(window).height();
    var boxColumns = 0;
    var boxRows = 0;
    
    winWidth = $(window).width();
    winHeight = $(window).height() - $('body > nav').height();
  
    boxColumns = (Math.round(winWidth / boxSize))+1;
    boxRows = (Math.round(winHeight / boxSize))+1;
    
    _this.$('.faces').width(winWidth);
    _this.$('.faces').height(winHeight);
    
    addBoxes(boxColumns,boxRows);
    
    function addBoxes(cols,rows) {
      var faceDelay = 100;
      var delayToPlayAnimation = 0;
      
      _this.$('.faces').empty();
      for(n = 0; n < rows; n++){
        _this.$('.faces').append("<div id='row" + n + "' class='row'>");
        _this.$('#row'+n).css("top",(n * boxSize + 70)+"px");
        
        for(m = 0; m < cols; m++) {
          (function() {
            _this.$('#row'+n).append("<div id='box" + n + "-" + m + "' class='box animated transparent row" + n + " col" + m + "'></div>");
            var object = _this.$('#box' + n + "-" + m);
            object.css("left",(m*boxSize)+"px");
            
            //load random image
            var rnd = Math.floor(Math.random() * (12) + 1);
            if( ( rnd * faceDelay ) > delayToPlayAnimation ) delayToPlayAnimation = rnd * faceDelay;
            object.css("background-image",'url(faces/'+(rnd)+'.png)').delay(rnd * faceDelay).queue(function() {
              $(this).removeClass('transparent');
            });
          })();
        }
        _this.$('.faces').append("</div>")
      }
      
      // set row width
      _this.$('.row').css('width',(boxSize * boxColumns)+'px');
      
      // do face animations + effects
      setTimeout(function() {
        playAnimation(cols, rows);
      }, delayToPlayAnimation);
      
      // draw the heart
      setTimeout(function() {
        drawHeart(cols, rows);
      }, (delayToPlayAnimation + ((boxColumns) * frameRate)));
    }
    
    function playAnimation() {
      if(counter < boxColumns) {
        var internalCounter = counter;
        _this.$('.col' + counter).css('opacity', '0');
        
        // repeat animation
        setTimeout(playAnimation, frameRate);
        
        // restore opacity after (cssTransitionDelay + (counter * internalCounter))
        setTimeout(function() {
          _this.$('.col' + (internalCounter - 1)).css('opacity', '1');
        }, (cssTransitionDelay + (counter * internalCounter)));
        
        // increase counter
        counter++;
      }
    }
    
    function drawHeart(cols, rows) {
      var startCol = Math.round (cols / 2) - 5;
      var startRow = Math.round (rows / 2) - 4;
      var heart = [[0,1,1,0,1,1,0],
                   [1,1,1,1,1,1,1],
                   [1,1,1,1,1,1,1],
                   [0,1,1,1,1,1,0],
                   [0,0,1,1,1,0,0],
                   [0,0,0,1,0,0,0]];
      
      // draw heart boxes
      for(n = 0; n < heart.length; n++){            
        for(m = 0; m < heart[0].length; m++) {
          // draw a heart box only if the array value is 1
          if(heart[n][m] === 1) {
            (function() {
              var posX = (boxSize * (startCol + m)) + 'px';
              var posY = (boxSize * (startRow + n)) + 'px';
              
              $("<div class='box heartBox animated' style='left:" + posX + "; top: " + posY + ";'></div>").appendTo(_this.$('.faces')).animate({ opacity: '0.95' }, cssTransitionDelay);
            })();
          }
        }
      }
    }
  },
  
  // facebookAuth
  // -----------------------------------------------------------------------
  facebookAuth: function() {
    var self = this;
    console.log('> Doing Facebook auth');
    
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
            + 'user_likes,user_photos,offline_access'
          });    
        
      } else {
        if (res.status === 'connected') {
          console.log('> User is logged into Facebook and has authenticated the application');            
          
          // get facebook token data
          var fbToken = res.authResponse.accessToken;
          var fbTokenExpires = res.authResponse.expiresIn;
                      
          // Check if token is still valid
          if(fbTokenExpires > 0) {
            console.log('> Facebook token expires in ' + (fbTokenExpires / 60) + ' minutes');
            console.log('>   -> ' + fbToken);
            // get third_party_id from Facebook and login the user
            FB.api(
              {
                method: 'fql.query',
                query: 'SELECT third_party_id FROM user WHERE uid=me()'
              },
              function(res) {
                console.log('> Attempting to login the user');
                IS.login(fbToken, res[0].third_party_id, function(err) {
                  if(!err) {
                    console.log('> SUCCESS! User is logged in');
                    appReady = true;
                    IS.navigateTo('me');
                  } else {
                    console.log('> FAIL: Need to create new account');
                    IS.createAccount(fbToken, res[0].third_party_id, function (err, res) {
                      if(!err) {
                        console.log('> SUCCESS! Account created');
                        appReady = true;
                        IS.navigateTo('me');
                      } else {
                        console.log('> ERROR: ' + res);
                      }
                    });
                  }
                });
              }
            );
          } else {
            console.log('- Facebook token has expired');
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
});