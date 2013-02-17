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

    // update on collection change
    this.collection.bind('reset', this.enter);
    this.collection.bind('change', this.enter);
    this.collection.bind('add', this.addUser);
    this.collection.bind('remove', this.removeUser);

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
    log('showing FavouritesView');
    this.$el.html(this.html);

    // show sub views
    this.favouritesUserListView.setElement(this.$('#starred-users-container .slides')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering FavouritesView');

    // show tip if collection is empty
    if(this.collection.length === 0) {
      this.$('.starred-users-tip').show();
      this.$('#starred-users-container').width(0);
    } else {
      // else size the container
      this.$('.starred-users-tip').hide();
      this.$('#starred-users-container').width(this.collection.length * 110);
    }

    // update counter text
    $('#nav-starred-people .nav-title').text(this.collection.length);
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving FavouritesView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing FavouritesView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  },

  // addUser
  // ---------------------------------------------------------------------------
  addUser: function(user) {
    log('addUser');

    this.enter();
    document.getElementById('starred-people').scrollLeft = $('.' + user.get('_id')).offset().left;
  },

  // removeUser
  // ---------------------------------------------------------------------------
  removeUser: function() {
    log('removeUser');

    this.enter();
  }
});