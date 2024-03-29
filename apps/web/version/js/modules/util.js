/*
Functions overview
=================

> notify:
Create a toast notification

> handleFavourite:
Add/remove a person to the user's favourites

> addOrRemoveLikeFromSearchOptions:
Adds or removes a like from the user's search options

> addOrRemoveLikeAndRate:
Adds or removes a like with a rating

> navigateTo:
Navigates to a page

> changeView:
Changes current view

> animateToView:
Creates an animated transition from the current page to the destination page

> prepareApp:
Prepares App

> facebookAuth:
Attempts to auth a FB user

> login:
Attempts to log the user into the system

> createAccount:
Create a new user account by connecting to Facebook

> logout:
Logs the user out of the system & clears localStorage

> nullOrEmpty:
Checks if a property is null, empty or undefined. If so, returns true

> saveUser:
Saves the User model to the API

> getCommonLikes:
Returns common likes between User and another user

> parseLikes:
Parses a user's likes and extends model with favs, dislikes and categories

> setupPage:
Do various admin tasks after loading a page

> showMetabar:
Shows or hides the metabar

> setupUser:
Sets user settings (username, sex prefs, etc)

> pageFlip:
Creates a page flip animation between two containers

> l:
Shortcut for console.log()

> showMapAndGetLocation:
Creates a map widget and returns [lon,lat] per user selection

> addToFancybox:
Fancybox-ise specified images

> Backbone.sync
Overwrite Backbone's sync method, to hash all requests using HMAC

>textAreaAdjust
Adjusts the height of a text area

*/


/**
 * Create a toast notification.
 * @param {String} message
 */
IS.notify = function(sTitle, sSubtitle, sMessage) {

  var oNotification = {
    title: sTitle,
    subtitle: sSubtitle,
    message: sMessage
  };

  setTimeout(function() {
    // push the notification into the array
    IS.notificationsArray.push(oNotification);
    log('Pushed new notification', 'info');

    // render template
    var template = $('#tplNotification').html();
    var notification = Mustache.to_html(template, IS.notificationsArray.shift());
    processNotifications(notification);
  }, (500 * IS.notificationsArray.length - 1));

  // Process the notification
  function processNotifications(notification) {
    if (!$('.notification').length) {
      displayNotification(notification);
    } else {
      $("body > .notification").each(function() {
        $(this).animate({'top':'+=60px'}, 500, function() {
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
          }).delay(400).queue(function() {
            _notif.remove();
            $(this).dequeue();
          });
      }, 5000);
    });
  }
};

/**
 * Add a person to the user's favourites.
 * @param {String} userToFavId
 */
