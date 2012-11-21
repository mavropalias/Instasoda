// =========================================================================
// WelcomeView
// =========================================================================
var WelcomeView = Backbone.View.extend({
  // settings
  //id: 'welcome',
  
  // events
  // -----------------------------------------------------------------------
  events: {
    'click #fb-auth': 'facebookAuth',
    'click .instantProfiles': 'featureInstantProfiles'
  },
  
  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplWelcome").innerHTML;
  },
  
  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering WelcomeView');
    this.html = this.template;
  },
  
  // show
  // -----------------------------------------------------------------------
  show: function() {
    log('showing WelcomeView');
    this.$el.html(this.html);
  },

  // enter
  // ---------------------------------------------------------------------------
  enter: function() {
    log('entering WelcomeView');
  },

  // leave
  // ---------------------------------------------------------------------------
  leave: function(cb) {
    log('leaving WelcomeView');
    cb();
  },

  // refresh
  // ---------------------------------------------------------------------------
  refresh: function() {
    log('refreshing WelcomeView');

    var _this = this;

    this.leave(function() {
      _this.render();
      _this.show();
      _this.enter();
    });
  },

  // featureInstantProfiles
  // -----------------------------------------------------------------------
  featureInstantProfiles: function() {
    var _this = this;
    
    var frameRate = 50;
    var cssTransitionDelay = 400;
    var counter = 0;
    var boxSize = 80;
    var winWidth = $(window).width();
    var winHeight = $(window).height();
    var boxColumns = 0;
    var boxRows = 0;
    
    winWidth = $(window).width();
    winHeight = $(window).height() - $('body > nav').height();
  
    boxColumns = (Math.round(winWidth / boxSize))+1;
    boxRows = (Math.round(winHeight / boxSize))+1;
    
    _this.$('.faces').width(winWidth);
    _this.$('.faces').height(winHeight);
    
    addBoxes(boxColumns,boxRows);
    
    function addBoxes(cols,rows) {
      var faceDelay = 100;
      var delayToPlayAnimation = 0;
      
      _this.$('.faces').empty();
      for(n = 0; n < rows; n++){
        _this.$('.faces').append("<div id='row" + n + "' class='row'>");
        _this.$('#row'+n).css("top",(n * boxSize + 70)+"px");
        
        for(m = 0; m < cols; m++) {
          (function() {
            _this.$('#row'+n).append("<div id='box" + n + "-" + m + "' class='box animated transparent row" + n + " col" + m + "'></div>");
            var object = _this.$('#box' + n + "-" + m);
            object.css("left",(m*boxSize)+"px");
            
            //load random image
            var rnd = Math.floor(Math.random() * (12) + 1);
            if( ( rnd * faceDelay ) > delayToPlayAnimation ) delayToPlayAnimation = rnd * faceDelay;
            object.css("background-image",'url(faces/'+(rnd)+'.png)').delay(rnd * faceDelay).queue(function() {
              $(this).removeClass('transparent');
            });
          })();
        }
        _this.$('.faces').append("</div>")
      }
      
      // set row width
      _this.$('.row').css('width',(boxSize * boxColumns)+'px');
      
      // do face animations + effects
      setTimeout(function() {
        playAnimation(cols, rows);
      }, delayToPlayAnimation);
      
      // draw the heart
      setTimeout(function() {
        drawHeart(cols, rows);
      }, (delayToPlayAnimation + ((boxColumns) * frameRate)));
    }
    
    function playAnimation() {
      if(counter < boxColumns) {
        var internalCounter = counter;
        _this.$('.col' + counter).css('opacity', '0');
        
        // repeat animation
        setTimeout(playAnimation, frameRate);
        
        // restore opacity after (cssTransitionDelay + (counter * internalCounter))
        setTimeout(function() {
          _this.$('.col' + (internalCounter - 1)).css('opacity', '1');
        }, (cssTransitionDelay + (counter * internalCounter)));
        
        // increase counter
        counter++;
      }
    }
    
    function drawHeart(cols, rows) {
      var startCol = Math.round (cols / 2) - 5;
      var startRow = Math.round (rows / 2) - 4;
      var heart = [[0,1,1,0,1,1,0],
                   [1,1,1,1,1,1,1],
                   [1,1,1,1,1,1,1],
                   [0,1,1,1,1,1,0],
                   [0,0,1,1,1,0,0],
                   [0,0,0,1,0,0,0]];
      
      // draw heart boxes
      for(n = 0; n < heart.length; n++){            
        for(m = 0; m < heart[0].length; m++) {
          // draw a heart box only if the array value is 1
          if(heart[n][m] === 1) {
            (function() {
              var posX = (boxSize * (startCol + m)) + 'px';
              var posY = (boxSize * (startRow + n)) + 'px';
              
              $("<div class='box heartBox animated' style='left:" + posX + "; top: " + posY + ";'></div>").appendTo(_this.$('.faces')).animate({ opacity: '0.95' }, cssTransitionDelay);
            })();
          }
        }
      }
    }
  },
  
  // facebookAuth
  // -----------------------------------------------------------------------
  facebookAuth: function() {
    IS.prepareApp(true, function(err) {
      if(err) {
        alert(err);
      } else {
        router.welcome();
      }
    });
  }
});