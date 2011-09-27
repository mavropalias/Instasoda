//
// GET /ping:
// * Responds with 200
// * Responds with `{ pong: true }`
//
function ping(res){
	res.send(200, {}, {
		pong : true
	});
}


exports.ping = ping;