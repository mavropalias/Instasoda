// =========================================================================
// FavouritesView
// =========================================================================
var FavouritesView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing FavouritesView');
    
    // bindings
    _.bindAll(this);

    // model listener
    this.model.bind('change:favs', this.render);

    // create collection for the view
    this.favsCollection = new FavouritesCollection();
    
    // initialize sub-views
    this.favouritesUserListView = new FavouritesUserListView({ collection: this.favsCollection });
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering FavouritesView');

    var _this = this;

    // render template
    var template = $('#tplFavourites').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));

    // render sub views
    this.favouritesUserListView.setElement(this.$('#favouriteUsers'));


    // reset & populate collection from user's 'favs'
    this.favsCollection.reset();
    _.each(this.model.get('favs'), function(user){

      // fetch user's basic info
      socket.emit('getBasicUserInfoFromId', {
        userId: user
      }, function(err, user) {
        if(!err) {
          _this.favsCollection.add(user);
          _this.favouritesUserListView.render();
          //TODO: don't render on every user
        } else {
          console.log('getBasicUserInfoFromId error');
          //TODO: handle errors
        }
      }); 
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
    console.log('  ~ initializing FavouritesUserListView');
    
    _.bindAll(this);
    //this.collection.bind('reset', this.render);
  },

  // renderItem
  // -----------------------------------------------------------------------
  renderItem: function(model) {
    var favouritesUserView = new FavouritesUserView({
        model: model
    });
    favouritesUserView.render();
    this.$el.append(favouritesUserView.el);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering FavouritesUserListView');
    this.$el.html('');
    this.collection.each(this.renderItem);
  }
});

// =========================================================================
// FavouritesUserView - a basic view of a user appearing in the favourites
// =========================================================================
var FavouritesUserView = Backbone.View.extend({
  // properties
  // -----------------------------------------------------------------------
  className: 'userPreview',
  tagName: 'div',
  
  // events
  // -----------------------------------------------------------------------
  events: {
    'click': 'viewProfile'
  },

  // viewProfile
  // -----------------------------------------------------------------------
  viewProfile: function(e) {
    router.navigate(this.model.get('_id'), {trigger: true});
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering FavouritesUserView');
    var template = $('#tplSearchResult').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  }
});