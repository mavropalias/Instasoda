// =========================================================================
// ChatSessionTabs
// =========================================================================
var ChatSessionTabs = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    console.log('  ~ initializing ChatSessionTabs');
    _.bindAll(this);

    this.collection.bind('add', this.renderSessionTab);
    this.collection.bind('remove', this.render);
    this.model.bind('change:tkn', this.render);

    // sub-views
    this.chatSessionsView = new ChatSessionsView({ collection: chatSessions });
  },

  // events
  // -----------------------------------------------------------------------
  events: {
    'click .chat-tab': 'chatSessionsTabClick'
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering ChatSessionTabs (tabs)');

    var _this = this;

    // fetch chat sessions
    chatSessions.reset();
    chatSessions.fetch({
      data: {
        'id': user.get('_id'),
        'fTkn': user.get('fTkn')
      },
      success: function(model, response) {
        //_this.chatSessionsView.setElement(_this.$('.chatSessionContainer')).render();
        _this.$('.chat-tabs').html('');
        _this.collection.each(_this.renderSessionTab);

        // render sub-views
        _this.chatSessionsView.setElement(_this.$('.chat-sessions-container')).render();

        // enable custom scrollbars
        this.$('.chat-tabs').slimScroll({
          height: $(window).height() - $('#chat-button').outerHeight() + 'px',
          allowPageScroll: false,
          alwaysVisible: false,
          railVisible: true,
          position: 'right',
          start: 'top',
          width: $('#user-bar').outerWidth()
        });
      }
    });
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
      var otherPersonsId = (model.get('uA') == user.get('_id')) ? model.get('uB') : model.get('uA');

      // now find the other person's username, using his id
      if(!IS.nullOrEmpty(otherPersonsId)) {
        console.log(' - (chat) looking up username for id #' + otherPersonsId);
        socket.emit('getBasicUserInfoFromId', {
          userId: otherPersonsId
        }, function(err, user) {
          if(!err) {
            model.set({
              u: user.u,
              ag: user.ag,
              p: user.p
            })

            // render the template
            var template = $('#tplChatSessionsButtons').html();
            _this.$('.chat-tabs').append(Mustache.to_html(template, model.toJSON()));
          } else {
            console.log('!!! ERROR: renderSessionTab -> ' + err);
            //TODO: handle errors
          }
        });
      } // else do nothing
    } else {
      // render the template
      var template = $('#tplChatSessionsButtons').html();
      _this.$('.chat-tabs').append(Mustache.to_html(template, model.toJSON()));
    }
  },

  // chatSessionsTabClick
  // -----------------------------------------------------------------------
  chatSessionsTabClick: function(e) {
    var _this = this;
    var sSessionId = $(e.currentTarget).attr('id');
    var toHide = false;
    console.log('  - chatSessionsTabClick:' + sSessionId);

    this.collection.each(function(m) {
      if(m.get('_id') == sSessionId ) {
        if(m.get('active'))  {
          _this.hideChatSession(sSessionId);
          toHide = true;
        }
      }
    });

    if(!toHide) this.showChatSession(sSessionId);
  },

  // showChatSession
  // -----------------------------------------------------------------------
  showChatSession: function(sSessionId) {
    console.log('  - showChatSession (1): ' + sSessionId);

    // show chat window
    userbarView.showChatWindow();

    // apply 'active' style to the tab
    this.$('.chat-tab').removeClass('active');
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

    // update custom scrollbars
    $('#chat .slimScrollDiv, #chat .chat-tabs').css({
      'height': $(window).height() - $('#chat-button').outerHeight() - 300 + 'px',
      'width': $('#chat-button').outerWidth()
    });
  },

  // hideChatSession
  // -----------------------------------------------------------------------
  hideChatSession: function(sSessionId) {
    console.log('  - hideChatSession: ' + sSessionId);

    this.$('#' + sSessionId).removeClass('active');
    this.collection.each(function(m) {
      if(m.get('_id') == sSessionId ) {
        m.set({ active: false });
      }
    });

    // update custom scrollbars
    $('#chat .slimScrollDiv, #chat .chat-tabs').css({
      'height': $(window).height() - $('#chat-button').outerHeight() + 'px',
      'width': $('#chat-button').outerWidth()
    });
  },

  // initiateSessionWith
  // -----------------------------------------------------------------------
  initiateSessionWith: function(userId, username, age, photos) {
    var _this = this;

    userbarView.showChatWindow();

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
            {
              _id: sessionId,
              u: username,
              ag: age,
              p: photos,
              m: 0,
              active: true,
              log: result.log }
          ]);
        }

        _this.showChatSession(sessionId);
      } else {
        alert("Couldn't initiate chat session!");
      }
    });
  },

  // fetchChatSessionFromServerById
  // -----------------------------------------------------------------------
  fetchChatSessionFromServerById: function(sessionId) {
    console.log('  - fetchChatSessionFromServerById: ' + sessionId);

    var _this = this;

    // get session details
    socket.emit('getChatSessionById', {
      sId: sessionId
    }, function(err, result) {
      if(!err) {
        // add new chat session into the chatSessions collection
        _this.collection.add([
          { _id: result._id, u: result.log[0].u, m: result.log.length, active: false, log: result.log }
        ]);
      } else {
        // counld't get chat session
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
    this.collection.bind('change:active', this.showHideSession);
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

  // showHideSession
  // -----------------------------------------------------------------------
  showHideSession: function(model) {
    console.log('  - (chat) showHideSession ' + model.get('_id'));

    this.$('.chat-session').hide();

    if(model.get('active')) {
      // show chat session and focus on the text input field
      this.$('#session_' + model.get('_id')).show().find('.chat-input').focus();

      // convert timestamps to timeago
      this.$('.time').timeago();

      // enable custom scrollbars
      var scroller = this.$('#scroller_' + model.get('_id') + ' > .chat-log');
      scroller.slimScroll({
        height: '250px',
        allowPageScroll: false,
        alwaysVisible: false,
        railVisible: false,
        start: 'bottom'
      });
    }

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
    'submit form#send-sessage-form': 'sendMessage'
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
    oChatLog = $('.chat-log', this.el);

    // append the new msg into the dom
    var template = $('#tplChatLog').html();
    oChatLog.append(Mustache.to_html(template, sMsg));

    // convert timestamps to timeago
    $('.chat-log .time', this.el).timeago();

    // scroll to the bottom of the chat log
    oChatLog.scrollTop(oChatLog[0].scrollHeight);
  },

  // sendMessage
  // -----------------------------------------------------------------------
  sendMessage: function(e) {
    console.log('  - (chat) sendMessage');

    // return if msg is empty
    if(this.$('.chat-input').val() == "") return false;

    // construct message
    var date = new Date().toJSON();
    var sMsg = {
      u: user.get('u'),
      t: date,
      m: $('.chat-input', this.el).val()
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
    $('.chat-input', this.el).val('');

    // done - prevent default form action
    return false;
  }
});