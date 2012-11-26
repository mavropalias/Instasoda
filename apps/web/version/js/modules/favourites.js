// =========================================================================
// FavouritesView
// =========================================================================
var FavouritesView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {   
    // bindings
    _.bindAll(this);
    
    // initialize sub-views
    this.favouritesUserListView = new SearchResultsView({ collection: this.collection });

    // get template
    this.template = document.getElementById("tplFavourites").innerHTML;

    // render
    this.render();
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering FavouritesView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());

    // render sub views
    this.favouritesUserListView.render();
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing NavigationView');
    this.$el.html(this.html);

    // show sub views
    this.favouritesUserListView.setElement(this.$('#favouriteUsers')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering NavigationView');
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving NavigationView');
    cb();
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
// FavouritesUserListView - a list of favourite users
// =========================================================================
var FavouritesUserListView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {   
    _.bindAll(this);
  },

  // renderItem
  // -----------------------------------------------------------------------
  renderItem: function(model) {
    var favouritesUserView = new FavouritesUserView({
        model: model
    });
    favouritesUserView.render();
    this.html = this.html + '<div class="userPreview">' + favouritesUserView.$el.html() + '</div>';
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering FavouritesUserListView');
    this.html = '';
    this.collection.each(this.renderItem);
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing FavouritesUserListView');
    this.$el.html(this.html);
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering FavouritesUserListView');
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving FavouritesUserListView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing FavouritesUserListView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  }
});

// =============================================================================
// FavouritesUserView - a basic view of a user appearing in the favourites
// =============================================================================
var FavouritesUserView = Backbone.View.extend({
  // properties
  // -----------------------------------------------------------------------
  className: 'userPreview',
  tagName: 'li',

  // initialize
  // ---------------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplSearchResult").innerHTML;
  },

  // render
  // ---------------------------------------------------------------------------
  render: function() {
    log('rendering FavouritesUserView');
    this.$el.html(Mustache.to_html(this.template, this.model.toJSON()));
  }
});