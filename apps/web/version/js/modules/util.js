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
 */
IS.addOrRemoveLikeFromSearchOptions = function(likeId) {
  var userSearchLikes = (!!user.get('so').l) ? user.get('so').l : [];

  // search if the like is already in the user's search options
  // AND is the total likes are no more than 10
  // if so, then add it to the user model
  // ==========================================================
  if(!_.any(userSearchLikes, function(like) { return like._id == likeId; }) && userSearchLikes.length < 10) 
  {
    console.log(' - adding search like');

    userSearchLikes.push({
      _id: likeId
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

/**
 * Saves the user model to the API.
 */
IS.saveUser = function() {
  user.save();
  store.set('user', user);
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