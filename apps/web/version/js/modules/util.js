/**
 * Create a toast notification.
 * @param {String} message
 */
IS.notify = function(sTitle, sSubtitle, sMessage) {

  var oNotification = {
    title: sTitle,
    subtitle: sSubtitle,
    message: sMessage
  }

  // push the notification into the array
  IS.notificationsArray.push(oNotification);
  console.log('Pushed new notification');

  setTimeout(function() {
    // render template
    var template = $('#tplNotification').html();
    var notification = Mustache.to_html(template, IS.notificationsArray.shift());
    processNotifications(notification)
  }, 3000*IS.notificationsArray.length);

  // Process the notification
  function processNotifications(notification) {
    if (!$('.notification').length) {
      displayNotification(notification);
    } else {
      $("body > .notification").each(function() {
        $(this).animate({'top':'+=80px'}, 500, function() {
          displayNotification(notification);
        });
      });   
    }
  }

  // show notification
  function displayNotification(notification) {
    $(notification).appendTo('body').fadeIn(200, 'easeInOutQuint', function() {
      var _notif = $(this);
      _notif.addClass('active');
      setTimeout(function() {
          _notif.css({
            'opacity':0,
            'filter':'opacity(0)'
          }).delay(600).queue(function() {
            _notif.remove();
            $(this).dequeue();
          });
      }, 5000);
    });
  }
}

/**
 * Add a person to the user's favourites.
 * @param {String} userToFavId
 */
IS.handleFavourite = function(userToFavId, userToFavName, favType) {
  socket.emit('handleFavourite', {
    userId: user.get('_id'),
    userToFav: userToFavId,
    favType: favType,
  }, function(err, result) {
    if(!err) {
      
      // update the user model's favs array
      if(!!user.get('favs')) { // favs property exists
        var userFavs = user.get('favs');
        // check if the userToFavId already exists

        var indexOfFav = userFavs.indexOf(userToFavId);
        
        if(favType == 'add') {
          userFavs.push(userToFavId);

          user.set({
            favs: userFavs
          });
          
          // save user locally
          store.set("user", user);

          $('#handleFavourite').text('- Favourite');

          // success - show notification to the user
          IS.notify('New favourite!', null, userToFavName + ' added to your favourites.');

          console.log('- added new user to favourites');
        } else {
          userFavs.splice(indexOfFav,1); 

          user.set({
            favs: userFavs
          });

          store.set("user", user);

          // Change favourite button text
          $('#handleFavourite').text('+ Favourite');

          // success - show notification to the user
          IS.notify('Removed favourite!', null, userToFavName + ' removed from your favourites.');
          console.log('- removed user from favourites');
        }
        
      } else { // user has not set any favs yet
        user.set({
          favs: [userToFavId]
        });
        store.set("user", user);

        console.log('- added new user to favourites (first fav)');
      }
    } else {
      IS.notify(err, null, userToFavName + ' could not be added to your favorites :(');
    }
  });
}

/**
 * Adds or removes a like from the user's search options
 * @param {String} likeId
 * @param {String} likeName
 */
IS.addOrRemoveLikeFromSearchOptions = function(likeId, likeName) {
  var userSearchLikes = (!!user.get('so').l) ? user.get('so').l : [];

  // search if the like is already in the user's search options
  // AND is the total likes are no more than 10
  // if so, then add it to the user model
  // ==========================================================
  if(!_.any(userSearchLikes, function(like) { return like._id == likeId; }) && userSearchLikes.length < 10) 
  {
    console.log(' - adding search like');

    userSearchLikes.push({
      _id: likeId,
      n: likeName
    });

    // save these preferences into the user model
    user.get('so').l = userSearchLikes;

    // trigger a newSearchLike event to notify other views
    user.trigger('newSearchLike', likeId);
  }
  // else remove it
  // ==========================================================
  else if(!!user.get('so').l)
  {
    console.log(' - removing search like');

    user.get('so').l = _.reject(user.get('so').l, function(like) { return like._id == likeId; });

    // trigger a removedSearchLike event to notify other views
    user.trigger('removedSearchLike', likeId);
  }
}

/**
 * Adds or removes a like with a rating
 * @param {String} likeId
 * @param {String} likeRating
 */
