// =========================================================================
// MyProfileView - the profile page of the person using the app
// =========================================================================
var MyProfileView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #saveProfileButton': 'save',
    'click .photoMakeDefault': 'photoMakeDefault',
    'click .photoDelete': 'photoDelete'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function(options) {
    console.log('  ~ initializing MyProfileView');

    // bindings
    _.bindAll(this);

    // initialize sub-views
    this.facebookLikesView = new FacebookLikesView({ model: this.model });
    this.myPhotosView = new MyPhotosView({ model: this.model });
  },

  // render
  // -----------------------------------------------------------------------
  render: function(cb) {
    var _this = this;
    console.log('  ~ rendering MyProfileView');

    // render template
    var template = $('#tplMyProfile').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));

    // render sub views
    this.myPhotosView.setElement(this.$('#userPhotosList')).render();
    this.facebookLikesView.setElement(this.$('#facebookLikes')).render();

    setTimeout(function() {
      _this.onView();
    }, 0);
  },

  // onView
  // -----------------------------------------------------------------------
  onView: function() {
    // create upload widget
    var _this = this;
    var iUploads = 0;
    console.log('- creating upload widget')
      var uploader = new qq.FileUploader({
        element: document.getElementById('uploadWidget'),
        action: sApi + 'user/' + user.get('_id') + '/photo',
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],
        debug: false,
        sizeLimit: 3000000, // 3MB
        maxConnections: 3,
        onSubmit: function(id, fileName){
          iUploads++;
          //$('.qq-upload-drop-area').addClass('working');
        },
        onProgress: function(id, fileName, loaded, total){
          $('.qq-upload-drop-area').addClass('working');
        },
        onComplete: function(id, fileName, res){
          iUploads--;

          if(res.success === true) {
            // update model
            var newPhotoId = Math.floor(Math.random()*10001)+Math.floor(Math.random()*10001);
            var photos = _this.model.get('p');
            photos.push({
              id: newPhotoId,
              f: res.file,
              p: 1,
              d: 0
            });
            _this.model.set({
              'p': photos
            });

            console.log('- inserting new photo to the model');

            // trigger newPhoto event for myPhotosView
            _this.myPhotosView.trigger('newPhoto', {
              p: {
                id: newPhotoId,
                f: res.file,
                p: 1,
                d: 0
              }
            });
          } else {
            // TODO: handle errors
            console.log('- error uploading photo ' + fileName + ' (' + res.error + ')')
          }

          // When all photos have been uploaded:
          if(iUploads === 0) {
            // remove loading animation
            $('.qq-upload-drop-area').removeClass('working');

            // save model
            _this.save();
          }
        }
      });

    // activate fancybox for all photos - including the newly uploaded
    this.$("#userPhotos").on("focusin", function(){
      _this.$(".fancybox-thumb").fancybox({
        prevEffect  : 'elastic',
        nextEffect  : 'elastic',
        padding: 0,
        helpers : {
          title : {
            type: 'outside'
          },
          overlay : {
            opacity : 0.85,
            css : {
              'background-color' : '#000'
            }
          },
          thumbs  : {
            width : 50,
            height: 50
          }
        }
      }); // fancybox
    }); // on
  },

  // save
  // -----------------------------------------------------------------------
  save: function() {
    console.log('- saving user');
    _this = this.model;

    $('#saveProfileButton').fadeOut();
    $('#working').fadeIn();

    this.model.save(
      {
        'u': this.$('input[name=username]').val(),
        'a': this.$('#aboutMe').html(),
        'm': ((this.$('input[name=interestedInMen]:checked').length > 0) ? 1 : 0),
        'w': ((this.$('input[name=interestedInWomen]:checked').length > 0) ? 1 : 0)
      },
      {
        error: function(model, response) {
          //TODO: properly handle errors
          alert('User save failed!');
          $('#saveProfileButton').fadeIn();
          $('#working').fadeOut();
        },
        success: function(model, response) {
          console.log('- got an API response');
          // SUCCESS
          if ((typeof model.attributes._id !== 'undefined') && (typeof response.error === 'undefined')) {
            console.log('- API call was successful');
            store.set("user", _this);
            $('#saveProfileButton').fadeIn();
            $('#working').fadeOut();
          }
          // FAIL
          else {
            console.log('- API call failed: ' + response.error);
            alert('User save failed: ' + response.error);
          }
        }
      }
    );
  },

  // photoMakeDefault
  // -----------------------------------------------------------------------
  photoMakeDefault: function(e) {
    console.log('- changing default photo');
    var _this = this;
    e.preventDefault();
    e.stopPropagation();

    // get photo id
    var photoId = parseInt($(e.currentTarget).parent().parent().attr('id'));
    var photoSrc = $(e.currentTarget).parent().parent().find('img').attr('src');
    var photos = this.model.get('p');

    // process and update model photos
    for(var i = 0; i < photos.length; i++) {
     if(photos[i].id === photoId) {
       photos[i].d = 1;
       console.log('- new default photo: ' + photoId);
     } else {
       photos[i].d = 0;
     }
    }

    // update photo text to working
    $('#userPhotos #' + photoId + ' .photoMakeDefault').html('saving...');

    // save model
    this.model.save({ 'p': photos }, {
      error: function(model, res) {
        $('#userPhotos #' + photoId + ' .photoMakeDefault').html('make default');
        alert('Error: could not change photo status');
      },
      success: function(model, res) {
        // save locally
        store.set("user", _this.model);

        // update UI
        $('#userPhotos .photoMakeDefault').removeClass('hidden');
        $('#userPhotos .photoIsDefault').addClass('hidden');

        $('#userPhotos .photo').removeClass('default');
        $('#userPhotos #' + photoId).addClass('default');

        $('#userPhotos #' + photoId + ' .photoMakeDefault').addClass('hidden');
        $('#userPhotos #' + photoId + ' .photoIsDefault').removeClass('hidden');
        $('#userPhotos #' + photoId + ' .photoMakeDefault').html('make default');

        // update default photo in the top sidebar
        _this.$('#basicInfo .photo img').attr('src', photoSrc);
      }
    });
  },

  // photoDelete
  // -----------------------------------------------------------------------
  photoDelete: function(e) {
    var _this = this;
    console.log('- deleting photo');
    e.preventDefault();
    e.stopPropagation();

    // Get photo id
    var photoId = parseInt($(e.currentTarget).parent().parent().attr('id'));
    var isDefault = false;

    // Check if this is the default profile photo
    this.model.get('p').forEach(function(photo, index) {
      if(photo.id === photoId && photo.d === 1) {
        console.log(' - warning: deleting the default photo!');
        isDefault = true;
      }
    });

    // Make an API call to delete the photo
    $.ajax({
      url: sApi + 'user/' + user.get('_id') + '/photo/' + photoId,
      type: 'DELETE',
      data: {
        'fTkn': user.get('fTkn')
      },
      success: function(data, textStatus, jqXHR){
        if(textStatus === 'success') {
          console.log('- photo deleted from S3');
          // Remove photo from the model
          var photos = _this.model.get('p');
          for(var i = 0; i < photos.length; i++) {
           if(photos[i].id === photoId) {
             photos.splice(i, 1);
           }
          }
          _this.model.set({ 'p': photos });

          // save view
          _this.save();

          // trigger deletePhoto event for myPhotosView
          _this.myPhotosView.trigger('deletePhoto', photoId);

          // update default photo in the top sidebar
          console.log(' - replacing default photo with a generic one');
          if(isDefault) _this.$('#basicInfo .photo img').attr('src', 'http://img.instasoda.com/i/noPhoto.png');
        } else {
          alert('Error deleting photo');
        }
      }
    });
  }
});




