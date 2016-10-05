# Project description

Creates a RESTful multiple-resource API with a persistence layer powered by Mongo. User's can sign-up, login, and make changes to a a gallery using CRUD operations.

## How to install

See package.json for list of dependencies necessary to install and run this project.

## How to start the server

From the root level of the project, enter 'npm start' in terminal to start the server.

## Server endpoints

### Sign-up and Login

POST requests

/api/park/:parkID/dog

* Pass a new 'dog' as valid JSON into the body of the request to create a dog, and pass a parkID into the query string to specify the park the dog should reside in.

GET requests

/api/park/dog/:dogID

* Pass a dog id to fetch a specific dog. No parkID required in query string.


DELETE requests

/api/dog/:dogID

* Pass a dog id to delete that dog. No parkID required in query string.


###

POST requests

/api/park

* Pass in a new 'park' as valid JSON into the body of the request to create a park.

GET requests

/api/park/:id

* Pass in a park id to fetch that park.

DELETE requests

/api/park/:id

* Pass in a park id to delete that park.

PUT requests

* Pass in a park id and valid JSON into the body of the request to update a park.
