'use strict';

// npm modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('meeksgram:server');

// app modules
const errorMiddleware = require('./lib/error-middleware.js');
const authRouter = require('./route/auth-router.js');
// load env vars (environment variables)
dotenv.load();

// setup mongoose
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
app.use(errorMiddleware);

// start server
const server = module.exports = app.listen(PORT, () => {
  debug(`server up on ${PORT}`);
});

server.isRunning = true;
