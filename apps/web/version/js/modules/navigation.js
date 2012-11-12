// =========================================================================
// Navigation view
// =========================================================================
var NavigationView = Backbone.View.extend({      
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);
    
    // get template
    this.template = document.getElementById("tplNavigation").innerHTML;

    // init sub views
    this.onlineUsersView = new OnlineUsersView({ model: onlineUsers });

    // update nav when user models changes
    this.model.bind('change:_id', this.refresh);

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
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing NavigationView');
    this.$el.html(this.html);
    
    // show sub view
    this.onlineUsersView.setElement(this.$('#nav_onlineUsers .userCount')).show();
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
    cb();
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