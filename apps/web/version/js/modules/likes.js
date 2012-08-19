// =========================================================================
// LikesView
// =========================================================================
var LikesView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click .viewAll': 'viewAll',
    'click .viewFavs': 'viewFavs',
    'click .viewDislikes': 'viewDislikes'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing LikesView');
    
    // bindings
    _.bindAll(this);
    
    // initialize sub-views
    this.likesFiltersView = new LikesFiltersView({ model: this.model });
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering LikesView');

    // parse likes
    IS.parseLikes(this.model, this.model.get('l'));
    
    // render template
    var template = $('#tplLikes').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // render sub views
    this.likesFiltersView.setElement(this.$('#likesFilters')).render();

    // render likes
    IS.renderLikes(this.model.get('l'), this.$('#likesResults'), true);
  },

  // viewAll
  // -----------------------------------------------------------------------
  viewAll: function() {
    if(!this.$('.viewAll').hasClass('current')) {
      this.$('.likeCategory').hide();
      this.$('.likeView').removeClass('current');

      this.$('.viewAll').addClass('current');
      this.$('.catAll').slideDown();
    }
  },

  // viewFavs
  // -----------------------------------------------------------------------
  viewFavs: function() {
    if(!this.$('.viewFavs').hasClass('current')) {
      this.$('.likeCategory').hide();
      this.$('.likeView').removeClass('current');

      this.$('.viewFavs').addClass('current');
      this.$('.catFavourites').slideDown();
    }
  },

  // viewDislikes
  // -----------------------------------------------------------------------
  viewDislikes: function() {
    if(!this.$('.viewDislikes').hasClass('current')) {
      this.$('.likeCategory').hide();
      this.$('.likeView').removeClass('current');

      this.$('.viewDislikes').addClass('current');
      this.$('.catDislikes').slideDown();
    }
  }
});

// =========================================================================
// LikesFilters view
// =========================================================================
var LikesFiltersView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'mouseover .like': 'showLikePanel',
    'mouseout .like': 'hideLikePanel',
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
// LikesListView - multiple likes
// =========================================================================
var LikesListView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'mouseover .like': 'showLikePanel',
    'mouseout .like': 'hideLikePanel',
    'click .fbLikeCategoryTitle': 'showCategoryLikes'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing LikesListView');
    _.bindAll(this);
    this.renderType = null;
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var _this = this;
    this.renderType = 1;
    console.log('  ~ rendering LikesListView');

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
    this.renderType = 2;
    console.log('  ~ rendering LikesListView - with cats');
    var template = $('#tplLikesWithCategories').html();
    
    // pre-process likes and split them into categories
    // ================================================

      // 1) get all likes
      var aLikes = this.model.get('likes');

      // 2) extract category names (pluck), and remove duplicates (uniq)
      var aCategories = _.uniq(_.pluck(aLikes, 'c').sort(), true);

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

      // 4) update model
      this.model.set({ fLbyCategory: aCategoriesAndLikes });
      this.model.set({ likeCategories: aCategories });

    // render likes
    // ============
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));

    // Add active class to the first category
    setTimeout(function() {
      $(".fbLikeCategoryTitle:first-child").addClass('active');
      $(".fbCategoryLikes").first().show();
    }, 0);

    // reload like images until they load, while the API moves them to S3
    /*if(this.model.get('u') === "" && this.model.get('_id') === user.get('_id')) {
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
    }*/

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

  // showCategoryLikes
  // -----------------------------------------------------------------------
  showCategoryLikes: function(e) {
    var target = $(e.currentTarget);
    var category = target.data('cat');

    // Remove active class from tabs
    $(".fbLikeCategoryTitle").removeClass('active');

    // Add active class to clicked tab
    $('.fbCategoryLikes').hide();
    $('.like').removeClass('active');
    target.addClass('active');
    $(".fbCategoryLikes[data-cat='" + category + "']").fadeIn(200);
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
        n: target.data('name'),
        c: target.data('cat')
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
    'click .addToSearch': 'addOrRemoveLikeFromSearchOptions',
    'click .removeFromSearch': 'addOrRemoveLikeFromSearchOptions',
    'click .attitude1': 'rateLike1',
    'click .attitude2': 'rateLike2',
    'click .attitude3': 'rateLike3'
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
    var currentLike = this.model.get('_id');

    // check if the like is already in the user's search options
    var userSearchLikes = (!!user.get('so').l) ? user.get('so').l : [];
    if(_.any(userSearchLikes, function(like) { return like._id == currentLike; })) 
    {
      this.model.set('isInSearch', true);
    } 
    else 
    {
      this.model.set('isInSearch', false);
    }

    // pre-process like's rating
    this.model.set({
      'like': false,
      'dislike': false,
      'fav': false
    });
    var fullLike = _.find(user.get('l'), function(like) {
      return currentLike == like._id;
    });
    if(!!fullLike) {
      if(fullLike.r === 2)  this.model.set('like', true);
      else if(fullLike.r === 1)  this.model.set('dislike', true);
      else if(fullLike.r === 3)  this.model.set('fav', true);
    }

    // render template
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
  },

  // addOrRemoveLikeFromSearchOptions
  // -----------------------------------------------------------------------
  addOrRemoveLikeFromSearchOptions: function(e) {
    IS.addOrRemoveLikeFromSearchOptions(this.model.get('_id'), this.model.get('n'));
  },

  // rateLike1
  // -----------------------------------------------------------------------
  rateLike1: function() {
    var _this = this;
    IS.addOrRemoveLikeAndRate(this.model.get('_id'),
        this.model.get('n'),
        1,
        this.model.get('c'),
        function() {
          _this.render();
        });
  },

  // rateLike2
  // -----------------------------------------------------------------------
  rateLike2: function() {
    var _this = this;
    IS.addOrRemoveLikeAndRate(this.model.get('_id'),
        this.model.get('n'),
        2,
        this.model.get('c'),
        function() {
          _this.render();
        });
  },

  // rateLike3
  // -----------------------------------------------------------------------
  rateLike3: function() {
    var _this = this;
    IS.addOrRemoveLikeAndRate(this.model.get('_id'),
        this.model.get('n'),
        3,
        this.model.get('c'),
        function() {
          _this.render();
        });
  },
});