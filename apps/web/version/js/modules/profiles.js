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
    console.log('  ~ initializing MyProfileView');

    // bindings
    _.bindAll(this);

    // initialize sub-views
    this.myPhotosView = new MyPhotosView({ model: this.model });
  },

  // render
  // -----------------------------------------------------------------------
  render: function(cb) {
    console.log('  ~ rendering MyProfileView');
    var _this = this;
    var likes = this.model.get('l');

    // set likeCount
    this.model.set('likeCount', likes.length);

    // set favouriteCount
    this.model.set('favouriteCount', IS.countLikesByRating(likes, '3'));

    // render template
    var template = $('#tplMyProfile').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));

    // render sub views
    this.myPhotosView.setElement(this.$('#userPhotosList')).render();

    // render all likes
    IS.renderLikes(likes, this.$('#allLikes'));

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

    // resize columns
    var iLikesCount = this.model.get('l').length;
    var iPhotosCount = this.model.get('p').length;
    IS.resizeProfilePage(iLikesCount, 0, true, iPhotosCount);

    // enable custom scrollbars for the full page
    /*IS.myScroll.destroy();
    console.log(IS.myScroll);
    if(!!IS.myScroll) {
      IS.myScroll.destroy();
      IS.myScroll = null;
      console.log(IS.myScroll);
    }*/
    IS.myScroll = new iScroll('content', {
      hScroll: true,
      hScrollbar: true,
      vScroll: false,
      vScrollbar: false,
      scrollbarClass: 'scrollbar'
    });

    // add custom scrollbar in the #instasodaOptions div
    /*var myScroll2 = new iScroll('instasodaOptions', {
      hScroll: false,
      hScrollbar: false,
      vScroll: true,
      vScrollbar: true,
      scrollbarClass: 'scrollbar'
    });*/

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
    _this = this;

    $('#saveProfileButton').addClass('transparent');
    $('#working').removeClass('transparent');

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
          $('#saveProfileButton').removeClass('transparent');
          $('#working').addClass('transparent');
        },
        success: function(model, response) {
          console.log('- got an API response');
          // SUCCESS
          if ((typeof model.attributes._id !== 'undefined') && (typeof response.error === 'undefined')) {
            console.log('- API call was successful');
            _this.toggleProfileOptions();
            store.set("user", _this.model);
            $('#saveProfileButton').removeClass('transparent');
            $('#working').addClass('transparent');
          }
          // FAIL
          else {
            console.log('- API call failed: ' + response.error);
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

        // update default photo in the left column
        _this.$('#basicInfo .defaultPhoto img').attr('src', photoSrc);
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
  },

  // toggleProfileOptions
  // -----------------------------------------------------------------------
  toggleProfileOptions: function(e) {
    var container = $('.flipContainer');

    if(container.hasClass('rotateY')) container.removeClass('rotateY');
    else container.addClass('rotateY');
    
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
    this.myPhotosView = new MyPhotosView({ model: this.model });
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering UsersFullView for: ' + this.model.get('_id'));
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

    // find common likes and update the user model
    var commonLikes = IS.getCommonLikes(this.model.get('l'));
    this.model.set('commonLikesCount', commonLikes.length);

    // render template
    var template = $('#tplUsersProfile').html();
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // render sub views
    this.myPhotosView.setElement(this.$('#userPhotosList')).render();

    // render common likes
    if(commonLikes.length > 0) {
      var cLContainer = _this.$('#commonLikes');
      IS.renderLikes(commonLikes, cLContainer);
    }

    // render all likes
    IS.renderLikes(this.model.get('l'), this.$('#facebookLikes'));

    setTimeout(function() {
      _this.onView();
    }, 0);
  },

  // onView
  // -----------------------------------------------------------------------
  onView: function() {
    // resize columns
    var iLikesCount = this.model.get('l').length;
    var iCommonLikesCount = this.model.get('commonLikesCount');
    var iPhotosCount = this.model.get('p').length;
    IS.resizeProfilePage(iLikesCount, iCommonLikesCount, false, iPhotosCount);

    // enable custom scrollbars
    var myScroll = new iScroll('content', {
      hScroll: true,
      hScrollbar: true,
      vScroll: false,
      vScrollbar: false,
      scrollbarClass: 'scrollbar'
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
      });
    });
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

    // resize columns
    var iLikesCount = this.model.get('l').length;
    var iPhotosCount = this.model.get('p').length;
    IS.resizeProfilePage(iLikesCount, 0, true, iPhotosCount);
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