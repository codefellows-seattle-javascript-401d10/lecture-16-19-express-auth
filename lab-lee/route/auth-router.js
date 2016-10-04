'use strict';

// npm modules
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const debug = require('debug')('leegram:auth-router');

// app modules
const basicAuth = require('../lib/basic-auth-middleware'); //takes header for basic authorization and adds req.auth which has username & password properties

// module constants
const authRouter = module.exports = Router();

const User = require('../model/user');

authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST /api/signup');
  let password = req.body.password; //pw comes from user and we remove it from the request before deleting it immediately, then we hash it before we store
  delete req.body.password;

  let user = new User(req.body);

  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

authRouter.get('/api/login', basicAuth, function(req, res, next) {
  //This module parses the authorization header off of the request
  //We parse that off so we have a username and a password from it.
  //We compare it against what's in the database and send back a token based off of the properly validated user
  debug('GET /api/login');
  User.findOne({username: req.auth.username})
  .then( user => user.comparePasswordHash(req.auth.password))
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});