// =========================================================================
// UsersFullView - a complete view of a user's profile
// =========================================================================
var UsersFullView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #sendMessage': 'sendMessage',
    'click #handleFavourite': 'handleFavourite'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing UsersFullView');
    _.bindAll(this);
    //this.model.bind('change', this.render);

    // initialize sub-views
    this.facebookLikesView = new FacebookLikesView({ model: this.model });
    this.myPhotosView = new MyPhotosView({ model: this.model });
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering UsersFullView for: ' + this.model.get('_id'));
    var _this = this;

    // If the user exists already, pass a new attr to the model
    this.model.set({isFaved: false});
    if (_.indexOf(user.get('favs'), this.model.get('_id')) != -1) {
      console.log(this.model.get('isFaved'));
      this.model.set({
        isFaved: true
      });
      console.log(this.model.get('isFaved'));
      console.log(user.get('isFaved'));
    }

    // Update template
    var template = $('#tplUsersProfile').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // render sub views
    this.myPhotosView.setElement(this.$('#userPhotosList')).render();
    this.facebookLikesView.setElement(this.$('#facebookLikes')).render();

    // activate fancybox for all photos - including the newly uploaded
    this.$("#userPhotos").on("focusin", function(){
      _this.$(".fancybox-thumb").fancybox({
        prevEffect  : 'elastic',
        nextEffect  : 'elastic',
        padding: 0,
        helpers : {
          title : {
            type: 'outside'
          },
          overlay : {
            opacity : 0.85,
            css : {
              'background-color' : '#000'
            }
          },
          thumbs  : {
            width : 50,
            height: 50
          }
        }
      }); // fancybox
    }); // on
  },

  // sendMessage
  // -----------------------------------------------------------------------
  sendMessage: function() {
    chatView.chatSessionTabs.initiateSessionWith(this.model.get('_id'), this.model.get('u'), this.model.get('ag'), this.model.get('p'));
  },

  // handleFavourite
  // -----------------------------------------------------------------------
  handleFavourite: function() {
    if (_.indexOf(user.get('favs'), this.model.get('_id')) === -1) {
      var favType = 'add'
    } else {
      var favType = 'remove'
    }
    IS.handleFavourite(this.model.get('_id'), this.model.get('u'), favType);
  }
});

