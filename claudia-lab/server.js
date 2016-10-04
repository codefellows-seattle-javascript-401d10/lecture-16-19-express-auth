'use strict'; //get better warnings

// NPM MODULES
const express = require('express');
const morgan = require('morgan'); // route logging middleware
const Promise = require('bluebird');
const cors = require('cors');
const mongoose = require('mongoose');
const debug = require('debug')('TastyToast:server');
const dotenv = require('dotenv'); //loads environment variables form the file

// APP MODULES
const authRouter = require('./route/auth-router');
const galleryRouter = require('./route/gallery-router');
const errorMiddleware = require('./lib/error-middleware.js');

// LOAD ENV VARIABLES -looks for .env files and sets variables into process.env
dotenv.load();

// CONNECT TO MONGO DATABASE
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI); // allows you to make queries to mongo database

// MODULE CONSTANTS
const PORT = process.env.PORT;
const app = express(); //instantiate instance of expres (with factory method)

// APP MIDDLEWARE
app.use(cors());
app.use(morgan('dev'));

// APP ROUTES
app.use(authRouter);
app.use(galleryRouter);
app.use(errorMiddleware);


// START SERVER
const server = module.exports = app.listen(PORT, function() {
  debug('server up');
});

// check if the server is running so we can turn it on or off
server.isRunning = true;
