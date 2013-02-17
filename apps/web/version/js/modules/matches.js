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
    this.searchResultsView = new SearchResultsView({
      collection: this.collection
    });

    // update UI on collection change
    this.collection.bind('reset', this.refreshResultsCounter);
    this.collection.bind('change', this.refreshResultsCounter);
    this.collection.bind('add', this.refreshResultsCounter);
    this.collection.bind('remove', this.refreshResultsCounter);
  },


  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering MatchesView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());

    // render sub views
    this.searchResultsView.render();
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing MatchesView');
    this.$el.html(this.html);

    // show sub views
    this.searchResultsView.setElement(this.$('#searchResults')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering MatchesView');

    this.refreshResultsCounter();

    // enter sub views
    this.searchResultsView.enter();
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
  },

  // refreshResultsCounter
  // ---------------------------------------------------------------------------
  refreshResultsCounter: function() {
    this.$('.results-counter-icon').hide();
    this.$('.results-counter').text(this.collection.length);
  }
});