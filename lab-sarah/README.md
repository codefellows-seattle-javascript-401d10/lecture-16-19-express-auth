# Project description

Creates a RESTful multiple-resource API with a persistence layer powered by Mongo and AWS. User's can sign-up, login, and make changes to a gallery using CRUD operations. User's can also upload pictures to a specific gallery.

## How to install

See package.json for list of dependencies necessary to install and run this project.

## How to start the server

From the root level of the project, enter 'npm start' in terminal to start the server.

## Server endpoints

### authRouter

POST requests

/api/signup

* Create an 'account' by passing into the body of a request a unique username, password, and email address, all of type String.

GET requests

/api/login

* Login using username and password in the body of the request, both of type String.


### galleryRouter

POST requests

/api/gallery

* Pass in a new 'gallery' as valid JSON to upload a gallery. Body of request should include a name and description property, both of type String.

GET requests

/api/gallery/:galleryid

* Pass in a gallery ID in the body of the request to fetch that gallery.

DELETE requests

/api/gallery/:galleryid

* Pass in a gallery ID in the body of the request to delete that gallery.

PUT requests

/api/gallery/:galleryid

* Pass in a gallery ID and valid JSON to update a gallery. Request body should include a gallery ID, and a name and description property, both of type String.


### picRouter

POST requests

/api/gallery/:galleryid/pic

* Pass in a gallery ID and picture object as valid JSON to upload a picture to that gallery. Body of the request should include the id, name, and description, all of type String.
