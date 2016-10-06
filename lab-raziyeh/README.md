# Express Authentication & Authorization
=============

## Getting Started
- In terminal enter : DEBUG=slug* server.js
- also you can run gulp
- for run tests in terminal enter:
    - gulp  OR
    - mocha



### Prerequisities

- dependencies:

```
npm install --save node-uuid superagent bluebird mkdirp-bluebird del bcrypt bluebirdbody-parser http-errors jsonwebtoken  mongoose dotenv cors

```

- devDependencies:

```
npm install -D gulp-eslint gulp-mocha mocha gulp chai superagent

```

## Running

- In your root server, type in the command **"node server.js"** in your terminal.
- OR in terminal type: gulp

### /api/signup

POST request
the client should pass the username and passord in the body of the request
the server should respond with a token genoratorated using jsonwebtoken and the users findHash
the server should respond with a 400 Bad Request to failed request

### /api/signin

GET request
the client should pass the username and password to the server using a Basic auth header
the server should respond with a token to authenticated users
the server should respond with a 401 Unauthorized to non authenticated users

## Testing:

- start server when tests begin and stop server when tests finish
- write a test to ensure that api returns a status code of 404 for routes that have not been registered /api/signup

- POST - test 400, responds with the http-errors 401 name, for if no body provided or invalid body
- POST - test 200, response body like <token> for a post request with a valid body /api/signin
- GET - test 401, responds with the http-errors 401 name, if the users could not be authenticated
- GET - test 200, response body like <token> for a request with a valid basic auth header
-

## Built With:
* Nodejs
* JavaScript
* Visual studio code 3

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

* **Raziyeh Bazargan** - [Github](https://github.com/RaziyehBazargan)

## License

This project is licensed under the ISC License.
