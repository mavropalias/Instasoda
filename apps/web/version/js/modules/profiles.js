// =========================================================================
// MyProfileView - the profile page of the person using the app
// =========================================================================
var MyProfileView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click .photo-make-default': 'photoMakeDefault',
    'click .photo-delete': 'photoDelete',
    'click #view-all-my-interests': 'toggleInterests',
    'click #view-all-favs': 'toggleFavs',
    'click #view-all-dislikes': 'toggleDislikes'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function(options) {
    // bindings
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplMyProfile").innerHTML;

    // render on model change
    this.model.bind('change:u', this.render);
    this.model.bind('change:a', this.render);
    this.model.bind('change:m', this.render);
    this.model.bind('change:w', this.render);
    this.model.bind('change:ff', this.render);
    this.model.bind('change:fd', this.render);
    this.model.bind('change:l', this.render);
    this.model.bind('change:p', this.render);

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
    if(likes) IS.parseLikes(this.model, this.model.get('l'));

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
    this.myPhotosView.setElement(this.$('#user-photos')).show();
    this.favouritesView.setElement(this.$('#interests-favourites')).show();
    this.dislikesView.setElement(this.$('#interests-dislikes')).show();
    this.likesView.setElement(this.$('#interests-likes')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering MyProfileView');

    // convert \n to <br> in the about me
    this.$('#about-me, #about-me-full .about-text').html( this.$('#about-me').html().replace(/\n/g, '<br/><br/>') );

    // create upload widget
    var _this = this;
    var iUploads = 0;
    log('creating upload widget');

    $('#uploadWidget').fineUploader({
        request: {
            endpoint: sApi + 'me/' + user.get('_id') + '/photo',
            params: {
              tkn: user.get('tkn'),
              _id: user.get('_id')
            }
        },
        validation: {
          allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],
          acceptFiles: 'image/*',
          sizeLimit: 3000000 // 3MB
        },
        retry: {
          enableAuto: false,
          autoAttemptDelay: 2,
          maxAutoAttempts: 1
        },
        text: {
          uploadButton: '<i class="icon icon-picture"></i><i class="icon icon-cog icon-spin"></i><span class="upload-text">add photos</span>',
          dragZone: '&larr; click to browse, or drag & drop your photos here to upload &hellip;'
        }
    }).on('submit', function(event, id, fileName){
        iUploads++;
      })
      .on('progress', function(event, id, fileName, uploadedBytes, totalBytes) {
         $('.qq-upload-button .upload-text, .qq-upload-button .icon-picture').hide();
         $('.qq-upload-button .icon-cog').css('display', 'block');
      })
      .on('autoRetry', function(event, id, fileName, attemptNumber) {
        iUploads++;
         $('.qq-upload-button .upload-text, .qq-upload-button .icon-picture').hide();
         $('.qq-upload-button .icon-cog').css('display', 'block');
      })
      .on('error', function(event, id, filename, reason) {
        iUploads--;
        if(iUploads === 0) {
          // remove loading animation
          $('.qq-upload-button .upload-text, .qq-upload-button .icon-picture').show();
          $('.qq-upload-button .icon-cog').hide();
        }

        alert("Couldn't upload your photo! " + reason);
      })
      .on('complete', function(event, id, filename, res){
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
          log('error uploading photo (' + res.error + ')', 'error', _this);
        }

        // When all photos have been uploaded:
        if(iUploads === 0) {
          // remove loading animation
         $('.qq-upload-button .upload-text, .qq-upload-button .icon-picture').show();
         $('.qq-upload-button .icon-cog').hide();

          // save model
          IS.saveUser();
        }
      });

    // activate fancybox for photos
    this.$("#user-photos .fancybox-thumb").fancybox({
      prevEffect  : 'fade',
      nextEffect  : 'fade',
      padding: 0,
      topRatio: 0,
      helpers: {
        title: {
          type: 'outside'
        },
        overlay: {
          css: {
            'background' : 'rgba(0,0,0,.9)'
          }
        },
        thumbs: {
          width: 200,
          height: 150,
          position: 'top'
        },
        buttons: {
          position: 'bottom'
        }
      }
    });

    // activate fancybox when user uploads new photos
    this.$("#userPhotosList").on("focusin", function(){
      addToFancybox(_this.$(".fancybox-thumb"));
    });

    // enter sub views
    this.myPhotosView.enter();
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
        }
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

  // photoMakeDefault
  // -----------------------------------------------------------------------
  photoMakeDefault: function(e) {
    log('changing default photo', 'info');

    e.preventDefault();
    e.stopPropagation();

    var _this = this;
    var parent = $(e.currentTarget).parent();

    // get photo id
    var photoId = parseInt(parent.attr('id'));
    var photoSrc = parent.data('src');
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

    // show loading animation
    parent.children('.loading').fadeIn();

    // save model
    this.model.save({ 'p': photos }, {
      error: function(model, res) {
        // hide loading animation
        parent.children('.loading').fadeOut();

        alert('Error: could not change photo status');
      },
      success: function(model, res) {
        // save locally
        store.set("user", _this.model);

        // update old default photo
        $('#user-photos .photo-make-default').removeClass('picture-is-default');

        // update new default photo
        $('#user-photos #' + photoId + ' .photo-make-default').addClass('picture-is-default');

        // hide loading animation
        parent.children('.loading').fadeOut();
      }
    });
  },

  // photoDelete
  // -----------------------------------------------------------------------
  photoDelete: function(e) {
    log('deleting photo', 'info');

    e.preventDefault();
    e.stopPropagation();

    var _this = this;
    var parent = $(e.currentTarget).parent();

    // Get photo id
    var photoId = parseInt(parent.attr('id'));
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
      url: sApi + 'me/' + user.get('_id') + '/photo/' + photoId,
      type: 'DELETE',
      data: {
        tkn: user.get('tkn'),
        _id: user.get('_id')
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

          // save user
          IS.saveUser();

          // trigger deletePhoto event for myPhotosView
          _this.myPhotosView.trigger('deletePhoto', photoId);
        } else {
          alert('Error deleting photo');
        }
      }
    });
  },

  // toggleInterests
  // -----------------------------------------------------------------------
  toggleInterests: function() {
    if(this.$('#interests-likes-row').hasClass('expanded')) {
      this.$('#interests-likes-row, #view-all-my-interests').removeClass('expanded');
    } else {
      this.$('#interests-likes-row, #view-all-my-interests').addClass('expanded');
    }
  },

  // toggleFavs
  // -----------------------------------------------------------------------
  toggleFavs: function() {
    if(this.$('#interests-favourites-row').hasClass('expanded')) {
      this.$('#interests-favourites-row, #view-all-favs').removeClass('expanded');
    } else {
      this.$('#interests-favourites-row, #view-all-favs').addClass('expanded');
    }
  },

  // toggleDislikes
  // -----------------------------------------------------------------------
  toggleDislikes: function() {
    if(this.$('#interests-dislikes-row').hasClass('expanded')) {
      this.$('#interests-dislikes-row, #view-all-dislikes').removeClass('expanded');
    } else {
      this.$('#interests-dislikes-row, #view-all-dislikes').addClass('expanded');
    }
  }
});


