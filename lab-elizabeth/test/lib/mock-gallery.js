'use strict';

const debug = require('debug')('bookstagram:mock-gallery');
const mockUser = require('./mock-user');
const Gallery = require('../../model/gallery');


module.exports = function(done){
  debug('create mock gallery');
  let exampleGallery = {
    name: 'That trip to Mordor',
    desc: 'the eagles said they would meet us, they were late',
  };
  mockUser.call(this, err => {
    if (err)
      return done(err);
    exampleGallery.userID = this.tempUser._id.toString();
    new Gallery(exampleGallery).save()
    .then(gallery => {
      this.tempGallery = gallery;
      done();
    })
    .catch(done);
  });
};
