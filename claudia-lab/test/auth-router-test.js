'use strict';

//const debug = require('debug')('fruit:server');
const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const User = require('../model/user.js');

const server = require('../server.js');
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'hellokitty',
  password: '1234',
  email: 'chicken@nuggets.com',
};

describe('testing auth router', function() {
/////////////////////////////////////////////////////
// TESTING POST - SIGNUP
  describe('testing POST /api/signup', function() {
    describe('with a valid body', function() {
      //removes user after each test
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });
      //test for POST response code 200
      it ('should return a token', (done)=> {
        request.post(`${url}/api/signup`)
        .send(exampleUser) //send it example user to test
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      }); //end it block
    }); //end describe- with valid body


    describe('with an invalid body or no body', () => {
      //test for POST response code 400
      it ('should respond with 401 error', done => {
        request.post(`${url}/api/signup`)
        .send({}) //send it empty body
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      }); //end it block
    }); //end describe block - invalid body

  //Testing for routes not registered
    describe('testing for unregistered routes', () => {
      it('should return error 404- not found', done => {
        request.post(`${url}/api/asdfasdf`)
        .send(exampleUser) //send it empty body
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      }); //end it block
    });

  }); // end describe block - testing POST
/////////////////////////////////////////////////////
//TESTING GET - LOGIN
  describe('testing GET /api/login', function() {

    describe('with a valid basic auth header', function() {
      before( done => {
        let user  =  new User(exampleUser);
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

      it ('should return a token', (done)=> {
        request.get(`${url}/api/login`) //.auth - creates basic auth header (built into superagent)
        .auth('hellokitty', '1234')
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      }); //end it block
    }); //end describe with a valid basic auth header

    describe('user can not be authenticated', () => {
      it ('should respond with error 401- cannot be authenticated', done => {
        request.get(`${url}/api/login`) //.auth - creates basic auth header (built into superagent)
        .auth('hellokitty')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      }); //end it block
    }); //end describe with user can't be authenticated

    //Testing for routes not registered
    describe('testing for unregistered routes', () => {
      it('should return error 404- not found', done => {
        request.get(`${url}/api/asdfasdf`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      }); //end it block
    }); //end describe testing for unregistered routes

  });  // end describe testing GET api/login
}); //end first describe block