// =============================================================================
// EditMyProfileView
// =============================================================================
var EditMyProfileView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #save-profile-button': 'save',
    'click .change-location': 'changeLocation',
    'keyup #aboutMe': 'adjustTextArea'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function(options) {
    // bindings
    _.bindAll(this);

    // render on model change
    this.model.bind('change', this.render);

    // subviews
    this.myPhotosView = new MyPhotosView({ model: this.model });

    // get template
    this.template = document.getElementById("tplEditMyProfile").innerHTML;
  },

  // render
  // -----------------------------------------------------------------------
  render: function(cb) {
    log('rendering EditMyProfileView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());

    // render sub views
    this.myPhotosView.render();
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing EditMyProfileView');
    this.$el.html(this.html);

    // show sub views
    this.myPhotosView.setElement(this.$('#user-photos')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering EditMyProfileView');

    IS.adjustTextArea(document.getElementById('aboutMe'));

    // enter sub views
    this.myPhotosView.enter();
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving EditMyProfileView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing EditMyProfileView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  },

  // changeLocation
  // ---------------------------------------------------------------------------
  changeLocation: function(cb) {
    this.model.set('locN', null);
    IS.setupUser();
  },

  // adjustTextArea
  // ---------------------------------------------------------------------------
  adjustTextArea: function(event) {
    IS.adjustTextArea(event.target);
  },

  // save
  // -----------------------------------------------------------------------
  save: function() {
    log('saving user');
    _this = this;

    // alert(this.$('#aboutMe').val().replace(/\n/g, '<br/>'));
    // return;

    $('#save-profile-button .icon').css('display', 'inline-block');
    $('#save-profile-button .button-title').hide();

    this.model.save(
      {
        'u': this.$('input[name=username]').val(),
        'a': this.$('#aboutMe').val(),
        'm': ((this.$('input[name=interestedInMen]:checked').length > 0) ? 1 : 0),
        'w': ((this.$('input[name=interestedInWomen]:checked').length > 0) ? 1 : 0),
        'ff': ((this.$('input[name=findFriends]:checked').length > 0) ? 1 : 0),
        'fd': ((this.$('input[name=findDates]:checked').length > 0) ? 1 : 0),
        'fn': ((this.$('input[name=notifications]:checked').val() == 'true') ? true : false)
      },
      {
        error: function(model, response) {
          //TODO: properly handle errors
          alert('User save failed!');
          $('#save-profile-button .icon').hide();
          $('#save-profile-button .button-title').show();
        },
        success: function(model, response) {
          log('got an API response', 'info');
          // SUCCESS
          if ((typeof model.attributes._id !== 'undefined') && (typeof response.error === 'undefined')) {
            log('API call was successful', 'info');
            store.set("user", _this.model);
            $('#save-profile-button .icon').hide();
            $('#save-profile-button .button-title').show();
            IS.navigateTo('me');
          }
          // FAIL
          else {
            log('API call failed: ' + response.error, 'error');
            alert('User save failed: ' + response.error);

            $('#save-profile-button .icon').hide();
            $('#save-profile-button .button-title').show();
          }
        }
      }
    );
  }
});


