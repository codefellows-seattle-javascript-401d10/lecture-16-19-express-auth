'use strict';

//const debug = require('debug')('auth:test');
const expect = require('chai').expect;
const request = require('superagent'); // makes ajax requests
const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const User = require('../model/user.js');

const server = require('../server.js');
const url = `http://localhost:${process.env.PORT}`;

// exampleUser for mock data
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
          // token is on res.text, res.body is ONLY JSON
          // only know that there is a token, not what it is
          // (randomly generated each signup and login)
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      }); //end it block
    }); //end describe- with valid body

    //test for POST response code 400 - Bad Request
    describe('with an invalid body or no body', () => {
      it ('should respond with 400 bad request', (done)=> {
        request.post(`${url}/api/signup`)
        .set('Content-type', 'application/json')
        .send('asdfasdf')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      }); //end it block
    }); //end describe block - invalid body

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
          this.tempuser = user; // can remove since we are only looking for tokens
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
        .auth('hellokitty', '1234') //sending the base64 encoded auth header
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text); //get a token back
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      }); //end it block
    }); //end describe with a valid basic auth header

    describe('user can not be authenticated', () => {
      it ('should respond with error 401- cannot be authenticated', done => {
        request.get(`${url}/api/login`) //.auth - creates basic auth header (built into superagent)
        .auth('hellokitty', '')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      }); //end it block
    }); //end describe with user can't be authenticated

    //Testing for routes not registered
    describe('testing for unregistered routes', () => {
      it('should return error 404- not found', done => {
        request.get(`${url}/api/gooseroute`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      }); //end it block
    }); //end describe testing for unregistered routes

  });  // end describe testing GET api/login
}); //end first describe block
