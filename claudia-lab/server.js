'use strict';

// NPM MODULES
const express = require('express');
const morgan = require('morgan');
const Promise = require('bluebird');
const cors = require('cors');
const mongoose = require('mongoose');
const debug = require('debug')('auth:server');
const dotenv = require('dotenv'); //loads environment variables form the file

// APP MODULES
const authRouter = require('./route/auth-router');
const errorMiddleware = require('./lib/error-middleware.js');

// LOAD ENV VARIABLES
dotenv.load();

// CONNECT TO MONGO DATABASE
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

// MODULE CONSTANTS
const PORT = process.env.PORT;
const app = express();

// APP MIDDLEWARE
app.use(cors());
app.use(morgan('dev'));

// APP ROUTES
app.use(authRouter);
app.use(errorMiddleware);

// START SERVER
const server = module.exports = app.listen(PORT, function() {
  debug('server up');
});
server.isRunning = true;
