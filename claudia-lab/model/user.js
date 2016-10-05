'use strict';

// NPM MODULES
const crypto = require('crypto'); // only used for random numbers
const bcrypt = require('bcrypt'); // used for encryption
const jwt = require('jsonwebtoken'); // encrypt and decrypt js objects
const Promise = require('bluebird'); // promise library
const mongoose = require('mongoose'); // creates user Schema
const createError = require('http-errors'); // generate errors with specific status codes
const debug = require('debug')('TastyToast:user'); // logs messages

// MODULE CONSTANT
const Schema = mongoose.Schema;

const userSchema = Schema({
  // if unique is not met - token generation fails
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true}, //encrypted
  findHash: {type: String, unique: true},
  //don't generate findHash unless they are a unique user
});


// SIGNUP
// store a password that has been encrypted as a hash
userSchema.methods.generatePasswordHash = function(password){
  debug('generatePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => { // encrypts
      if (err) return reject(err); // 500 error - set automiatcally
      this.password = hash; //
      resolve(this);
    });
  });
};

// LOGIN - compares plain text password with hashed password
userSchema.methods.comparePasswordHash = function(password){
  debug('comparePasswordHash');
  return new Promise((resolve, reject) => {
    // determines if plain text password can be used to generate hashed password
    bcrypt.compare(password, this.password, (err, valid) => {
      if (err) return reject(err); // 500 error bcrypt failed
      if (!valid) return reject(createError(401, 'wrong password'));
      resolve(this);
    });
  });
};

// SIGNUP
// always need to change tokens so you need to create a random String
// to generate unique random tokens
userSchema.methods.generateFindHash = function(){
  debug('generateFindHash');
  return new Promise((resolve, reject) => {
    let tries = 0;
    _generateFindHash.call(this);

    function _generateFindHash(){
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then(() => resolve(this.findHash))
      .catch(err => {
        if (tries > 3) return reject(err); // 500 error
        tries++;
        _generateFindHash.call(this);
      });
    }
  });
};

// for SIGNUP and LOGIN
userSchema.methods.generateToken = function(){
  debug('generateToken');
  return new Promise((resolve, reject) => {
    this.generateFindHash() // findHash is returned
    //create token with web tokens - can be decrypted to get hash back
    .then(findHash => resolve(jwt.sign({token: findHash}, process.env.APP_SECRET)))
    .catch(err => reject(err)); // 500 error from find hash
  });
};

module.exports = mongoose.model('user', userSchema);