IS.addOrRemoveLikeAndRate = function(likeId, likeName, likeRating, likeCategory, cb) {
  var userLikes = user.get('l');

  // search if the like is already in the user's model
  // if so, then change its rating or remove it
  // ==========================================================
  var like = _.find(userLikes, function(like) { return like._id == likeId; })
  if(!!like) 
  {
    if(like.r != likeRating) {
      console.log(' - changing like\'s rating to ' + likeRating);

      // create new like array without said like
      var updatedLikes = _.reject(userLikes, function(like) { return like._id == likeId; });

      // set rating & push new like
      like.r = likeRating;
      updatedLikes.push(like);

      // save user model
      user.set('l', updatedLikes);
      IS.saveUser();
      cb();
    } else {
      console.log(' - removing like');

      // create new like array without said like
      var updatedLikes = _.reject(userLikes, function(like) { return like._id == likeId; });

      // save user model
      user.set('l', updatedLikes);
      IS.saveUser();
      cb();
    }
  }
  // else add it
  // ==========================================================
  else
  {
    console.log(' - adding new like with rating of ' + likeRating);

    // create current date for the like
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
      if(month < 10) month = '0' + month;
    var day = currentTime.getDate();
      if(day < 10) day = '0' + day;
    var year = currentTime.getFullYear();

    // set rating & push new like
    userLikes.push({
      _id: likeId.toString(),
      n: likeName,
      c: likeCategory,
      t: year + month + day,
      r: likeRating
    });

    // save user model
    user.set('l', userLikes);
    IS.saveUser();
    cb();
  }
}

/**
 * Navigates to a page.
 * @param {String} path
 */
IS.navigateTo = function(path) {
  console.log('> navigateTo ' + path);
  router.navigate(path, {trigger: true, replace: true});
}

/**
 * Prepares APP.
 */
IS.prepareApp = function(bForceLogin, cb) {
  console.log('> Preparing app');

  // Auth user & redirect to page
  // ============================
  //if(!!store.get("user") && store.get("user").hasOwnProperty('fTkn')) {
  if(IS.nullOrEmpty(store.get("user"))) {
    IS.facebookAuth(function(err, res) {
      if(!err) {
        console.log('> Attempting to login the user');

        IS.login(IS.fbToken, res[0].third_party_id, function(err) {
          if(!err) {
            console.log('> SUCCESS! User is logged in');
            appReady = true;
            if(cb) cb();
            else IS.navigateTo('');
          } else {
            console.log('> FAIL: Need to create new account');
            IS.createAccount(IS.fbToken, res[0].third_party_id, function (err, res) {
              if(!err) {
                console.log('> SUCCESS! Account created');
                appReady = true;
                IS.navigateTo('');
              } else {
                console.log('> ERROR: ' + res);
                appReady = false;
                IS.logout();
              }
            });
          }
        });
      } else {
        console.log('> User is not ready');
        appReady = false;
        IS.logout();
      }
    });
  } else if (!IS.nullOrEmpty(store.get("user"))) {
    IS.fbToken = store.get("user").fbToken;

    IS.login(IS.fbToken, store.get("user")._id, function(err, res) {
      if(!err) {
        console.log('> SUCCESS! User is logged in');
        appReady = true;
        if(cb) cb();
        else IS.navigateTo('');
      } else {
        console.log('> FAIL: Need to create new account');
        IS.createAccount(IS.fbToken, res[0].third_party_id, function (err, res) {
          if(!err) {
            console.log('> SUCCESS! Account created');
            appReady = true;
            IS.navigateTo('');
          } else {
            console.log('> ERROR: ' + res);
            appReady = false;
            IS.logout();
          }
        });
      }
    });
  }
}

/**
 * Attempts to auth a FB user.
 */
