## About The Program:
This program is a simple photo sharing REST API that authorizes new and returning users granting them access to CRUD operations that enable the user to upload new photos as well as edit or delete existing photos. The program uses Express to respond to and route HTTP methods appropriately from client requests at a particular endpoint. The specified models are created via mongoose which map to a mongoDB collection and define the shape of the documents within that collection. A user will authenticate by passing in a valid name, email, and a password and will get back a token upon success. JSON web tokens is used to validate tokens which allows information to be passed back and fourth in JSON format if the token is good. The program is compatible with AWS and uses it to store uploaded images. A user can only use the program after successful authentication and authorization.

##User Guide:

It is important to structure your files as follows:
* **lib** will contain middleware
* **model** will contain the models
* **test** will contain program test files
  * test/**data** contains the image for the tests
  * test/**lib** contains the form request file
* **route** will contain the routes

Run npm install before installing the required dependencies:
```
npm install
```

*See package.json for required dependencies and devdependencies*

Be sure to include a .env file and include it in your .gitignore, the .env file should include the following:
```
PORT=3000
MONGODB_URI=mongodb://localhost/<name of program>
APP_SECRET='this is secret string'
AWS_ACCESS_KEY_ID=<access key>
AWS_SECRET_ACCESS_KEY=<secret access key>

```

Start mongoDB from the terminal:
```
mongod --dbpath=db
```

From the terminal, open another window and run...
```
npm run start
```

*Before continuing it is important to note that every user request is validated by a unique token so a user can only make requests to it's own models*

The following is a list of endpoints for each of the routes:

## Gallery Routes

## GET

A valid GET request will return a 200 status code:
```
http localhost:3000/api/gallery/<gallery id>
```

An invalid GET request will return a 404 status code for an invalid or not found id:
```
http localhost:3000/api/gallery/1234
```

## POST

A valid POST request will return a 200 status code:
```
echo '{"name": "Pudge the Cat", "desc": "Meet Pudge"}' | http localhost:3000/api/gallery/gallery
```

An invalid POST will return a 400 status code for invalid or missing body:
```
echo '{"name": 123, "desc": "Meet Pudge"}' | http localhost:3000/api/gallery/gallery
```

An unauthorized user will receive a 401 status code.

## PUT

A valid PUT request will return a 200 status code:
```
echo '{"name": "Smudge the Cat", "desc": "Meet Smudge"}' | http PUT localhost:3000/api/gallery/<gallery id>
```

An invalid PUT request will return a 400 status code for invalid or missing body:
```
echo '{"name": "", "desc": 1}' | http PUT localhost:3000/api/gallery/<gallery id>
```

An unauthorized user will receive a 401 status code.

## DELETE

A valid DELETE request will return a 204 status code (success without content):
```
http DELETE localhost:3000/api/gallery/<gallery id>
```

An invalid DELETE request will return a 404 status code for invalid or not found id:
```
http DELETE localhost:3000/api/gallery/123
```

## Pic Routes

## POST

A valid POST request to upload a picture is sent via form request and will result in a 200 status code upon success:
```
http POST localhost:3000/api/gallery/<gallery id>/pic
```
