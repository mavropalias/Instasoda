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
    'click #fb-login': 'facebookAuth'
  },

  // initialize
  // -----------------------------------------------------------------------
  initialize: function() {
    _.bindAll(this);

    // get template
    this.template = document.getElementById("tplWelcome").innerHTML;

    this.model = {};

    // interests for homepage
    this.model.interests =  [
      '103744106330864', // ricky gervais
      '108242515862622', // life of brian
      '122908054392375', // star trek
      '112601588751853', // soylent green
      '109706182389863', // brazil
      '19159654256', // massive attack
      '105499302815949', // carl sagan
      '231563943589594', // stargate atlantis
      '8366783839', // dylan moran
      '33127847632', // hitchhickers guide to the galaxy
      '5660597307', // pink floyd
      '104039112967388', // david hewlett
      '24712846969', // ferrari
      '112389535440648', // magic the gathering online
      '130577231135', // modern family
      '251138591567190', // bill bailey
      '152513780224', // arcade fire
      '26101560328', // depeche mode
      '139807436080442', // robots podcast
      '5956341397', // pink
      '107356652627192', // astronomy
      '105591692807941', // monty python's flying circus
      '160617097307237', // the hobbit
      '19440638720', // wired
      '23519525029', // sheldon cooper
      '35370633792', // mumford and sons
      '135027136641', // ellie goulding
      '256213217787402', // mass effect game
      '30899502664', // david bowie
      '270208243080697', // oculus VR
      '8759772983', // REM
      '20460316308', // yeah yeah yeahs
      '219481794848822', // robots on tour
      '93211205814', // marilyn manson
      '105638652803531', // fear and loathing in LA
      '5988735115', // kylie minogue
      '7807422276', // how i met your mother
      '6979332244', // radiohead
      '11711572282', // jimmy carr
      '110484305640505', // noam chomsky
      '78883723363', // monkey island game
      '105978536100775', // leonardo da vinci
      '22934684677', // big bang theory
      '12534674842', // albert einstein
      '157960270884061', // path of exile game
      '119450638088147', // inside job
      '20950654496', // the onion
      '159991337403488', // amelie
      '34490197275', // stitcher app
      '141181562619195', // space janitors
      '141884481557', // peter jackson
      '117533210756', // bob marley
      '6028461107', // moby
      '117631940358', // civilization V game
      '209420425824150', // logan's run
      '107613208517', // michael mcintyre
      '15155960214', // kaiser chiefs
      '109763962384131', // naomi klein
      '104184276284244', // exit through the gift shop
      '363846180362887', // cyberpunk game
      '120599328027856', // city of god
      '108250085865894', // metropolis
      '23373933029', // sean penn milk
      '7177913734', // reddit
      '386829811341324', // oliver stone
      '138363806221349', // prismatic
      '7301722641', // smashing pumpkins
      '10862798402', // science friday
      '107774172579107', // brian cox
      '119442141442476', // deus ex game
      '225579723426' // mitch hedberg
    ];

    // user photos for homepage
    this.model.users =  [
      'qjK0IPFm_wCbnen_HE3LgrtwPEI_ad4838f2a506a79f7b3b098492fb35fb', // christiana
      'o5Aa2AkbQakLx9sdbxgwGuapDU4_f072a7dbad2e0219e24511cde72140ba', // gina
      'l0vTpAU6tb2QCBLQpBwCb653PcA_9340ef4d343a2c63331a09b279a6cd6c', // mihalis
      '_rfLXV0o_Qjz2LMPV-ysnKYy-mc_7cf065e6504e2d7b5565b95dde4cf4c9', // dimitris
      '_400kohroR5WU1dw96KOK1_WsT4_19488bfb769679046ca97b0d912b3c7d', // nastasha
      'XIYcyZ3gegVZ3GMe42OHpN7Sy1o_58e89a5c348dce41584e1aeb65d160e4', // magda
      'PEIS3qvNRn0UktkyZG_oF8Fx-YM_0a542cf0b73f8d616e363935277093bf', // nicola
      'OcYtC-i071U-BKLMhz2jtE-EIqQ_b8e4b75ad16d02e424415817837d5f76', // fotini
      'OQYYdqWl5XrHrG9hSVRRVCvRmF4_53f6f663fdbe55d698f4adeaa2a373ec', // giannis 1
      'D5kHSpESPs1t7gMvHQvoHHx4o0s_19e7b1e701cca7abe74f6b4b11650089', // andre
      '87Ar0gukdhTcyUN3ps97yDEFZLI_89515dccce41c847d6db296c39269fb1', // noa
      '0YMTBSXaWfmeGQ1p1lzR6gy0xGI_6677c51f6e445bc4f1f41c99323fb67d', // giannis 2
      'Mtk8lCFrK5ybLN8ygSRmjvsJK0M_fd181753e5dcea31db4397484d977f17' // kostas
    ];
  },

  // render
  // -----------------------------------------------------------------------
  render: function() {
    log('rendering WelcomeView');
    this.html = Mustache.to_html(this.template, this.model);
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

    // enable flexSlider
    /*$('#interests-slider').flexslider({
      animation: "slide",
      animationLoop: true,
      itemWidth: 200,
      itemMargin: 20,
      minItems: 2,
      maxItems: 8
    });*/

    // render facebook like-box
    FB.XFBML.parse(document.getElementById('dashboard'));
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