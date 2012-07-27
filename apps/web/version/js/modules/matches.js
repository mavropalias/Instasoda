// =========================================================================
// MatchesView
// =========================================================================
var MatchesView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing MatchesView');
    
    // bindings
    _.bindAll(this);
    
    // initialize sub-views
    this.matchesResultsView = new SearchResultsView({ collection: this.collection });
    this.matchesFiltersView = new MatchesFiltersView({ model: this.model });
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering MatchesView');
    
    // render template
    var template = $('#tplMatches').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // render sub views
    this.matchesFiltersView.setElement(this.$('#matchesFilters')).render();
    this.matchesResultsView.setElement(this.$('#matchesResults'));
  }
});

// =========================================================================
// MatchesFilters view
// =========================================================================
var MatchesFiltersView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing MatchesFiltersView');
    _.bindAll(this);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var _this = this;
    console.log('  ~ rendering MatchesFiltersView');
    
    // render template
    var template = $('#tplMatchesFilters').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  }
});