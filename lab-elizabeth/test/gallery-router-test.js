'use strict';

require('./lib/test-env');
require('./lib/aws-mock');

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const server = require('../server');
const serverCtrl = require('./lib/server-ctrl');
const dbClean = require('./lib/db-clean');
const mockUser = require('./lib/mock-user');
const mockGallery = require('./lib/mock-gallery');

const url = `http://localhost:${process.env.PORT}`;

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

  before(done => serverCtrl.serverUp(server, done));

  after(done => serverCtrl.serverDown(server, done));

  afterEach(done => dbClean(done));

  describe('POST /api/gallery', () => {

    describe('with valid gallery and user token', () => {

      before(done => mockUser.call(this, done));

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

      before(done => mockUser.call(this, done));

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

    describe('with valid user token and galleryID', () => {

      before(done => mockGallery.call(this, done));

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

      before(done => mockGallery.call(this, done));

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

    describe('with valid user token and galleryID', () => {

      before(done => mockGallery.call(this, done));

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

      before(done => mockGallery.call(this, done));

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
