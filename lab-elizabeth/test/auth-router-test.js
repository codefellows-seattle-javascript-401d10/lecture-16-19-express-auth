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

    describe('with invalid body', function(){

      after(done => {
        debug('removing user');
        User.remove({})
        .then(() => done())
        .catch(done);
      });

      afterEach(done => {
        debug('resetting exampleUser');
        exampleUser.username = 'J.R.R.Tolkien';
        exampleUser.password = '1ring';
        exampleUser.email = 'hobbits@theshire.middleearth';
        done();
      });

      it('should return status: 400', done => {
        exampleUser.username = null;
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.password = null;
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.email = null;
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.username = null;
        exampleUser.password = null;
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.username = null;
        exampleUser.email = null;
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.password = null;
        exampleUser.email = null;
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err) => {
          expect(err.status).to.equal(400);
          done();
        });
      });

      it('should return status: 400', done => {
        exampleUser.username = null;
        exampleUser.password = null;
        exampleUser.email = null;
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
        request.get(`${url}/api/login`)
        .auth('J.R.R.Tolkien', '1ring')
        .end((err, res) => {
          if(err) return done(err);
          debug('res', res);
          expect(res.status).to.equal(200);
          expect(res.text).to.not.equal(true);
          done();
        });
      });

    });

    describe('with invalid body', function(){

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
