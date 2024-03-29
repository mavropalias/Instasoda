Instasoda
=========

### /apps
Code repo for our desktop & mobile apps.

### /instalabs
A place to experiment with new features, mockups and ideas and showcase them to the rest of the team.

### /web
Code repo for the main + mobile website. **(Legacy - to be removed)


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

1. **NodeJS (v6.11)**

		sudo apt-get install g++ curl libssl-dev apache2-utils
		git clone git://github.com/joyent/node.git
		cd node
		git checkout v.06.11
		./configure
		make
		sudo make install
	
2. **NPM (NodeJS Package Manager)**

		git clone https://github.com/isaacs/npm.git
		cd npm
		sudo make install
		
3. **Express.js**

		sudo npm install -g express
	
4. **MongoDB (v2.0.0)**

	Install your distro's package following the guidelines provided here:
	
		http://www.mongodb.org/downloads#packages
		
5. **Forever (NodeJS server process management)**

		sudo npm install forever -g
	
	
	
	
	