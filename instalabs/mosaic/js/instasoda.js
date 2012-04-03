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
        'click':'maximizeStory',
        'mouseenter': 'mouseoverstory',
        'mouseleave' : 'mouseleavestory'
      },

      mouseoverstory: function(e) {
        var _storyID = this.model.get('id');
        var _storyOffset = this.$el.offset();
        _currentStoryElement = "#" + _storyID + 'tooltip';
        _currentStoryElementSection = _currentStoryElement + '> section';

        if ( $(_currentStoryElement).is('.loadedComment') ) {
          $(_currentStoryElement).css({left:_storyOffset.left - 5},{top:_storyOffset.top}).slideDown(300).addClass('loadedComment');
        } else {
          _tooltipLoader = this.$el.find('img');
          _tooltipLoader.delay(500).fadeIn(500);
          tooltipFetchInfo = setTimeout(function() {
            _DISQUS(_storyID, function(data) {
              $(_currentStoryElement).css({left:_storyOffset.left - 5},{top:_storyOffset.top}).slideDown(300).addClass('loadedComment');

              console.log(data);
              $.each(data, function() {
                var $i = 0;
                $.each(this, function(k, v) {
                  $(_currentStoryElementSection).append(data.response[$i].author.name + ' said: ' + data.response[$i].message);
                  $i++;
                });
              });

              //$(_currentStoryElementSection).append(data.response[0].author.name);
              _tooltipLoader.hide();
            });
          }, 2000);
        }
      },

      mouseleavestory: function(e) {
        clearTimeout(tooltipFetchInfo);
        _tooltipLoader.hide();
        setTimeout(function() {
          $('.commentTooltip').fadeOut(300);
        }, 1500);
      },

      maximizeStory: function (e) {
        console.log('> Navigate to the [Full story]');
        mosaicRouter.navigate("!/story/" + this.model.get('id'), {trigger: true, replace: false});
      },

      renderComments: function(model) {
        _DISQUScomments(model.get('id'), function(data) {
          model.set({comments: data});
          $('footer > #' + model.get('id'))
            .text(data)
            .css({opacity:1});
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
        storyView.renderComments(model);
        storyView.render();
        $("#container").append(storyView.el);
      },

      renderNewStory: function (model) {
        var storyView = new StoryView({ model: model });
        storyView.render();
        $(".storyForm").after(storyView.el);
      },

      renderStoryForm: function () {
        console.log('   ~ Rendering new story [Form] view');
        var template = $('#tplSubmitStory').html();
        this.$el.html(template);
      },

      save: function() {
        console.log('  ~ Preparing new story');
        var story = new Story();
        var storyText = $('textarea[name=storytext]').val();
        var storyTitle = $('input[name=storytitle]').val();

        story.save(
        {
          'author':'Konstantinos',
          'content':storyText,
          'title':storyTitle
        },
        {
          success: function(model, response) {
            $('textarea[name=storytext], input[name=storytitle]').val('');
            console.log('   ~~~ SUCCESS: Added a new story to database!');
            storiesCollection.add(story);
            console.log('  > Navigate to the new [Full story]');
            mosaicRouter.navigate("!/story/" + story.id, {trigger: true, replace: true});
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
        _.bindAll(this);
        this.model.bind('change', this.render);
        this.model.bind("add", this.render);
      },

      save: function() {
        console.log('  ~ Preparing to add a new [Comment] to the story with ID: ' + story.id);
        var comment = new Comment();
        //commentText = $('textarea[name=commenttext]').val();
        //commentAuthor = story.get('author');

        comment.save(
        {
          'postId':story.id,
          'author':'someone',
          'content':'something'
        },
        {
          success: function (model, response){
            //$('textarea[name=commenttext]').val('');
            console.log('   ~~~ SUCCESS: Added the new [Comment] to database');
            //processComment();
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
          storiesCollection.fetch();
          $('body').append(storiesListView.el);
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

  function _DISQUSappend(id) {
    var disqus_identifier = id;
    var disqus_url = _disqus_url + _disqus_story + id;
    console.log(' /// ' + disqus_url + ' /// ' + disqus_shortname);
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
  }

  function _DISQUScomments(id, cb) {
    // Get a story's comments
    $.ajax({
      url: 'https://disqus.com/api/3.0/threads/list.json',
      data: {
          'api_key': papi_key,
          'forum': disqus_shortname,
          'thread': 'link:' + _disqus_url + _disqus_story + id
      },
      success: function(data) {
        cb(data.response[0].posts);
      }
    });
  }

  function _DISQUS(id,cb) {
    //Get all comments
    var _storyID = id;
    $.ajax({
      url: 'https://disqus.com/api/3.0/threads/list.json',
      data: {
          'api_key': papi_key,
          'forum': disqus_shortname,
          'thread': 'link:' + _disqus_url + _disqus_story + _storyID
      },
      success: function(data) {
        var _threadID = data.response[0].id;
        $.ajax({
          url: 'https://disqus.com/api/3.0/threads/listPosts.json',
          data: {
              'api_key': papi_key,
              'thread': _threadID
          },
          success: function(data) {
            cb(data);
            console.log(data);
          }
        });

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
