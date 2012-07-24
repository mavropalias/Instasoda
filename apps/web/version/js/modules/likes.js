// =========================================================================
// LikesView
// =========================================================================
var LikesView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing LikesView');
    
    // bindings
    _.bindAll(this);
    
    // initialize sub-views
    this.likesResultsView = new LikesResultsView({ model: this.model });
    this.likesFiltersView = new LikesFiltersView({ model: this.model });
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering LikesView');
    
    // render template
    var template = $('#tplLikes').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // render sub views
    this.likesFiltersView.setElement(this.$('#likesFilters')).render();
    this.likesResultsView.setElement(this.$('#likesResults')).render();
  }
});

// =========================================================================
// LikesFilters view
// =========================================================================
var LikesFiltersView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #doSearch': 'doSearch',
    'click .fbLike': 'addOrRemoveLikeFromSearchOptions'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing LikesFiltersView');
    
    _.bindAll(this);

    this.model.bind('newSearchLike', this.render);
    this.model.bind('removedSearchLike', this.render);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var _this = this;
    console.log('  ~ rendering LikesFiltersView');
    
    // render template
    var template = $('#tplLikesFilters').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  },

  // addOrRemoveLikeFromSearchOptions
  // -----------------------------------------------------------------------
  addOrRemoveLikeFromSearchOptions: function(e) {
    var likeId = $(e.currentTarget).data('id');    
    IS.addOrRemoveLikeFromSearchOptions(likeId);
  },

  // newSearchLike
  // show the new like that was added to the user's search options
  // -----------------------------------------------------------------------
  newSearchLike: function() {

  },
  
  // doSearch
  // -----------------------------------------------------------------------
  doSearch: function() {
    // fetch search options
    /*var options = new Object({
      'w': ((this.$('input[name=interestedInWomen]:checked').length > 0) ? 'female' : 0),
      'm': ((this.$('input[name=interestedInMen]:checked').length > 0) ? 'male' : 0),
      'nearMe': 0,
      'ageMin': this.$("#ageRange").slider("values", 0),
      'ageMax': this.$("#ageRange").slider("values", 1)
    });
    
    // save these preferences into the user model
    this.model.set({ so: options });
    this.model.save();
    store.set('user', user);
    
    IS.navigateTo('search/'
                  + options.m + '/'
                  + options.w + '/'
                  + options.nearMe + '/'
                  + options.ageMin + '/'
                  + options.ageMax
    );*/
  }
});

// =========================================================================
// LikesResultsView - contains a list of LikeView items
// =========================================================================
var LikesResultsView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click .fbLike': 'addOrRemoveLikeFromSearchOptions'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing LikesResultsView');
    
    _.bindAll(this);
    this.model.bind('reset', this.render);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var _this = this;
    console.log('  ~ rendering LikesResultsView');
    
    // template
    // ========
    var template = $('#tplLikesResults').html();
    
    // pre-process likes and split them into categories
    // ================================================

      // 1) get all likes
      var aLikes = this.model.get('fL');

      // 2) extract category names (pluck), and remove duplicates (uniq)
      var aCategories = _.uniq( _.pluck(aLikes, 'c') );

      // 3) create object with categories and their likes
      var aCategoriesAndLikes = [];
      _.each(aCategories, function(category) {
        // get all likes for that category
        var aCategoryLikes = _.filter(aLikes, function(like){
          return like.c == category;
        });

        // push category and its likes into aCategoriesAndLikes
        aCategoriesAndLikes.push({
          c: category,
          l: aCategoryLikes
        });
      });

      // 4) insert aCategoriesAndLikes into the model's fLbyCategory property
      this.model.set({ fLbyCategory: aCategoriesAndLikes });

    // render likes
    // ============
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));

    // Add active class to the first category
    setTimeout(function() {
      $(".fbLikeCategories").find('li:first-child').addClass('active');
      $(".fbCategoryLikes").first().show();
    }, 100);

    // Categories tab functionality
    $(".fbLikeCategoryTitle").live('click', function() {
      var _this = $(this);
      var _thisData = _this.data('cat');
      // Remove active class from tabs
      $(".fbLikeCategoryTitle").removeClass('active');
      // Add active class to clicked tab
      $('.fbCategoryLikes').hide();
      $('.fbLike').removeClass('active');
      _this.addClass('active');
      $(".fbCategoryLikes[data-cat='" + _thisData + "']").fadeIn(200);
    });
  },

  // addOrRemoveLikeFromSearchOptions
  // -----------------------------------------------------------------------
  addOrRemoveLikeFromSearchOptions: function(e) {
    var likeId = $(e.currentTarget).data('id');    
    IS.addOrRemoveLikeFromSearchOptions(likeId);
  }
});