IS.handleFavourite = function(userToFavId, userToFavName, favType) {
  socket.emit('handleFavourite', {
    userId: user.get('_id'),
    userToFav: userToFavId,
    favType: favType
  }, function(err, result) {
    if(!err) {

      // update the user model's favs array
      if(!!user.get('favs')) { // favs property exists
        var userFavs = user.get('favs');

        // check if the userToFavId already exists
        var indexOfFav = userFavs.indexOf(userToFavId);

        if(favType == 'add') {
          userFavs.unshift(userToFavId);

          user.set({
            favs: userFavs
          });

          // save user locally
          store.set("user", user);

          // update button on user page
          $('#handle-favourite .icon').removeClass('icon-star-empty').addClass('icon-star').attr('title', 'Remove from your starred users.');

          // render user page - fixes issue when going back to the same profile and fav button is in wrong state due to caching
          usersFullView.render();

          // update favsCollection
          socket.emit('getBasicUserInfoFromId', {
            userId: userToFavId
          }, function(err, userToFav) {
            if(!err) {
              favsCollection.add(userToFav); //TODO: don't render on every user

            } else {
              log('getBasicUserInfoFromId error', 'error');
            }
          });
        } else {

          // update favsCollection
          favsCollection.remove( _.find(favsCollection.models, function(fav) {
            return fav.get('_id') == userToFavId;
          }));

          // update user model
          userFavs.splice(indexOfFav,1);
          user.set({
            favs: userFavs
          });

          // save locally
          store.set("user", user);

          // update button on user page
          $('#handle-favourite .icon').removeClass('icon-star').addClass('icon-star-empty').attr('title', 'Add to your starred users.');

          // render user page - fixes issue when going back to the same profile and fav button is in wrong state due to caching
          usersFullView.render();

          // success - show notification to the user
          //IS.notify('Removed favourite!', null, userToFavName + ' removed from your favourites.');
          console.log('- removed user from favourites');
        }

      } else { // user has not set any favs yet
        user.set({
          favs: [userToFavId]
        });
        store.set("user", user);

        console.log('- added new user to favourites (first fav)');

        // update button on user page
        $('#handle-favourite .icon').removeClass('icon-star-empty').addClass('icon-star').attr('title', 'Remove from your starred users.');
      }
    } else {
      //IS.notify(err, null, userToFavName + ' could not be added to your favorites :(');
    }
  });
};

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
  // if so, change its rating or remove it
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
      cb(true);
    } else {
      console.log(' - removing like');

      // create new like array without said like
      var updatedLikes = _.reject(userLikes, function(like) { return like._id == likeId; });

      // save user model
      user.set('l', updatedLikes);
      IS.saveUser();
      cb(false);
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
    cb(true);
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
 * Changes current view
 * @param currentView
 * @param destinationView
 */
IS.changeView = function(currentView, destinationView, destinationViewMode) {
  async.series([
    // allow the currentView to execute its leave function
    function(cb) {
      log('leaving currentView', 'info');
      if(!IS.nullOrEmpty(currentView) && !IS.nullOrEmpty(currentView.leave)) {
        currentView.leave(cb);
      } else {
        cb();
      }
    },
    // if leave is not rejected, transition between the two views
    function(cb) {
      log('animating views', 'info');

      // only animate when scrollTop < 10 && destinationViewMode === null
      //if($(document).scrollTop() < 10 && IS.nullOrEmpty(destinationViewMode)) {
      //  IS.animateToView(currentView, destinationView, destinationViewMode, cb);
      //}
      //else {
        if(!destinationView.html) destinationView.render();
        destinationView.show(destinationViewMode);
        $(document).scrollTop(0);
        cb();
      //}
    },
    // execute any further actions defined by the destinationView's enter method
    function(cb){
      log('calling destinationView:enter', 'info');
      if(!IS.nullOrEmpty(destinationView.enter)) {
        destinationView.enter();
        cb();
      }
      else cb();
    },
  ],
  function(err, results) {
    // update app's currentView
    log('update IS.currentView', 'info');
    if(!err) IS.currentView = destinationView;
  });
}

/**
 * Creates an animated transition from the current view to the
 * destination view.
 * @param currentView
 * @param destinationView
 */
IS.animateToView = function(currentView, destinationView, destinationViewMode, cb) {
  // check if destinationView is rendered
  if(!destinationView.html) destinationView.render();

  // transition the views
  if(!IS.nullOrEmpty(currentView)) {
    // hide currentView
    currentView.$el.stop(true, true).animate(
      {
        opacity: 0,
        'margin-left': '-40px'
      }, 200, 'easeInQuad',
      function() {
        // hide destinationView
        destinationView.$el.css({
          opacity: 0,
          'margin-left': '40px'
        });

        // show destinationView
        destinationView.show(destinationViewMode);
        destinationView.$el.stop(true, true).animate({
          opacity: 1,
          'margin-left': '0px'
        }, 200, 'easeOutQuad', function() {
          cb();
        });
      }
    );
  } else {
    // hide destinationView
    destinationView.$el.css({
      opacity: 0,
      'margin-left': '40px'
    });

    // show destinationView
    destinationView.show(destinationViewMode);
    destinationView.$el.stop(true, true).animate({
      opacity: 1,
      'margin-left': '0px'
    }, 200, 'easeOutQuad', function() {
      cb();
    });
  }
}

/**
 * Prepares APP.
 */
IS.prepareApp = function(bForceLogin, cb) {
  console.log('> Preparing app');

  // Login or register user if bForceLogin == true
  if(bForceLogin)
  {
    IS.facebookAuth(function(err, res) {
      if(!err) {
        console.log('> Attempting to login the user');

        IS.login(IS.fbToken, res[0].third_party_id, function(err) {
          if(!err) {
            console.log('> SUCCESS! User is logged in');

            appReady = true;

            // set user's online status
            IS.userIsOnline(true);

            // fetch matches
            matchesCollection.fetch();

            // fetch favs
            favsCollection.fetch();

            // fetch interests
            interestsCollection.fetch();

            if(cb) cb();
            else {
              IS.navigateTo('');
              router.welcome();
            }
          } else {
            console.log('> FAIL: Need to create new account for: ' + IS.fbToken + '  /  ' + res[0].third_party_id);
            IS.createAccount(IS.fbToken, res[0].third_party_id, function (err, res) {
              if(!err) {
                console.log('> SUCCESS! Account created');

                appReady = true;

                // set user's online status
                IS.userIsOnline(true);

                // fetch matches
                matchesCollection.fetch();

                // fetch favs
                favsCollection.fetch();

                // fetch interests
                interestsCollection.fetch();

                IS.navigateTo('');
                router.welcome();
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
  }
  // else probe localStorage to see if the user is already logged in
  else if (!IS.nullOrEmpty(store.get("user")))
  {
    IS.fbToken = store.get("user").fTkn;

    IS.login(IS.fbToken, store.get("user")._id, function(err, res) {
      if(!err) {
        console.log('> SUCCESS! User is logged in');

        appReady = true;

        // set user's online status
        IS.userIsOnline(true);

        // fetch matches
        matchesCollection.fetch();

        // fetch favs
        favsCollection.fetch();

        // fetch interests
        interestsCollection.fetch();

        // sync user
        user.fetch();

        if(cb) cb();
        else {
          IS.navigateTo('');
          router.welcome();
        }
      } else {
        console.log('> FAIL: Need to create new account');
        IS.createAccount(IS.fbToken, res[0].third_party_id, function (err, res) {
          if(!err) {
            console.log('> SUCCESS! Account created');

            appReady = true;

            // set user's online status
            IS.userIsOnline(true);

            // fetch matches
            matchesCollection.fetch();

            // fetch favs
            favsCollection.fetch();

            // fetch interests
            interestsCollection.fetch();

            IS.navigateTo('');
            router.welcome();
          } else {
            console.log('> ERROR: ' + res);
            appReady = false;
            IS.logout();
          }
        });
      }
    });
  }
  // else do nothing & redirect to welcome page
  else {
    cb();
  }
};

/**
 * Attempts to auth a FB user.
 */
IS.facebookAuth = function(cb){
  console.log('> Doing Facebook auth');
  if(!!FB.getLoginStatus) {
    FB.getLoginStatus(function(res) {
      if (!res.authResponse) {
        //user is not connected to the app or logged out
          FB.login(function(response) {
            IS.facebookAuth(cb);
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

          // store token
          user.set("fTkn", IS.fbToken);
          var expires = new Date();
          expires.setSeconds(expires.getSeconds() + res.authResponse.expiresIn);
          store.set("fbToken", {
            tkn: res.authResponse.accessToken,
            expiry: expires
          });

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
  } else {
    cb(); // fail silently
  }
};

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

      // sync local data from server
      user.fetch(
        {
          data: {
            'fTkn': fTkn,
            '_id': fTid
        },
          error: function(model, response) {
            //TODO: properly handle errors
            //a false might only mean that the API server is N/A
            console.log('- login error: ' + response.error);
            //alert('Could not sync your account from server!');
            IS.logout();
        },
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
            }
            // FAIL
            // ----
            else {
              console.log('- ' + response.error);
              //alert('Could not sync your account from server!');
              IS.logout();
            }
          }
        }
      );

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
            'fTkn': fTkn,
            '_id': fTid
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
 * Create a new user account
 * @param {String} facebookToken
 * @param {String} fTid
 * @param {Function} callback
 */
IS.createAccount = function(fbToken, fTid, cb) {
  console.log('- creating account');
  user.set({
    '_id': null,
    'fTid': fTid,
    'fTkn': fbToken
  });

  // switch to HTTPS while creating new account
  user.urlRoot = sApiHttps + 'me';

  user.save({
    error: function(model, response) {
      //TODO: properly handle errors
      //a false might only mean that the API server is N/A
      console.log('- login error: ' + response.error);

      // revert to non-https
      user.urlRoot = sApi + 'me';

      cb(true, response.error);
    }
  }, {
    success: function(model, response) {
      // Ajax call was successful
      console.log('- got an API response');

      // revert to non-https
      user.urlRoot = sApi + 'me';

      // Now check if the account was created
      // ------------------------------------
      if (!IS.nullOrEmpty(model.attributes._id)) {
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
        console.log('- ' + response);
        alert('Could not create your account');
        cb(true, response.error);
      }
    }
  });
}

/**
 * Sets the user as online/offline in the API
 * @param {Boolean} bIsOnline
 */
IS.userIsOnline = function(bIsOnline) {
  l('> Online status for user is: ' + bIsOnline);
  socket.emit('userIsOnline', {
    _id: user.get('_id'),
    fTkn: user.get('fTkn'),
    tkn: user.get('tkn'),
    isOnline: bIsOnline
  });
}

/**
 * Logs the user out of the system.
 */
IS.logout = function(bStopRedirect) {
  IS.userIsOnline(false);
  user.clear(); // clear local Backbone model
  store.clear(); // clear localStorage
  appReady = false;
  $('body').removeClass('chat-is-visible');
  if(!bStopRedirect) {
    router.navigate("", {trigger: true}); // redirect to homepage
    router.welcome();
  }
};

/**
 * Checks if a property is null or empty "". If so, returns true.
 * @param {any} property
 */
IS.nullOrEmpty = function(property) {
  if(typeof property == 'undefined') return true;
  else if(property === '' || property === null) return true;
  else return false;
};

/**
 * Saves the User model to the API.
 */
IS.saveUser = function() {
  user.save();
  store.set('user', user);
};

/**
 * Returns common likes between User and another user
 * @param {Array} otherUserInterests
 */
IS.getCommonLikes = function(otherUserInterestsFull) {
  var myInterestsFull = user.get('l');
  var myInterests = _.pluck(myInterestsFull, '_id');
  otherUserInterests = _.pluck(otherUserInterestsFull, '_id');

  var commonInterests = _.intersection(myInterests, otherUserInterests);

  var interestsInOtherUserFavourites = [];
  var interestsInOtherUserLikes = [];
  var interestsInOtherUserDislikes = [];


  // get favourites, likes and dislikes
  _.each(commonInterests, function(value) {
    // find other user's original interest to get the rating
    var originalInterest = _.find(otherUserInterestsFull, function(like) {
      return like._id == value;
    });

    if(originalInterest.r === 1) {
      interestsInOtherUserDislikes.push(
        _.find(myInterestsFull, function(myLike) {
          return myLike._id == value;
        })
      );
    } else if(originalInterest.r === 2 || typeof originalInterest.r == 'undefined') {
      interestsInOtherUserLikes.push(
        _.find(myInterestsFull, function(myLike) {
          return myLike._id == value;
        })
      );
    } else if(originalInterest.r === 3) {
      interestsInOtherUserFavourites.push(
        _.find(myInterestsFull, function(myLike) {
          return myLike._id == value;
        })
      );
    }
  });

  var commonInterests = [];
  commonInterests.push(interestsInOtherUserDislikes);
  commonInterests.push(interestsInOtherUserLikes);
  commonInterests.push(interestsInOtherUserFavourites);

  return commonInterests;
};

/**
 * Parses a user's likes and updates model with favs, dislikes and categories
 * @param {Array} likes
 */
IS.parseLikes = function(model, likes) {

  if(IS.nullOrEmpty(likes)) return;

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

  model.set({ hasLikes: (alikes.length > 0) ? true : false });
  model.set({ hasDislikes: (aDislikes.length > 0) ? true : false });
  model.set({ hasFavourites: (aFavs.length > 0) ? true : false });
}

/**
 * Do various admin tasks when loading a page
 * @param {String} page
 */
IS.setupPage = function (page) {
  // set page title as a class name to do targeted styling
  document.title = "Instasoda / " + page;
  $('#content').attr('class', page);
  $('body').attr('data-page', page);

  // highligh the current page in the navigation menu
  $('nav li').removeClass('active');
  $('#nav_' + page).addClass('active');

  // setup user
  if(!IS.nullOrEmpty(user.get('_id'))) IS.setupUser();

  // track pageview
  _gaq.push(['_trackPageview', window.location.hash]);
}

/**
 * Shows or hides the metabar
 * @param {Bool} true to show / false to hide
 */
IS.showMetabar = function (bShow) {
  if(bShow) {
    $('#metabar').addClass('visible');
  } else {
    $('#metabar').removeClass('visible');
  }
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
  var loc = user.get('loc');
  var locN = user.get('locN');
  var gender = user.get('g');
  var fn = user.get('fn');

  // check if the user need to update his profile
  if(IS.nullOrEmpty(loc) || IS.nullOrEmpty(gender) || IS.nullOrEmpty(locN) || IS.nullOrEmpty(u) || (IS.nullOrEmpty(ff) && IS.nullOrEmpty(fd)) || (IS.nullOrEmpty(w) && IS.nullOrEmpty(m)) || IS.nullOrEmpty(fn)) {
    log('setting up user preferences', 'info');

    // check username
    if(IS.nullOrEmpty(u)) {
      nextView = new SettingsUsernameView({
        model: user
      });
    }
    // check gender
    else if(IS.nullOrEmpty(gender)) {
      nextView = new SettingsGenderView({
        model: user
      });
    }
    // check location
    else if(IS.nullOrEmpty(loc) || IS.nullOrEmpty(locN)) {
      nextView = new SettingsLocationView({
        model: user
      });
    }
    // check looking for friends/dates
    else if(IS.nullOrEmpty(ff) && IS.nullOrEmpty(fd)) {
      nextView = new SettingsFindTypeView({
        model: user
      });
    }
    // check gender preference
    else if(IS.nullOrEmpty(w) && IS.nullOrEmpty(m)) {
      nextView = new SettingsGenderPrefsView({
        model: user
      });
    }
    // check facebook notifications
    else if(IS.nullOrEmpty(fn)) {
    console.log(IS.nullOrEmpty(fn));

      nextView = new SettingsNotificationsView({
        model: user
      });
    }

    // if we're already showing a settings page (currentView), flip the two views
    if(currentView) {
      $(nextView.el).appendTo('body').show();

      setTimeout(function() {
        //IS.pageFlip(currentView.$el, nextView.$el);
        currentView.$el.css('z-index', '998').remove();
        nextView.$el.css('z-index', '999').show();
      }, 0);
    }
    // else fadeIn the settings page over the app
    else {
      $(nextView.el).appendTo('body').fadeIn();

      // temporarily remove scrollbars
      $('body').css('overflow', 'hidden');
    }

    // if it was the location page, activate the map by calling the view's show function
    if(IS.nullOrEmpty(loc) || IS.nullOrEmpty(locN)) nextView.show();
  }
  // we don't need to update any more settings, check if the user was previously
  // going through the setup process (if currentView is not null) and show the
  // 'done' screen
  else if(currentView) {
    log('user preferences are set - moving to the next page', 'info');
    matchesCollection.fetch({
      success: function(model, response) {
        dashboardView.refresh();
      }
    });
    currentView.$el.css('z-index', '998').remove();
    /*$('<section/>', {
        id: 'settingsDone'
    }).html($('#tplSettingsDone').html()).addClass('settings').appendTo('body');

    $('#settingsButtonDone').click(function() {
      IS.navigateTo('');
      router.welcome();
      $('#settingsDone').fadeOut(400, function() {
        // re-enable scrollbars
        $('body').css('overflow', 'auto');

        // fetch matches
        matchesCollection.fetch({
          success: function(model, response) {
            dashboardView.refresh();
          }
        });

        // remove settings screen from DOM
        $(this).remove();
      });
    });

    setTimeout(function() {
      //IS.pageFlip(currentView.$el, $('#settingsDone'));
        currentView.$el.css('z-index', '998').remove();
        $('#settingsDone').css('z-index', '999').show();
    }, 0);*/
  }
};

/**
 * Creates a page flip animation between two containers
 * @param {String} c1
 * @param {String} c2
 */
IS.pageFlip = function (c1, c2) {
  log('flipping pages', 'info');

  var iWidth = $(window).width();
  var iHeight = $(window).height();

  // create a new pageFlip placeholder
  $('#tplPageFlipPlaceholder').clone().attr('id', 'pageFlipPlaceholder').css({
    'height': iHeight + 'px'
  }).appendTo('body');

  // clone page into the placeholder divs
  $(c1).children().clone().appendTo('#pageFlipPlaceholder .pageA, #pageFlipPlaceholder .pageApartialInner');
  $(c2).children().clone().appendTo('#pageFlipPlaceholder .pageB, #pageFlipPlaceholder .pageBpartialInner');

  // set CSS before the animation
  $('#pageFlipPlaceholder .pageA').css({
    'left': '-' + (iWidth/2) + 'px',
    'width': iWidth + 'px',
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

  // process UI post-animation
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

/**
 * Creates a map widget and returns [lon,lat] per user selection
 * @param {String} container
 * @param {Boolean} bAllowTextInput
 */
function showMapAndGetLocation(container, bAllowTextInput, parentView, cb) {
    var haveAddress = false;
    var lat = null;
    var lng = null;
    var formattedAddress = null;
    var availableLocations = [];

    // init map object
    var map = new GMaps({
      div: container,
      lat: 43.834526782236814,
      lng: -37.265625,
      streetViewControl: false,
      width: '100%',
      height: '100%',
      zoom: 2,
      dragend: function() {
        $('#targetAdress').html('');
        $('#setLocation').hide();

        GMaps.geocode({
          location: map.getCenter(),
          callback: function(results, status) {
            if (status == 'OK') {
              availableLocations = _.last(_.pluck(results, 'formatted_address'), 5);
              if(availableLocations.length > 0) {
                parentView.showLocations(availableLocations);
                $('.mapCenterLocationMarker').html(availableLocations[0]);
                haveAddress = true;
              }
            }
          }
        });
      }
    });

    // enable button
    $('#setLocation').on('click', function() {
      if(haveAddress && $('.targetAdress').html() !== "") {
        lat = map.getCenter().lat();
        lng = map.getCenter().lng();
        formattedAddress = $('#targetAdress').text();

        log('user location set to: ' + lat + '/' + lng + ' (' + formattedAddress + ')', 'info');

        cb(lat, lng, formattedAddress);
      }
    });

    // get geoLocation
    GMaps.geolocate({
      success: function(position) {
        // center map to user's location
        map.setCenter(position.coords.latitude, position.coords.longitude);
        map.setZoom(12);

        // get geocode
        GMaps.geocode({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          callback: function(results, status) {
            if (status == 'OK') {
              availableLocations = _.last(_.pluck(results, 'formatted_address'), 5);
              if(availableLocations.length > 0) {
                parentView.showLocations(availableLocations);
                $('.mapCenterLocationMarker').html(availableLocations[0]);
                haveAddress = true;
              }
            }
          }
        });
      },
      error: function(error) {
        //alert('Geolocation failed: '+ error.message);
      },
      not_supported: function() {
        //alert("Your browser does not support geolocation");
      },
      always: function() {
        //alert("Done!");
      }
    });
}

/**
 * Add fancybox to images
 * @param {Object} objects
 */
function addToFancybox(jqObjects) {
  jqObjects.fancybox({
    prevEffect  : 'elastic',
    nextEffect  : 'elastic',
    padding: 0,
    helpers : {
      title : {
        type: 'outside'
      },
      overlay : {
        opacity : 0.85,
        css : {
          'background-color' : '#000'
        }
      },
      thumbs  : {
        height: 50
      }
    }
  });
}

/**
 * Helper log function
 * @param msg
 * @param msgType
 * @param context
 */
function log(msg, msgType, context) {
  if (typeof console != "undefined") {
    switch(msgType) {
      case 'log':
        console.log('  ~ ' + msg);
        break;
      case 'warn':
        console.warn(msg);
        break;
      case 'error':
        console.error(msg, context);
        break;
      case 'info':
        console.info('> ' + msg);
        break;
      default:
        console.log('  ~ ' + msg);
    }
  }
}

/**
 * Overwrite Backbone's sync method, to hash all requests using HMAC
 */
Backbone.sync = function(method, model, options) {
  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  var type = methodMap[method];

  // Default options, unless specified.
  options || (options = {});

  // Default JSON-request options.
  var params = {type: type, dataType: 'json'};
  params.contentType = 'application/json';

  // Ensure that we have a URL.
  if (!options.url) {
    params.url = getValue(model, 'url') || urlError();
  }

  // Ensure that we have the appropriate request data.
  if (!options.data && model && (method == 'create' || method == 'update')) {
    params.data = model.toJSON();
  } else {
    params.data = options.data;
  }

  // Don't process data on a non-GET request.
  if (params.type !== 'GET' && !Backbone.emulateJSON) {
    params.processData = false;
  }

  // Get user token
  var userToken = "null";
  var signed = false;
  if(!!user) {
    if(!!user.get('tkn')) {
      userToken = user.get('tkn');
      signed = true;
    }
  }


  var now = new Date();

  async.auto({
    // Verify FB token is not expired
    // -------------------------------------------------------------------------
    verifyFbToken: function(cb) {
      var fbtoken = store.get('fbToken');
      if(!!fbtoken) {
        var tokenExpiration = new Date(fbtoken.expiry);
        if(tokenExpiration - now > 0) {
          cb();
        } else {
          IS.facebookAuth(cb);
        }
      } else {
        IS.facebookAuth(cb);
      }
    }
  }, function(err, data) {
      // Make a hashed request
      var hashedRequest = {};

      // Set request data
      var requestData = {};

      // Set UTC timestamp
      var timestamp = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

      // Create request object
      var rawData = (params.data) ? params.data : {};

      requestData.data = rawData;
      requestData.timestamp = timestamp; // protection against 'replay' attacks
      requestData.uri = params.url;
      requestData.requestType = type; // protection against hash-collision attacks (setting DELETE instead of GET)

      // Create hashed request object
      hashedRequest.data = rawData;
      hashedRequest.hashedData = CryptoJS.HmacSHA256(JSON.stringify(requestData), userToken).toString(CryptoJS.enc.Hex);
      hashedRequest._id = user.get('_id');
      hashedRequest.isHashed = signed;
      hashedRequest.timestamp = timestamp;
      hashedRequest.uri = params.url;
      hashedRequest.requestType = type;
      hashedRequest.fTkn = store.get('fbToken').tkn;

      // update params with the hashed data
      params = _.extend(params, options);
      params.data = JSON.stringify(hashedRequest);
      params.type = 'POST';

      return $.ajax(params);
  });
};


/**
 * Adjusts the height of a text area
 */
IS.adjustTextArea = function(t) {
  a = t.value.split('\n');
  b = 1;
  for (x=0;x < a.length; x++) {
    if (a[x].length >= t.cols) b+= Math.floor(a[x].length/t.cols);
  }
  b += a.length;
  if (b > t.rows) t.rows = b;
};
