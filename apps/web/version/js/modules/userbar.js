// =========================================================================
// Userbar view
// =========================================================================
var UserbarView = Backbone.View.extend({      
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);
    this.render();
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering UserbarView');
    var template = $('#tplUserbar').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  }
});