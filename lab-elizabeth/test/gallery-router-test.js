'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('bookstagram:gallery-router-test');

const server = require('../server');
const User = require('../model/user');
const Gallery = require('../model/gallery');

const url = `http://localhose:${process.env.PORT}`;
const exampleUser = {
  username: 'J.R.R.Tolkien',
  password: '1ring',
  email: 'hobbits@theshire.middleearth',
};
const exampleGallery = {
  name: 'That trip to Mordor',
  desc: 'the eagles said they would meet us, they were late',
};

mongoose.Promise = Promise;

describe('testing gallery-router', function(){

  before(done => {
    debug('starting server');
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
    debug('closing server');
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
    debug('removing users/galleries');
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST /api/gallery', () => {
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

    it('should return a gallery', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

  });

  describe('GET /api/gallery/:id', () => {

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

    after(() => {
      delete exampleGallery.userID;
    });

    it('should return a gallery', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

  });

});
