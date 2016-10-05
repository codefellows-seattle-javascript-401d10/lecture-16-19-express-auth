'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('bookstagram:auth-router');
const bearerAuth = require('../lib/bearer-auth-middleware');

const User = require('../model/user');

const authRouter = module.exports = Router();

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
