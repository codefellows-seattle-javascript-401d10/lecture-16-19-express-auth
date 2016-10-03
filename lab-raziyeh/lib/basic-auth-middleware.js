'use strict';

const createError = require('http-errors');
const debug = require('debug')('slugram:basic-auth-middleware');

module.exports = function( req, res, next) {
  debug();

  var authHeder = req.headers.authorization;
  if(!authHeder)
    return next(createError(401, 'require authorization header'));

  let base64String = authHeder.split('Basic ')[1];
  if(!base64String)
    return next(createError(301, 'require username and password'));

  let utf8String = new Buffer(base64String, 'base64').toString();
  let authArray = utf8String.aplit(':');
  req.auth = {
    username: authArray[0],
    password: authArray[1],
  };

  if(!req.auth.username)
    return next(createError(401, 'basic auth requires username'));
  if(!req.auth.password)
    return next(createError(401, 'basic auth requires password'));
  next();
};