'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const request = require('superagent');
const expect = require('chai').expect;

const User = require('../model/user');

mongoose.Promise = Promise;

const server = require('../server');
const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'J.R.R.Tolkien',
  password: '1ring',
  email: 'hobbits@theshire.middleearth',
};

describe('auth-router', function(){

  before()

  describe('POST /api/signup', function(){

    describe('with valid body', function(){

      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if(err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });

    });

  });

  describe('GET /api/signup', function(){

    describe('with valid body', function(){

      before(done => {
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
        User.remove({})
        .then(() => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api.login`)
        .auth('J.R.R.Tolkien', '1ring')
        .end((err, res) => {
          if(err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });

    });

  });

});
