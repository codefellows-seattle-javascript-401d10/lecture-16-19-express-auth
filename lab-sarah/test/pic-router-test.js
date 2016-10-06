'use strict';

//node modules
const fs = require('fs');

//npm modules
const expect = require('chai').expect;
const debug = require('debug')('sarahgram:pic-router-test');

//have to mock a user and gallery, so you have a token and can associate gallery to user. SO have to require in models
//app modules
const Gallery = require('../model/gallery.js');
const User = require('../model/user.js');
const formRequest = require('./lib/form-request.js');

//module constants
const server = require('../server.js');
const url = 'http://localhost:3000';

const exampleUser = {
  username: 'piper',
  password: '4747',
  email: 'piper@sarah.com',
};

const exampleGallery = {
  name: 'mountain adventure',
  description: 'too much uphill',
};

//will give it a pic with name, description, and uri, and we expect an object with ALL the proeprties of pic
const examplePic = {
  name: 'asgard',
  description: 'so very steep',
  image: fs.createReadStream(`${__dirname}/data/shield.png`),
};

describe('testing pic router', function() {
  before(done => {
    if (!server.isRunning){
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        console.log('server up');
        done();
      });
      return;
    }
    done();
  });

  after(done => {
    if (server.isRunning){
      server.close(err => {
        if (err) return done(err);
        server.isRunning = false;
        console.log('server down');
        done();
      });
      return;
    }
    done();
  });

  afterEach(done => {
    debug('clean up database');
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then(() => done())
    .catch(done);
  });

  describe('testing post /api/gallery/:id/pic', function() {
    describe('with valid token and data', function() {
      //mock a user and mock a gallery
      before(done => {
        debug('create user');
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      //make a temp gallery
      before(done => {
        debug('create gallery');
        exampleGallery.userID = this.tempUser._id;
        new Gallery(exampleGallery).save()
        .then(gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      after(() => {
        debug('clean up example gallery');
        delete exampleGallery.userID;
      });

      it('should return a pic', (done) => {
        debug('it should return a pic');
        formRequest(`${url}/api/gallery/${this.tempGallery._id}/pic`, this.tempToken, examplePic)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.description).to.equal(examplePic.description);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          done();
        })
        .catch(done);
      });

    });
  });

});
