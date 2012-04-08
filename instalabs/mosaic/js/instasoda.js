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

  // DISQUS settings
  disqus_developer = 1;
  var papi_key = 'gFHfw6LElOAHK7e862NuDxdQl3shnEpcJB1BprqwiBf75n41BbdUtFtV8c5GW94S',
      sapi_key = 'qFNSRuuzMCwIkcSjW8OlKX3hRAOflg86WvoVYbmohyQnFGhMoRfz2Tv52xEKWYBZ',
      _disqus_url = "http://localhost/Instasoda/instalabs/mosaic/",
      _disqus_story = "#!/story/",
      disqus_shortname = 'mosaicdev';



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
      console.log('> Navigate to the [Full story]');
      mosaicRouter.navigate("!/story/" + this.model.get('id'), {trigger: true, replace: false});
    },

    renderStoryWidgets: function(model) {
      $.each(_DISQUSarr, function(){
        var myModelId = model.get('id');
        if (this.title == _disqus_url + _disqus_story + myModelId) {
          model.set({comments: this.posts});
          return false;
        } else {
          model.set({comments: 0});
        }
      });
    },

    render: function () {
      console.log('   ~ Rendering [Model] view with ID: ' + this.model.id);
      var template = $('#tplStories').html();
      this.$el.html(Mustache.to_html(template, this.model.toJSON()));
    }
  });

  //  StoriesListView:
  //  Contains a list of StoryView items, to show the stories in the main mosaic page
  var StoriesListView = Backbone.View.extend({
    tagName: 'section',
    id: 'container',
    initialize: function (model) {
      appReady = true;
      _.bindAll(this);
      this.collection.bind("reset", this.render);
      this.collection.bind("add", this.renderNewStory);
    },

    events: {
      'click .button':'save'
    },

    renderStory: function (model) {
      var storyView = new StoryView({ model: model });
      storyView.renderStoryWidgets(model);
      storyView.render();
      $("#container").append(storyView.el);
    },

    renderNewStory: function (model) {
      var storyView = new StoryView({ model: model });
      storyView.renderStoryWidgets(model);
      storyView.render();
      $("#formWrapper").after(storyView.el);
    },

    renderStoryForm: function () {
      console.log('   ~ Rendering new story [Form] view');
      var template = $('#tplSubmitStory').html();
      this.$el.html(template);
    },

    save: function() {
      console.log('  ~ Preparing new story');
      $('.storyForm .submitLoader').fadeIn(300);
      var story = new Story(),
          storyText = processStoryText($('textarea[name=storytext]').val()),
          storyTitle = $('input[name=storytitle]').val();
      $(".storyForm").addClass('sendingStory');
      $(".storyForm > button").text('sending story...')


      story.save(
      {
        'author':'Konstantinos',
        'content':storyText,
        'title':storyTitle
      },
      {
        success: function(model, response) {
          $('.storyForm .submitLoader').fadeOut(300);
          $('textarea[name=storytext], input[name=storytitle]').val('');
          console.log('   ~~~ SUCCESS: Added a new story to database!');
          storiesCollection.add(story);
          $(".storyForm > button").text('submit your story');
          $(".storyForm").removeClass('sendingStory');
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
    },

    initialize: function () {
      _.bindAll(this);
      this.model.bind('change', this.render);
      this.model.bind("add", this.render);
    },

    hideStory: function (e) {
      $('#articleFullView').detach();
      $("body").css({'overflow':'auto'});
      mosaicRouter.navigate("/");
    },

    render: function () {
      console.log('  ~ Rendering [Full story] view');
      var template = $("#tplFullStory").html();
      this.$el.html(Mustache.to_html(template, this.model.toJSON()));
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
      "!/story/:id": "fullStory"
    },

    initialize: function(){
      appReady = false;
    },

    index: function() {
      console.log('> Routing [Index] page');
      if (appReady == false) {
        // Calling the DISQUS API to get a an array of objects/stories
        _DISQUS_get_comments(function(data) {
          _DISQUSarr = data.response;
          storiesCollection.fetch();
          $('#wrapper').append(storiesListView.el);
        });
      }
    },

    fullStory: function(id) {
      console.log('> Routing [Full story] page');
      // Avoid empty collection *view* when hotlinking to a single story by
      // checking if the collection contains only 1 model. If it is, fetch
      // the collection and render the main view.
      if (storiesCollection.length == 1) {
        storiesCollection.fetch();
        $("body").append(storiesListView.el);
      }

      story.fetch({
        data: { id: id },
        success: function() {
          $("body").append(storyFullView.el);
          $("#articleFullView").show();
          $("body").css({'overflow':'hidden'});
          _DISQUSappend(story.get('id'));
        }
      });
    }

  });
  var mosaicRouter = new MosaicRouter;
  Backbone.history.start({
    root: "/"
  });

  // Function to process the story text
  // (convert new lines to <br /> and " - " to n dashes. More to come for good typography)
  function processStoryText(text) {
    return text.replace(/[\n|\r\n]/g,"<br />").replace(' - '," &ndash; ");
  }

  // Function to append the DISQUS comments to the full story
  function _DISQUSappend(id) {
    var disqus_identifier = id;
    var disqus_url = _disqus_url + _disqus_story + id;
    console.log(' /// ' + disqus_url + ' /// ' + disqus_shortname);
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
  }

  // Use the DISQUS API to get the comment count per story ~> collection view
  function _DISQUS_get_comments(cb) {
    // Get a story's comments
    $.ajax({
      url: 'https://disqus.com/api/3.0/threads/list.json',
      data: {
          'api_key': papi_key,
          'forum': disqus_shortname
      },
      success: function(data) {
        console.log(data);
        cb(data);
      }
    });
  }

  /*
  disqus_config = function() {
    this.callbacks.onNewComment.push(function() { storyFullView.save(); });
    Available callbacks are afterRender, onInit, onNewComment, onPaginate, onReady, preData, preInit, preReset
  }
  */


});
