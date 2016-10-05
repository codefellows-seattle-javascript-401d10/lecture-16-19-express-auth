'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

const server = require('../server.js');
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'stelle',
  password: '1234',
  email: 'adamstelle@gmail.com',
};

describe('testing auth-router', function(){
  before(done => {
    if (!server.isRunning){
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        console.log('server up');
        done();
      });
    }
    done();
  });
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
      after(done => {
        User.remove()
        .then(() => done())
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
      it('should return a 400', (done) => {
        request.post(`${url}/api/signup`)
        .send({
          username: 1234,
          password: 'not a string',
          email: '',
        })
        .end((err, res) => {
          console.log(err);
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });
  describe('testing GET /api/login', function(){
    describe('with valid credentials', function(){
      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(() => done());
      });
      after(done => {
        User.remove()
        .then(() => done())
        .catch(done);
      });
      it('should return a token', (done) => {
        request.get(`${url}/api/login`)
        .auth('stelle', '1234')
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text is ', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });
    describe('with invalid credentials', function(){
      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempuser = user;
          done();
        });
      });
      after(done => {
        User.remove()
        .then(() => done())
        .catch(done);
      });

      it('should return a token', (done) => {
        request.get(`${url}/api/login`)
        .auth('stelle', 'badpassword')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.text).to.equal('UnauthorizedError');
          done();
        });
      });
    });
  });
  describe('testing invalid routes', function(){
    it('should return a 404', (done) => {
      request.get(`${url}/api/badurl`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });
});
