// =========================================================================
// DashboardView
// =========================================================================
var DashboardView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing DashboardView');
    
    // bindings
    _.bindAll(this);
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering DashboardView');
    
    // render template
    var template = $('#tplDashboard').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  }
});