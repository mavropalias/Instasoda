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

    // Comment - Single story comment @ Mosaic
    var Comment = Backbone.Model.extend({
      url: sApiMosaic + 'comment.php'
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

    //  StoryView:
    //  A basic view of a story appearing in the mosaic
    var StoryView = Backbone.View.extend({
      tagName: 'article',
      className: 'item',
      events: {
        'click':'maximizeStory'
      },

      maximizeStory: function (e) {
        console.log('  > Navigate to the [Full story]');
        mosaicRouter.navigate("story/" + this.model.get('id'), {trigger: true});
      },

      render: function () {
        var template = $('#tplStories').html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        console.log('  ~ Rendering [Model] view with ID: ' + this.model.id);
      }
    });

    //  StoriesListView:
    //  Contains a list of StoryView items, to show the stories in the main mosaic page
    var StoriesListView = Backbone.View.extend({
      tagName: 'section',
      id: 'container',
      initialize: function (model) {
        appReady = true;
        this.collection.bind('reset', this.render, this);
        this.collection.bind('add', this.renderNewStory, this);
      },

      events: {
        'click .button':'save'
      },

      renderStory: function (model) {
        var storyView = new StoryView({
          model: model
        });
        storyView.render();
        $("#container").append(storyView.el);
      },

      renderNewStory: function (model) {
        var storyView = new StoryView({
          model: model
        });
        storyView.render();
        $(".storyForm").after(storyView.el);
      },

      renderStoryForm: function () {
        var template = $('#tplSubmitStory').html();
        $(this.el).html(template);
        console.log('  ~ Rendering new story [Form] view');
      },

      save: function() {
        console.log('  ~ Preparing new story');
        var story = new Story();
        var storyText = $('textarea[name=storytext]').val();

        story.save(
        {
          'author':'Konstantinos',
          'content':storyText,
          'title':'This is a story title',
        },
        {
          success: function(model, response) {
            $('textarea[name=storytext]').val('');
            console.log('   ~~~ SUCCESS: Added a new story to database!');
            storiesCollection.add(story);
            console.log('  > Navigate to the new [Full story]');
            mosaicRouter.navigate("story/" + story.id, {trigger: true});
          },
          error: function (model, response) {
            console.log('   !!! ERROR: Could not add the new story to database!');
          }
        });

      },

      render: function () {
        console.log('  ~ Rendering [C]ollection view');
        this.renderStoryForm();
        this.collection.each(this.renderStory);
      }
    });

    //  StoryFullView:
    //  Single story view
    var StoryFullView = Backbone.View.extend({
      tagName: 'section',
      className: 'item',
      id: 'articleFullView',
      events: {
        'click #articleFullView > #curtain, .closeStory': 'hideStory',
        'click .commentSubmit':'save'
      },

      initialize: function () {
        this.model.bind('change', this.render, this);
        this.model.bind("add", this.render, this);
      },

      save: function() {
        var comment = new Comment();
        commentText = $('textarea[name=commenttext]').val();
        commentAuthor = story.get('author');
        console.log('  ~ Preparing to add a new [Comment] to the story with ID: ' + story.id);

        comment.save(
        {
          'postId':story.id,
          'author':commentAuthor,
          'content':commentText
        },
        {
          success: function (model, response){
            console.log('   ~~~ SUCCESS: Added the new [Comment] to database');
            processComment();
          },
          error: function (model, response) {
            console.log('   !!! ERROR: Could not add [Comment] to database');
          }
        });
      },

      hideStory: function (e) {
        $('#articleFullView').detach();
        $("body").css({'overflow':'auto'});
        mosaicRouter.navigate("/");
      },

      render: function () {
        var template = $("#tplFullStory").html();
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        console.log('  ~ Rendering [Full story] view')
      }
    });


    // =====================================================================
    // =====================================================================
    // = Instantiate Models, Collections and Views
    // =====================================================================
    // =====================================================================

    var story = new Story();
    var storiesCollection = new StoriesCollection({
      model: story
    });

    var storiesListView = new StoriesListView({
      collection: storiesCollection
    });

    var storyFullView = new StoryFullView({
      model: story
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
        "/": "index",

        // Mosaic Full story
        "story/:id": "fullStory"
      },

      initialize: function(){
        appReady = false;
      },

      index: function() {
        console.log('> Routing [Index] page');
        if (appReady == false) {
          storiesCollection.fetch();
          $('body').append(storiesListView.el)
        }
      },

      fullStory: function(id) {
        console.log('> Routing [Full story] page');
        // Avoid empty collection *view* when hotlinking to a single story by
        // checking if the collection contains only 1 model. If it is, fetch
        // the collection and render the main view.
        if (storiesCollection.length == 1) {
          storiesCollection.fetch();
          $("body").append(storiesListView.el)
        }

        story.fetch({
          data: { id: id },
          success: function() {
            $('body').append(storyFullView.el);
            $("#articleFullView").show();
          }
        });
        console.log('Append and show');
        $("body").css({'overflow':'hidden'});
      }

    });
    var mosaicRouter = new MosaicRouter;
    Backbone.history.start({
      root: "/"
    });

	// initialise the rich text-area
	// $('.rte-zone').rte();




  function processComment() {
    if ( $(".noComments").length > 0 ) {
      $(".noComments").slideUp(300, function () {
        appendNewCommentToFullStoryView();
      });
    } else {
      appendNewCommentToFullStoryView();
    }
  }

  function appendNewCommentToFullStoryView() {
    $("#comments").prepend('<p class="newComment"><img src="img/anon.png" style="float: left;" /><span><strong>' + commentAuthor + '</strong><br>' + commentText + '</span></p>');
    $("#comments > p:first-child").fadeOut(0, function() {
      $(this).slideDown(300);
    })
  }

});
