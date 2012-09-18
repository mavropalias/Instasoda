// =========================================================================
// MetabarView
// =========================================================================

var MetabarView = Backbone.View.extend({      
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #chatTab': 'toggleChatWindow'
  },
  
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
  	console.log('  ~ initializing MetabarView');

    _.bindAll(this);
    
    // initialize sub views
    this.chatSessionTabs = new ChatSessionTabs({ collection: chatSessions });
    
    //this.model.bind('change', this.render);
    this.render();
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    console.log('  ~ rendering MetabarView');
    
    var _this = this;
    var template = $('#tplMetabar').html();
    
    this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    
    // render sub-views
    this.chatSessionTabs.setElement(_this.$('.chatSessions')).render();
  },
  
  // toggleChatWindow
  // -----------------------------------------------------------------------
  toggleChatWindow: function() {
    console.log('  ~ toggling chat window');
    this.$('#chat').toggle(0, function() {
      //if($(this).is(':visible')) $('#chatTab').addClass('active');
      //else $('#chatTab').removeClass('active');
    });
  },
  
  // showChatWindow
  // -----------------------------------------------------------------------
  showChatWindow: function() {
    console.log('  ~ showing chat window');
    this.$('#chat').show();
    //this.$('#chatTab').addClass('active');
  }
});