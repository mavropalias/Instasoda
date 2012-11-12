// =========================================================================
// MatchesView
// =========================================================================
var MatchesView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {    
    // bindings
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplMatches").innerHTML;
    
    // initialize sub-views
    this.matchesResultsView = new SearchResultsView({ collection: this.collection });
    this.matchesFiltersView = new MatchesFiltersView({ model: this.model });
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering MatchesView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());

    // render sub views
    this.matchesFiltersView.render();
    this.matchesResultsView.render();
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing MatchesView');
    this.$el.html(this.html);

    // show sub views
    this.matchesFiltersView.setElement(this.$('#matchesFilters')).show();
    this.matchesResultsView.setElement(this.$('#matchesResults')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering MatchesView');
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving MatchesView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing MatchesView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  }
});

// =========================================================================
// MatchesFilters view
// =========================================================================
var MatchesFiltersView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplMatchesFilters").innerHTML;
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering MatchesFiltersView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing MatchesFiltersView');
    this.$el.html(this.html);
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering MatchesFiltersView');
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving MatchesFiltersView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing MatchesFiltersView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  }
});