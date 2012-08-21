// =========================================================================
// SidebarView
// =========================================================================

var SidebarView = Backbone.View.extend({      
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #chatTab': 'render'
  },
  
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
  	console.log('  ~ initializing SidebarView');

    _.bindAll(this);
    
    // initialize sub views
    this.chatSessionTabs = new ChatSessionTabs({ collection: chatSessions });
    //this.chatSessionsView = new ChatSessionsView({ collection: chatSessions });
    
    //this.model.bind('change', this.render);
    this.render();
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering SidebarView');
    
    var _this = this;
    var template = $('#tplSidebar').html();
    
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // render sub-views
    _this.chatSessionTabs.setElement(_this.$('#chat')).render();


    // enable custom scrollbars
    this.$('.chatSessions').slimScroll({
      height: '300px',
      allowPageScroll: false,
      alwaysVisible: false,
      railVisible: true,
      position: 'left',
      start: 'bottom'
    });
  },
  
  // toggleSidebar
  // -----------------------------------------------------------------------
  toggleSidebar: function() {
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