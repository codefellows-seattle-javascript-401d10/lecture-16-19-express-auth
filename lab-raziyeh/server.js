'use strict';

//npm modules
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const express = require('express');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const debug = require('debug')('slug:server');

//app modules
const errorMiddleware = require('./lib/error-middleware.js');
const basicErrorMiddleware = require('./lib/basic-auth-middleware.js');

const authRouther = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');

//load env vars
dotenv.load();

//setup mongoose
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

//module constants
const PORT = process.env.PORT;
const app = express();

//app middleware
app.use(cors());
app.use(morgan('dev'));

//app routes
app.use(authRouther);
app.use(galleryRouter);
app.use(errorMiddleware);
app.use(basicErrorMiddleware);

const server = module.exports = app.listen(PORT, () => {
  debug(`server is up ${PORT}`);
});

server.isRunning = true;