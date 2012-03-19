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

    // Story - Single story @ Mosaic
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
      tagName: 'article',
      className: 'item',
      events: {
        'click':'maximizeStory'
      },

      maximizeStory: function (e) {
        mosaicRouter.navigate("story/" + this.model.get('id'), {trigger: true});
      },

      render: function () {
        var template = $('#tplStories').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
      }
    });


    // StoriesListView - contains a list of StoryView items, to show the stories in the main mosaic page
    var StoriesListView = Backbone.View.extend({
      tagName: 'section',
      id: 'container',
      initialize: function () {
        this.collection.bind('reset', this.render, this);
      },

      renderItem: function (model) {
        var storyView = new StoryView({
          model: model
        });
        storyView.render();
        $("#container").append(storyView.el);
      },

      renderStoryBox: function () {
        var template = $('#tplSubmitStory').html();
        $(this.el).html(template);
      },

      render: function () {
        console.log('  ~ rendering welcome view');
        currentLocation = window.location + "";
        this.renderStoryBox();
        if (!currentLocation.match(/\#story\//)) {
          closeFullView();
          this.collection.each(this.renderItem);
        } else {
          this.collection.each(this.renderItem);
        }
      }
    });

    // StoryFullView - Single story view
    var StoryFullView = Backbone.View.extend({
      tagName: 'section',
      className: 'item',
      id: 'articleFullView',
      events: {
        'click': 'hideStory'
      },
      initialize: function () {
        this.model.bind('change', this.render, this);
      },

      hideStory: function (e) {
        mosaicRouter.navigate("", {trigger: true});
      },

      render: function () {
        if ($("#container").html() == "") {
          storiesCollection.fetch();
          $("#container").append(storiesListView.el)
        }
        $("#curtain").fadeIn();
        var template = $("#tplFullStory").html();
        $("#articleFullView").html(Mustache.to_html(template, this.model.toJSON()));
        $("#articleFullView").fadeIn(300);
      }
    });


    var story = new Story();
    var storiesCollection = new StoriesCollection({
      model: story
    });

    var storiesListView = new StoriesListView({
      collection: storiesCollection
    });


    // =====================================================================
    // =====================================================================
    // = Routes
    // =====================================================================
    // =====================================================================

    var MosaicRouter = Backbone.Router.extend({

      routes: {
        // Mosaic index
        "": "index",

        // A single story
        "story/:id": "fullStory"
      },

      index: function() {
        console.log('> routing welcome page');
        storiesCollection.fetch();
        $('body').append(storiesListView.el)
        //storiesListView.render();
      },

      fullStory: function(id) {
        console.log('> routing view story page');
        story.fetch({ data: { id: id } });
        var storyFullView = new StoryFullView({
          model: story
        });
        $('body').append(storyFullView.el);
        storyFullView.delegateEvents();
      }

    });
    var mosaicRouter = new MosaicRouter;
    Backbone.history.start({
      root: "/"
    });

	// initialise the rich text-area
	// $('.rte-zone').rte();

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