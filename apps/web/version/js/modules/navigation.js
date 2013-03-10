// =========================================================================
// Navigation view
// =========================================================================
var NavigationView = Backbone.View.extend({

  // events
  // -----------------------------------------------------------------------
  events: {
    'click #nav-starred-people': 'toggleStarredPeople'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplNavigation").innerHTML;

    // init sub views
    this.onlineUsersView = new OnlineUsersView({ model: onlineUsers });
    this.favouritesView = new FavouritesView({
      model: this.model,
      collection: favsCollection
    });

    // update nav when user models changes
    this.model.bind('change:tkn', this.refresh);
    this.model.bind('change:u', this.refresh);

    // render
    this.render();
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering NavigationView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());

    // render sub view
    this.onlineUsersView.render();
    this.favouritesView.render();
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing NavigationView');
    this.$el.html(this.html);

    // show sub view
    this.onlineUsersView.setElement(this.$('#nav_onlineUsers .userCount')).show();
    this.favouritesView.setElement(this.$('#starred-people')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering NavigationView');
    // TODO: animate icons
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving NavigationView');

    // leave favourites
    this.favouritesView.leave(cb);

    // TODO: animate icons
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing NavigationView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  },

  // toggleStarredPeople
  // ---------------------------------------------------------------------------
  toggleStarredPeople: function() {
    this.favouritesView.enter();

    this.$('#starred-people, #nav-starred-people').toggleClass('docked');
  }
});

// =========================================================================
// OnlineUsersView
// =========================================================================
var OnlineUsersView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing OnlineUsersView');
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplOnlineUsers").innerHTML;

    // render on change
    this.model.bind('change', this.refresh);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering OnlineUsersView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing OnlineUsersView');
    this.$el.html(this.html);
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering OnlineUsersView');
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving OnlineUsersView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing OnlineUsersView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  }
});