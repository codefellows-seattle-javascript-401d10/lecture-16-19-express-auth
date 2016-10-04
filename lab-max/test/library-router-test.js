'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('meekslib:library-route-test');

const server = require('../server.js');
const User = require('../model/user.js');
const Library = require('../model/library.js');

const url = `http://localhost:${process.env.PORT}`;

mongoose.Promise = Promise;

const exampleUser = {
  username: 'meeks',
  password: '12345',
  email: 'meeks@meeks.com',
};

const exampleLibrary = {
  name: 'maxs travels',
  genre: 'travel',
};

const updateLibrary = {
  name: 'other adventures',
  genre: 'sports',
};

describe('testing /api/library', function(){

  before(done => {
    debug('before module library-router-test');
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
    debug('after module library-router-test');
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

  afterEach(done => {
    Promise.all([
      User.remove({}),
      Library.remove({}),
    ])
    .then(() => done())
    .catch(done);
  });

  describe('testing unregistered route', function(){
    it('should return a 404 error', done => {
      request.get(`${url}/api/pizza/12345`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('testing POST routes to /api/library', function(){
    describe('testing valid POST', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      it('should return a library', done => {
        request.post(`${url}/api/library`)
        .send(exampleLibrary)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleLibrary.name);
          expect(res.body.genre).to.equal(exampleLibrary.genre);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });

    describe('testing invalid POST', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      it('should return a 401 error for unauthorized access', done => {
        request.post(`${url}/api/library`)
        .send(exampleLibrary)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('testing invalid POST', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      it('should return a 400 error for invalid body', done => {
        let badLibrary = {
          name: 10,
          genre: '',
        };
        request.post(`${url}/api/library`)
        .send(badLibrary)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('testing GET routes to /api/library/:id', function(){
    describe('testing valid GET request', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
        })
        .then(() => {
          exampleLibrary.userID = this.tempUser._id.toString();
          new Library(exampleLibrary).save()
          .then( library => {
            this.tempLibrary = library;
            done();
          });
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a library', done => {
        request.get(`${url}/api/library/${this.tempLibrary._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleLibrary.name);
          expect(res.body.genre).to.equal(exampleLibrary.genre);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });

    describe('testing invalid GET request', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
        })
        .then(() => {
          exampleLibrary.userID = this.tempUser._id.toString();
          new Library(exampleLibrary).save()
          .then( library => {
            this.tempLibrary = library;
            done();
          });
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a 401 error for unauthorized/no token/bad token', done => {
        request.get(`${url}/api/library/${this.tempLibrary._id}`)
        .set({
          Authorization: '12345',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('testing invalid GET request', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a 404 error for valid request with id not found', done => {
        request.get(`${url}/api/library/12345`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('testing PUT routes to /api/library/:id', function(){
    describe('testing valid PUT request', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
        })
        .then(() => {
          exampleLibrary.userID = this.tempUser._id.toString();
          new Library(exampleLibrary).save()
          .then( library => {
            this.tempLibrary = library;
            done();
          });
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return an updated library', done => {
        request.put(`${url}/api/library/${this.tempLibrary._id}`)
        .send(updateLibrary)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(updateLibrary.name);
          expect(res.body.genre).to.equal(updateLibrary.genre);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });

    describe('testing invalid PUT request', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
        })
        .then(() => {
          exampleLibrary.userID = this.tempUser._id.toString();
          new Library(exampleLibrary).save()
          .then( library => {
            this.tempLibrary = library;
            done();
          });
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a 401 error for no token provided', done => {
        request.put(`${url}/api/library/${this.tempLibrary._id}`)
        .send(updateLibrary)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('testing valid PUT request', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
        })
        .then(() => {
          exampleLibrary.userID = this.tempUser._id.toString();
          new Library(exampleLibrary).save()
          .then( library => {
            this.tempLibrary = library;
            done();
          });
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a 400 error for invalid body', done => {
        request.put(`${url}/api/library/${this.tempLibrary._id}`)
        .send('{')
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('testing valid PUT request', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a 404 error for id not found', done => {
        request.put(`${url}/api/library/12345`)
        .send(updateLibrary)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('testing DELETE routes to /api/library/:id', function(){
    describe('testing valid DELETE', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
        })
        .then(() => {
          exampleLibrary.userID = this.tempUser._id.toString();
          new Library(exampleLibrary).save()
          .then( library => {
            this.tempLibrary = library;
            done();
          });
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a 204 status code for successful delete', done => {
        request.delete(`${url}/api/library/${this.tempLibrary._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });

    describe('testing valid DELETE', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
        })
        .then(() => {
          exampleLibrary.userID = this.tempUser._id.toString();
          new Library(exampleLibrary).save()
          .then( library => {
            this.tempLibrary = library;
            done();
          });
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a 401 status code for no token/bad token', done => {
        request.delete(`${url}/api/library/${this.tempLibrary._id}`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('testing valid DELETE', function(){

      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a 404 status code for invalid id', done => {
        request.delete(`${url}/api/library/11111`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
