'use strict';

//node modules
const fs = require('fs');

//npm modules
const expect = require('chai').expect;
const debug = require('debug')('logan:pic-router-test');

//app modules
const Gallery = require('../model/gallery.js');
const User = require('../model/user.js');
const formRequest = require('./lib/form-request.js');

//module constants
const server = require('../server.js');
const url = 'http://localhost:3000';
const exampleUser = {
  username: 'exampleUsername',
  password: '1234',
  email: 'l@logan.net',
};

const exampleGallery = {
  name: 'beach fun',
  desc: 'too much sand',
  created: new Date(),
};

const examplePic = {
  name: 'sun',
  desc: 'bright',
  image: fs.createReadStream(`${__dirname}/data/18649821.png`),
};

describe('testing pic-router', function(){

  afterEach(done => {
    debug('clean up database');
    console.log('removing things');
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });


  describe('testing post /api/gallery/:id/pic', function(){
    describe('with valid token and data', function(){
      before(done => {
        debug('create mock user');
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });

      after(() => {
        debug('clean up userID from exampleGallery');
        delete exampleGallery.userID;
        delete exampleUser.userID;
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

      it('should return a pic', done => {
        formRequest(`${url}/api/gallery/${this.tempGallery._id}/pic`,  examplePic)
        .then( res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.desc).to.equal(examplePic.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          //expect(res.body.imageURI).to.equal('http://lulwat/img.pic')
          done();
        })
        .catch(done);
      });
    });
  });
});
