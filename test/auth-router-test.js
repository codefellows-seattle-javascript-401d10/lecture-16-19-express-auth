'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');

const Gallery = require('../model/gallery.js');
const User = require('../model/user.js');

const server = require('../server.js');

mongoose.Promise = Promise;

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'logan',
  password: '12345',
  email: 'logan@logan.com',
};

describe('testing auth router', function(){

  before( done => {
    if (!server.isRunning){
      server.listen(process.env.PORT, () => {
        console.log('server up');
        done();
      });
      return;
    }
    done();
  });

  after( done => {
    if (server.isRunning){
      server.close(err => {
        if (err) return done(err);
        console.log('server down');
        done();
      });
      return;
    }
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  describe('testing POST /api/signup', function(){

    describe('with valid body', function(){

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', (done) => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });
    describe('with invalid body', function(){

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', (done) => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(401);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });

    describe('with bad path', function(){

      it('should return a token', (done) => {
        request.get(`${url}/api/badpath`)
        .auth('logan', '12345')
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(400);
          expect(!!res.text).to.equal(true);
          done();
        });
        done();
      });
    });
  });

  describe('testing GET /api/login', function(){

    describe('with valid body', function(){

      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( () => done())
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', (done) => {
        request.get(`${url}/api/login`)
        .auth('logan', '12345')
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
        done();
      });
    });

    describe('with invalid body', function(){

      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempuser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', (done) => {
        request.get(`${url}/api/login`)
        .auth('logan', '12345')
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
        done();
      });
    });

    describe('with bad path', function(){

      it('should return a token', (done) => {
        request.get(`${url}/api/badpath`)
        .auth('logan', '12345')
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(400);
          expect(!!res.text).to.equal(true);
          done();
        });
        done();
      });
    });
  });
});
