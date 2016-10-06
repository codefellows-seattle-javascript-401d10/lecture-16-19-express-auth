'use strict';

// node modules
const jsonParser = require('body-parser').json();

// npm modules
const debug = require('debug')('bookstagram:auth-router');

// app modules
const User = require('../model/user');
const bearerAuth = require('../lib/bearer-auth-middleware');

// module constants
const authRouter = module.exports = require('express').Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next){
  debug('POST /api/signup');

  let password = req.body.password;
  delete req.body.password;
  let user = new User(req.body);

  user.generatePasswordHash(password)
  .then(user => user.save())
  .then(user => user.generateToken())
  .then(token => res.send(token))
  .catch(next);
});

authRouter.get('/api/login', bearerAuth, function(req, res, next){
  debug('GET /api/login');

  User.findOne({username: req.auth.username})
  .then(user => user.comparePasswordHash(req.auth.password))
  .then(user => user.generateToken())
  .then(token => res.send(token))
  .catch(next);
});