// =========================================================================
// FacebookLikesView - multiple likes
// =========================================================================
var FacebookLikesView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'mouseover .like': 'showLikePanel',
    'mouseout .like': 'hideLikePanel'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing FacebookLikesView');
    _.bindAll(this);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var _this = this;

    var template = $('#tplLikesList').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));

    setTimeout(function() {
      _this.onView();
    }, 0);
  },

  // renderWithCategories
  // -----------------------------------------------------------------------
  renderWithCategories: function() {
    var _this = this;
    console.log('  ~ rendering FacebookLikesView');
    var template = $('#tplLikesWithCategories').html();
    
    // pre-process likes and split them into categories
    // ================================================

      // 1) get all likes
      var aLikes = this.model.get('likes');

      // 2) extract category names (pluck), and remove duplicates (uniq)
      var aCategories = _.uniq( _.pluck(aLikes, 'c') );

      // 3) create object with categories and their likes
      var aCategoriesAndLikes = [];
      _.each(aCategories, function(category) {
        // get all likes for that category
        var aCategoryLikes = _.filter(aLikes, function(like){
          return like.c == category;
        });

        // push category and its likes into aCategoriesAndLikes
        aCategoriesAndLikes.push({
          c: category,
          l: aCategoryLikes
        });
      });

      // 4) insert aCategoriesAndLikes into the model's fLbyCategory property
      this.model.set({ fLbyCategory: aCategoriesAndLikes });

    // render likes
    // ============
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));

    // Add active class to the first category
    setTimeout(function() {
      $(".fbLikeCategory").find('li:first-child').addClass('active');
      $(".fbCategoryLikes").first().show();
    }, 100);

    // Categories tab functionality
    $(".fbLikeCategory li").live('click', function() {
      var _this = $(this);
      var _thisData = _this.data('cat');
      // Remove active class from tabs
      $(".fbLikeCategory li").removeClass('active');
      // Add active class to clicked tab
      $('.fbCategoryLikes').hide();
      $('.fbLike').removeClass('active8');
      _this.addClass('active');
      $(".fbCategoryLikes[data-cat='" + _thisData + "']").fadeIn(200);
    });

    // reload like images until they load, while the API moves them to S3
    if(this.model.get('u') === "" && this.model.get('_id') === user.get('_id')) {
      console.log('- reloading like photos');

      this.$('.fbLikePic img').load(function(){
        $(this).parent().show().parent().find('.fbLikePicLoading').remove();
      });

      this.$('.fbLikePic img').error(function(){
        var _this = this;
        setTimeout(function() {
          var src = $(_this).attr('src');
          var date = new Date();
          $(_this).attr('src', src + "?v=" + date.getTime());
        }, 10);
      });
    }

    setTimeout(function() {
      _this.onView();
    }, 0);
  },

  // onView
  // -----------------------------------------------------------------------
  onView: function() {
    // load like's image when it appears on the screen
    this.$('.likeImg').appear(function() {
      $(this).attr('src', $(this).data('src'));
    });
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
// FacebookLikePanelView - info panel for a like
// =========================================================================
var FacebookLikePanelView = Backbone.View.extend({
  // properties
  className: 'likePanel',

  // events
  // -----------------------------------------------------------------------
  events: {
    'click .addToSearch': 'addOrRemoveLikeFromSearchOptions'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);

    user.bind('newSearchLike', this.render);
    user.bind('removedSearchLike', this.render);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var _this = this;
    var template = $('#tplLikePanel').html();

    // check if the like is already in the user's search options
    var userSearchLikes = (!!user.get('so').l) ? user.get('so').l : [];
    var currentLike = this.model.get('_id');
    if(_.any(userSearchLikes, function(like) { return like._id == currentLike; })) 
    {
      this.model.set('isInSearch', true);
    } 
    else 
    {
      this.model.set('isInSearch', false);
    }

    // render template
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  },

  // addOrRemoveLikeFromSearchOptions
  // -----------------------------------------------------------------------
  addOrRemoveLikeFromSearchOptions: function(e) {
    IS.addOrRemoveLikeFromSearchOptions(this.model.get('_id'));
  }
});