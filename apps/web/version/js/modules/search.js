// =========================================================================
// SearchView
// =========================================================================
var SearchView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SearchView');
    
    // bindings
    _.bindAll(this);
    
    // initialize sub-views
    this.searchResultsView = new SearchResultsView({ collection: this.collection });
    this.searchFiltersView = new SearchFiltersView({ model: this.model });
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SearchView');
    
    // render template
    var template = $('#tplSearch').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // render sub views
    this.searchFiltersView.setElement(this.$('#searchFilters')).render();
    this.searchResultsView.setElement(this.$('#searchResults'));
  }
});

// =========================================================================
// SearchFilters view
// =========================================================================
var SearchFiltersView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #doSearch': 'doSearch',
    'mouseover .like': 'showLikePanel',
    'mouseout .like': 'hideLikePanel'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SearchFiltersView');
    _.bindAll(this);

    user.bind('removedSearchLike', this.render);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var _this = this;
    console.log('  ~ rendering SearchFiltersView');
    
    // determine default filter values
    var userSearchOptions = this.model.get('so');
    
    // render template
    var template = $('#tplSearchFilters').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // enable jquery slider
    this.$("#ageRange").slider({
      range: true,
      min: 18,
      max: 70,
      values: [userSearchOptions.ageMin, userSearchOptions.ageMax],
      slide: function (event, ui) {
        $("#ageNum").text(ui.values[0] + " - " + ui.values[1] + " years old");
        // small easter egg :)
        if (ui.values[1] == 99) {
          $("#ageNum").text(ui.values[0] + " - " + ui.values[1] + " years old (wow!)");
        }
      }
    });
    this.$("#ageNum").text(this.$("#ageRange").slider("values", 0) + " - " + this.$("#ageRange").slider("values", 1) + " years old");
  },
  
  // doSearch
  // -----------------------------------------------------------------------
  doSearch: function() {
    // fetch search options
    var options = new Object({
      'w': ((this.$('input[name=interestedInWomen]:checked').length > 0) ? 'female' : 0),
      'm': ((this.$('input[name=interestedInMen]:checked').length > 0) ? 'male' : 0),
      'on': ((this.$('input[name=onlyOnline]:checked').length > 0) ? true : false),
      'nearMe': ((this.$('input[name=nearMe]:checked').length > 0) ? 1 : 0),
      'ageMin': this.$("#ageRange").slider("values", 0),
      'ageMax': this.$("#ageRange").slider("values", 1),
      'l': this.model.get('so').l,
      'lon': this.model.get('loc')[0],
      'lat': this.model.get('loc')[1]
    });

    // save these preferences into the user model
    this.model.set({ so: options });
    IS.saveUser();
    
    IS.navigateTo('search/'
                  + options.m + '/'
                  + options.w + '/'
                  + options.nearMe + '/'
                  + options.ageMin + '/'
                  + options.ageMax + '/'
                  + options.on
    );
  },

  // showLikePanel
  // -----------------------------------------------------------------------
  showLikePanel: function(e) {
    var target = $(e.currentTarget);

    if(target.find('.likePanel').length > 0) target.find('.likePanel').show();
    else {
      // construct a new like model, based on the event's target
      var likeAttrs = {
        _id: target.data('id'),
        n: target.data('name')
      };
      var like = new Like(likeAttrs);

      // create the panel view & render it
      var facebookLikePanelView = new FacebookLikePanelView({
        model: like
      });
      facebookLikePanelView.render();
      $(e.currentTarget).append(facebookLikePanelView.el);
    }
  },

  // hideLikePanel
  // -----------------------------------------------------------------------
  hideLikePanel: function() {
    this.$('.likePanel').hide();
  }
});

// =========================================================================
// SearchResultsView - contains a list of UsersView items,
// used for search results / matches
// =========================================================================
var SearchResultsView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing SearchResultsView');
    
    _.bindAll(this);
    this.collection.bind('reset', this.render);
  },

  // renderItem
  // -----------------------------------------------------------------------
  renderItem: function(model) {
    var usersView = new UsersView({
      model: model
    });
    usersView.render();
    this.$el.append(usersView.el);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SearchResultsView');
    this.$el.html('');
    this.collection.each(this.renderItem);
  }
});

// =========================================================================
// UsersView - a basic view of a user appearing in the search results
// =========================================================================
var UsersView = Backbone.View.extend({
  // properties
  // -----------------------------------------------------------------------
  className: 'userPreview',
  tagName: 'li',

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var template = $('#tplSearchResult').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  }
});