'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); //lib for encrypting and decrypting JS objects
const Promise = require('bluebird'); //Promise library
const mongoose = require('mongoose');
const createError = require('http-errors');
const debug = require('debug')('catgram:user');

// mondule constant
const Schema = mongoose.Schema;

//declaring a schema for a user
const userSchema = Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  findHash: {type: String, unique: true}, //findHash will produce a random and unique hash
});


// for signUP, happens every time a user is created 
// store a password that has been encrypted as a hash
userSchema.methods.generatePasswordHash = function(password){
  debug('generatePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err); // 500 error
      this.password = hash;
      resolve(this);
    });
  });
};

// for signIN
// returns a Promise that uses bcrypt.compare to compare a plain text password with the stored hashed password
userSchema.methods.comparePasswordHash = function(password){
  debug('comparePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if (err) return reject(err); // 500 error bcrypt failed
      if (!valid) return reject(createError(401, 'wrong password'));
      resolve(this);
    });
  });
};

// for signup
// this function is going to generate a random string that is 32 bytes of hex and try to save the user
userSchema.methods.generateFindHash = function(){
  debug('generateFindHash');
  return new Promise((resolve, reject) => {
    let tries = 0;
    _generateFindHash.call(this);

    function _generateFindHash(){
      this.findHash = crypto.randomBytes(32).toString('hex'); //will return the 32 randomBytes as a string
      this.save()
      .then(() => resolve(this.findHash)) //a one line arrow function is an implicit return, the whole function is going to resolve this value
      .catch(err => {
        if (tries > 3) return reject(err); // 500 error
        tries++;
        _generateFindHash.call(this); //recursive function, call invokes a function with a specified context
      });
    }
  });
};

// for signup and signin
userSchema.methods.generateToken = function(){
  debug('generateToken');
  return new Promise((resolve, reject) => {
    this.generateFindHash()
    .then(findHash => resolve(jwt.sign({token: findHash}, process.env.APP_SECRET)))
    .catch(err => reject(err)); // 500 error from find hash
  });
};

module.exports = mongoose.model('user', userSchema);
