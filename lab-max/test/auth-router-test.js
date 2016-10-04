'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const server = require('../server.js');
const debug = require('debug')('meekslib:auth-router-test');

mongoose.promise = Promise;


const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'meeks',
  password: '12345',
  email: 'meeks@meeks.com',
};

describe('testing auth-router', function(){

  before(done => {
    debug('before module auth-router-test');
    if (!server.isRunning) {
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
    debug('after module auth-router-test');
    if (server.isRunning) {
      server.close(() => {
        server.isRunning = false;
        debug('server down');
        done();
      });
      return;
    }
    done();
  });

  describe('testing unregistered route', function(){
    it('should return a 404 error for unregistered route', done => {
      request.get(`${url}/api/pizza`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('testing POST /api/signup', function(){
    describe('with valid body', function(){

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
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

      it('should respond with a 400 validation error', done => {
        let badUser = {
          username: 5,
          password: 'house',
          email: '',
        };
        request.post(`${url}/api/signup`)
        .send(badUser)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });
  });

  describe('testing GET /api/login', function(){
    describe('with valid body', function(){

      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then( () => done())
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/login`)
        .auth('meeks', '12345')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });

    describe('with invalid body', function(){

      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return 401 error for user not being authenticated/unauthorized', done => {
        request.get(`${url}/api/login`)
        .auth('meeks', '99999')
        .end((err, res) => {
          console.log('res-text',res.text);
          expect(res.status).to.equal(401);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });
  });
});
