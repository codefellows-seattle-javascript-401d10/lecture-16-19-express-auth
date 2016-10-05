'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const User = require('../model/user.js');

mongoose.Promise = Promise;

const server = require('../server.js');
const url =  `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'judy',
  password: '1234',
  email: 'judy@fakeaddy.com'
};

describe('testing auth-router', function(){

  before(done => {
    if (!server.isRunning){
      server.listen(process.env.PORT), () => {
        server.isRunning = true;
        console.log('server up');
        done();
      };
      return;
    }
    done();
  });

  after(done => {
    if(server.isRunning){
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


  //POST request status 200 with returned token
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
  });

  // POST 400 test with invalid body
  describe('testing POST request /api/signup', function(){
    describe('with invalid body or no body provided', function(){
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return status 400 for invalid body/no body provided', (done) => {
        request.post(`${url}/api/signup`)
        .set('Content-type', 'application/json')
        .send('{')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });


  //GET test 200
  describe('testing GET /api/login', function(){
    describe('with valid body', function(){
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempuser = user;
          done();
        })
        .catch(done);
      });

      after ( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      //GET test 200 for returned token
      it('should return a token', (done) => {
        request.get(`${url}/api/login`)
        .auth('judy', '1234')
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });
  });

  //GET test 401 if users cannot be authenticated
  describe('testing GET /api/login', function(){
    describe('when user cannot be authenticated', function(){
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempuser = user;
          done();
        })
        .catch(done);
      });

      after ( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return status 401 when user cannot be authenticated', (done) => {
        request.get(`${url}/api/login`)
        .auth('judy','badpassword')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
});
