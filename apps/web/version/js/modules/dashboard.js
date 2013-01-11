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
    this.model.bind('change:m', this.render);
    this.model.bind('change:u', this.render);
    this.model.bind('change:w', this.render);
    this.model.bind('change:ff', this.render);
    this.model.bind('change:fd', this.render);
    this.collection.bind('reset', this.render);

    // fetch collection
    this.collection.fetch();

    // initialize sub-views
    this.matchesResultsView = new SearchResultsView({ collection: this.collection });
  },

  // events
  // -----------------------------------------------------------------------
  events: {
    'click #facebook-invite': 'facebookInvite'
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering DashboardView');

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
    this.matchesResultsView.setElement(this.$('#dashboard-matches .slides')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering DashboardView');

    this.matchesResultsView.enter();

    // enable flexSlider
    $('#dashboard-matches').flexslider({
      animation: "slide",
      animationLoop: true,
      itemWidth: 200,
      itemMargin: 20,
      minItems: 2,
      maxItems: 8
    });

    // render facebook like-box
    FB.XFBML.parse(document.getElementById('dashboard'));
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
  },

  // facebookInvite
  // -----------------------------------------------------------------------
  facebookInvite: function() {
    log('facebookInvite');

    FB.ui({
      method: 'apprequests',
      filter: ['app_non_users'],
      title: 'Invite your friends to Instasoda!',
      message: 'Check this app out. It lets you find people who share the things that you like. :)'
    }, function() {

    });
  },
});