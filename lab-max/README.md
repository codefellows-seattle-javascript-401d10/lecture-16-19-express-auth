#Express Authentication/Authorization Lab

This is a double resource API with User models associated with those resources, built using MongoDB for our persistence layer and Express as the framework, which is compatible with CRUD operations. We've also linked up with AWS to allow posting of book images, or entire book files. Before you can use any resources in this API, you need to signup/login, and have a matching token in our User database. For this API, you can GET, POST, PUT, and DELETE a 'library' or only POST a 'book'.

- Each user will need to signup with: username, email, password.
- Each library object must have: name, genre.
- Each book object must have: name, desc, year, image.
- An Id and createdOn Date will be automatically generated upon valid POST's. If a book is posted, an ID referencing its library will be created.

To start, run:

```
npm i
```

This will install all dependencies for this project, including:

- bluebird
- body-parser
- debug
- aws-sdk
- bcrypt
- dotenv
- jsonwebtoken
- multer
- express
- http-errors
- mongoose
- morgan
- cors
- chai
- form-data
- mocha
- superagent

Once all dependencies are installed you must first boot up mongoDB.

To do this open up another tab in your shell in the same home directory, and run:

```
mongod --dbpath=db
```

Then in another tab in the home directory, run:

```
npm run start
```

which will start our server.

#EVERY REQUEST YOU MAKE HERE MUST BE VALIDATED BY A UNIQUE USER TOKEN.

- You can only make CRUD requests to your own resources/models. No user can access another users' models.

#Library Routes

#GET

A valid GET request should look like this, and result in a 200 status code:

```
http localhost:3000/api/library/(library id)
```

and that will return the object with properties: id, name, genre, created, userID.

A GET request resulting in a 404 status error will return if a library at a specified id isn't found.

```
http localhost:3000/api/library/99999
```

A GET request resulting in a 401 status error means you are an unauthorized user. Check to make sure you have a token, or try logging in/out.

#POST

A valid POST request should look like this, and result in a 200 status code:

```
echo '{"name": "Crazy Space Stories", "genre": "sci-fi fantasy"}' | http localhost:3000/api/library
```

A POST request resulting in a 400 status error will return if there was a bad request. Meaning invalid body or no body was sent.

```
echo '{"name": "", "genre": 20}' | http localhost:3000/api/library
```

A POST request resulting in a 401 status error means you are an unauthorized user. Check to make sure you have a token, or try logging in/out.

#PUT

A valid PUT request should look like this, and result in a 200 status code:

```
echo '{"name": "Wild Wild West", "genre": "adventure"}' | http PUT localhost:3000/api/library/(library id)
```

A PUT request resulting in a 400 status error will return if there was a bad request. Meaning invalid or no body was sent.

```
echo '{"notName": "red", "notGenre": 2}' | http PUT localhost:3000/api/library/(library id)
```

A PUT request resulting in a 404 status error will return if there was an invalid Id or Id not found.

```
echo '{"name": "horror stories", "genre": "horror"}' | http PUT localhost:3000/api/library/12345
```

A PUT request resulting in a 401 status error means you are an unauthorized user. Check to make sure you have a token, or try logging in/out.

#DELETE

A valid DELETE request should look like this, and result in a 204 status code:

```
http DELETE localhost:3000/api/library/(library id)
```

A DELETE request resulting in a 404 status error will return if there was a bad request. Meaning no id was found.

```
http DELETE localhost:3000/api/library/11111
```

A DELETE request resulting in a 401 status error means you are an unauthorized user. Check to make sure you have a token, or try logging in/out.

#Book routes

#POST

In our hypothetical form, a valid POST request should look like this, and result in a 200 status code:

```
http POST localhost:3000/api/library/(library id)/book
```

- name: 'His Dark Materials'
- desc: 'Lyra and Will try to save the world with a band of companions'
- year: 2003
- image: (A button to submit either a book image file, or an audiobook file)
