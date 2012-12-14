// =========================================================================
// SettingsUsernameView
// =========================================================================
var SettingsUsernameView = Backbone.View.extend({
  // properties
  // -----------------------------------------------------------------------
  className: 'settings',
  tagName: 'section',

  // events
  // -----------------------------------------------------------------------
  events: {
    'click #saveUsername': 'save'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SettingsUsernameView');
    _.bindAll(this);
    this.render();
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SettingsUsernameView');
    var template = $('#tplSettingsUsername').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    // nothing yet
  },

  // save
  // -----------------------------------------------------------------------
  save: function() {
    console.log('  ~ saving SettingsView');

    var u = this.$('.settingUsernameInput').val();
    if(!IS.nullOrEmpty(u)) {
      // delete temp name
      this.model.unset('tempU', {silent: true});

      // save user model
      this.model.set('u', u);
      IS.saveUser();

      // move on to the next setting
      IS.setupUser(this);
    }
  }
});

// =========================================================================
// SettingsLocationView
// =========================================================================
var SettingsLocationView = Backbone.View.extend({
  // properties
  // -----------------------------------------------------------------------
  className: 'settings',
  tagName: 'section',

  // events
  // -----------------------------------------------------------------------
  events: {
    //'click #saveUsername': 'save'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SettingsLocationView');
    _.bindAll(this);
    this.render();
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SettingsLocationView');
    var template = $('#tplMapWidget').html();
    var mapStrings = {
      h1: 'Welcome ' + this.model.get('u') + '! What is your location?',
      h2: 'Instasoda members will see your location. In order to protect your privacy, we recommend only zooming-in up to your general area in your city/town.',
      target: 'drag the map to center at your approximate location!',
      buttonTxt: 'Set my location to <span id="targetAdress"> ...drag the map!</span>'
    };
    this.$el.html(Mustache.to_html(template, mapStrings));
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    var _this = this;

    // show map widget
    showMapAndGetLocation('#mapContainer', true, function(lat, lng, formattedAddress) {
      _this.model.set('loc', [lng, lat]);
      _this.model.set('locN', formattedAddress);

      // save user model
      IS.saveUser();

      // move on to the next setting
      IS.setupUser(_this);
    });
  }
});

// =========================================================================
// SettingsFindTypeView (friendship / dating)
// =========================================================================
var SettingsFindTypeView = Backbone.View.extend({
  // properties
  // -----------------------------------------------------------------------
  className: 'settings',
  tagName: 'section',

  // events
  // -----------------------------------------------------------------------
  events: {
    'click #saveFindType': 'save'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SettingsFindTypeView');
    _.bindAll(this);
    this.render();
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SettingsFindTypeView');
    var template = $('#tplSettingsFindType').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    // nothing yet
  },

  // save
  // -----------------------------------------------------------------------
  save: function() {
    console.log('  ~ saving SettingsFindTypeView');

    var ff = this.$('input[name="findFriends"]:checked').length;
    var fd = this.$('input[name="findDates"]:checked').length;

    if(!IS.nullOrEmpty(ff) || !IS.nullOrEmpty(fd)) {
      // save user model
      this.model.set('ff', ff);
      this.model.set('fd', fd);
      IS.saveUser();

      // move on to the next setting
      IS.setupUser(this);
    }
  }
});

// =========================================================================
// SettingsGenderPrefsView
// =========================================================================
var SettingsGenderPrefsView = Backbone.View.extend({
  // properties
  // -----------------------------------------------------------------------
  className: 'settings',
  tagName: 'section',

  // events
  // -----------------------------------------------------------------------
  events: {
    'click #saveGenderPrefs': 'save'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SettingsGenderPrefsView');
    _.bindAll(this);
    this.render();
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SettingsGenderPrefsView');
    var template = $('#tplSettingsGenderPrefs').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    // nothing yet
  },

  // save
  // -----------------------------------------------------------------------
  save: function() {
    console.log('  ~ saving SettingsGenderPrefsView');

    var m = this.$('input[name="men"]:checked').length;
    var w = this.$('input[name="women"]:checked').length;

    if(!IS.nullOrEmpty(m) || !IS.nullOrEmpty(w)) {
      // update gender prefs
      this.model.set('m', m);
      this.model.set('w', w);

      // update gender prefs in the search options
      var so = (this.model.get('so')) ? this.model.get('so') : {};
      so.m = (m > 0) ? 'male' : 0;
      so.w = (w > 0) ? 'female' : 0;
      this.model.set('so', so);

      // save user
      IS.saveUser();

      // move on to the next setting
      IS.setupUser(this);
    }
  }
});