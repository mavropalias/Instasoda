// =========================================================================
// Userbar view
// =========================================================================
var UserbarView = Backbone.View.extend({
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplUserbar").innerHTML;

    // initialize sub views
    this.chatSessionTabs = new ChatSessionTabs({
      collection: chatSessions,
      model: user
    });

    // refresh when user logs in/out
    this.model.bind('change:_id', this.refresh);

    // render
    this.render();
  },

  // events
  // -----------------------------------------------------------------------
  events: {
    'click #chat-button': 'toggleChatWindow'
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering UserbarView');
    this.html = Mustache.to_html(this.template, this.model.toJSON());
  },

  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing UserbarView');
    this.$el.html(this.html);

    // render & show sub-views
    this.chatSessionTabs.setElement(this.$('#chat'));
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering UserbarView');
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving UserbarView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing UserbarView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  },

  // toggleChatWindow
  // -----------------------------------------------------------------------
  toggleChatWindow: function() {
    console.log('  ~ toggling chat panel');

    var chat = this.$('#chat');
    chat.toggleClass('expanded');

    if(chat.hasClass('expanded')) {
      this.$('#chat-button').addClass('active');
      $('body').addClass('chat-is-visible');
      this.$('.chat-sessions-container').show();
    }
    else {
      this.$('#chat-button').removeClass('active');
      $('body').removeClass('chat-is-visible');
      this.$('.chat-sessions-container').hide();
    }

    // update custom scrollbars + dimensions 1
    $('#chat .slimScrollDiv, #chat .chat-tabs').css({
      'width': '50rem'
    });

    // update custom scrollbars + dimensions 2
    setTimeout(function() {
      $('#chat .slimScrollDiv, #chat .chat-tabs').css({
        'height': $(window).height() - $('#chat-button').outerHeight() - $('.chat-session:visible').outerHeight() + 'px',
        'width': $('#chat-button').outerWidth()
      });
    }, 510);
  },

  // showChatWindow
  // -----------------------------------------------------------------------
  showChatWindow: function() {
    console.log('  ~ showing chat window');
    this.$('#chat').addClass('expanded');
    this.$('#chat-button').addClass('active');
    this.$('.chat-sessions-container').show();
    $('body').addClass('chat-is-visible');

    // update custom scrollbars + dimensions 1
    $('#chat .slimScrollDiv, #chat .chat-tabs').css({
      'width': '50rem'
    });

    // update custom scrollbars + dimensions 2
    setTimeout(function() {
      $('#chat .slimScrollDiv, #chat .chat-tabs').css({
        'height': $(window).height() - $('#chat-button').outerHeight() - $('.chat-session:visible').outerHeight() + 'px',
        'width': $('#chat-button').outerWidth()
      });
    }, 510);
  }
});