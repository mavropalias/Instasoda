//load node modules
var http = require("http");
var url = require("url");

function start(router) {
	http.createServer(function(request, response) {
		var body = "";

		request.addListener('data', function(chunk) {
			body += chunk
		});
		request.addListener('end', function() {
			// Dispatch the request to the router
			router.handle(request, body, function(result) {
				response.writeHead(result.status, result.headers);
				response.end(result.body);
			});
		});

		// log requests
		var pathname = url.parse(request.url).pathname;
		console.log("Request for " + pathname + " received.");

	}).listen(8000);
	console.log("Server has started at 8000.");
}

exports.start = start;