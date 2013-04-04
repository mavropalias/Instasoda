// Create the IS namespace
// =============================================================================

  var IS = {};
  IS.notificationsArray = [];
  IS.fbToken = null;
  IS.fbTokenExpires = null;
  IS.currentView = null;

// Config
// =============================================================================

  var FB = false;
  var appReady = false;
  var userReady = false;
  var socketIoHost = "https://localhost:443"; //##socketIoHost##
  var sApi = "http://localhost:8080/api/"; //##apiUrl##
  var sApiHttps = "https://localhost/api/"; //##apiHttpsUrl##
  jQuery.support.cors = true;


// Bootstrap application
// =============================================================================

  // User - the person using the app
  var User = Backbone.Model.extend({
    defaults: {
    },
    idAttribute: "_id",
    urlRoot: sApi + 'me'
  });

  // Users - all other Instasoda users
  var Users = Backbone.Model.extend({
    defaults: {
    },
    idAttribute: "_id",
    urlRoot: sApi + 'user'
  });

  // OnlineUsers
  var OnlineUsers = Backbone.Model.extend({
    defaults: {
    }
  });

  // UsersCollection - a collection of Users
  var UsersCollection = Backbone.Collection.extend({
    url: sApi + 'search'
  });

  // MatchesCollection - a collection of matches
  var MatchesCollection = Backbone.Collection.extend({
    url: sApi + 'me/matches'
  });

  // FavouritesCollection - user's favourite people
  var FavouritesCollection = Backbone.Collection.extend({
    url: sApi + 'me/favourites'
  });

  // InterestsCollection
  var InterestsCollection = Backbone.Collection.extend({
    url: sApi + 'interests'
  });

  // ChatSession
  var ChatSession = Backbone.Model.extend({
    idAttribute: "_id"
  });

  // ChatSessionLog
  var ChatSessionLog = Backbone.Model.extend({
    idAttribute: "_id",
    log: {}
  });

  // ChatSessions
  var ChatSessions = Backbone.Collection.extend({
    url: sApi + 'me/chat'
  });

  // Like
  var Like = Backbone.Model.extend();

  // Likes
  var Likes = Backbone.Model.extend();

  // Backbone models
  // ---------------------------------------------------------------------------
  var user = new User();
  var users = new Users();
  var onlineUsers = new OnlineUsers();

  // Backbone collections
  // ---------------------------------------------------------------------------
  var usersCollection = new UsersCollection({
    model: users
  });
  var favsCollection = new FavouritesCollection();
  var matchesCollection = new MatchesCollection({
    model: users
  });
  var chatSessions = new ChatSessions({
    model: ChatSession
  });
    chatSessions.comparator = function(session) {
      return parseInt(session.get("t"), 10);
    };
  var interestsCollection = new InterestsCollection();

  // Backbone views
  // ---------------------------------------------------------------------------
  var navigationView;
  var userbarView;
  var welcomeView;
  var myProfileView;
  var editMyProfileView;
  var searchView;
  var favouritesView;
  var matchesView;
  var usersFullView;
  var likesView;
  var dashboardView;


// Start application
// =============================================================================

  // get main content area
  var mainContentElement = document.getElementById('content');
  var navigationBarElement = '';//document.getElementById('navigation-bar');
  var userBarElement = '';//document.getElementById('user-bar');

  jQuery(function($) {
    // Initialize Backbone views
    // =========================
    navigationView = new NavigationView({
      el: document.getElementById('navigation-bar'),
      model: user
    });
    userbarView = new UserbarView({
      el: document.getElementById('user-bar'),
      model: user
    });
    dashboardView = new DashboardView({
      el: document.getElementById('content'),
      collection: matchesCollection,
      model: user
    });
    welcomeView = new WelcomeView({
      el: document.getElementById('content')
    });
    myProfileView = new MyProfileView({
      el: document.getElementById('content'),
      model: user
    });
    editMyProfileView = new EditMyProfileView({
      el: document.getElementById('content'),
      model: user
    });
    searchView = new SearchView({
      el: document.getElementById('content'),
      collection: usersCollection,
      model: user
    });
    matchesView = new MatchesView({
      el: document.getElementById('content'),
      collection: matchesCollection,
      model: user
    });
    usersFullView = new UsersFullView({
      el: document.getElementById('content'),
      model: users
    });
    likesView = new LikesView({
      el: document.getElementById('content'),
      model: user
    });

    // show navigation
    // -------------------------------------------------------------------------
      navigationView.show();
      userbarView.show();
  });