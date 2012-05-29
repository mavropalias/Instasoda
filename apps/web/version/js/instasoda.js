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
    var socketIoHost = "http://localhost:8082"; //##socketIoHost##
    var sApi = "http://localhost:8080/api/"; //##apiUrl##
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
    
    // OnlineUsers
    // =========================================================================
    var OnlineUsers = Backbone.Model.extend({
      defaults: {
      }
    });
    
    // ChatSession
    // =========================================================================
    var ChatSession = Backbone.Model.extend({
      idAttribute: "_id"
    });
    
    // ChatSessionLog
    // =========================================================================
    var ChatSessionLog = Backbone.Model.extend({
      idAttribute: "_id",
      log: {}
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
    
    // ChatSessions
    // =========================================================================
    var ChatSessions = Backbone.Collection.extend({
      url: sApi + 'chat'
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
      // initialize
      initialize: function() {
        _.bindAll(this);
      },
      
      // render
      render: function() {
        console.log('  ~ rendering beta view');
        var template = $('#tplBeta').html();
        $(this.el).html(template);
      }
    });
    
    // =========================================================================
    // Navigation view
    // =========================================================================
    var NavigationView = Backbone.View.extend({      
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        _.bindAll(this);
        this.model.bind('change', this.render);
        this.render();
      },
      
      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering NavigationView');
        var template = $('#tplNavigation').html();
        this.$el.html(Mustache.to_html(template, this.model.toJSON()));
        
        // render sub views
        this.onlineUsersView = new OnlineUsersView({ model: onlineUsers });
        this.onlineUsersView.setElement(this.$('#navOnlineUsers')).render();
      }
    });
    
    // =========================================================================
    // Chat view
    // =========================================================================
    var ChatView = Backbone.View.extend({      
      // events
      // -----------------------------------------------------------------------
      events: {
        'click #chatToggle': 'toggleChatWindow'
      },
      
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        _.bindAll(this);
        
        // initialize sub views
        this.chatSessionTabs = new ChatSessionTabs({ collection: chatSessions });
        this.chatSessionsView = new ChatSessionsView({ collection: chatSessions });
        
        this.model.bind('change', this.render);
        this.render();
      },
      
      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering ChatView');
        
        var _this = this;
        var template = $('#tplChat').html();
        
        this.$el.html(Mustache.to_html(template, this.model.toJSON()));
        
        // fetch chat sessions
        // ---------------------------------------------------------------------
        chatSessions.reset();
        chatSessions.fetch({
          data: {
            'id': this.model.get('_id'),
            'fTkn': this.model.get('fTkn')
          },
          success: function(model, response) {
            // render sub views
            _this.chatSessionTabs.setElement(_this.$('.chatSessions')).render();
            _this.chatSessionsView.setElement(_this.$('.chatSessionContainer')).render();
          }
        }
        );
      },
      
      // toggleChatWindow
      // -----------------------------------------------------------------------
      toggleChatWindow: function() {
        console.log('  ~ toggling chat window');
        this.$('#chatWindow').toggle(0, function() {
          if($(this).is(':visible')) $('#chatToggle').addClass('active');
          else $('#chatToggle').removeClass('active');
        });
      },
      
      // showChatWindow
      // -----------------------------------------------------------------------
      showChatWindow: function() {
        console.log('  ~ showing chat window');
        this.$('#chatWindow').show();
        this.$('#chatToggle').addClass('active')
      }
    });
    
    // =========================================================================
    // ChatSessionTabs
    // =========================================================================
    var ChatSessionTabs = Backbone.View.extend({
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        console.log('  ~ initializing ChatSessionTabs');
        _.bindAll(this);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
      },
      
      // events
      // -----------------------------------------------------------------------
      events: {
        'click .chatSessionsTab': 'chatSessionsTabClick'
      },
      
      // render
      // -----------------------------------------------------------------------
      render: function(options) {
        console.log('  ~ rendering ChatSessionTabs (tabs)');
        this.$el.html('');
        this.collection.each(this.renderSessionTab);
      },
      
      // renderSessionTab
      // -----------------------------------------------------------------------
      renderSessionTab: function(model) {
        console.log('  ~ renderSessionTab');
        
        var _this = this;
        
        // when fetching the chat sessions from the API server, we need to
        // pre-process the 'u' property of the model, and set it to the other
        // person's username
        if(!model.get('u')) {
          var otherPersonsId = model.get('uA') == user.get('_id') ? model.get('uB') : model.get('uA');
          
          // now find the other person's username, using his id
          console.log(' - (chat) looking up username for id #' + otherPersonsId);          
          socket.emit('getUsernameFromId', {
            userId: otherPersonsId
          }, function(err, username) {
            if(!err) {
              console.log(' - got username: ' + username)
              model.set({
                u: username
              })
              
              // render the template
              var template = $('#tplChatSessions').html();
              _this.$el.append(Mustache.to_html(template, model.toJSON()));
            } else {
              console.log('!!! ERROR: renderSessionTab -> ' + err);
              //TODO: handle errors
            }
          });
        } else {
          // render the template
          var template = $('#tplChatSessions').html();
          _this.$el.append(Mustache.to_html(template, model.toJSON()));
        }
      },
      
      // chatSessionsTabClick
      // -----------------------------------------------------------------------
      chatSessionsTabClick: function(e) {        
        var sSessionId = $(e.currentTarget).attr('id');
        console.log('  - chatSessionsTabClick:' + sSessionId);
        this.showChatSession(sSessionId);
      },
      
      // showChatSession
      // -----------------------------------------------------------------------
      showChatSession: function(sSessionId) {
        console.log('  - showChatSession (1): ' + sSessionId);
        
        // apply 'active' style to the tab
        this.$('.chatSessionsTab').removeClass('active');
        this.$('#' + sSessionId).addClass('active');
        
        // set 'active' status for the model in the collection
        this.collection.each(function(m) {
          if(m.get('active')) {
            m.set({ active: false });
          }
        });
        this.collection.each(function(m) {
          if(m.get('_id') == sSessionId ) {
            console.log('  ~ showChatSession (2): ' + m.get('_id'));
            m.set({ active: true });            
          }
        });       
      },
      
      // initiateSessionWith
      // -----------------------------------------------------------------------
      initiateSessionWith: function(userId, username) {
        var _this = this;
        
        chatView.showChatWindow();
        
        // get session id
        var sessionId;
        socket.emit('getChatSession', {
          userA: user.get('_id'), 
          userB: userId
        }, function(err, result) {
          if(!err) {
            sessionId = result._id;
            
            var sessionExistsLocally = _this.collection.find(function(session) {
              return session.get('_id') == sessionId;
            });
            
            if(!sessionExistsLocally) {
              _this.collection.add([
                { _id: sessionId, u: username, m: 0, active: true, log: result.log }
              ]);
            }
          
            _this.showChatSession(sessionId);
          } else {
            alert("Couldn't initiate chat session!");
          }
        });
      }
    });
    
    // =========================================================================
    // ChatSessionsView
    // =========================================================================
    var ChatSessionsView = Backbone.View.extend({      
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        console.log('  ~ initializing ChatSessionsView');
        _.bindAll(this);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
        this.collection.bind('change:active', this.showSession);
      },
      
      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering ChatSessionsView');
        this.$el.html('');
        this.collection.each(this.renderSession);
      },
      
      // renderSession
      // -----------------------------------------------------------------------
      renderSession: function(model) {
        console.log('  ~ rendering chat sessions');
        var chatSessionView = new ChatSessionView({
            model: model
        });
        chatSessionView.render();
        this.$el.append(chatSessionView.el);
      },
      
      // showSession
      // -----------------------------------------------------------------------
      showSession: function(model) {
        console.log('  - (chat) showSession ' + model.get('_id'));
        this.$('.chatSession').hide();
        this.$('#session_' + model.get('_id')).show().find('.chatInput').focus();
        
        // convert timestamps to timeago
        this.$('.time').timeago();
        
        // scroll to the bottom of the chat log
        oChatLog = $('.chatLog', this.el);
        oChatLog.scrollTop(oChatLog[0].scrollHeight);
        
        //TODO: investigate why this gets triggered twice
      }
    });
    
    // =========================================================================
    // ChatSessionView
    // =========================================================================
    var ChatSessionView = Backbone.View.extend({
      // events
      // -----------------------------------------------------------------------
      events: {
        'submit form#sendMessageForm': 'sendMessage'
      },
      
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        console.log('  ~ initializing ChatSessionView');
        _.bindAll(this);
        this.model.bind('change:log', this.renderNewChatMessage);
      },
      
      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering ChatSessionView');
        var template = $('#tplChatSession').html();
        this.$el.html(Mustache.to_html(template, this.model.toJSON()));
      },
      
      // renderNewChatMessage
      // -----------------------------------------------------------------------
      renderNewChatMessage: function(sMsg) {
        console.log('  ~ (chat) renderNewChatMessage');
        oChatLog = $('.chatLog', this.el);
        
        // append the new msg into the dom
        var template = $('#tplChatLog').html();
        oChatLog.append(Mustache.to_html(template, sMsg));
        
        // convert timestamps to timeago
        $('.chatLog .time', this.el).timeago();
        
        // scroll to the bottom of the chat log
        oChatLog.scrollTop(oChatLog[0].scrollHeight);
      },
      
      // sendMessage
      // -----------------------------------------------------------------------
      sendMessage: function(e) {
        console.log('  - (chat) sendMessage');
        
        // return if msg is empty
        if($('.chatInput', this.el).val() == "") return false;
        
        // construct message
        var date = new Date().toJSON();
        var sMsg = {
          u: user.get('u'),
          t: date,
          m: $('.chatInput', this.el).val()
        };
        
        // update the model's log
        this.model.get('log').push(sMsg);
        this.model.trigger('change:log', sMsg);
        
        // send message to the other person via Socket.IO
        socket.emit('newChatMessage', {
          sessionId: this.model.get('_id'),
          message: sMsg
        }, function(data) {
          // TODO:  handle chat msg response
        });
        
        // clear chat input
        $('.chatInput', this.el).val('');
        
        // done - prevent default form action
        return false;
      }
    });
    
    // =========================================================================
    // WelcomeView
    // =========================================================================
    var WelcomeView = Backbone.View.extend({
      // settings
      id: 'welcome',
      
      // events
      // -----------------------------------------------------------------------
      events: {
        'click #fb-auth': 'facebookAuth',
        'click .instantProfiles': 'featureInstantProfiles'
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
      
      // featureInstantProfiles
      // -----------------------------------------------------------------------
      featureInstantProfiles: function() {
        var _this = this;
        
        var frameRate = 50;
        var cssTransitionDelay = 400;
        var counter = 0;
        var boxSize = 80;
        var winWidth = $(window).width();
        var winHeight = $(window).height();
        var boxColumns = 0;
        var boxRows = 0;
        
        winWidth = $(window).width();
        winHeight = $(window).height() - $('body > nav').height();
      
        boxColumns = (Math.round(winWidth / boxSize))+1;
        boxRows = (Math.round(winHeight / boxSize))+1;
        
        _this.$('.faces').width(winWidth);
        _this.$('.faces').height(winHeight);
        
        addBoxes(boxColumns,boxRows);
        
        function addBoxes(cols,rows) {
          var faceDelay = 100;
          var delayToPlayAnimation = 0;
          
          _this.$('.faces').empty();
          for(n = 0; n < rows; n++){
            _this.$('.faces').append("<div id='row" + n + "' class='row'>");
            _this.$('#row'+n).css("top",(n * boxSize + 70)+"px");
            
            for(m = 0; m < cols; m++) {
              (function() {
                _this.$('#row'+n).append("<div id='box" + n + "-" + m + "' class='box animated transparent row" + n + " col" + m + "'></div>");
                var object = _this.$('#box' + n + "-" + m);
                object.css("left",(m*boxSize)+"px");
                
                //load random image
                var rnd = Math.floor(Math.random() * (12) + 1);
                if( ( rnd * faceDelay ) > delayToPlayAnimation ) delayToPlayAnimation = rnd * faceDelay;
                object.css("background-image",'url(faces/'+(rnd)+'.png)').delay(rnd * faceDelay).queue(function() {
                  $(this).removeClass('transparent');
                });
              })();
            }
            _this.$('.faces').append("</div>")
          }
          
          // set row width
          _this.$('.row').css('width',(boxSize * boxColumns)+'px');
          
          // do face animations + effects
          setTimeout(function() {
            playAnimation(cols, rows);
          }, delayToPlayAnimation);
          
          // draw the heart
          setTimeout(function() {
            drawHeart(cols, rows);
          }, (delayToPlayAnimation + ((boxColumns) * frameRate)));
        }
        
        function playAnimation() {
          if(counter < boxColumns) {
            var internalCounter = counter;
            _this.$('.col' + counter).css('opacity', '0');
            
            // repeat animation
            setTimeout(playAnimation, frameRate);
            
            // restore opacity after (cssTransitionDelay + (counter * internalCounter))
            setTimeout(function() {
              _this.$('.col' + (internalCounter - 1)).css('opacity', '1');
            }, (cssTransitionDelay + (counter * internalCounter)));
            
            // increase counter
            counter++;
          }
        }
        
        function drawHeart(cols, rows) {
          var startCol = Math.round (cols / 2) - 5;
          var startRow = Math.round (rows / 2) - 4;
          var heart = [[0,1,1,0,1,1,0],
                       [1,1,1,1,1,1,1],
                       [1,1,1,1,1,1,1],
                       [0,1,1,1,1,1,0],
                       [0,0,1,1,1,0,0],
                       [0,0,0,1,0,0,0]];
          
          // draw heart boxes
          for(n = 0; n < heart.length; n++){            
            for(m = 0; m < heart[0].length; m++) {
              // draw a heart box only if the array value is 1
              if(heart[n][m] === 1) {
                (function() {
                  var posX = (boxSize * (startCol + m)) + 'px';
                  var posY = (boxSize * (startRow + n)) + 'px';
                  
                  $("<div class='box heartBox animated' style='left:" + posX + "; top: " + posY + ";'></div>").appendTo(_this.$('.faces')).animate({ opacity: '0.95' }, cssTransitionDelay);
                })();
              }
            }
          }
        }
      },
      
      // facebookAuth
      // -----------------------------------------------------------------------
      facebookAuth: function() {
        var self = this;
        console.log('> Doing Facebook auth');
        
        FB.getLoginStatus(function(res) {
          var button = document.getElementById('fb-auth');
          if (!res.authResponse) {
            //user is not connected to the app or logged out
            //button.innerHTML = 'Login with Facebook';
            
              FB.login(function(response) { 
                // FB.Event.subscribe('auth.statusChange') will take care of the rest
                self.facebookAuth();
              },
              {
                scope:'email,user_relationships,user_location,user_hometown,user_birthday,'
                + 'user_activities,user_education_history,read_stream,user_interests,'
                + 'user_likes,user_photos,offline_access'
              });    
            
          } else {
            if (res.status === 'connected') {
              console.log('> User is logged into Facebook and has authenticated the application');            
              
              // get facebook token data
              var fbToken = res.authResponse.accessToken;
              var fbTokenExpires = res.authResponse.expiresIn;
                          
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
                  function(res) {
                    console.log('> Attempting to login the user');
                    IS.login(fbToken, res[0].third_party_id, function(err) {
                      if(!err) {
                        console.log('> SUCCESS! User is logged in');
                        appReady = true;
                        IS.navigateTo('me');
                      } else {
                        console.log('> FAIL: Need to create new account');
                        IS.createAccount(fbToken, res[0].third_party_id, function (err, res) {
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
            } else if (res.status === 'not_authorized') {
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
    // SearchView
    // =========================================================================
    var SearchView = Backbone.View.extend({
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        console.log('  ~ initializing SearchView');
        
        // bindings
        _.bindAll(this);
        
        // initialize sub-views
        this.searchResultsView = new SearchResultsView({ collection: this.collection });
        this.searchFiltersView = new SearchFiltersView({ model: this.model });
      },
      
      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering SearchView');
        
        // render template
        var template = $('#tplSearch').html();
        this.$el.html(Mustache.to_html(template, this.model.toJSON()));
        
        // render sub views
        this.searchFiltersView.setElement(this.$('#searchFilters')).render();
        this.searchResultsView.setElement(this.$('#searchResults'));
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
        console.log('  ~ initializing SearchFiltersView');
        _.bindAll(this);
      },

      // render
      // -----------------------------------------------------------------------
      render: function() {
        var _this = this;
        console.log('  ~ rendering SearchFiltersView');
        
        // determine default filter values
        var userSearchOptions = this.model.get('so');
        
        // render template
        var template = $('#tplSearchFilters').html();
        this.$el.html(Mustache.to_html(template, this.model.toJSON()));
        
        // enable jquery slider
        this.$("#ageRange").slider({
          range: true,
          min: 18,
          max: 70,
          values: [userSearchOptions.ageMin, userSearchOptions.ageMax],
          slide: function (event, ui) {
            $("#ageNum").text(ui.values[0] + " - " + ui.values[1] + " years old");
            // small easter egg :)
            if (ui.values[1] == 99) {
              $("#ageNum").text(ui.values[0] + " - " + ui.values[1] + " years old (wow!)");
            }
          }
        });
        this.$("#ageNum").text(this.$("#ageRange").slider("values", 0) + " - " + this.$("#ageRange").slider("values", 1) + " years old");
      },
      
      // doSearch
      // -----------------------------------------------------------------------
      doSearch: function() {
        // fetch search options
        var options = new Object({
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
        );
      }
    });
    
    // =========================================================================
    // SearchResultsView - contains a list of UsersView items,
    // used for search results / matches
    // =========================================================================
    var SearchResultsView = Backbone.View.extend({
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        console.log('  ~ initializing SearchResultsView');
        
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
        this.$el.append(usersView.el);
      },

      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering SearchResultsView');
        this.$el.html('');
        this.collection.each(this.renderItem);
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
        'click': 'viewProfile'
      },

      // viewProfile
      // -----------------------------------------------------------------------
      viewProfile: function(e) {
        router.navigate(this.model.get('_id'), {trigger: true});
      },

      // render
      // -----------------------------------------------------------------------
      render: function() {
        var template = $('#tplSearchResult').html();
        this.$el.html(Mustache.to_html(template, this.model.toJSON()));
      }
    });
    
    // =========================================================================
    // UsersFullView - a complete view of a user's profile
    // =========================================================================
    var UsersFullView = Backbone.View.extend({
      // events
      // -----------------------------------------------------------------------
      events: {
        'click #sendMessage': 'sendMessage'
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
      
      // render
      // -----------------------------------------------------------------------
      sendMessage: function() {
        chatView.chatSessionTabs.initiateSessionWith(this.model.get('_id'), this.model.get('u'));
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
    
    // =========================================================================
    // OnlineUsersView
    // =========================================================================
    var OnlineUsersView = Backbone.View.extend({
      // initialize
      // -----------------------------------------------------------------------
      initialize: function() {
        console.log('  ~ initializing OnlineUsersView');
        _.bindAll(this);
        this.model.bind('change', this.render);
      },
      
      // render
      // -----------------------------------------------------------------------
      render: function() {
        console.log('  ~ rendering FacebookLikesView');
        var template = $('#tplOnlineUsers').html();
        this.$el.html(Mustache.to_html(template, this.model.toJSON()));
      }
    });
    

    // #########################################################################
    // #########################################################################
    // # Private methods
    // #########################################################################
    // #########################################################################
    
    /**
     * Logs the user out of the system.
     */
    var logout = function() {
      user.clear({ silent: true }); // clear local Backbone model
      store.clear(); // clear localStorage
      navigationView.render(); // update nav menu
      chatView.render(); // update footer/chat view
      router.navigate("", {trigger: true}); // redirect to homepage
    }


    // #########################################################################
    // #########################################################################
    // # Private variables
    // #########################################################################
    // #########################################################################
  
    // Backbone models
    // -------------------------------------------------------------------------
    var user = new User();
    var users = new Users();
    var onlineUsers = new OnlineUsers();

    // Backbone collections
    // -------------------------------------------------------------------------
    var usersCollection = new UsersCollection({
      model: users
    });
    var chatSessions = new ChatSessions({
      model: ChatSession
    });
    
    // Backbone views
    // -------------------------------------------------------------------------
    var navigationView = new NavigationView({
      el: $('nav')[0],
      model: user
    });
    var chatView = new ChatView({
      el: $('#footer')[0],
      model: user
    });
    var welcomeView = new WelcomeView();
    var betaView = new BetaView();
    var myProfileView = new MyProfileView({
      model: user
    });
    var searchView = new SearchView({
      collection: usersCollection,
      model: user
    });
    var usersFullView = new UsersFullView({
      model: users,
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
        "search": "search",
        
        // Search results
        "search/:m/:w/:nearMe/:ageMin/:ageMax": "search",
        
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
           
      // search
      // -----------------------------------------------------------------------
      search: function(m, w, nearMe, ageMin, ageMax) {
        if(!appReady) {
          router.navigate('', {trigger: true});
          return;
        }
        console.log('> routing search page');
        
        // fetch options - if null then load user defaults
        if(ageMin > 0) {
          usersCollection.fetch({
            data: {
              'm': m,
              'w': w,
              'nearMe': nearMe,
              'ageMin': ageMin,
              'ageMax': ageMax,
              '_id': user.get('_id'),
              'fTkn': user.get('fTkn')
            }
          });
        } else {
          usersCollection.fetch({
            data: {
              'm': user.get('so').m,
              'w': user.get('so').w,
              'nearMe': user.get('so').nearMe,
              'ageMin': user.get('so').ageMin,
              'ageMax': user.get('so').ageMax,
              '_id': user.get('_id'),
              'fTkn': user.get('fTkn')
            }
          });
        }
        searchView.render();
        $('#content > div').detach();
        $('#content').append(searchView.el);
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
        
        users.set({ '_id': id }, {silent: true});
        users.fetch({
          success: function() {
            usersFullView.render();
            $('#content > div').detach();
            $('#content').append(usersFullView.el);
          }
        });
      }
      
    }); 
    var router = new Router;
    Backbone.history.start({

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
      if(!!store.get("user") && store.get("user").hasOwnProperty('fTkn')) {
        welcomeView.facebookAuth();
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
        user.set(store.get("user"));

        if (user.get('_id')) {
          console.log('- found user in local storage');
          
          // TODO sync data from API
          
          user.set({ 'fTkn': fTkn });
          store.set("user", user);
          
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
                  store.set("user", user);
  
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
            store.set("user", user);
    
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
    //TODO delete this (verify deletion)
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
                    store.set("user", user);
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
    
    
    // #########################################################################
    // #########################################################################
    // # Socket.io
    // #########################################################################
    // #########################################################################

    var socket = io.connect(socketIoHost);
    
    // Connected
    // -------------------------------------------------------------------------
    socket.on('connected', function (data) {
      console.log('- SOCKET.IO status: ' + data.status);
    });
    
    // Receive online users
    // -------------------------------------------------------------------------
    socket.on('onlineUsers', function (msg) {
      onlineUsers.set({ count: msg.count });
    });
  }
});