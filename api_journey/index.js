/**
 * Load Node modules
 */
var journey = require('journey');
var mongoose = require('mongoose');

/**
 * Load Instasoda files
 */
var server = require("./server");
var routes = require("./routes");

/**
 * Create a Journey router
 */
var router = new journey.Router({
	strict : false,
	strictUrls : false,
	api : 'basic'
});

/**
 * Create the routing table
 */
router.map(function () {
	this.get('/ping').bind(routes.ping);
});

/**
 * Load fixtures (default data) into the database
 */
var fixtures = require("./fixtures");

/**
 * start the server
 */
server.start(router);
