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

    // =====================================================================
    // =====================================================================
    // = Settings
    // =====================================================================
    // =====================================================================

    var sApi = "http://localhost:8080/api/";
    var sApiPhotos = "http://localhost:8080/api/photos/";
    var sApiSecretKey = "aG35svDHJURCG35253dCFDC69fvsf3fhg0f";
    var sApiSecretKeyGet = "?skey=" + sApiSecretKey;
    jQuery.support.cors = true;
    
   
    // =====================================================================
    // =====================================================================
    // = Models
    // =====================================================================
    // =====================================================================

    // User - the person using the app
    //----------------------------------------------------------------------
    var User = Backbone.Model.extend({
        defaults: {
        },
        idAttribute: "_id",
        urlRoot: sApi + 'user'
    });

    // Users - all other Instasoda users
    //----------------------------------------------------------------------
    var Users = Backbone.Model.extend({
        defaults: {
        },
        idAttribute: "_id",
        urlRoot: sApi + 'user'
    });


    // =====================================================================
    // =====================================================================
    // = Collections
    // =====================================================================
    // =====================================================================

    // UsersCollection - a collection of Users
    //----------------------------------------------------------------------
    var UsersCollection = Backbone.Collection.extend({
        url: sApi + 'users/' + sApiSecretKeyGet
    });


    // =====================================================================
    // =====================================================================
    // = Views
    // =====================================================================
    // =====================================================================

    // Beta message
    //----------------------------------------------------------------------
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
    
    // WelcomeView
    //----------------------------------------------------------------------
    var WelcomeView = Backbone.View.extend({
      events: {
        'click #fb-auth': 'facebookAuth'
      },
      
      initialize: function() {
        _.bindAll(this);
      },

      render: function() {
        console.log('  ~ rendering welcome view');
        var template = $('#tplWelcome').html();
        $(this.el).html(template);
      },
      
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
                      IS.navigateTo('me');
                    } else {
                      console.log('> FAIL: Need to create new account');
                      IS.createAccount(fbToken, response[0].third_party_id, function (err, res) {
                        if(!err) {
                          console.log('> SUCCESS! Account created');
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
    
    // UserSettingsView - the settings page of the person using the app
    //----------------------------------------------------------------------
    var UserSettingsView = Backbone.View.extend({
      events: {
        'click #saveProfileButton': 'save',
        'click #addPhoto': 'addPhoto',
        'click .userPicture': 'viewPhoto'
      },

      initialize: function(options) {
        _.bindAll(this, 'render');
        _.bindAll(this, 'save');
        this.model.bind('change', this.render);
      },
      
      render: function() {
        console.log('  ~ rendering user view');
        var template = $('#tplSettings').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        
        // animate user's photos
        this.$('.userPicture img').load(function(){
          $(this).fadeIn();
        });
      },

      viewPhoto: function(e) {
        var filename = $(e.currentTarget).data('filename');

        //TODO: convert the following code into a template
        $('#photoView').html('<div class="isColumn1 isRow1"><button onclick="IS.deletePhoto(\'' + $(e.currentTarget).data('filenameshort') + '\');">Delete photo</button><br /><img src="' + filename + '"></div>');
        IS.navigateTo('#photoView', 'Photo');
        $('#photoView img').one('click', function() {
            IS.navigateTo('#settings', 'My profile');
        });
      },

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

      addPhoto: function() {
        var fbThirdPartyId = this.model.get('fbThirdPartyId');
        var that = this;

        // create a FileOpenPicker object for the image file picker button
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail; //show images in thumbnail mode
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary; // start browsing in My Pictures library
        openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]); // show only image files
        openPicker.pickSingleFileAsync().then(function(file) {
          // Ensure picked file is valid and usable
          if (file) {
            // append picture in the page
            //$('#userPictures').append('<li class="userPicture"><img height=150 src="' + URL.createObjectURL(file) + '"></li>');

            // upload the image
            file.openAsync(Windows.Storage.FileAccessMode.read).then(function(stream) {
              var blob = msWWA.createBlobFromRandomAccessStream(file.contentType, stream);
              var xhr = new XMLHttpRequest();
              xhr.open('POST', sApi + 'photo.php?a=1&token=' + fbThirdPartyId + '&t=' + file.fileType + '&skey=' + sApiSecretKey, true);
              xhr.onload = function(e) {
                var imageData = JSON.parse(e.currentTarget.response);
                that.model.set(imageData);
                that.model.save({
                  error: function(model, response) {
                    //TODO: properly handle errors
                    //callback(false, "Ajax error: " + response.status);
                  }
                }, {
                  success: function(model, response) {
                    // SUCCESS
                    if (response.status == "success") {
                      saveLocally("user", user);
                      $('#saveProfileButton').fadeIn();
                      $('#working').fadeOut();
                    }
                    // FAIL
                    else {
                      //callback(false, response.status);
                    }
                  }
                });
              };
              xhr.send(blob);
            });
          } else {
            // File not valid
            //$('#userPictures').append("error");
          }
        });
      }
    });
    
    // SearchFilters
    //----------------------------------------------------------------------
    var SearchFiltersView = Backbone.View.extend({
      events: {
        'click #doSearch': 'doSearch'
      },

      initialize: function() {
        _.bindAll(this);
      },

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
      
      doSearch: function() {
        IS.navigateTo('search/all');
      }
    });

    
    // UsersView - a basic view of a user appearing in the search results
    //----------------------------------------------------------------------
    var UsersView = Backbone.View.extend({
      className: 'userPreview',
      tagName: 'li',
      events: {
        "click .userPreviewPhoto": "viewProfile"
      },

      viewProfile: function(e) {
        router.navigate(this.model.get('_id'), {trigger: true});
      },

      render: function() {
        var template = $('#tplUsersPreview').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
      }
    });

    // UsersListView - contains a list of UsersView items,
    // used for search results / matches
    //----------------------------------------------------------------------
    var UsersListView = Backbone.View.extend({
      initialize: function() {
        _.bindAll(this);
        this.collection.bind('reset', this.render);
      },

      renderItem: function(model) {
        var usersView = new UsersView({
            model: model
        });
        usersView.render();
        //WinJS.Utilities.setInnerHTMLUnsafe(this.el, $(usersView.el).html());
        $('#searchResults').append(usersView.el);
      },

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
    
    // UsersFullView - a complete view of a user's profile
    //----------------------------------------------------------------------
    var UsersFullView = Backbone.View.extend({
      events: {
        'click .userPicture': 'viewPhoto'
      },

      initialize: function() {
        _.bindAll(this);
        
        // Fetch data
        this.model.fetch();
      },

      viewPhoto: function(e) {
        var filename = $(e.currentTarget).data("filename");

        //TODO: convert the following code into a template
        var that = this;
        $('#photoView').html('<div class="isColumn1 isRow1"><img src="' + filename + '"></div>');
        IS.navigateTo('#photoView', this.model.get('username') + "'s photo");
        /*$('#photoView').one('click', function () {
          IS.navigateTo('#usersProfile', that.model.get('username') + "'s profile");
          //IS.navigateBack();
        });*/
      },

      render: function() {
        console.log('  ~ rendering userFull view for: ' + this.model.get('_id'));
        
        // Update template
        var template = $('#tplUsersProfile').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
      }
    });



    // =====================================================================
    // =====================================================================
    // = Private methods
    // =====================================================================
    // =====================================================================

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
     * Calculate width of search results
     * @param {Integer} iProfileCount the number of users in the searc results
     */
    var calculateSearchResultsDimensions = function(iProfileCount) {
        var iWindowHeight = $(window).height();
        var iWindowWidth = $(window).width();
        var iHeaderHeight = $(".homePage > header").height() + 60; // 60 is the top margin that we have to calculate too.

        iMaxProfileRows = (iWindowHeight - iHeaderHeight) / 210;
        iProfilesWrapperWidth = (iProfileCount / iMaxProfileRows) * 350;

        // The 720 below is the minimum width that each block (likes/profile pics) occupies
        // Doing this so we won't end up with a 1-pic-width / 1-like-width column if the profile pics are too few.
        if (iProfilesWrapperWidth > 720) {
            if (iProfilesWrapperWidth < iWindowWidth) {
                $("#searchResults").css({
                    'width': iWindowWidth - 200
                });
            } else {
                $("#searchResults").css({
                    'width': iProfilesWrapperWidth
                });
            }
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


    // =====================================================================
    // =====================================================================
    // = Private variables
    // =====================================================================
    // =====================================================================

    var isLoggedIn = false;
    var navHistoryPage = new Array();
    var navHistoryTitle = new Array();
  
    // Backbone models
    var user = new User();
    var users = new Users();

    // Backbone collections
    var usersCollection = new UsersCollection({
      model: users
    });

    // Backbone views
    var welcomeView = new WelcomeView();
    var betaView = new BetaView();
    var searchFiltersView = new SearchFiltersView();
    var userSettingsView = new UserSettingsView({
      model: user
    });
    var usersListView = new UsersListView({
        collection: usersCollection,
    });


    // =====================================================================
    // =====================================================================
    // = Routes
    // =====================================================================
    // =====================================================================
    
    var Router = Backbone.Router.extend({
    
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
    
      welcome: function() {
        console.log('> routing welcome page');
        welcomeView.render();
        $('#content > div').detach();
        $('#content').append(welcomeView.el);
      },
      
      myProfile: function() {
        console.log('> routing my profile page');
        userSettingsView.render();
        $('#content > div').detach();
        $('#content').append(userSettingsView.el);
      },
      
      searchFilters: function() {
        console.log('> routing search filters page');
        searchFiltersView.render();
        $('#content > div').detach();
        $('#content').append(searchFiltersView.el);
      },
      
      searchResults: function(query) {
        console.log('> routing search results page');
        usersCollection.fetch();
        usersListView.render();
        $('#content > div').detach();
        $('#content').append(usersListView.el);
      },
      
      beta: function() {
        console.log('> routing beta page');
        betaView.render();
        $('#content > div').detach();
        $('#content').append(betaView.el);
      },
      
      logout: function() {
        console.log('> routing logout page');
        logout();
      },
      
      viewUser: function(id) {
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
    
    
    // =====================================================================
    // =====================================================================
    // = Public methods
    // =====================================================================
    // =====================================================================
    
    /**
     * Navigates to a page.
     * @param {String} path
     */
    this.navigateTo = function(path) {
      router.navigate(path, {trigger: true});
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