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
// SettingsGenderView (male / female)
// =========================================================================
var SettingsGenderView = Backbone.View.extend({
  // properties
  // -----------------------------------------------------------------------
  className: 'settings',
  tagName: 'section',

  // events
  // -----------------------------------------------------------------------
  events: {
    'click #saveGender': 'save'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SettingsGenderView');
    _.bindAll(this);
    this.render();
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SettingsGenderView');
    var template = $('#tplSettingsGender').html();
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
    console.log('  ~ saving SettingsGenderView');

    var gender = $('input:radio[name=gender]:checked').val();

    if(!IS.nullOrEmpty(gender)) {
      // save user model
      this.model.set('g', gender);
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
    'click .location-name-label': 'setLocationName'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SettingsLocationView');
    _.bindAll(this);

    // locations template
    this.locTemplate = "<label class='location-name-label' data-name='{{location}}'><input type='radio' name='location' value='{{location}}' class='location-name'>{{location}}</label>";

    this.render();
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SettingsLocationView');
    var template = $('#tplMapWidget').html();
    var mapStrings = {
      h1: 'Set your location',
      h2: 'Tip: Other Instasoda members will see the location you choose. In order to protect your privacy, be only as specific as you feel comfortable with.',
      target: 'drag the map to centre on your location!',
      buttonTxt: 'Click here to set your location to: <span id="targetAdress"></span>'
    };
    this.$el.html(Mustache.to_html(template, mapStrings));
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    var _this = this;

    // show map widget
    showMapAndGetLocation('#mapContainer', true, this, function(lat, lng, formattedAddress) {
      _this.model.set('loc', [lng, lat]);
      _this.model.set('locN', formattedAddress);

      // save user model
      IS.saveUser();

      // move on to the next setting
      IS.setupUser(_this);
    });
  },

  // showLocations
  // -----------------------------------------------------------------------
  showLocations: function(locations) {
    var _this = this;

    // clear current locations
    this.$('.location-names-container').html('');

    locations.forEach(function(loc) {
      _this.$('.location-names-container').append(Mustache.to_html(_this.locTemplate, {location: loc}));
    });
  },

  // setLocationName
  // -----------------------------------------------------------------------
  setLocationName: function(e) {
    if(!$('#setLocation').is(':visible')) {
      // show submit button
      $('#setLocation').fadeIn(100);
    }
    $('#targetAdress').html($(e.currentTarget).data('name'));
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

// =========================================================================
// SettingsNotificationsView
// =========================================================================
var SettingsNotificationsView = Backbone.View.extend({
  // properties
  // -----------------------------------------------------------------------
  className: 'settings',
  tagName: 'section',

  // events
  // -----------------------------------------------------------------------
  events: {
    'click #saveNotifications': 'save'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SettingsNotificationsView');
    _.bindAll(this);
    this.render();
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SettingsNotificationsView');
    var template = $('#tplSettingsNotifications').html();
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
    console.log('  ~ saving SettingsNotificationsView');

    var notifications = $('input:radio[name=notifications]:checked').val();

    if(!IS.nullOrEmpty(notifications)) {
      notifications = (notifications == 'true') ? true : false;
      // save user model
      this.model.set('fn', notifications);
      IS.saveUser();

      // move on to the next setting
      IS.setupUser(this);
    }
  }
});