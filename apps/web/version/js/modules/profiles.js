// =========================================================================
// MyProfileView - the profile page of the person using the app
// =========================================================================
var MyProfileView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #saveProfileButton': 'save',
    'click #editProfileButton': 'toggleProfileOptions',
    'click #cancelProfileButton': 'toggleProfileOptions',
    'click .photoMakeDefault': 'photoMakeDefault',
    'click .photoDelete': 'photoDelete'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function(options) {
    // bindings
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplMyProfile").innerHTML;

    // init sub views
    this.myPhotosView = new MyPhotosView({ model: this.model });
    this.favouritesView = new LikesListView({ model: this.model });
    this.dislikesView = new LikesListView({ model: this.model });
    this.likesView = new LikesListView({ model: this.model });
  },

  // render
  // -----------------------------------------------------------------------
  render: function(cb) {
    log('rendering MyProfileView');
    var _this = this;
    var likes = this.model.get('l');

    // parse likes and extend user model with favs & dislikes
    IS.parseLikes(this.model, this.model.get('l'));

    // render template
    this.html = Mustache.to_html(this.template, this.model.toJSON());

    // render sub views
    this.myPhotosView.render();
    this.favouritesView.render(3, null, null, 9);
    this.dislikesView.render(1, null, null, 9);
    this.likesView.render(2, null, null, 30);
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing MyProfileView');
    this.$el.html(this.html);

    // show sub views
    this.myPhotosView.setElement(this.$('#userPhotosList')).show();
    this.favouritesView.setElement(this.$('#like-block-favourites-placeholder')).show();
    this.dislikesView.setElement(this.$('#like-block-dislikes-placeholder')).show();
    this.likesView.setElement(this.$('#like-block-likes-placeholder')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering MyProfileView');

    // create upload widget
    var _this = this;
    var iUploads = 0;
    log('creating upload widget');

    /*var uploader = new qq.FileUploader({
      element: document.getElementById('uploadWidget'),
      action: sApi + 'user/' + user.get('_id') + '/photo',
      params: {

      },
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],
      acceptFiles: ['jpg', 'jpeg', 'png', 'gif'],
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

          log('inserting new photo to the model', 'info');

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
          log('error uploading photo ' + fileName + ' (' + res.error + ')', 'error')
        }

        // When all photos have been uploaded:
        if(iUploads === 0) {
          // remove loading animation
          $('.qq-upload-drop-area').removeClass('working');

          // save model
          _this.save();
        }
      }
    });*/

    // activate fancybox for photos
    addToFancybox(_this.$(".fancybox-thumb"));

    // activate fancybox when user uploads new photos
    this.$("#userPhotosList").on("focusin", function(){
      addToFancybox(_this.$(".fancybox-thumb"));
    });

    // enter sub views
    this.favouritesView.enter();
    this.dislikesView.enter();
    this.likesView.enter();
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving MyProfileView');

    var _this = this;

    // leave sub-views
    async.parallel(
      [
        function(cb){
          _this.favouritesView.leave(cb);
        },
        function(cb){
          _this.dislikesView.leave(cb);
        },
        function(cb){
          _this.likesView.leave(cb);
        },
      ],
      function(err, res){
        cb();
      }
    );
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing MyProfileView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  },

  // save
  // -----------------------------------------------------------------------
  save: function() {
    log('saving user');
    _this = this;

    $('#saveProfileButton').addClass('transparent');
    $('#working').removeClass('transparent');

    this.model.save(
      {
        'u': this.$('input[name=username]').val(),
        'a': this.$('#aboutMe').html(),
        'm': ((this.$('input[name=interestedInMen]:checked').length > 0) ? 1 : 0),
        'w': ((this.$('input[name=interestedInWomen]:checked').length > 0) ? 1 : 0),
        'ff': ((this.$('input[name=findFriends]:checked').length > 0) ? 1 : 0),
        'fd': ((this.$('input[name=findDates]:checked').length > 0) ? 1 : 0)
      },
      {
        error: function(model, response) {
          //TODO: properly handle errors
          alert('User save failed!');
          $('#saveProfileButton').removeClass('transparent');
          $('#working').addClass('transparent');
        },
        success: function(model, response) {
          log('got an API response', 'info');
          // SUCCESS
          if ((typeof model.attributes._id !== 'undefined') && (typeof response.error === 'undefined')) {
            log('API call was successful', 'info');
            _this.toggleProfileOptions();
            store.set("user", _this.model);
            $('#saveProfileButton').removeClass('transparent');
            $('#working').addClass('transparent');
          }
          // FAIL
          else {
            log('API call failed: ' + response.error, 'error');
            alert('User save failed: ' + response.error);

            $('#saveProfileButton').removeClass('transparent');
            $('#working').addClass('transparent');
          }
        }
      }
    );
  },

  // photoMakeDefault
  // -----------------------------------------------------------------------
  photoMakeDefault: function(e) {
    log('changing default photo', 'info');
    var _this = this;
    e.preventDefault();
    e.stopPropagation();

    // get photo id
    var photoId = parseInt($(e.currentTarget).parent().children('> img').attr('id'));
    var photoSrc = $(e.currentTarget).parent().children('img').attr('src');
    var photos = this.model.get('p');

    // process and update model photos
    for(var i = 0; i < photos.length; i++) {
     if(photos[i].id === photoId) {
       photos[i].d = 1;
       log('new default photo: ' + photoId, 'info');
     } else {
       photos[i].d = 0;
     }
    }

    // update photo text to working
    $('#profile-pictures #' + photoId + ' .picture-is-default').html('saving...');

    // save model
    this.model.save({ 'p': photos }, {
      error: function(model, res) {
        $('#profile-pictures #' + photoId + ' .picture-is-default').html('make default');
        alert('Error: could not change photo status');
      },
      success: function(model, res) {
        // save locally
        store.set("user", _this.model);
        // update UI
        $('#profile-pictures .photoMakeDefault').removeClass('hidden');
        $('#profile-pictures .photoIsDefault').addClass('hidden');

        $('#profile-pictures .photo').removeClass('picture-is-default');
        $('#profile-pictures #' + photoId).addClass('picture-is-default');

        $('#profile-pictures #' + photoId + ' .photoMakeDefault').addClass('hidden');
        $('#profile-pictures #' + photoId + ' .photoIsDefault').removeClass('hidden');
        $('#profile-pictures #' + photoId + ' .photoMakeDefault').html('make default');

        // update default profile photo in the page
        _this.$('#profile-picture img').attr('src', photoSrc);
      }
    });
  },

  // photoDelete
  // -----------------------------------------------------------------------
  photoDelete: function(e) {
    var _this = this;
    log('deleting photo', 'info');
    e.preventDefault();
    e.stopPropagation();

    // Get photo id
    var photoId = parseInt($(e.currentTarget).parent().parent().attr('id'));
    var isDefault = false;

    // Check if this is the default profile photo
    this.model.get('p').forEach(function(photo, index) {
      if(photo.id === photoId && photo.d === 1) {
        log('warning: deleting the default photo!', 'warn');
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
          log('photo deleted from S3', 'info');
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
          log('replacing default photo with a generic one', 'info');
          if(isDefault) _this.$('#basicInfo .photo img').attr('src', 'http://img.instasoda.com/i/noPhoto.png');
        } else {
          alert('Error deleting photo');
        }
      }
    });
  },

  // toggleProfileOptions
  // -----------------------------------------------------------------------
  toggleProfileOptions: function(e) {
    var container = $('.flipContainer');

    if(container.hasClass('rotateY')) {
      container.removeClass('rotateY');
      $('#aboutMe').hide();
      $('.aboutText').fadeIn();
    }
    else {
      container.addClass('rotateY');
      $('#aboutMe').fadeIn();
      $('.aboutText').hide();
    }
    
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
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplUsersProfile").innerHTML;

    // initialize sub-views
    this.myPhotosView = new MyPhotosView({ model: this.model });
    this.likesListView = new LikesListView({ model: this.model });
    this.commonLikesListView = new LikesListView({ model: this.model });
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering UsersFullView for: ' + this.model.get('_id'));
    var _this = this;

    // set variables
    this.model.set('likeCount', this.model.get('l').length);

    // check if this person is in the user's favourites
    this.model.set({isFaved: false});
    if (_.indexOf(user.get('favs'), this.model.get('_id')) != -1) {
      this.model.set({
        isFaved: true
      });
    }

    // find common likes
    var commonLikes = IS.getCommonLikes(this.model.get('l'));
    this.model.set('commonLikesCount', commonLikes.length);
    this.model.set('commonLikes', commonLikes);

    // render template
    this.html = Mustache.to_html(this.template, this.model.toJSON());
    
    // render sub views
    this.myPhotosView.render();
    this.likesListView.render();
    this.commonLikesListView.render(null, null, true);

    /*setTimeout(function() {
      _this.onView();
    }, 0);*/
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing UsersFullView');
    this.$el.html(this.html);

    // show sub views
    this.myPhotosView.setElement(this.$('#userPhotosList')).show();
    this.likesListView.setElement(this.$('#facebookLikes')).show();
    this.commonLikesListView.setElement(this.$('#commonLikes')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering UsersFullView');

    // resize columns
    var iLikesCount = this.model.get('l').length;
    var iCommonLikesCount = this.model.get('commonLikesCount');
    var iPhotosCount = this.model.get('p').length;

    // activate fancybox for all photos
    this.$(".fancybox-thumb").fancybox({
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
    });

    // enter sub views
    this.likesListView.enter();
    this.commonLikesListView.enter();
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving UsersFullView');

    var _this = this;

    // leave sub-views
    async.parallel(
      [
        function(cb){
          _this.likesListView.leave(cb);
        },
        function(cb){
          _this.commonLikesListView.leave(cb);
        },
      ],
      function(err, res){
        cb();
      }
    );
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing UsersFullView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  },

  // sendMessage
  // -----------------------------------------------------------------------
  sendMessage: function() {
    userbarView.chatSessionTabs.initiateSessionWith(this.model.get('_id'), this.model.get('u'), this.model.get('ag'), this.model.get('p'));
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
// MyPhotosView
// =========================================================================
var MyPhotosView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);
    
    // get template
    this.template = document.getElementById("tplMyPhotos").innerHTML;

    this.bind('newPhoto', this.refresh);
    this.bind('deletePhoto', this.deletePhoto);
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering MyPhotosView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing MyPhotosView');
    this.$el.html(this.html);
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering MyPhotosView');

    // fadein user photos
    this.$('.photo img').load(function(){
      $(this).parent().removeClass('transparent');
    });
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving MyPhotosView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing MyPhotosView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  },

  // deletePhoto
  // -----------------------------------------------------------------------
  deletePhoto: function(photoId) {
    log('deleting photo ', 'info');

    // fadeout photo...
    var _this = this;
    this.$('#' + photoId).addClass('transparent');

    // ...and detach it from the dom after 400ms
    setTimeout(function() {
      _this.$('#' + photoId).detach();
    }, 400);
  }
});