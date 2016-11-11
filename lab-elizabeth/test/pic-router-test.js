'use strict';

// node modules
const fs = require('fs');

// npm modules
const expect = require('chai').expect;
const debug = require('debug')('bookstagram:pic-router-test');

// app modules
const User = require('../model/user');
const Gallery = require('../model/gallery');
const formRequest = require('./lib/form-request');

// module constants
const server = require('../server');
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'J.R.R.Tolkien',
  password: '1ring',
  email: 'hobbits@theshire.middleearth',
};

const exampleGallery = {
  name: 'That trip to Mordor',
  desc: 'the eagles said they would meet us, they were late',
};

const examplePic = {
  name: 'map',
  desc: 'we do not want to get lost on this trip, we have to walk the whole way!',
  image: fs.createReadStream(`${__dirname}/data/map.png`),
};

describe('testing pic-router', function(){

  before(done => {
    if(!server.isRunning){
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        debug('server up');
        done();
      });
      return;
    }
    done();
  });

  after(done => {
    if(server.isRunning){
      server.close(err => {
        if(err) return done(err);
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
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST /api/gallery/:id/pic', function(){

    describe('with valid token and data', function(){

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

      after(() => {
        debug('clean up userID from exampleGallery');
        delete exampleGallery.userID;
      });

      before(done => {
        debug('create gallery');
        exampleGallery.userID = this.tempUser._id.toString();
        new Gallery(exampleGallery).save()
        .then(gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      it('should return a pic', done => {
        formRequest(`${url}/api/gallery/${this.tempGallery._id}/pic`, this.tempToken, examplePic)
        .then(res => {
          console.log(res.body);
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

});
