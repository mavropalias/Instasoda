// load Node modules
var journey = require('journey');

// load Instasoda files
var server = require("./server");
var routes = require("./routes");

//Create a Journey router
var token, router = new journey.Router({
	strict : false,
	strictUrls : false,
	api : 'basic'
});

//Create the routing table
router.map(function () {
	this.get('/ping').bind(routes.ping);
});

// start the server
server.start(router);