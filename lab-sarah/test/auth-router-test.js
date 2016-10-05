'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const User = require('../model/user.js');

mongoose.Promise = Promise;

require('../server.js');
const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'sarah',
  password: '4747',
  email: 'sarah@sarah.com',
};

describe('testing auth-router', function(){
  afterEach(done => {
    User.remove({})
    .then(() => done())
    .catch(done);
  });
  describe('testing POST /api/signup', function(){
    describe('with valid body', function(){


      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    }); //end of POST with valid body

    describe('with invalid body', function() {

      it('should return a 400 error', (done) => {
        request.post(`${url}/api/signup`)
        .set('Content-Type', 'application/json')
        .send('asdf')
        .end((err, res) => {
          console.log('res.status', res.status);
          expect(res.status).to.equal(400);
          done();
        });
      });

    }); //end of POST test with invalid body
  });

  describe('testing GET /api/signup', function(){
    describe('with valid body', function(){
      before( done => {
        let user  =  new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(() => done())
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', (done) => {
        request.get(`${url}/api/login`)
        .auth('sarah', '4747')
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      }); //end of it block: should return a token
    }); //end of describe 'with valid body'

    describe('testing GET request from unauthenticated user', function() {
      before( done => {
        let user  =  new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(() => done())
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a 401 error', (done) => {
        request.get(`${url}/api/login`)
        .auth('sarah', 'wrongpassword')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });

    }); //end of GET test with unauthenticated user

    describe('testing GET request to unregistered route', function() {
      it('should return a 404 error', (done) => {
        request.get(`${url}/WRONG`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  }); //end of GET tests
});
