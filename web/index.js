/**
 * Module dependencies.
 */
var express = require('express');
var app = module.exports = express.createServer();

/**
 * Configuration
 */
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('view options', {
		layout : false
	});
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

// settings for dev environment
app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions : true,
		showStack : true
	}));
});

// settings for production environment
app.configure('production', function() {
	app.use(express.errorHandler());
});

/**
 * Routes
 */
app.get('/', function(req, res) {
	res.render('index', {
		title : 'Express'
	});
});
app.get('/m', function(req, res) {
	res.render('m/index', {
		title : 'Express'
	});
});
app.get('/m/dashboard', function(req, res) {
	res.render('m/dashboard', {
		title : 'Express'
	});
});

/**
 * Run server
 */
app.listen(80);
console.log("==         INSTASODA activation sequence          ==")
console.log("== SUCCESS: Web server started                    ==");
console.log("==          port: %d, mode: %s           ==",
		app.address().port, app.settings.env);
