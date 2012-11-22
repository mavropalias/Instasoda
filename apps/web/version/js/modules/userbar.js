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
    console.log('  ~ toggling chat window');
    this.$('#chat').toggle(0, function() {
      if($(this).is(':visible')) {
        $('#chat-button').addClass('active');
        $('body').addClass('chat-is-visible');
      }
      else {
        $('#chat-button').removeClass('active');
        $('body').removeClass('chat-is-visible');
      }
    });
  },
  
  // showChatWindow
  // -----------------------------------------------------------------------
  showChatWindow: function() {
    console.log('  ~ showing chat window');
    this.$('#chat').show();
    this.$('#chat-button').addClass('active');
    $('body').addClass('chat-is-visible');
  }
});