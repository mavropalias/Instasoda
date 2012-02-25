// ==========================
// Load Node modules
// ==========================

	var express = require("express"),
	    path = require("path"),
	    mongoose = require('mongoose');
    

// ==========================
// Database
// ==========================

	var mongodb = require("mongodb"),
	    mongoserver = new mongodb.Server('localhost', 27017),
	    db_connector = new mongodb.Db('instasoda', mongoserver),
	    db = null;
	
	db_connector.open(function(err, dbObject){
		if(!err){
			db = dbObject;
			console.log(">> Database open!");
		} else {
			console.log(">> Database error :(");
		}
	});


// ==========================
// Config
// ==========================
	
	var app = express.createServer();
	var application_root = __dirname;
	
	app.configure(function () {
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(app.router);
	  app.use(express.static(path.join(application_root, "public")));
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});


// ==========================
// Routes
// ==========================

	// ==========================
	// /api
	// ==========================
		
		app.get('/api', function (req, res) {
		  res.send('Instasoda API is running!');
		});
	
	
	// ==========================
	// /users | GET
	// ==========================
	
		app.get('/api/users', function (req, res){
			db.collection('users', function(err, collection){
				if(!err){
					collection.findOne({}, function(err, document){
						if(!err){
							return res.send(document);
						} else {
							return console.log(err);
						}	
					});
				} else {
					return console.log(err);
				}
			});
		  /*return ProductModel.find(function (err, products) {
		    if (!err) {
		      return res.send(products);
		    } else {
		      return console.log(err);
		    }
		  });*/
		});
	
	// ==========================
	// /users | POST
	// ==========================
	
		app.post('/api/products', function (req, res){
		  /*var product;
		  console.log("POST: ");
		  console.log(req.body);
		  product = new ProductModel({
		    title: req.body.title,
		    description: req.body.description,
		    style: req.body.style,
		  });
		  product.save(function (err) {
		    if (!err) {
		      return console.log("created");
		    } else {
		      return console.log(err);
		    }
		  });
		  return res.send(product);*/
		});
	
	
	// ==========================
	// /users/:id | GET
	// ==========================
	
		app.get('/api/products/:id', function (req, res){
		  /*return ProductModel.findById(req.params.id, function (err, product) {
		    if (!err) {
		      return res.send(product);
		    } else {
		      return console.log(err);
		    }
		  });*/
		});
	
	
	// ==========================
	// /users/:id | PUT
	// ==========================
	
		app.put('/api/products/:id', function (req, res){
		  /*return ProductModel.findById(req.params.id, function (err, product) {
		    product.title = req.body.title;
		    product.description = req.body.description;
		    product.style = req.body.style;
		    return product.save(function (err) {
		      if (!err) {
		        console.log("updated");
		      } else {
		        console.log(err);
		      }
		      return res.send(product);
		    });
		  });*/
		});
	
	// ==========================
	// /users/:id | DELETE
	// ==========================
		
		app.delete('/api/products/:id', function (req, res){
		  /*return ProductModel.findById(req.params.id, function (err, product) {
		    return product.remove(function (err) {
		      if (!err) {
		        console.log("removed");
		        return res.send('');
		      } else {
		        console.log(err);
		      }
		    });
		  });*/
		});


// ==========================
// Launch server
// ==========================
	
	app.listen(8080, function(){
		console.log(">> API Server running at port 8080");
	});
	









