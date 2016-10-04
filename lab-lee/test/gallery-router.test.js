'use strict';

// npm modules
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

// app modules
const server = require('../server.js');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');
const debug = require('debug')('leegram:gallery-route-test');

// variable constants
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'steveguy',
  password: '1234',
  email: 'blerpderp@blerp.com',
};

const exampleGallery = {
  name: 'cool time party',
  desc: 'it was a cool party',
};

// config
mongoose.Promise = Promise;

describe('Testing /api/gallery routes', function() {

  // Turn server on before tests
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

  // Turn server off before tests
  after( done => {
    if (server.isRunning) {
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
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  describe('testing POST to /api/gallery', () => {

    before( done => {
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

    it('should return a gallery and status 200', done => {

      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('no token, so should return unauthorized and status 401', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('no body, so should return bad request and status 400', done => {
      request.post(`${url}/api/gallery`)
      .set('Content-Type', 'application/json')
      .send('notjson')
      .set({
        'Authorization': `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
  });

  describe('testing GET to /api/gallery:id', () => {

    before( done => {
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

    it('valid token, so should return gallery and status 200', done => {

      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('no token, so should return unauthorized and status 401', done => {

      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('invalid id, so should return not found and status 404', done => {

      request.get(`${url}/api/gallery/`)
      .set({
        'Authorization': `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('testing PUT to /api/gallery/:id', () => {

    before( done => {
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

    it('should update an existing gallery by ID and status 200', done => {
      let updateData = {name:'bob'};
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .send(updateData)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal('bob');
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('no token, so should return unauthorized and status 401', done => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .send(exampleGallery)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('no body, so should return bad request and status 400', done => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .set('Content-Type', 'application/json')
      .send('notjson')
      .set({
        'Authorization': `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });

    it('invalid id, so should return not found and status 404', done => {

      request.put(`${url}/api/gallery/bad`)
      .send(exampleGallery)
      .set({
        'Authorization': `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('testing DELETE to /api/gallery:id', () => {

    before( done => {
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

    it('valid token, so should delete gallery and status 204', done => {

      request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(204);
        done();
      });
    });

    it('no token, so should return unauthorized and status 401', done => {

      request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('invalid id, so should return not found and status 404', done => {

      request.delete(`${url}/api/gallery/`)
      .set({
        'Authorization': `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });
});
