'use strict';

// npm modules
const debug = require('debug')('bookstagram:mock-pic');

// app modules
const Pic = require('../../model/pic');
const awsMock = require('./aws-mock');
const mockGallery = require('./mock-gallery');

module.exports = function(done){
  debug('creating mock pic');
  let examplePicData = {
    name: 'map',
    desc: 'we do not want to get lost on this trip, we have to walk the whole way!',
    created: new Date(),
    imageURI: awsMock.uploadMock.Location,
    objectKey: awsMock.uploadMock.Key,
  };

  mockGallery.call(this, err => {
    if (err) return done(err);
    examplePicData.userID = this.tempUser._id.toString();
    examplePicData.galleryID = this.tempGallery._id.toString();
    new Pic(examplePicData).save()
    .then( pic => {
      this.tempPic = pic;
      done();
    })
    .catch(done);
  });
};
