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
  render: function() {
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
    if(IS.nullOrEmpty(model.get('u'))) {
      var otherPersonsId = model.get('uA') == user.get('_id') ? model.get('uB') : model.get('uA');
      
      // now find the other person's username, using his id
      if(!IS.nullOrEmpty(otherPersonsId)) {
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
      } // else do nothing
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

    // show chat session and focus on the text input field
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
      uid: user.get('_id'),
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