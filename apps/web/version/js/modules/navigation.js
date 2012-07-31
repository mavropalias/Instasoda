// =========================================================================
// Navigation view
// =========================================================================
var NavigationView = Backbone.View.extend({      
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);
    this.model.bind('change', this.render);
    this.render();
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering NavigationView');
    var template = $('#tplNavigation').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // render sub views
    this.onlineUsersView = new OnlineUsersView({ model: onlineUsers });
    this.onlineUsersView.setElement(this.$('#navOnlineUsers')).render();
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
    this.model.bind('change', this.render);
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering OnlineUsersView');
    var template = $('#tplOnlineUsers').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  }
});