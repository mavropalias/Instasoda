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
    'click #doSearch': 'doSearch'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing LikesFiltersView');
    
    _.bindAll(this);

    this.model.bind('newSearchLike', this.render);
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
    'click .fbLike': 'addLike'
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
      $('.fbLike').removeClass('active8');
      _this.addClass('active');
      $(".fbCategoryLikes[data-cat='" + _thisData + "']").fadeIn(200);
    });
  },

  // addLike
  // -----------------------------------------------------------------------
  addLike: function(e) {
    var _this = this;
    var likeId = $(e.currentTarget).data('id');
    var userSearchLikes = (!!user.get('so').l) ? user.get('so').l : [];

    // search if the like is already in the user's search options
    // AND is the total likes are no more than 10
    if(!_.any(userSearchLikes, function(like) { return like.id == likeId; }) && userSearchLikes.length < 10) {
      userSearchLikes.push({id: likeId});

      // save these preferences into the user model
      user.get('so').l = userSearchLikes;

      // trigger a newSearchLike event to notify other views
      user.trigger('newSearchLike', likeId);
    }
  }
});