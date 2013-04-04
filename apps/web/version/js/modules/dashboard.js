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
    this.model.bind('change:u', this.render);
    this.model.bind('change:m', this.refreshMatches);
    this.model.bind('change:w', this.refreshMatches);
    this.model.bind('change:ff', this.refreshMatches);
    this.model.bind('change:fd', this.refreshMatches);
    this.collection.bind('reset', this.refreshMatches);

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
      itemMargin: 0,
      pauseOnHover: true,
      prevText: "<span class='icon icon-chevron-left'></span>",
      nextText: "<span class='icon icon-chevron-right'></span>"
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

  // refreshMatches
  // ---------------------------------------------------------------------------
  refreshMatches: function() {
    log('refreshing DashboardView matches-only');

    if($('body').data('page') == "home") {
      this.refresh();
    } else {
      this.render();
    }
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