// =========================================================================
// UsersFullView - a complete view of a user's profile
// =========================================================================
var UsersFullView = Backbone.View.extend({
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #send-message': 'sendMessage',
    'click #handle-favourite': 'handleFavourite',
    'click #view-all-common-interests': 'viewAllCommonInterests',
    'click #show-full-about': 'toggleAboutMe',
    'click #close-full-about': 'toggleAboutMe',
    'click #view-all-interests': 'viewAllInterests'
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
    this.model.set('commonLikesCount', (commonLikes[0].length + commonLikes[1].length + commonLikes[2].length));

    if(commonLikes[0].length > 0) {
      this.model.set('commonInterestsInDislikes', commonLikes[0]);
      this.model.set('commonInterestsInDislikesFound', true);
    }
    else {
      this.model.unset('commonInterestsInDislikes', {silent: true});
      this.model.unset('commonInterestsInDislikesFound', {silent: true});
    }

    if(commonLikes[1].length > 0) {
      this.model.set('commonInterestsInLikes', commonLikes[1]);
      this.model.set('commonInterestsInLikesFound', true);
    }
    else {
      this.model.unset('commonInterestsInLikes', {silent: true});
      this.model.unset('commonInterestsInLikesFound', {silent: true});
    }

    if(commonLikes[2].length > 0) {
      this.model.set('commonInterestsInFavourites', commonLikes[2]);
      this.model.set('commonInterestsInFavouritesFound', true);
    }
    else {
      this.model.unset('commonInterestsInFavourites', {silent: true});
      this.model.unset('commonInterestsInFavouritesFound', {silent: true});
    }

    // render template
    this.html = Mustache.to_html(this.template, this.model.toJSON());

    // render sub views
    this.myPhotosView.render();
    this.likesListView.render();
    this.commonLikesListView.render(null, null, true);
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing UsersFullView');
    this.$el.html(this.html);

    // show sub views
    this.myPhotosView.setElement(this.$('#user-photos')).show();
    this.likesListView.setElement(this.$('#facebookLikes')).show();
    this.commonLikesListView.setElement(this.$('#commonLikes')).show();
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering UsersFullView');

    // convert \n to <br> in the about me
    this.$('#about-me, #about-me-full .about-text').html( this.$('#about-me').html().replace(/\n/g, '<br/><br/>') );

    // activate fancybox for all photos
    this.$("#user-photos .fancybox-thumb").fancybox({
      prevEffect  : 'fade',
      nextEffect  : 'fade',
      padding: 0,
      topRatio: 0,
      helpers: {
        title: {
          type: 'outside'
        },
        overlay: {
          css: {
            'background' : 'rgba(0,0,0,.9)'
          }
        },
        thumbs: {
          width: 200,
          height: 150,
          position: 'top'
        },
        buttons: {
          position: 'bottom'
        }
      }
    });

    // enter sub views
    this.myPhotosView.enter();
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
        }
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
    var favType = null;

    if (_.indexOf(user.get('favs'), this.model.get('_id')) === -1) {
      favType = 'add';
    } else {
      favType = 'remove';
    }
    IS.handleFavourite(this.model.get('_id'), this.model.get('u'), favType);
  },

  // viewAllCommonInterests
  // -----------------------------------------------------------------------
  viewAllCommonInterests: function() {
    if(this.$('#common-interests').hasClass('expanded')) {
      this.$('#common-interests, #view-all-common-interests').removeClass('expanded');
    } else {
      this.$('#common-interests, #view-all-common-interests').addClass('expanded');
    }
  },

  // toggleAboutMe
  // -----------------------------------------------------------------------
  toggleAboutMe: function() {
    this.$('#about-me-full').toggle();
  },

  // viewAllInterests
  // -----------------------------------------------------------------------
  viewAllInterests: function() {
    if(this.$('#all-interests').hasClass('expanded')) {
      this.$('#all-interests, #view-all-interests').removeClass('expanded');
    } else {
      this.$('#all-interests, #view-all-interests').addClass('expanded');
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
    this.$('.photo img').each(function(){
      var self = this;
      setTimeout(function() {
        $(self).removeClass('transparent');
      }, (150 + (150 * Math.floor((Math.random()*3)+1))));
    });

    this.$('.photo img').each(function() {
      var self = this;
      if($(this).height() > 0) {
        setTimeout(function() {
          $(self).removeClass('transparent');
        }, (150 + (150 * Math.floor((Math.random()*3)+1))));
      } else {
        $(this).load(function(){
          setTimeout(function() {
            $(self).removeClass('transparent');
          }, (150 + (150 * Math.floor((Math.random()*3)+1))));
        });
      }
    });

    // set the width of the photo container
    var iTotalWidth = this.model.get('p').length * 300;
    this.$('.user-photos-scroller').width(iTotalWidth);
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