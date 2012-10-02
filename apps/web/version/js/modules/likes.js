// =========================================================================
// LikesView
// =========================================================================
var LikesView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click .viewLikes': 'viewLikes',
    'click .viewFavs': 'viewFavs',
    'click .viewDislikes': 'viewDislikes',
    'click .likeCategoryTitle': 'viewCategory',
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing LikesView');
    
    // bindings
    _.bindAll(this);
    
    // initialize sub-views
    this.likesFiltersView = new LikesFiltersView({ model: this.model });
    this.likesListView = new LikesListView({ model: this.model });
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
    this.likesListView.setElement(this.$('#likesResults')).render();
  },

  // viewAll
  // -----------------------------------------------------------------------
  viewLikes: function() {
    if(!this.$('.viewLikes').hasClass('current')) {
      this.$('.likeCategory').hide();
      this.$('.likeView').removeClass('current');

      this.$('.viewLikes').addClass('current');
      this.$('.catLikes').slideDown();
    }

    // remove active class from sub-tabs
    this.$(".likeCategoryTitle").removeClass('active');

    this.likesListView.render(2);
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

    // remove active class from sub-tabs
    this.$(".likeCategoryTitle").removeClass('active');

    this.likesListView.render(3);
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

    // remove active class from sub-tabs
    this.$(".likeCategoryTitle").removeClass('active');

    this.likesListView.render(1);
  },

  // viewCategory
  // -----------------------------------------------------------------------
  viewCategory: function(e) {
    var likesType = parseInt($(e.currentTarget).data('liketype'));
    var likesCategory = $(e.currentTarget).data('cat');

    // Set active class on tab
    this.$(".likeCategoryTitle").removeClass('active');
    $(e.currentTarget).addClass('active');

    this.likesListView.render(likesType, likesCategory);
  }
});

// =========================================================================
// LikesFilters view
// =========================================================================
var LikesFiltersView = Backbone.View.extend({
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
    'mouseout .like': 'hideLikePanel'
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
  render: function(iLikesType, sLikesCategory, bShowCommonLikes) {
    var _this = this;
    this.renderType = 1;
    console.log('  ~ rendering LikesListView');

    // check iLikesType, sLikesCategory & bShowCommonLikes to determine which likes to render
      var likesToRender = null;
      // show common likes
      if(bShowCommonLikes) 
      {
        likesToRender = this.model.get('commonLikes');
      } 
      else 
      {
        // show likes of a particular type (dislikes/likes/favourites)
        if(iLikesType > 0) {
          if(iLikesType === 1) likesToRender = this.model.get('dislikes');
          else if(iLikesType === 2) likesToRender = this.model.get('likes');
          else if(iLikesType === 3) likesToRender = this.model.get('favourites');
        } 
        // show all likes
        else 
        {
          likesToRender = this.model.get('l');
        }
        // show likes of a specific category, while keeping any type that was defined earlier
        if(!IS.nullOrEmpty(sLikesCategory))
        {
          var likesToRenderWithCat = likesToRender;
          likesToRender = [];
          
          $.each(likesToRenderWithCat, function(index, value) {
            if (likesToRenderWithCat[index]['c'] === sLikesCategory)
              likesToRender.push(likesToRenderWithCat[index]);
          });
        }
      }

    this.model.set({ likesToRender: likesToRender });

    // render template
    var template = $('#tplLikesList').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));

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