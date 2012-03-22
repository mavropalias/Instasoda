// =============================================================================
// =============================================================================
// = Instasoda client library
// = > requires jQuery 1.7+
// = > requires Backbone.js
// = > requires Mustache.js
// =============================================================================
// =============================================================================

var IS;
$(document).ready(function() {
  IS = new function() {

    // #########################################################################
    // #########################################################################
    // # Config
    // #########################################################################
    // #########################################################################

    var appReady = false;
    var sApi = "http://localhost:8080/api/";
    var sApiPhotos = "http://localhost:8080/api/photos/";
    jQuery.support.cors = true;
    
   
    // #########################################################################
    // #########################################################################
    // # Models
    // #########################################################################
    // #########################################################################

    // User - the person using the app
    // =========================================================================
    var User = Backbone.Model.extend({
        defaults: {
        },
        idAttribute: "_id",
        urlRoot: sApi + 'user'
    });

    // Users - all other Instasoda users
    // =========================================================================
    var Users = Backbone.Model.extend({
        defaults: {
        },
        idAttribute: "_id",
        urlRoot: sApi + 'user'
    });


    // #########################################################################
    // #########################################################################
    // # Collections
    // #########################################################################
    // #########################################################################

    // UsersCollection - a collection of Users
    // =========================================================================
    var UsersCollection = Backbone.Collection.extend({
        url: sApi + 'user/search'
    });


    // #########################################################################
    // #########################################################################
    // # Views
    // #########################################################################
    // #########################################################################

    // =========================================================================
    // Beta message view
    // =========================================================================
    var BetaView = Backbone.View.extend({

      initialize: function() {
        _.bindAll(this);
      },

      render: function() {
        console.log('  ~ rendering beta view');
        var template = $('#tplBeta').html();
        $(this.el).html(template);
      }
      
    });
    
    // =========================================================================
    // WelcomeView
    // =========================================================================
    var WelcomeView = Backbone.View.extend({
      // events
      // -----------------------------------------------------------------------
      events: {
        'click #fb-auth': 'facebookAuth'
      },
      
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        _.bindAll(this);
      },

      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering welcome view');
        var template = $('#tplWelcome').html();
        $(this.el).html(template);
      },
      
      // facebookAuth
      // -----------------------------------------------------------------------
      facebookAuth: function() {
        console.log('> Doing Facebook auth');
        
        FB.getLoginStatus(function(res) {
          var button = document.getElementById('fb-auth');
          if (!res.authResponse) {
            //user is not connected to the app or logged out
            button.innerHTML = 'Login with Facebook';
            button.onclick = function() {
              FB.login(function(response) { 
                // FB.Event.subscribe('auth.statusChange') will take care of the rest
                },
                {
                  scope:'email,user_relationships,user_location,user_hometown,user_birthday,'
                  + 'user_activities,user_education_history,read_stream,user_interests,'
                  + 'user_likes,user_photos,offline_access'
                }
              );    
            }
        } else {
          if (response.status === 'connected') {
            console.log('> User is logged into Facebook and has authenticated the application');            
            
            // get facebook token data
            var fbToken = response.authResponse.accessToken;
            var fbTokenExpires = response.authResponse.expiresIn;
                        
            // Check if token is still valid
            if(fbTokenExpires > 0) {
              console.log('> Facebook token expires in ' + (fbTokenExpires / 60) + ' minutes');
              console.log('>   -> ' + fbToken);
              // get third_party_id from Facebook and login the user
              FB.api(
                {
                method: 'fql.query',
                query: 'SELECT third_party_id FROM user WHERE uid=me()'
                },
                function(response) {
                  console.log('> Attempting to login the user');
                  IS.login(fbToken, response[0].third_party_id, function(err) {
                    if(!err) {
                      console.log('> SUCCESS! User is logged in');
                      appReady = true;
                      IS.navigateTo('me');
                    } else {
                      console.log('> FAIL: Need to create new account');
                      IS.createAccount(fbToken, response[0].third_party_id, function (err, res) {
                        if(!err) {
                          console.log('> SUCCESS! Account created');
                          appReady = true;
                          IS.navigateTo('me');
                        } else {
                          console.log('> ERROR: ' + res);
                        }
                      });
                    }
                  });
                }
              );
            } else {
              console.log('- Facebook token has expired');
              FB.logout();
            }
          } else if (response.status === 'not_authorized') {
            console.log('> User is logged into Facebook but has not authenticated the application');
            //IS.navigateTo('');
          } else {
            console.log('> User is not logged into Facebook at this time');
            //IS.navigateTo('');
          }
        }
          
        });  
      }
      
    });
    
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
        
        // render master template
        var template = $('#tplSettings').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        
        // render sub views
        this.myPhotosView.setElement(this.$('#userPhotosList')).render();
        this.facebookLikesView.setElement(this.$('#facebookLikes')).render();
               
        setTimeout(function() {
          _this.onView();
          //_this.facebookLikesView.setElement(_this.$('#facebookLikes')).render();
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
        $("#userPhotos").on("focusin", function(){
          _this.$(".fancybox-thumb").fancybox({
            prevEffect	: 'elastic',
            nextEffect	: 'elastic',
            padding: 0,
            helpers	: {
              title	: {
                type: 'outside'
              },
              overlay	: {
                opacity : 0.85,
                css : {
                  'background-color' : '#000'
                }
              },
              thumbs	: {
                width	: 50,
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
                saveLocally("user", _this);
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
        e.preventDefault();
        e.stopPropagation();
        
        // get photo id
        var photoId = parseInt($(e.currentTarget).parent().parent().attr('id'));
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
            // update UI
            $('#userPhotos .photoMakeDefault').removeClass('hidden');
            $('#userPhotos .photoIsDefault').addClass('hidden');
            
            $('#userPhotos .photo').removeClass('default');
            $('#userPhotos #' + photoId).addClass('default');
            
            $('#userPhotos #' + photoId + ' .photoMakeDefault').addClass('hidden');
            $('#userPhotos #' + photoId + ' .photoIsDefault').removeClass('hidden');
            $('#userPhotos #' + photoId + ' .photoMakeDefault').html('make default');
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
            } else {
              alert('Error deleting photo');
            }
          }
        });
      }
    });
    
    // =========================================================================
    // SearchFilters view
    // =========================================================================
    var SearchFiltersView = Backbone.View.extend({
      // events
      // -----------------------------------------------------------------------
      events: {
        'click #doSearch': 'doSearch'
      },

      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        _.bindAll(this);
      },

      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering search view');
        var template = $('#tplSearchFilters').html();
        $(this.el).html(template);
        
        // enable jquery slider
        this.$("#ageRange").slider({
          range: true,
          min: 18,
          max: 99,
          values: [26, 91],
          slide: function (event, ui) {
            $("#ageNum").val(ui.values[0] + " - " + ui.values[1] + " years old");
            // small easter egg :)
            if (ui.values[1] == 99) {
              $("#ageNum").val(ui.values[0] + " - " + ui.values[1] + " years old (wow!)");
            }
          }
        });
        this.$("#ageNum").val(this.$("#ageRange").slider("values", 0) + " - " + this.$("#ageRange").slider("values", 1) + " years old");
      },
      
      // doSearch
      // -----------------------------------------------------------------------
      doSearch: function() {
        IS.navigateTo('search/all');
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
      
      // events
      // -----------------------------------------------------------------------
      events: {
        "click .userPreviewPhoto": "viewProfile"
      },

      // viewProfile
      // -----------------------------------------------------------------------
      viewProfile: function(e) {
        router.navigate(this.model.get('_id'), {trigger: true});
      },

      // render
      // -----------------------------------------------------------------------
      render: function() {
        var template = $('#tplUsersPreview').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
      }
    });

    // =========================================================================
    // UsersListView - contains a list of UsersView items,
    // used for search results / matches
    // =========================================================================
    var UsersListView = Backbone.View.extend({
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
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
        //WinJS.Utilities.setInnerHTMLUnsafe(this.el, $(usersView.el).html());
        $('#searchResults').append(usersView.el);
      },

      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering search results view');
        //this.collection.each(this.renderItem);
        this.collection.each(function(a, b, c) {
          //parse photos string and convert it to json
          var imagesArray = new Array();
          if (a.get('photos') != "" && a.get('photos') != null) {
            var images = a.get('photos').split(',');
            for (var i = 0; i < (images.length - 1); i++) {
              imagesArray[i] = sApiPhotos + images[i];

              // set 'main' photo
              if (i === 0) a.set({
                'profilePhoto': sApiPhotos + images[i]
              });
            }
          }
          a.set({
              'photosArray': imagesArray
          });
          //a.renderItem;
        });
        $(this.el).html('<ul id="searchResults" class="isColumn1 isRow1"></ul>');
        this.collection.each(this.renderItem);
      }
    });
    
    // =========================================================================
    // UsersFullView - a complete view of a user's profile
    // =========================================================================
    var UsersFullView = Backbone.View.extend({
      // events
      // -----------------------------------------------------------------------
      events: {
        'click .userPicture': 'viewPhoto'
      },

      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        _.bindAll(this);
        
        // Fetch data
        this.model.fetch();
      },

      // viewPhoto
      // -----------------------------------------------------------------------
      viewPhoto: function(e) {
        var filename = $(e.currentTarget).data("filename");

        //TODO: convert the following code into a template
        var that = this;

        /*$('#photoView').one('click', function () {
          IS.navigateTo('#usersProfile', that.model.get('username') + "'s profile");
          //IS.navigateBack();
        });*/
      },

      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering userFull view for: ' + this.model.get('_id'));
        
        // Update template
        var template = $('#tplUsersProfile').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        
        // Animate user's photos
        this.$('.userPicture img').load(function(){
          $(this).fadeIn();
        });
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
        this.$el.html(Mustache.to_html(template, this.model.toJSON()));
        
        if(this.model.get('u') === "") {
          // show like images when they load
          this.$('.fbLikePic img').load(function(){
            $(this).parent().show();
            $(this).parent().parent().find('.fbLikePicLoading').remove();
          });
          
          // reload like images until they load, while the API moves them to S3
          this.$('.fbLikePic img').error(function(){
            var _this = this;
            setTimeout(function() {
              var src = $(_this).attr('src');
              var date = new Date();
              $(_this).attr('src', src + "?v=" + date.getTime());
            }, 2500);
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
    

    // #########################################################################
    // #########################################################################
    // # Private methods
    // #########################################################################
    // #########################################################################

    /**
     * Store data locally, using one of the following methods:
     * 1. localStorage
     * 2. local DB
     * 3. Cookies
     * @param {String} varName
     * @param {Object} data
     * @return {Bool} success
     */
    var saveLocally = function(sVarName, jData) {
      if ( !! window.localStorage) {
        console.log("    (local storage save in process)");
        window.localStorage.setItem(sVarName, JSON.stringify(jData));
        return true;
      } else {
        //TODO: alternative storage solution, when localStorage is not available
        console.log("    (local storage is not available)");
        throw ("Local storage is not available");
      }
    }

    /**
     * Update data that have been saved locally.
     * @param {String} varName
     * @return {Object} object
     */
    var readLocally = function(sVarName) {
      if ( !! window.localStorage) {
        console.log("    (local storage read in process)");
        return JSON.parse(window.localStorage.getItem(sVarName));
      } else {
        //TODO: alternative storage solution, when localStorage is not available
        console.log("    (local storage is not available)");
        return false;
      }
    }
    
    /**
     * Logs the user out of the system.
     */
    var logout = function() {
      // silent only clears locally stored data
      // without any effect on the API
      user.clear({ silent: true });
      saveLocally("user", user);
      router.navigate("", {trigger: true});
    }


    // #########################################################################
    // #########################################################################
    // # Private variables
    // #########################################################################
    // #########################################################################
  
    // Backbone models
    // -----------------------------------------------------------------------
    var user = new User();
    var users = new Users();

    // Backbone collections
    // -----------------------------------------------------------------------
    var usersCollection = new UsersCollection({
      model: users
    });

    // Backbone views
    // -----------------------------------------------------------------------
    var welcomeView = new WelcomeView();
    var betaView = new BetaView();
    var searchFiltersView = new SearchFiltersView();
    var myProfileView = new MyProfileView({
      model: user
    });
    var usersListView = new UsersListView({
      collection: usersCollection,
    });


    // #########################################################################
    // #########################################################################
    // # Routes
    // #########################################################################
    // #########################################################################
    
    var Router = Backbone.Router.extend({
    
      // routes
      // -----------------------------------------------------------------------
      routes: {
        // Welcome
        "": "welcome",
        
        // My profile
        "me": "myProfile"
        ,
        // Search filters
        "search": "searchFilters",
        
        // Search results
        "search/:id": "searchResults",
        
        // Beta message
        "beta": "beta",
        
        // Logout
        "logout": "logout",

        // View user
        ":id": "viewUser"
      },
    
      // welcome
      // -----------------------------------------------------------------------
      welcome: function() {
        console.log('> routing welcome page');
        welcomeView.render();
        $('#content > div').detach();
        $('#content').append(welcomeView.el);
      },
      
      // myProfile
      // -----------------------------------------------------------------------
      myProfile: function() {
        if(!appReady) {
          router.navigate('', {trigger: true});
          return;
        }
        console.log('> routing my profile page');
        myProfileView.render();
        $('#content > div').detach();
        $('#content').append(myProfileView.el);
      },
      
      // searchFilters
      // -----------------------------------------------------------------------
      searchFilters: function() {
        if(!appReady) {
          router.navigate('', {trigger: true});
          return;
        }
        console.log('> routing search filters page');
        searchFiltersView.render();
        $('#content > div').detach();
        $('#content').append(searchFiltersView.el);
      },
      
      // searchResults
      // -----------------------------------------------------------------------
      searchResults: function(query) {
        if(!appReady) {
          router.navigate('', {trigger: true});
          return;
        }
        console.log('> routing search results page');
        usersCollection.fetch({
          data: {
            m: 1,
            f: 0
          }
        });
        usersListView.render();
        $('#content > div').detach();
        $('#content').append(usersListView.el);
      },
      
      // beta
      // -----------------------------------------------------------------------
      beta: function() {
        if(!appReady) {
          router.navigate('', {trigger: true});
          return;
        }
        console.log('> routing beta page');
        betaView.render();
        $('#content > div').detach();
        $('#content').append(betaView.el);
      },
      
      // logout
      // -----------------------------------------------------------------------
      logout: function() {
        console.log('> routing logout page');
        logout();
      },
      
      // viewUser
      // -----------------------------------------------------------------------
      viewUser: function(id) {
        if(!appReady) {
          router.navigate('', {trigger: true});
          return;
        }
        console.log('> routing view user page');
        
        users.set({ '_id': id });
        users.fetch();
        
        var usersFullView = new UsersFullView({
          model: users,
        });
        
        usersFullView.render();
        
        $('#content > div').detach();
        $('#content').append(usersFullView.el);
      }
      
    }); 
    var router = new Router;
    Backbone.history.start({
      root: "/is/"
    });
    
    
    // #########################################################################
    // #########################################################################
    // # Public methods
    // #########################################################################
    // #########################################################################
    
    /**
     * Navigates to a page.
     * @param {String} path
     */
    this.navigateTo = function(path) {
      router.navigate(path, {trigger: true});
    }
    
    /**
     * Attempts to auth a FB user.
     */
    this.facebookAuth = function(){
      if(readLocally("user") !== null) {
        if(typeof readLocally("user")._id !== 'undefined') {
          welcomeView.facebookAuth();
        }
      }
    }

    /**
     * Attempts to log the user into the system.
     * If it fails, it means that the user needs to register a new account.
     * @param {String} Facebook token
     * @param {String} Facebook third_party_id
     * @param {Function} Callback
     * @return {Bool} true/false
     */
    this.login = function(fTkn, fTid, cb) {
      // first check if the user is already logged in
      // --------------------------------------------
      if (user.get('_id')) {
        console.log('- user is logged in');
        cb(null, "success");
      } else {
        // try to read locally saved data to read the login status
        // -------------------------------------------------------
        console.log('- reading local storage');
        user.set(readLocally("user"));

        if (user.get('_id')) {
          console.log('- found user in local storage');
          
          // TODO sync data from API
          
          user.set({ 'fTkn': fTkn });
          saveLocally("user", user);
          
          cb(null);
        } else {
          console.log('- trying the API: ' + fTid);
          
          user.set({
            '_id': fTid,
            'fTkn': fTkn
          });
          
          // connect to the API server and fetch the user
          // --------------------------------------------
          user.fetch(
            { 
              data: {
                'fTkn': fTkn
              }
            , 
              error: function(model, response) {
                //TODO: properly handle errors
                //a false might only mean that the API server is N/A
                console.log('- login error: ' + response.error);
                cb(true, response.error);
              }
            ,
              success: function(model, response) {
                // Ajax call was successful
                // ------------------------
                console.log('- got an API response');
                // Now check if the account was created
                // ------------------------------------
                if ((typeof model.attributes._id !== 'undefined') && (typeof response.error === 'undefined')) {                    
                  // store the user details locally
                  // ------------------------------
                  saveLocally("user", user);
  
                  // callback success
                  // ----------------
                  cb(null, "success");
                }
                // FAIL
                // ----
                else {
                  console.log('- ' + response.error);
                  cb(true, response.error);
                }
              }
            }
          );
        }
      }
    }

    /**
     * Create a new user account by connecting to Facebook.
     * @param {Integer} package 1=basic, 2=standard, 3=complete
     * @param {String} facebookToken
     * @param {Function} callback
     * @return {Object} Returns an object {'s': 'success/fail'}
     */
    this.createAccount = function(fbToken, fTid, cb) {
      console.log('- creating account');
      user.set({
        '_id': null,
        'fTid': fTid,
        'fTkn': fbToken
      });

      user.save({
        error: function(model, response) {
          //TODO: properly handle errors
          //a false might only mean that the API server is N/A
          console.log('- login error: ' + response.error);
          cb(true, response.error);
        }
      }, {
        success: function(model, response) {
          // Ajax call was successful
          // ------------------------
          console.log('- got an API response');
          // Now check if the account was created
          // ------------------------------------
          if ((typeof model.attributes._id !== 'undefined') && (typeof response.error === 'undefined')) {                    
            // store the user details locally
            // ------------------------------
            saveLocally("user", user);
    
            // callback success
            // ----------------
            cb(null, "success");
          }
          // FAIL
          // ----
          else {
            console.log('- ' + response.error);
            cb(true, response.error);
          }
        }
      });
    }

    /**
     * Deletes a user photo
     * @param {String} photo
     */
    this.deletePhoto = function(imgFile) {
        var fbThirdPartyId = user.get('fbThirdPartyId');

        // split photos string to array and remove image
        var images = user.get('photos').split(',');
        var arrayPos = $.inArray(imgFile, images);
        if (arrayPos != -1) {
            images.splice(arrayPos, 1);
        }

        // rebuild string and save user
        var imgStr = "";
        for (var i = 0; i < (images.length - 1); i++) {
            imgStr += images[i] + ',';
        }
        user.set({
            'photos': imgStr
        });
        user.save({
            error: function(model, response) {
                //TODO: properly handle errors
                IS.navigateBack();
            }
        }, {
            success: function(model, response) {
                // SUCCESS
                if (response.status == "success") {
                    saveLocally("user", user);
                    IS.navigateBack();
                }
                // FAIL
                else {
                    //TODO: properly handle errors
                    IS.navigateBack();
                }
            }
        });
    }
  }
});