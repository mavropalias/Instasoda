Instasoda
=========

### /api
The API code repo of instasoda.

### /apps
Code repo for our phone & tablets apps.

### /instalabs
A place to experiment with new features, mockups and ideas and showcase them to the rest of the team.

### /web
Code repo for the main + mobile website.


Getting the code
================

	git init
	git remote add origin git@github.com:mavropalias/Instasoda.git
	git pull origin master

< do some coding >

	git commit -m "my changes"
	git push origin master


Git tips
========

1. **Add all new files to the repo:**
	
		git add .

2. **Add a specific file to the repo (newfile.js in the /web folder):**
	
		git add web/\newfile.js
	
3. **Delete files from the repo, which have been deleted locally:**
	
		git add . -A 
		git commit -m "removed some files"
	
	OR (in a single line):
	
		git commit -am "my changes, including deleted files"
		
		
Install required software
=========================

1. **NodeJS (v4.12)**

		sudo apt-get install g++ curl libssl-dev apache2-utils
		git clone git://github.com/joyent/node.git
		cd node
		git checkout v.04.12
		./configure
		make
		sudo make install
	
2. **NPM (NodeJS Package Manager)**

		git clone https://github.com/isaacs/npm.git
		cd npm
		sudo make install

3. **Journey (API router for NodeJS)**

		npm install journey
		
4. **Express (NodeJS MCV framework + EJS template engine)**

		sudo npm install -g express
		npm install ejs
	
5. **MongoDB (v2.0.0)**

	64-bit (recommended):
	
		curl http://downloads.mongodb.org/linux/mongodb-linux-x86_64-2.0.0.tgz > mongo.tgz
	
	32-bit:
	
		curl http://downloads.mongodb.org/linux/mongodb-linux-i686-2.0.0.tgz > mongo.tgz
	
	and then:
	
		tar xzf mongo.tgz
	
	By default MongoDB will store data in /data/db, but it won't automatically create that directory. To create it, do:
	
		sudo mkdir -p /data/db/
		sudo chown `id -u` /data/db
	
	Run and connect to the server (replace 'x86_64' with 'i686' for 32-bit):
	
		./mongodb-linux-x86_64-2.0.0/bin/mongod

6. **Mongoose (MongoDB DRM for NodeJS)**

		npm install mongoose
		
7. **Forever (NodeJS server process management)**

		sudo npm install forever -g
	
	
	
	
	