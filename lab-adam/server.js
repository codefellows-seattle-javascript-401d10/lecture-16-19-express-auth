'use strict';

const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const debug = require('debug')('stellegram:server');

// app modules
const errorMiddleware = require('./lib/error-middleware.js');
const authRouter = require('./route/auth-router.js');
const propertyRouter = require('./route/property-router.js');

// load env vars
dotenv.load();

// setup DB & mongoose
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

// module constants
const PORT = process.env.PORT;
const app = express();

// app middleware
app.use(cors());
app.use(morgan('dev'));

// app routes
app.use(authRouter);
app.use(propertyRouter);
app.use(errorMiddleware);

// start server
const server = module.exports = app.listen(PORT, () => {
  debug(`server up on ${PORT}`);
});

server.isRunning = true;
