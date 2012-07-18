// Create the IS namespace
// =============================================================================

  var IS = {};
  IS.notificationsArray = new Array;

// Config
// =============================================================================
  
  var appReady = false;
  var socketIoHost = "http://localhost:8082"; //##socketIoHost##
  var sApi = "http://localhost:8080/api/"; //##apiUrl##
  jQuery.support.cors = true;


// Initialize application
// =============================================================================
  

  // User - the person using the app
  // =========================================================================
  var User = Backbone.Model.extend({
    defaults: {
    },
    idAttribute: "_id",
    urlRoot: sApi + 'user'
  });

  // Users - all other Instasoda users
  // =========================================================================
  var Users = Backbone.Model.extend({
    defaults: {
    },
    idAttribute: "_id",
    urlRoot: sApi + 'user'
  });
  
  // OnlineUsers
  // =========================================================================
  var OnlineUsers = Backbone.Model.extend({
    defaults: {
    }
  });

  // UsersCollection - a collection of Users
  // =========================================================================
  var UsersCollection = Backbone.Collection.extend({
    url: sApi + 'user/search'
  });

  // MatchesCollection - a collection of matches
  // =========================================================================
  var MatchesCollection = Backbone.Collection.extend({
    url: sApi + 'user/matches'
  });

  // FavouritesCollection - user's favourite people
  // =========================================================================
  var FavouritesCollection = Backbone.Collection.extend();

  // ChatSession
  // =========================================================================
  var ChatSession = Backbone.Model.extend({
    idAttribute: "_id"
  });

  // ChatSessionLog
  // =========================================================================
  var ChatSessionLog = Backbone.Model.extend({
    idAttribute: "_id",
    log: {}
  });

  // ChatSessions
  // =========================================================================
  var ChatSessions = Backbone.Collection.extend({
    url: sApi + 'chat'
  });

  // Backbone models
  // -------------------------------------------------------------------------
  var user = new User();
  var users = new Users();
  var onlineUsers = new OnlineUsers();

  // Backbone collections
  // -------------------------------------------------------------------------
  var usersCollection = new UsersCollection({
    model: users
  });
  var matchesCollection = new MatchesCollection({
    model: users
  });
  var chatSessions = new ChatSessions({
    model: ChatSession
  });
  
  // Backbone views
  // -------------------------------------------------------------------------
  var navigationView;
  var chatView;
  var welcomeView;
  var betaView;
  var myProfileView;
  var searchView;
  var favouritesView;
  var matchesView;
  var usersFullView;
  var likesView;


// Start application
// =============================================================================
  
  jQuery(function($) {

    // Backbone views
    // -------------------------------------------------------------------------
    navigationView = new NavigationView({
      el: $('nav')[0],
      model: user
    });
    chatView = new ChatView({
      el: $('#footer')[0],
      model: user
    });
    welcomeView = new WelcomeView();
    betaView = new BetaView();
    myProfileView = new MyProfileView({
      model: user
    });
    searchView = new SearchView({
      collection: usersCollection,
      model: user
    });
    matchesView = new MatchesView({
      collection: matchesCollection,
      model: user
    });
    favouritesView = new FavouritesView({
      model: user
    });
    usersFullView = new UsersFullView({
      model: users,
    });
    likesView = new LikesView({
      model: user,
    });

    Backbone.history.start({});
  });