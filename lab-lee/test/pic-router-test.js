'use strict';

const awsMocks = require('./lib/aws-mocks');

// node modules
// npm modules
const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('leegram:pic-router-test');


// app modules
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');
const Pic = require('../model/pic.js');
const serverControl = require('./lib/server-control');

// variable constants
const server = require('../server.js');
const url = 'http://localhost:3000';

const exampleUser = {
  username: 'steveguy',
  password: '1234',
  email: 'blerpderp@blerp.com',
};

const exampleGallery = {
  name: 'cool time party',
  desc: 'it was a cool party',
};

const examplePic = {
  name: 'partyfun',
  desc: 'sofun',
  image: `${__dirname}/data/hufflepuff.jpg`,
};

const examplePicData = {
  name: 'partyfun',
  desc: 'sofun',
  imageURI: awsMocks.uploadMock.Location,
  objectKey: awsMocks.uploadMock.Key,
  created: new Date(),
};

// config

describe('testing pic router', function() {

  before(done => {
    serverControl.serverUp(server, done);
  });

  // Turn server off before tests
  after(done => {
    serverControl.serverDown(server, done);
  });

  afterEach(done => {
    debug('clean up database');
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
      Pic.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  describe('testing POST /api/gallery/:galleryID/pic', function() {

    describe('with valid token and data', function() {

      before( done => {
        debug('create mock User');
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        debug('create gallery');
        exampleGallery.userID = this.tempUser._id.toString();
        new Gallery(exampleGallery).save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      after(() => {
        debug('clean up userID from exampleGallery');
        delete exampleGallery.userID;
      });

      it('should return a pic', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .field('name', examplePic.name)
        .field('desc', examplePic.desc)
        .attach('image', examplePic.image)
        .then( res => {
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.desc).to.equal(examplePic.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          expect(res.body.objectKey).to.equal(awsMocks.uploadMock.Key);
          done();
        })
        .catch(done);
      });
    });
  });

  describe('testing DELETE /api/gallery/:galleryID/pic/:picID', function() {

    describe('with valid token and data', function() {

      before( done => {
        debug('create mock User');
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        debug('create gallery');
        exampleGallery.userID = this.tempUser._id.toString();
        new Gallery(exampleGallery).save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      before( done => {
        debug('create pic');
        examplePicData.userID = this.tempUser._id.toString();
        examplePicData.galleryID = this.tempGallery._id.toString();
        new Pic(examplePicData).save()
        .then( pic => {
          this.tempPic = pic;
          done();
        })
        .catch(done);
      });

      after(() => {
        debug('clean up userID from exampleGallery');
        delete exampleGallery.userID;
        delete examplePicData.userID;
        delete examplePicData.galleryID;
      });

      it('should return a pic', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${this.tempPic._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .then( res => {
          expect(res.status).to.equal(204);
          done();
        })
        .catch(done);
      });
    });
  });

});
