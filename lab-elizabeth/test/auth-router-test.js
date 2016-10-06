'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const debug = require('debug')('bookstagram:auth-router-test');

const User = require('../model/user');

mongoose.Promise = Promise;

const server = require('../server');
const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'J.R.R.Tolkien',
  password: '1ring',
  email: 'hobbits@theshire.middleearth',
};

describe('testing auth-router', function(){

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

  describe('POST /api/signup', function(){

    describe('with valid body', function(){

      after(done => {
        debug('removing user');
        User.remove({})
        .then(() => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if(err) return done(err);
          debug('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(res.text).to.not.equal(true);
          done();
        });
      });

    });

  });

  describe('GET /api/signup', function(){

    describe('with valid body', function(){

      before(done => {
        debug('making user');
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempuser = user;
          done();
        })
        .catch(done);
      });

      after(done => {
        debug('removing user');
        User.remove({})
        .then(() => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api.login`)
        .auth('J.R.R.Tolkien', '1ring')
        .end((err, res) => {
          if(err) return done(err);
          debug('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(res.text).to.not.equal(true);
          done();
        });
      });

    });

  });

});
