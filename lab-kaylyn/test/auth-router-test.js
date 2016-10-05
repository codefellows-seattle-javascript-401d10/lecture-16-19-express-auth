'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const User = require('../model/user.js');

mongoose.Promise = Promise;

const server = require('../server.js');
const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'pudge',
  password: '1234',
  email: 'pudge@pudge.life',
};

describe('testing auth-router', function(){

  before( done => {
    if(!server.isRunning){
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        console.log('server up');
        done();
      });
      return;
    }
    done();
  });

  //when all the tests are done, kill server
  after(done => {
    if(server.isRunning){
      server.close(err => {
        if(err) return done(err);
        server.isRunning = false;
        console.log('server down');
        done();
      });
      return;
    }
    done();
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

      describe('testing invalid POST requests /api/signup', () => {

        it('should return a 400 status code for bad request', (done) => {
          request.post(`${url}/api/signup`)
          .send({username: 666, password: '', email:''})
          .end((err, res) => {
            expect(res.status).to.equal(400);
            done();
          });
        });
      });
    });
  });

  describe('testing GET /api/signup', function(){

    describe('with valid body', function(){

      before( done => {
        let user  =  new User(exampleUser); // mocks
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
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
        .auth('pudge', '1234')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });

      describe('testing invalid GET requests /api/signup', () => {
        
        it('should return 401 status code if users cannot be authenticated', (done) => {
          request.get(`${url}/api/login`)
          .auth('pudge', '666')
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
        });
      });
    });
  });
});
