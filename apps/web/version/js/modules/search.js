// =========================================================================
// SearchView
// =========================================================================
var SearchView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    // bindings
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplSearch").innerHTML;

    // initialize sub-views
    this.searchResultsView = new SearchResultsView({
      collection: this.collection
    });
    this.searchFiltersView = new SearchFiltersView({
      model: this.model
    });

    // update UI on collection change
    this.collection.bind('reset', this.refreshSidebarButtons);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering SearchView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());

    // render sub views
    this.searchFiltersView.render();
    this.searchResultsView.render();
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing SearchView');
    this.$el.html(this.html);

    // show sub views
    this.searchFiltersView.setElement(this.$('#searchFilters')).show();
    this.searchResultsView.setElement(this.$('#searchResults')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering SearchView');

    // enter sub views
    this.searchFiltersView.enter();
    this.searchResultsView.enter();
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving SearchView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing SearchView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  },

  // refreshSidebarButtons
  // ---------------------------------------------------------------------------
  refreshSidebarButtons: function() {
    this.searchFiltersView.refreshSidebarButtons();
  }
});

// =========================================================================
// SearchFilters view
// =========================================================================
var SearchFiltersView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #doSearch': 'doSearch',
    'click #doSearchRandom': 'doSearchRandom',
    'click .remove-search-like': 'removeSearchLike'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplSearchFilters").innerHTML;

    // bindings
    this.model.bind('newSearchLike', this.refresh);
    this.model.bind('removedSearchLike', this.refresh);
    this.model.bind('change:so', this.refresh);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var _this = this;
    log('rendering SearchFiltersView');

    // determine default filter values
    this.userSearchOptions = this.model.get('so');

    // render template
    this.html = Mustache.to_html(this.template, this.model.toJSON());
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing SearchFiltersView');
    this.$el.html(this.html);
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering SearchFiltersView');

    var _this = this;

    // enable jquery slider
    this.$("#ageRange").slider({
      range: true,
      min: 18,
      max: 70,
      values: [_this.userSearchOptions.ageMin, _this.userSearchOptions.ageMax],
      slide: function(event, ui) {
        $("#ageNum").text(ui.values[0] + " - " + ui.values[1] + " years old");
      }
    });
    this.$("#ageNum").text(this.$("#ageRange").slider("values", 0) + " - " + this.$("#ageRange").slider("values", 1) + " years old");
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving SearchFiltersView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing SearchFiltersView');

    if( !! user.get('so')) {
      var _this = this;

      this.leave(function() {
        _this.render();
        _this.show();
        _this.enter();
      });
    }
  },

  // refreshSidebarButtons
  // ---------------------------------------------------------------------------
  refreshSidebarButtons: function() {
    this.$('#doSearch, #doSearchRandom').removeClass('transparent hidden');
    this.$('#working').addClass('transparent hidden');
  },

  // doSearch
  // -----------------------------------------------------------------------
  doSearch: function() {
    this.$('#doSearch, #doSearchRandom').addClass('transparent hidden');
    this.$('#working').removeClass('transparent hidden');

    // fetch search options
    var options = new Object({
      'w': ((this.$('input[name=interestedInWomen]:checked').length > 0) ? 'female' : 0),
      'm': ((this.$('input[name=interestedInMen]:checked').length > 0) ? 'male' : 0),
      'on': ((this.$('input[name=onlyOnline]:checked').length > 0) ? true : null),
      'nearMe': ((this.$('input[name=nearMe]:checked').length > 0) ? 1 : 0),
      'ageMin': this.$("#ageRange").slider("values", 0),
      'ageMax': this.$("#ageRange").slider("values", 1),
      'l': this.model.get('so').l,
      'lon': ( !! this.model.get('loc')) ? this.model.get('loc')[0] : null,
      'lat': ( !! this.model.get('loc')) ? this.model.get('loc')[1] : null
    });

    // save these preferences into the user model
    this.model.set({
      so: options
    });
    IS.saveUser();

    //IS.navigateTo('search/' + options.m + '/' + options.w + '/' + options.nearMe + '/' + options.ageMin + '/' + options.ageMax + '/' + options.on + '/' + '0');

    options.l = (!!this.model.get('so').l) ? _.pluck(this.model.get('so').l, '_id') : [];
    usersCollection.fetch({
      data: options
    });
  },

  // doSearchRandom
  // -----------------------------------------------------------------------
  doSearchRandom: function() {
    this.$('#doSearch, #doSearchRandom').addClass('transparent hidden');
    this.$('#working').removeClass('transparent hidden');

    var randomMinAge = Math.floor(Math.random() * (65 - 18 + 1) + 18); // 18-65
    // fetch search options
    var options = new Object({
      'w': ((this.model.get('w') === 1) ? 'female' : 0),
      'm': ((this.model.get('w') === 1) ? 'male' : 0),
      'on': null,
      'nearMe': 0,
      'ageMin': randomMinAge,
      'ageMax': randomMinAge + 5,
      'l': null,
      'lon': null,
      'lat': null,
      'random': 1
    });

    //IS.navigateTo('search/' + options.m + '/' + options.w + '/' + options.nearMe + '/' + options.ageMin + '/' + options.ageMax + '/' + options.on + '/' + options.random);

    usersCollection.fetch({
      data: options
    });
  },

  // removeSearchLike
  // -----------------------------------------------------------------------
  removeSearchLike: function(e) {
    var likeId = $(e.currentTarget).parent().data('id');
    var likeName = $(e.currentTarget).parent().data('name');

    IS.addOrRemoveLikeFromSearchOptions(likeId, likeName);
  },
});

// =========================================================================
// SearchResultsView - contains a list of UsersView items,
// used for search results / matches
// =========================================================================
var SearchResultsView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SearchResultsView');

    _.bindAll(this);

    this.collection.bind('reset', this.refresh);
    this.collection.bind('change', this.refresh);
    this.collection.bind('add', this.refresh);
    this.collection.bind('remove', this.refresh);
  },

  // renderItem
  // -----------------------------------------------------------------------
  renderItem: function(model) {
    var usersView = new UsersView({
      model: model
    });
    usersView.render();
    this.html = this.html + '<li class="userPreview">' + usersView.$el.html() + '</li>';
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering SearchResultsView');
    this.html = '';
    if(this.collection.length > 0 ) this.collection.each(this.renderItem);
    else this.html = '<li class="no-results">no people found :(</li>';
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing SearchResultsView');
    this.$el.html(this.html);
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering SearchResultsView');
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving SearchResultsView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing SearchResultsView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  }
});

// =========================================================================
// UsersView - a basic view of a user appearing in the search results
// =========================================================================
var UsersView = Backbone.View.extend({
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
  // -----------------------------------------------------------------------
  render: function() {
    this.$el.html(Mustache.to_html(this.template, this.model.toJSON()));
  }
});