// =========================================================================
// DashboardView
// =========================================================================
var DashboardView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);
    
    // get template
    this.template = document.getElementById("tplDashboard").innerHTML;

    // update view when user models changes
    this.model.bind('change:tkn', this.refresh);

    // initialize sub-views
    this.matchesResultsView = new SearchResultsView({ collection: this.collection });
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering DashboardView');

    // fetch collection
    this.collection.fetch();

    // render html
    this.html = Mustache.to_html(this.template, this.model.toJSON());

    // render sub views
    this.matchesResultsView.render();
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing DashboardView');
    this.$el.html(this.html);

    // show sub views
    this.matchesResultsView.setElement(this.$('#dashboard-matches')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering DashboardView');
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving DashboardView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing DashboardView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  }
});