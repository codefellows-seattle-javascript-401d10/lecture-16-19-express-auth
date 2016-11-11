'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('bookstagram:gallery-router-test');

const server = require('../server');
const User = require('../model/user');
const Gallery = require('../model/gallery');

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

const newGallery = {
  name: 'Totally rocking this ring',
  desc: 'time for a vacation, I wonder if there are any good hiking trips',
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

    describe('with valid gallery and user token', () => {

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

    describe('with invalid gallery or user token', () => {

      it('should return status: 401', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: '',
        })
        .end((err) => {
          expect(err.status).to.equal(401);
          done();
        });
      });

      it('should return status: 401', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: 'Gollum!',
        })
        .end((err) => {
          expect(err.status).to.equal(401);
          done();
        });
      });

      it('should return status: 400', done => {
        request.post(`${url}/api/gallery`)
        .send('')
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
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

    describe('with valid user token and galleryID', () => {

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

    describe('with invalid user token or galleryID', () => {

      it('should return status: 404', done => {
        request.get(`${url}/api/gallery/`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err) => {
          expect(err.status).to.equal(404);
          done();
        });
      });

      it('should return status: 401', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: '',
        })
        .end((err) => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });

  });

  describe('PUT /api/gallery/:id', () => {

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

    describe('with valid user token and galleryID', () => {

      it('should return a gallery', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(newGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.body.name).to.equal(newGallery.name);
          expect(res.body.desc).to.equal(newGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });

    describe('with invalid user token or galleryID', () => {

      it('should return status: 404', done => {
        request.put(`${url}/api/gallery/`)
        .send(newGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err) => {
          expect(err.status).to.equal(404);
          done();
        });
      });

      it('should return status: 400', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send('')
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 401', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(newGallery)
        .set({
          Authorization: '',
        })
        .end((err) => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });

  });
});
