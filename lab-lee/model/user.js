'use strict';

const bcrypt = require('bcrypt'); //Hugely contributed to. Up-2-date and tested.
const crypto = require('crypto'); //Node.js module we use for random numbers.
const jwt = require('jsonwebtoken'); //Encrypts and decrypts javascript objects
const Promise = require('bluebird'); //Promise library
const mongoose = require('mongoose'); //Lets us create models
const createError = require('http-errors'); //Lets us generate errors
const debug = require('debug')('leegram:user'); //log messages while developing

// module constants
const Schema = mongoose.Schema; //convenience var to point to mongoose.Schema

const userSchema = Schema({
  username: {type: String, require: true, unique: true},
  email: {type: String, require: true, unique: true},
  password: {type: String, required: true},
  findHash: {type: String, unique: true},
});

userSchema.methods.generatePasswordHash = function(password) {
  //We hash a password, which is one-way.
  debug('generatePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);
      this.password = hash;
      resolve(this);
    });
  });
};

userSchema.methods.comparePasswordHash = function(password) {
  //We hash the pw we're comparing. If it matches, thumbs up.
  debug('comparePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if(err) return reject(err);
      if(!valid) return reject(createError(401, 'wrong password'));
      resolve(this);
    });
  });
};

userSchema.methods.generateFindHash = function() {
  debug('generateFindHash');
  return new Promise((resolve, reject) => {
    let tries = 0;
    _generateFindHash.call(this);
    function _generateFindHash() {
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then(() => resolve(this.findHash))
      .catch( err => {
        if (tries > 3) return reject(err);
        tries++;
        _generateFindHash.call(this);
      });
    }
  });
};

userSchema.methods.generateToken = function() {
  debug('generateToken');
  return new Promise((resolve, reject) => {
    this.generateFindHash()
    .then( findHash => resolve(jwt.sign({token: findHash}, process.env.APP_SECRET)))
    .catch(err => reject(err));
  });
};

module.exports = mongoose.model('user', userSchema);
