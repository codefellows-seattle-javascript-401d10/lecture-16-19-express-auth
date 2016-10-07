'use strict';

require('./lib/aws-mocks');

// npm modules
const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');
// const AWS = require('aws-sdk-mock');

// app modules
const User = require('../model/user');
const serverControl = require('./lib/server-control');

mongoose.Promise = Promise;

// starting the server
const server = require('../server.js');

// module constants
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'steveguy',
  password: '12345',
  email: 'blerpderp@blerp.com',
};

describe('testing auth-router', function() {

  before(done => {
    serverControl.serverUp(server, done);
  });
  // Turn server off before tests
  after(done => {
    serverControl.serverDown(server, done);
  });

  describe('testing POST /api/signup', function() {

    describe('with valid body', function() {

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token and status 200', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });

    describe('with no body or invalid body', function() {

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
        .set('Content-Type', 'application/json')
        .send('crap')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('testing GET /api/login', function() {

    describe('with valid request id', function() {

      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempuser = user;
          done();
        });
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/login`)
        .auth('steveguy', '12345')
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          console.log('res.text', res.text);
          done();
        });
      });
    });

    describe('with invalid body', function() {

      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempuser = user;
          done();
        });
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should not authenticate', done => {
        request.get(`${url}/api/login`)
        .auth('steveguy', '99999')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
});
