'use strict';

// npm modules
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const debug = require('debug')('bookstagram:server');

// app modules
const picRouter = require('./route/pic-router');
const authRouter = require('./route/auth-router');
const GalleryRouter = require('./route/gallery-router');
const errorMiddleware = require('./lib/error-middleware');

// load env vars
dotenv.load();

// set up mongoose
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

// module contants
const PORT = process.env.PORT;
const app = express();

// app middleware
app.use(cors());
app.use(morgan('dev'));

// app routes
app.use(picRouter);
app.use(authRouter);
app.use(GalleryRouter);
app.use(errorMiddleware);

const server = module.exports = app.listen(PORT, () => {
  debug(`server up, mate! <(0v0)> ${PORT}`);
});

server.isRunning = true;
