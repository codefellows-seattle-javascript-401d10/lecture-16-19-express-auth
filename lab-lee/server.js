'use strict'; //We turn on use strict to get better warnings

// npm modules
const cors = require('cors'); //express middleware lets us cross side scripting
const dotenv = require('dotenv'); //
const morgan = require('morgan'); //logging middleware. Logs info about route.
const express = require('express'); //server framework
const mongoose = require('mongoose'); //ORM for owrking with MongoDB
// const Promise = require('bluebird'); //Promises. Specifically to use w/ mongoose
const debug = require('debug')('leegram:server'); //logging tool

// app modules
const errorMiddleware = require('./lib/error-middleware'); //error routes
const authRouter = require('./route/auth-router'); //auth routes

// load env vars
dotenv.load(); //look in current directory for .env and adds to process.env

// setup mongoose
// mongoose.Promise = Promise; //
mongoose.connect(process.env.MONGODB_URI);

//module constants
const PORT = process.env.PORT; //setting PORT to what's on the env
const app = express(); //using express factory method to instantiate an instance of express. Factory = returns instance of a constructor

// app middleware
app.use(cors()); //telling the app to use cors to do cross-side scripting
app.use(morgan('dev')); //telling the app to use morgan middleware

// app routes
app.use(authRouter); //telling the app to use the auth router
app.use(errorMiddleware); // telling the app to use our error middleware

// start server
const server = module.exports = app.listen(PORT, function() {
  debug(`server started on ${PORT}`);
});

server.isRunning = true; //a test to check if the server is running
