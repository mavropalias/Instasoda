/**
 * Load Node modules
 */
var journey = require('journey');
var mongoose = require('mongoose');

/**
 * Connect to the database
 */
mongoose.connect('mongodb://localhost/instasoda');

/**
 * GET /ping:
 * @return {Object} 200 `{ pong: true }`
 */
function ping(res){
	res.send(200, {}, {
		pong : true
	});
}


exports.ping = ping; 