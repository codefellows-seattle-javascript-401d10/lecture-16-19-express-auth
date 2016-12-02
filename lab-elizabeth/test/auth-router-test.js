'use strict';

require('./lib/test-env');
require('./lib/aws-mock');

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');

const serverCtrl = require('./lib/server-ctrl');
const dbClean = require('./lib/db-clean');
const mockUser = require('./lib/mock-user');

mongoose.Promise = Promise;

const server = require('../server');
const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'J.R.R.Tolkien',
  password: '1ring',
  email: 'hobbits@theshire.middleearth',
};

describe('testing auth-router', function(){

  before(done => serverCtrl.serverUp(server, done));

  after(done => serverCtrl.serverDown(server, done));

  afterEach(done => dbClean(done));

  describe('POST /api/signup', function(){
    describe('with valid body', function(){

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.not.equal(true);
          done();
        });
      });
    });

    describe('with invalid body', function(){

      afterEach(done => {
        exampleUser.username = 'J.R.R.Tolkien';
        exampleUser.password = '1ring';
        exampleUser.email = 'hobbits@theshire.middleearth';
        done();
      });

      it('should return status: 400', done => {
        exampleUser.username = '';
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.password = '';
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.email = '';
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.username = '';
        exampleUser.password = '';
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.username = '';
        exampleUser.email = '';
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.password = '';
        exampleUser.email = '';
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.username = '';
        exampleUser.password = '';
        exampleUser.email = '';
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

    });

  });

  describe('GET /api/login', function(){

    describe('with valid body', function(){

      before(done => mockUser.call(this, done));

      it('should return a token', done => {
        request.get(`${url}/api/login`)
        .auth(this.tempUser.username, this.tempPassword)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.not.equal(true);
          done();
        });
      });

    });

    describe('with invalid body', function(){

      before(done => mockUser.call(this, done));

      it('should return status: 401', done => {
        request.get(`${url}/api/login`)
        .auth('J.R.R.Tolkien', '')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });

      it('should return status: 401', done => {
        request.get(`${url}/api/login`)
        .auth('J.R.R.Tolkien', 'noRing')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });

      it('should return status: 401', done => {
        request.get(`${url}/api/login`)
        .auth('', '1ring')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });

      it('should return status: 401', done => {
        request.get(`${url}/api/login`)
        .auth('Gollum', 'hobbitsies')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });

    });
  });
});
