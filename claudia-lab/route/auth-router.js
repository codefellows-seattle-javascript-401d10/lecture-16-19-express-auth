'use strict';

// NPM MODULES
const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('TastyToast:user-router');
const createError = require('http-errors');
// basicAuth takes header for basic authroization and adds an object called req.auth,
// which has name and password
const basicAuth = require('../lib/basic-auth-middleware.js');

// APP MOUDLES
// allows us to create users when somebody signs up
const User = require('../model/user.js');

// MODULE CONSTANTS
//factory- returns a new instance of a router without using the new keyword
const authRouter = module.exports = Router();
// name, password, email are passed in body of a post request
authRouter.post('/api/signup', jsonParser, function(req, res, next){
  debug('POST /api/signup');
  let password = req.body.password;
  //model should never have plain text password
  if(!req.body.password || !req.body.username) return next(createError(400, 'Must include username or password'));
  delete req.body.password; // delete allows you to remove key from an object in js
  let user = new User(req.body);
  //turns password into scrambled hash that gets put on the model
  user.generatePasswordHash(password)
  //above function returns the user so you can pass it into .then
  .then(user => user.save()) //checks for unique username with mongoose unique
  //if that works, pass username on and generate token
  .then(user => user.generateToken()) //returns a token
  .then(token => res.send(token)) //sends a token as response
  // token is a unique string that exists for each specific user
  // user passes back token when they want to do things
  .catch(next);
});

// header with basic: (user and password base 64 encoded)- parsed with basicAuth
authRouter.get('/api/login', basicAuth, function(req, res, next){
  debug('GET /api/login');
  //if user is found, run compareHash and generate them a new token
  User.findOne({username: req.auth.username})
  //should return a user
  .then(user => user.comparePasswordHash(req.auth.password))
  .then(user => user.generateToken()) //returns a token
  .then(token => res.send(token)) //sends a token as response
  .catch(next);
});
