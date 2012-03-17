$(document).ready(function(){

    // ===================================================
    // ===================================================
    // = Settings
    // ===================================================
    // ===================================================

    var sApi = "http://instasoda.com/api/";
    var sApiMosaic = "http://instasoda.com/api/mosaic/";
    jQuery.support.cors = true;
    Backbone.emulateHTTP = true;

    // ===================================================
    // ===================================================
    // = Models
    // ===================================================
    // ===================================================

    // Story - Individual story @ Mosaic
    var Story = Backbone.Model.extend({
      url: sApiMosaic + 'story.php'
    });

    // ===================================================
    // ===================================================
    // = Collections
    // ===================================================
    // ===================================================

    // UsersCollection - a collection of Users
    var StoriesCollection = Backbone.Collection.extend({
      url: sApiMosaic + 'stories.php'
    });

    // ===================================================
    // ===================================================
    // = Views
    // ===================================================
    // ===================================================

    // StoryView - a basic view of a story appearing in the mosaic
    var StoryView = Backbone.View.extend({
      events: {
        'click .item': 'viewStory'
      },

      viewStory: function (e) {
        var storyFullView = new StoryFullView({
          model: this.model,
          el: $('#articleFullView')[0]
        });
        storyFullView.render();
      },

      render: function () {
        var template = $('#tplStories').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
      }
    });


    // StoriesListView - contains a list of StoryView items, to show the stories in the main mosaic page
    var StoriesListView = Backbone.View.extend({
      initialize: function () {
        _.bindAll(this);
        this.collection.bind('reset', this.render);
      },

      renderItem: function (model) {
        var storyView = new StoryView({ model: model });
        storyView.render();
        $(this.el).append(storyView.el);
      },

      render: function () {
        this.collection.each(this.renderItem);
      }
    });

    var StoryFullView = Backbone.View.extend({
      initialize: function () {
        _.bindAll(this);
        this.model.bind('change', this.render);
      },

      events: {
        'click #articleFullView, #curtain': 'hideStory'
      },

      hideStory: function (e) {
        closeFullView();
      },

      render: function () {
        // update template
        $('#curtain').fadeIn();
        var template = $('#tplFullStory').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        $('#articleFullView').fadeIn(300);
      }
    });

    var story = new Story();
    var storiesCollection = new StoriesCollection({
      model: story
    });

    var storiesListView = new StoriesListView({
      collection: storiesCollection,
      el: $('#container')
    });

    var storyFullView = new StoryFullView({
      model: story,
      el: $('#articleFullView')
    });

    // Fetch all Mosaic Stories
    storiesCollection.fetch();

	// initialise the rich text-area
	$('.rte-zone').rte();

	function closeFullView(){
		$('#articleFullView, #curtain').fadeOut(300);
	}

	// submit story
	$('#storySubmit').on('click', function(){
    $.ajax({
      type: 'POST',
      url: "lib/submitStory.php",
      data: {
      	"story": $('iframe#storyContent').contents().find('.frameBody').html(),
      	"nickname": $('.storyNickname').val()
    	},
      dataType: "json",
      success: function(data) {
       if(data.status == "alright"){
         //success
         alert("success");
       } else {
         //fail
         alert("fail");
       }
      }
    });
	});
});