// =========================================================================
// FacebookLikesView
// =========================================================================
var FacebookLikesView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    //TODO: enable clicking on a like to view users with similar likes
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing FacebookLikesView');
    _.bindAll(this);
    this.model.bind('change:fL', this.render);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    var _this = this;
    console.log('  ~ rendering FacebookLikesView');
    var template = $('#tplFacebookLikes').html();
    
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
  }
});

// =========================================================================
// MyPhotosView
// =========================================================================
var MyPhotosView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing MyPhotosView');
    _.bindAll(this);
    //this.model.bind('change:p', this.render);
    this.bind('newPhoto', this.renderNewPhoto);
    this.bind('deletePhoto', this.deletePhoto);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering MyPhotosView');
    var template = $('#tplMyPhotos').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));

    // fadein user photos
    this.$('.photo img').load(function(){
      $(this).parent().removeClass('transparent');
    });
  },

  // renderNewPhoto
  // -----------------------------------------------------------------------
  renderNewPhoto: function(newPhoto) {
    console.log('  ~ rendering new photo ');

    // inject new photo into view
    var template = $('#tplMyPhotos').html();
    this.$el.append(Mustache.to_html(template, newPhoto));

    // fadein photo
    this.$('.photo img').load(function(){
      $(this).parent().removeClass('transparent');
    });
  },

  // deletePhoto
  // -----------------------------------------------------------------------
  deletePhoto: function(photoId) {
    console.log('  ~ deleting photo ');

    // fadeout photo...
    var _this = this;
    this.$('#' + photoId).addClass('transparent');

    // ...and detach it from the dom after 400ms
    setTimeout(function() {
      _this.$('#' + photoId).detach();
    }, 400);
  }
});