IS.facebookAuth = function(cb){
  console.log('> Doing Facebook auth');  
  FB.getLoginStatus(function(res) {
    if (!res.authResponse) {
      //user is not connected to the app or logged out        
        FB.login(function(response) { 
          IS.facebookAuth();
        },
        {
          scope:'email,user_relationships,user_location,user_hometown,user_birthday,'
          + 'user_activities,user_education_history,user_interests,'
          + 'user_likes,user_photos'
        });    
      
    } else {
      if (res.status === 'connected') {
        console.log('> User is logged into Facebook and has authenticated the application');            
        
        // get facebook token data
        IS.fbToken = res.authResponse.accessToken;
        IS.fbTokenExpires = res.authResponse.expiresIn;
                    
        // Check if token is still valid
        if(IS.fbTokenExpires > 0) {
          console.log('> Facebook token expires in ' + (IS.fbTokenExpires / 60) + ' minutes');
          console.log('>   -> ' + IS.fbToken);
          // get third_party_id from Facebook and login the user
          FB.api(
            {
              method: 'fql.query',
              query: 'SELECT third_party_id FROM user WHERE uid=me()'
            },
            function(res) {
              console.log('> Got user details from FB');
              cb(null, res);
            }
          );
        } else {
          console.log('- Facebook token has expired');
          FB.logout();
          cb("Facebook token has expired");
        }
      } else if (res.status === 'not_authorized') {
        console.log('> User is logged into Facebook but has not authenticated the application');
        cb("User is logged into Facebook but has not authenticated the application");
      } else {
        console.log('> User is not logged into Facebook at this time');
        cb("User is not logged into Facebook at this time");
      }
    }
  });
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
      
      navigationView.render(); // update nav menu

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

              navigationView.render(); // update nav menu

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
IS.logout = function(bStopRedirect) {
  user.clear({ silent: true }); // clear local Backbone model
  store.clear(); // clear localStorage
  navigationView.render(); // update nav menu
  chatView.render(); // update footer/chat view
  appReady = false;
  if(!bStopRedirect) {
    router.navigate("", {trigger: true}); // redirect to homepage
    router.welcome();
  }
}

/**
 * Checks if a property is null or empty "". If so, returns true.
 * @param {any} property
 */
IS.nullOrEmpty = function(property) {
  if(typeof property == 'undefined') return true;
  else if(property == '' || property == null) return true;
  else return false;
}

/**
 * Saves the user model to the API.
 */
IS.saveUser = function() {
  user.save();
  store.set('user', user);
}

/**
 * Returns common likes between two users
 * @param {Array} otherUserLikes
 */
IS.getCommonLikes = function(otherUserLikes) {
  var myLikes = _.pluck(user.get('l'), '_id');
  otherUserLikes = _.pluck(otherUserLikes, '_id');

  var commonLikes = _.intersection(myLikes, otherUserLikes);

  // rebuild commonLikes to add all like properties, sort the collection and return it
  return _.sortBy(_.map(commonLikes, function(like) {
    var fullLike = _.find(user.get('l'), function(myLike) {
      return myLike._id == like;
    });
    return fullLike;
  }), function(like){
    return like.r;
  });;
}

/**
 * Parses a user's likes and updates model with favs, dislikes and categories
 * @param {Array} likes
 */
IS.parseLikes = function(model, likes) {
    
  var alikes = [];
  var aDislikes = [];
  var aFavs = [];

  var aLikeCategories = [];
  var aDislikeCategories = [];
  var aFavsCategories = [];

  // get favourites and dislikes
  $.each(likes, function(index, value) {
    if (likes[index]['r'] === 1)
      aDislikes.push(likes[index]);
    else if (likes[index]['r'] === 2)
      alikes.push(likes[index]);
    else if (likes[index]['r'] === 3)
      aFavs.push(likes[index]);
  });

  // get like categories
  aLikeCategories = _.uniq(_.pluck(alikes, 'c').sort(), true);

  // get dislike categories
  aDislikeCategories = _.uniq(_.pluck(aDislikes, 'c').sort(), true);

  // get favs categories
  aFavsCategories = _.uniq(_.pluck(aFavs, 'c').sort(), true);

  // update model
  model.set({ likeCategories: aLikeCategories });
  model.set({ dislikeCategories: aDislikeCategories });
  model.set({ favsCategories: aFavsCategories });

  model.set({ likeCategoriesCount: aLikeCategories.length });
  model.set({ dislikeCategoriesCount: aDislikeCategories.length });
  model.set({ favsCategoriesCount: aFavsCategories.length });

  model.set({ likes: alikes });
  model.set({ dislikes: aDislikes });
  model.set({ favourites: aFavs });

  model.set({ likesCount: alikes.length });
  model.set({ dislikesCount: aDislikes.length });
  model.set({ favouritesCount: aFavs.length });
}

/**
 * Do various admin tasks
 * @param {String} page
 */
IS.setupPage = function (page) {
  // set page title as a class name to do targeted styling
  $('#content').attr('class', page);

  // highligh the current page in the navigation menu
  if(page !== "viewprofile") {
    $('nav a').removeClass('current');
    $('#nav_' + page).addClass('current');
  }

  // setup user
  if(!IS.nullOrEmpty(user.get('_id'))) IS.setupUser();
}

/**
 * Sets user settings (username, sex prefs, etc)
 */
IS.setupUser = function (currentView) {
  var u  = user.get('u');
  var m = user.get('m');
  var w = user.get('w');
  var ff = user.get('ff');
  var fd = user.get('fd');

  // check if the user need to update his profile
  if(IS.nullOrEmpty(u) || (IS.nullOrEmpty(ff) && IS.nullOrEmpty(fd)) || (IS.nullOrEmpty(w) && IS.nullOrEmpty(m))) {
    if(IS.nullOrEmpty(u)) {
      nextView = new SettingsUsernameView({
        model: user
      });
    }
    else if(IS.nullOrEmpty(ff) && IS.nullOrEmpty(fd)) {
      nextView = new SettingsFindTypeView({
        model: user
      });
    }
    else if(IS.nullOrEmpty(w) && IS.nullOrEmpty(m)) {
      nextView = new SettingsGenderPrefsView({
        model: user
      });
    }

    if(currentView) {
      $(nextView.el).appendTo('body').show();

      setTimeout(function() {
        IS.pageFlip(currentView.$el, nextView.$el);
      }, 0);
    } else {
      $(nextView.el).appendTo('body').fadeIn();
    }
  }
  // else show the 'done' screen if currentView exists
  else if(currentView) {
    $('<section/>', {
        id: 'settingsDone'
    }).html($('#tplSettingsDone').html()).addClass('settings').appendTo('body');

    $('#settingsButtonDone').click(function() {
      $('#settingsDone').fadeOut(400, function() {
        $(this).remove();
      });
    });

    setTimeout(function() {
      IS.pageFlip(currentView.$el, $('#settingsDone'));
    }, 0);
  }
}

/**
 * Creates a page flip animation between two containers
 * @param {String} c1
 * @param {String} c2
 */
IS.pageFlip = function (c1, c2) {
  var iWidth = $(window).width();

  // create a new pageFlip placeholder
  $('#tplPageFlipPlaceholder').clone().attr('id', 'pageFlipPlaceholder').appendTo('body');

  // clone page into the placeholder divs
  $(c1).children().clone().appendTo('#pageFlipPlaceholder .pageA, #pageFlipPlaceholder .pageApartialInner');
  $(c2).children().clone().appendTo('#pageFlipPlaceholder .pageB, #pageFlipPlaceholder .pageBpartialInner');

  // set CSS before the animation
  $('#pageFlipPlaceholder .pageA').css({
    'left': '-' + (iWidth/2) + 'px',
    'width': iWidth + 'px'
  });

  $('#pageFlipPlaceholder .pageB').css({
    'width': iWidth + 'px'
  });
  
  $('#pageFlipPlaceholder .pageA, #pageFlipPlaceholder .pageApartialInner, #pageFlipPlaceholder .pageB, #pageFlipPlaceholder .pageBpartialInner').children().show();
  $('#pageFlipPlaceholder').show();

  // do the flip animation
  setTimeout(function() {
    $('#pageFlipPlaceholder .pageFlip').addClass('pageFlipped');
  }, 0);

  // process UI port-animation
  setTimeout(function() {
    // adjust z-index of original divs to bring the new one in front
    $(c1).css('z-index', '998');
    $(c2).css('z-index', '999').show();
    $(c1).remove();

    // remove dummy divs after the animation is over
    $('#pageFlipPlaceholder').remove();
  }, 1500);
}

/**
 * Shortcut for console.log()
 * @param {String} msg
 */
function l(msg) {
  console.log(msg);
}