'use strict';

// node modules
const fs = require('fs');

// npm modules
const expect = require('chai').expect;
// const request = require('superagent');
const mongoose = require('mongoose');
const debug = require('debug')('leegram:pic-router-test');

// app modules
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');
const Pic = require('../model/pic.js');
const formRequest = require('./lib/form-request');

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
  image: fs.createReadStream(`${__dirname}/data/hufflepuff.jpg`),
};

// config
mongoose.Promise = Promise;

describe('testing pic router', function() {

  before(done => {
    if (!server.isRunning){
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        debug('server up');
        done();
      });
      return;
    }
    done();
  });

  // Turn server off before tests
  after(done => {
    if (server.isRunning) {
      server.close(err => {
        if (err) return done(err);
        server.isRunning = false;
        debug('server down');
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
        formRequest(`${url}/api/gallery/${this.tempGallery._id}/pic`, examplePic)
        .then( res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.desc).to.equal(examplePic.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          done();
        })
        .catch(done);
      });
    });
  });

  // describe('testing DELETE /api/gallery/:galleryID/pic/:picID', function() {
  //
  //   describe('with valid token and data', function() {
  //
  //     before( done => {
  //       debug('create mock User');
  //       new User(exampleUser)
  //       .generatePasswordHash(exampleUser.password)
  //       .then( user => user.save())
  //       .then( user => {
  //         this.tempUser = user;
  //         return user.generateToken();
  //       })
  //       .then( token => {
  //         this.tempToken = token;
  //         done();
  //       })
  //       .catch(done);
  //     });
  //
  //     before( done => {
  //       debug('create gallery');
  //       exampleGallery.userID = this.tempUser._id.toString();
  //       new Gallery(exampleGallery).save()
  //       .then( gallery => {
  //         this.tempGallery = gallery;
  //         done();
  //       })
  //       .catch(done);
  //     });
  //
  //     before( done => {
  //       formRequest(`${url}/api/gallery/${this.tempGallery._id}/pic`, examplePic);
  //       done();
  //     });
  //
  //     after(() => {
  //       debug('clean up userID from exampleGallery');
  //       delete exampleGallery.userID;
  //       delete examplePic.galleryID;
  //     });
  //
  //     it('should return a pic', done => {
  //       request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${examplePic._id}`)
  //       .set({
  //         Authorization: `Bearer ${this.tempToken}`,
  //       })
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         expect(res.status).to.equal(204);
  //         done();
  //       });
  //     });
  //   });
  // });
});
