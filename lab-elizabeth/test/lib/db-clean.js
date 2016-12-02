'use strict';

const debug = require('debug')('bookstagram:db-clean');

const Pic = require('../../model/pic');
const User = require('../../model/user');
const Gallery = require('../../model/gallery');

module.exports = function(done){
  debug('clean database');
  Promise.all([
    Pic.remove({}),
    User.remove({}),
    Gallery.remove({}),
  ])
  .then( () => done())
  .catch(done);
};
