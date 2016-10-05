'use strict';

const fs = require('fs');
const expect = require('chai').expect;
const debug = require('debug')('catgram:pic-router-test');
const User = require('../model/user');
const Gallery = require('../model/gallery');
const formRequest = require('./lib/form-request');

const server = require('../server.js');
const url = 'http://localhost:3000';

const exampleUser = {
  username: 'slugbyte',
  password: '1234',
  email: 'slug@slug.slug',
};

const exampleGallery = {
  name: 'beach adventure',
  desc: 'not enough sun screan ouch',
};

const examplePic = {
  name: 'mean cats',
  desc: 'hella mean cats',
  image: fs.createReadStream(`${__dirname}/data/shield.png`),
};

describe('testing routes /api/gallery/:id/pic', function(){

  before( done => {
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

  //when all the tests are done, kill server
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
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  describe('testing POST /api/gallery/:id/pic', function(){
    describe('with valid token and data', function(){
      //mock a user and gallery
      before(done => {
        debug('create user');
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
        delete exampleGallery.userID;
      });

      it('should return a pic', done => {
        formRequest(`/api/gallery/${this.tempGallery._id}/pic`, this.tempToken, examplePic)
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
});
