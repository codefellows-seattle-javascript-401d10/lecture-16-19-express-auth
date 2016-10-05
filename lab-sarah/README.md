# Project description

Creates a RESTful multiple-resource API with a persistence layer powered by Mongo. User's can sign-up, login, and make changes to a a gallery using CRUD operations.

## How to install

See package.json for list of dependencies necessary to install and run this project.

## How to start the server

From the root level of the project, enter 'npm start' in terminal to start the server.

## Server endpoints

### authRouter

POST requests

/api/signup

* Create an 'account' with a unique username, password, and email address.

GET requests

/api/login

* Login using username and password


### galleryRouter

POST requests

/api/gallery

* Pass in a new 'gallery' as valid JSON to upload a gallery.

GET requests

/api/gallery/:id

* Pass in a gallery id to fetch that gallery.

DELETE requests

/api/gallery/:id

* Pass in a gallery id to delete that gallery.

PUT requests

* Pass in a galery id and valid JSON into the body of the request to update a gallery.
