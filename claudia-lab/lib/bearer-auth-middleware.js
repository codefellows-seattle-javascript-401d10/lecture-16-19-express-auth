'use strict';
// NPM MODULES

const debug = require('debug')('TastyToast:bearer-middleware');
const createError = require('http-errors'); // generate errors with specific status codes
const jwt = require('jsonwebtoken'); // encrypt and decrypt js objects

//APP CONSTANT
const User = require('../model/user.js');

module.exports = function(req, res, next) {
  debug();
  let authHeader = req.headers.authorization;
  if (!authHeader)
    return next(createError(401, 'requires auth header'));
    //takes token out of header
  let token = authHeader.split('Bearer ')[1];
  if (!token)
    return next(createError(401, 'requires token'));
    // decrypts the token
  jwt.verify(token, process.env.APP_SECRET, (err, decoded) =>{
    if (err) return next (err); // 500 error
    // find a user with that specific findHash
    User.findOne({findHash: decoded.token})
    .then( user => {
      req.user = user; //now can access the user in the route
      next();
    })
    .catch( err => {
      next(createError(401, err.message));
    });
  });
};
