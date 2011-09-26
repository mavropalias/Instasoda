
Instasoda
=========

### /apps
Code repository for our phone & tablets apps.

### /instalabs
A place to experiment with new features, mockups and ideas and showcase them to the rest of the team.

### /web
Code repository for the main website, mobile website and API. This is where the magic happens!


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

### Add all new files to the repo:
	
	git add .

### Add a specific file to the repo (newfile.js in the /web folder):
	
	git add web/\newfile.js
	
### Delete files from the repo, which have been deleted locally:
	
	git add . -A 
	git commit -m "removed some files"
	
OR (in a single line):
	
	git commit -am "my changes, including deleted files"