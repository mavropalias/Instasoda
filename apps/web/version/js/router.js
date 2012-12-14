// #########################################################################
// #########################################################################
// # Routes
// #########################################################################
// #########################################################################

var Router = Backbone.Router.extend({

  // routes
  // -----------------------------------------------------------------------
  routes: {
    // Welcome
    "": "welcome",

    // Edit my profile
    "me/edit": "editMyProfile",

    // My profile
    "me": "myProfile",

    // Matches
    "matches": "matches",

    // Search filters
    "search": "search",

    // Search results
    "search/:m/:w/:nearMe/:ageMin/:ageMax/:onlyOnline/:random": "search",

    // Likes
    "likes": "likes",

    // Favourites
    "favourites": "favourites",

    // Mosaic
    "mosaic": "mosaic",

    // Beta message
    "beta": "beta",

    // Logout
    "logout": "logout",

    // View user
    ":id": "viewUser"
  },

  // welcome
  // -----------------------------------------------------------------------
  welcome: function() {
    log('routing welcome page', 'info');

    if(appReady) {
      /*dashboardView.render();
      $('#content > div').detach();
      $('#content').append(dashboardView.el);*/
      IS.changeView(IS.currentView, dashboardView);
      IS.setupPage('home');
    } else {
      IS.prepareApp(null, function() {
        if(user.get('_id') == null) {
          /*welcomeView.render();
          $('#content > div').detach();
          $('#content').append(welcomeView.el);*/
          IS.changeView(IS.currentView, welcomeView);
          IS.setupPage('home');
        }
        else
        {
          /*dashboardView.render();
          $('#content > div').detach();
          $('#content').append(dashboardView.el);*/
          IS.changeView(IS.currentView, dashboardView);
          IS.setupPage('home');
        }
      });
    }
  },

  // editMyProfile
  // -----------------------------------------------------------------------
  editMyProfile: function() {
    log('routing editMyProfile page', 'info');

    if(!appReady) {
      IS.prepareApp(null, function() {
        /*myProfileView.render();
        $('#content > div').detach();
        $('#content').append(myProfileView.el);*/
        IS.changeView(IS.currentView, editMyProfileView);
        IS.setupPage('profile');
      });
      return;
    } else {
      /*myProfileView.render();
      $('#content > div').detach();
      $('#content').append(myProfileView.el);*/
      IS.changeView(IS.currentView, editMyProfileView);
      IS.setupPage('profile');
    }
  },

  // myProfile
  // -----------------------------------------------------------------------
  myProfile: function() {
    log('routing my profile page', 'info');

    if(!appReady) {
      IS.prepareApp(null, function() {
        /*myProfileView.render();
        $('#content > div').detach();
        $('#content').append(myProfileView.el);*/
        IS.changeView(IS.currentView, myProfileView);
        IS.setupPage('profile');
      });
      return;
    } else {
      /*myProfileView.render();
      $('#content > div').detach();
      $('#content').append(myProfileView.el);*/
      IS.changeView(IS.currentView, myProfileView);
      IS.setupPage('profile');
    }
  },

  // matches
  // -----------------------------------------------------------------------
  matches: function() {
    log('routing matches page', 'info');

    if(!appReady) {
      IS.prepareApp(null, function() {
        IS.changeView(IS.currentView, matchesView);
        IS.setupPage('matches');
      });
      return;
    } else {
      IS.changeView(IS.currentView, matchesView);
      IS.setupPage('matches');
    }
  },

  // search
  // -----------------------------------------------------------------------
  search: function(m, w, nearMe, ageMin, ageMax, onlyOnline, random) {
    log('routing search page', 'info');

    if(!appReady) {
      IS.prepareApp(null, function() {
        // search by like - array with like ids
        var searchByLike = (!!user.get('so').l) ? _.pluck(user.get('so').l, '_id') : [];

        // fetch options from URL - if null then load user defaults
        if(ageMin > 0) {
          usersCollection.fetch({
            data: {
              'm': m,
              'w': w,
              'on': (onlyOnline == 'true'),
              'nearMe': nearMe,
              'lon': (!!user.get('loc')) ? user.get('loc')[0] : null,
              'lat': (!!user.get('loc')) ? user.get('loc')[1] : null,
              'ageMin': ageMin,
              'ageMax': ageMax,
              'l': searchByLike,
              'random': random
            }
          });
        } else {
          usersCollection.fetch({
            data: {
              'm': user.get('so').m,
              'w': user.get('so').w,
              'on': user.get('so').on,
              'nearMe': user.get('so').nearMe,
              'lon': (!!user.get('loc')) ? user.get('loc')[0] : null,
              'lat': (!!user.get('loc')) ? user.get('loc')[1] : null,
              'ageMin': user.get('so').ageMin,
              'ageMax': user.get('so').ageMax,
              'l': searchByLike,
              'random': random
            }
          });
        }
        /*searchView.render();
        $('#content > div').detach();
        $('#content').append(searchView.el);*/
        IS.changeView(IS.currentView, searchView);
        IS.setupPage('search');
      });
      return;
    } else {
      // search by like - array with like ids
      var searchByLike = (!!user.get('so').l) ? _.pluck(user.get('so').l, '_id') : [];

      // fetch options - if null then load user defaults
      if(ageMin > 0) {
        usersCollection.fetch({
          data: {
            'm': m,
            'w': w,
            'on': (onlyOnline == 'true'),
            'nearMe': nearMe,
            'lon': (!!user.get('loc')) ? user.get('loc')[0] : null,
            'lat': (!!user.get('loc')) ? user.get('loc')[1] : null,
            'ageMin': ageMin,
            'ageMax': ageMax,
            'l': searchByLike,
            'random': random
          }
        });
      } else {
        usersCollection.fetch({
          data: {
            'm': user.get('so').m,
            'w': user.get('so').w,
            'on': user.get('so').on,
            'nearMe': user.get('so').nearMe,
            'lon': (!!user.get('loc')) ? user.get('loc')[0] : null,
            'lat': (!!user.get('loc')) ? user.get('loc')[1] : null,
            'ageMin': user.get('so').ageMin,
            'ageMax': user.get('so').ageMax,
            'l': searchByLike,
            'random': random
          }
        });
      }
      /*searchView.render();
      $('#content > div').detach();
      $('#content').append(searchView.el);*/
      IS.changeView(IS.currentView, searchView);
      IS.setupPage('search');
    }
  },

  // likes
  // -----------------------------------------------------------------------
  likes: function() {
    log('routing likes page', 'info');

    if(!appReady) {
      IS.prepareApp(null, function() {
        /*likesView.render();
        $('#content > div').detach();
        $('#content').append(likesView.el);*/
        IS.changeView(IS.currentView, likesView);
        IS.setupPage('likes');
      });
      return;
    } else {
      /*likesView.render();
      $('#content > div').detach();
      $('#content').append(likesView.el);*/
      IS.changeView(IS.currentView, likesView);
      IS.setupPage('likes');
    }
  },

  // favourites
  // -----------------------------------------------------------------------
  favourites: function() {
    log('routing favourites page', 'info');

    if(!appReady) {
      IS.prepareApp(null, function() {
        /*favouritesView.render();
        $('#content > div').detach();
        $('#content').append(favouritesView.el);*/
        IS.changeView(IS.currentView, favouritesView);
        IS.setupPage('favourites');
      });
      return;
    } else {
      /*favouritesView.render();
      $('#content > div').detach();
      $('#content').append(favouritesView.el);*/
      IS.changeView(IS.currentView, favouritesView);
      IS.setupPage('favourites');
    }
  },

  // mosaic
  // -----------------------------------------------------------------------
  mosaic: function() {
    log('routing mosaic page', 'info');

    $('#content > div').detach();

    // create div & iframe for mosaic
    $('<div id="mosaic"/>').appendTo('#content');
    $('<iframe id="mosaicFrame"/>').appendTo('#mosaic');
    $('#mosaicFrame').attr('src', 'mosaic/index.html').css({
      height: '100%',
      width: '100%'
    });

    IS.setupPage('mosaic');
  },

  // logout
  // -----------------------------------------------------------------------
  logout: function() {
    log('routing logout page', 'info');
    IS.logout();
  },

  // viewUser
  // -----------------------------------------------------------------------
  viewUser: function(id) {
    log('routing view user page', 'info');

    if(!appReady) {
      IS.prepareApp(null, function() {
        users.set({ '_id': id }, {silent: true});
        users.fetch({
          success: function() {
            IS.changeView(IS.currentView, usersFullView);
            IS.setupPage('viewprofile');
          }
        });
      });
      return;
    } else {
      users.set({ '_id': id }, {silent: true});

      users.fetch({
        success: function() {
          // only re-render the user page if going to a different user
          if(router.previousProfileViewed != id) {
            usersFullView.render();
            router.previousProfileViewed = id;
          }

          IS.changeView(IS.currentView, usersFullView);
          IS.setupPage('viewprofile');
        }
      });
    }
  }
});
var router = null;