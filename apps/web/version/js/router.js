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
    "search/:m/:w/:nearMe/:ageMin/:ageMax": "search",

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
    welcomeView.render();
    $('#content > div').detach();
    $('#content').append(welcomeView.el);
    IS.setupPage('welcome');
  },
  
  // myProfile
  // -----------------------------------------------------------------------
  myProfile: function() {
    if(!appReady) {
      router.navigate('', {trigger: true});
      return;
    }
    console.log('> routing my profile page');
    myProfileView.render();
    $('#content > div').detach();
    $('#content').append(myProfileView.el);
    IS.setupPage('myProfile');
  },

  // matches
  // -----------------------------------------------------------------------
  matches: function() {
    if(!appReady) {
      router.navigate('', {trigger: true});
      return;
    }
    console.log('> routing matches page');

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
  },
       
  // search
  // -----------------------------------------------------------------------
  search: function(m, w, nearMe, ageMin, ageMax) {
    if(!appReady) {
      router.navigate('', {trigger: true});
      return;
    }
    console.log('> routing search page');

    // search by like - array with like id's
    var searchByLike = (!!user.get('so').l) ? _.pluck(user.get('so').l, '_id') : [];

    // fetch options - if null then load user defaults
    if(ageMin > 0) {
      usersCollection.fetch({
        data: {
          'm': m,
          'w': w,
          'nearMe': nearMe,
          'ageMin': ageMin,
          'ageMax': ageMax,
          'l': searchByLike,
          '_id': user.get('_id'),
          'fTkn': user.get('fTkn')
        }
      });
    } else {
      usersCollection.fetch({
        data: {
          'm': user.get('so').m,
          'w': user.get('so').w,
          'nearMe': user.get('so').nearMe,
          'ageMin': user.get('so').ageMin,
          'ageMax': user.get('so').ageMax,
          'l': searchByLike,
          '_id': user.get('_id'),
          'fTkn': user.get('fTkn')
        }
      });
    }
    searchView.render();
    $('#content > div').detach();
    $('#content').append(searchView.el);
    IS.setupPage('search');
  },

  // likes
  // -----------------------------------------------------------------------
  likes: function() {
    if(!appReady) {
      router.navigate('', {trigger: true});
      return;
    }
    console.log('> routing likes page');
    likesView.render();
    $('#content > div').detach();
    $('#content').append(likesView.el);
    IS.setupPage('likes');
  },

  // favourites
  // -----------------------------------------------------------------------
  favourites: function() {
    if(!appReady) {
      router.navigate('', {trigger: true});
      return;
    }
    console.log('> routing favourites page');
    favouritesView.render();
    $('#content > div').detach();
    $('#content').append(favouritesView.el);
    IS.setupPage('favourites');
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
  },
  
  // beta
  // -----------------------------------------------------------------------
  beta: function() {
    if(!appReady) {
      router.navigate('', {trigger: true});
      return;
    }
    console.log('> routing beta page');
    betaView.render();
    $('#content > div').detach();
    $('#content').append(betaView.el);
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
    if(!appReady) {
      router.navigate('', {trigger: true});
      return;
    }
    console.log('> routing view user page');
    
    users.set({ '_id': id }, {silent: true});
    users.fetch({
      success: function() {
        usersFullView.render();
        $('#content > div').detach();
        $('#content').append(usersFullView.el);
        IS.setupPage('profile');
      }
    });
  }  
}); 
var router = new Router;