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
    console.log('> routing welcome page');

    if(appReady) {
      dashboardView.render();
      $('#content > div').detach();
      $('#content').append(dashboardView.el);
      IS.setupPage('home');
    } else {
      IS.prepareApp(null, function() {
        if(user.get('_id') == null) {
          welcomeView.render();
          $('#content > div').detach();
          $('#content').append(welcomeView.el);
          IS.setupPage('home');
        }
        else 
        {
          dashboardView.render();
          $('#content > div').detach();
          $('#content').append(dashboardView.el);
          IS.setupPage('home');
        }
      });
    }
  },
  
  // myProfile
  // -----------------------------------------------------------------------
  myProfile: function() {
    console.log('> routing my profile page');

    if(!appReady) {
      IS.prepareApp(null, function() {
        myProfileView.render();
        $('#content > div').detach();
        $('#content').append(myProfileView.el);
        IS.setupPage('profile');
      });
      return;
    } else {
      myProfileView.render();
      $('#content > div').detach();
      $('#content').append(myProfileView.el);
      IS.setupPage('profile');
    }
  },

  // matches
  // -----------------------------------------------------------------------
  matches: function() {
    console.log('> routing matches page');

    if(!appReady) {
      IS.prepareApp(null, function() {
        matchesCollection.fetch({
          data: {
            '_id': user.get('_id'),
            'fTkn': user.get('fTkn')
          }
        });

        matchesView.render();
        $('#content > div').detach();
        $('#content').append(matchesView.el);
        IS.setupPage('matches');
      });
      return;
    } else {
      matchesCollection.fetch({
        data: {
          '_id': user.get('_id'),
          'fTkn': user.get('fTkn')
        }
      });

      matchesView.render();
      $('#content > div').detach();
      $('#content').append(matchesView.el);
      IS.setupPage('matches');
    }
  },
       
  // search
  // -----------------------------------------------------------------------
  search: function(m, w, nearMe, ageMin, ageMax, onlyOnline, random) {
    console.log('> routing search page');

    if(!appReady) {
      IS.prepareApp(null, function() {
        // search by like - array with like id's
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
        searchView.render();
        $('#content > div').detach();
        $('#content').append(searchView.el);
        IS.setupPage('search');
      });
      return;
    } else {
      // search by like - array with like id's
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
      searchView.render();
      $('#content > div').detach();
      $('#content').append(searchView.el);
      IS.setupPage('search');
    }
  },

  // likes
  // -----------------------------------------------------------------------
  likes: function() {
    console.log('> routing likes page');

    if(!appReady) {
      IS.prepareApp(null, function() {
        likesView.render();
        $('#content > div').detach();
        $('#content').append(likesView.el);
        IS.setupPage('likes');
      });
      return;
    } else {
      likesView.render();
      $('#content > div').detach();
      $('#content').append(likesView.el);
      IS.setupPage('likes');
    }
  },

  // favourites
  // -----------------------------------------------------------------------
  favourites: function() {
    console.log('> routing favourites page');

    if(!appReady) {
      IS.prepareApp(null, function() {
        favouritesView.render();
        $('#content > div').detach();
        $('#content').append(favouritesView.el);
        IS.setupPage('favourites');
      });
      return;
    } else {
      favouritesView.render();
      $('#content > div').detach();
      $('#content').append(favouritesView.el);
      IS.setupPage('favourites');
    }
  },

  // mosaic
  // -----------------------------------------------------------------------
  mosaic: function() {
    console.log('> routing mosaic page');
    
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
    console.log('> routing logout page');
    IS.logout();
  },
  
  // viewUser
  // -----------------------------------------------------------------------
  viewUser: function(id) {
    console.log('> routing view user page');

    if(!appReady) {
      IS.prepareApp(null, function() {
        users.set({ '_id': id }, {silent: true});
        users.fetch({
          success: function() {
            usersFullView.render();
            $('#content > div').detach();
            $('#content').append(usersFullView.el);
            IS.setupPage('viewprofile');
          }
        });
      });
      return;
    } else {
      users.set({ '_id': id }, {silent: true});
      users.fetch({
        success: function() {
          usersFullView.render();
          $('#content > div').detach();
          $('#content').append(usersFullView.el);
          IS.setupPage('viewprofile');
        }
      });
    }
  }  
}); 
var router = null;