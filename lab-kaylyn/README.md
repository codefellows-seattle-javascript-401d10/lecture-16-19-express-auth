## About The Program:
This program is a photo sharing REST API that is responsible for authorizing new users upon sign-up as well as returning users upon sign-in. The program uses Express to respond to and route HTTP methods from client requests at a particular endpoint and uses mongoose to define its User Model. This model includes username, email, password, and findHash properties that map to a mongoDB collection and defines the shape of the documents within that collection. A user will authenticate by passing in a name, email, and a password and will get back a token. The token is validated via JSON web tokens which allows information in JSON format to be passed back and fourth if the token is good. The user password is hashed and then stored in the database to ensure that no password is stored as plain text. Once a valid user has been set up they can then upload and share photos according to a pre-declared Gallery Model.

##User Guide:
It is important to structure your files as follows:
* **lib** dir will contain your middleware
* **model** dir will contain your object constructor, which should be a simple resource
* **test** dir will contain your program test files
* **route** dir will contain your routes

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
DEBUG=<username>*
```
