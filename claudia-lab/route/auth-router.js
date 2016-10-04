'use strict';

// NPM MODULES
const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('auth:server');
const createError = require('http-errors');
const basicAuth = require('../lib/basic-auth-middleware.js');

// APP MOUDLES
const User = require('../model/user.js');

// MODULE CONSTANTS
//factory- returns a new instance of a router without using the new keyword
const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next){
  debug('POST /api/signup');
  let password = req.body.password;
  //model should never have plain text password
  delete req.body.password;
  let user = new User(req.body);
  //turns password into scrambled hash that gets put on the model
  user.generatePasswordHash(password)
  //above function returns the user so you can pass it into .then
  .then(user => user.save()) //checks for unique username with mongoose unique
  //if that works, pass username on and generate token
  .then(user => user.generateToken()) //returns a token
  .then(token => res.send(token)) //sends a token as response
  .catch(err => next(createError(401, err.message)));
});

authRouter.get('/api/login', basicAuth, function(req, res, next){
  debug('GET /api/login');
  //if user is found, run compareHash and generate them a new token
  User.findOne({username: req.auth.username})
  //should return a user
  .then(user => user.comparePasswordHash(req.auth.password))
  .then(user => user.generateToken()) //returns a token
  .then(token => res.send(token)) //sends a token as response
  .catch(next);
//  .catch(err => next(createError(401, err.message)));
});
