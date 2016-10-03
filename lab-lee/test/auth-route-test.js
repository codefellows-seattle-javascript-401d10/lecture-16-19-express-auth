'use strict';

// npm modules
const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const User = require('../model/user');

// app modules
const server = require('../server.js');

// module constants
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'steveguy',
  password: 12345,
  email: 'blerpderp@blerp.com',
};
