'use strict';

// npm modules
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const debug = require('debug')('leegram:auth-router');

// app modules
const basicAuth = require('../lib/basic-auth-middleware');

// module constants
const authRouter = module.exports = Router();

const User = require('../model/user');

authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST /api/signup');
  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);

  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

authRouter.get('/api/login', basicAuth, function(req, res, next) {
  debug('GET /api/login');
  User.findOne({username: req.auth.username})
  .then( user => user.comparePasswordHash(req.auth.password))
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});
