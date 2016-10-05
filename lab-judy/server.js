'use strict';

//npm modules
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const debug = require('debug')('judy: server');

//app modules
const authRouter = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const errorMiddleWare = require('./lib/error-middleware.js');
const picRouter = require('./route/pic-router.js');

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
app.use(authRouter);
app.use(galleryRouter);
app.use(picRouter);
app.use(errorMiddleWare);

//start server
const server = module.exports = app.listen(PORT, () => {
  debug(`server up on ${PORT}`);
});

server.isRunning = true;
