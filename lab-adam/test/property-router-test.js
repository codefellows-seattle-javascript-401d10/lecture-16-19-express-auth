'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const server = require('../server.js');
const User = require('../model/user.js');
const Property = require('../model/property.js');

const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'stelle',
  password: '1234',
  email: 'adamstelle@gmail.com',
};

const exampleProperty = {
  name: 'fake property',
  description: 'corner 2 bedroom lot',
  address: '1533 25th Ave, Seattle, WA, 98122',
  spareBedrooms: 1,
};

const updatedProperty = {
  name: 'second fake property',
  description: 'Suburban 3 story junker',
  address: '111 Jackson St',
  spareBedrooms: 2,
};

mongoose.Promise = Promise;

describe('testing /api/property', function(){
  before(done => {
    if (!server.isRunning){
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        console.log('server up');
        done();
      });
      return;
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
  afterEach(done => {
    Promise.all([
      User.remove({}),
      Property.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });
  describe('testing POST to /api/property', () => {
    before(done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });
    describe('with valid user and body', () => {
      it('should return a valid Property json object', done => {
        request.post(`${url}/api/property`)
        .send(exampleProperty)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          for (var i in exampleProperty) {
            expect(res.body[i]).to.equal(exampleProperty[i]);
          }
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('with no token or invalid token', () => {
      it('should return a 401', done => {
        request.post(`${url}/api/property`)
        .send(exampleProperty)
        .set({
          Authorization: 'Bearer invalid token!',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('with no body or invalid body', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/property`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
          'Content-Type': 'application/json',
        })
        .send('{')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });
  describe('testing GET to /api/property/:id', () => {
    before(done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        exampleProperty.userID = this.tempUser._id.toString();
        new Property(exampleProperty).save()
        .then(property => {
          this.tempProperty = property;
          done();
        })
        .catch(done);
      })
      .catch(done);
    });
    after(() => {
      delete exampleProperty.userID;
    });
    describe('with valid ID & auth', () => {
      it('should return a Property', done => {
        request.get(`${url}/api/property/${this.tempProperty._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          for (var i in exampleProperty) {
            expect(res.body[i]).to.equal(exampleProperty[i]);
          }
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('with no token or invalid token', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/property/${this.tempProperty._id}`)
        .set({
          Authorization: 'Bearer 1234FAKETOKEN',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('with invalid ID', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/property/invalidID`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          console.log(err);
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('testing PUT to /api/property/:id', () => {
    before(done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        exampleProperty.userID = this.tempUser._id.toString();
        new Property(exampleProperty).save()
        .then(property => {
          this.tempProperty = property;
          done();
        })
        .catch(done);
      })
      .catch(done);
    });
    after(() => {
      delete exampleProperty.userID;
    });
    describe('with valid ID, permissions & body', () => {
      it('should return a Property', done => {
        request.put(`${url}/api/property/${this.tempProperty._id}`)
        .send(updatedProperty)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          for (var i in updatedProperty) {
            expect(res.body[i]).to.equal(updatedProperty[i]);
          }
          expect(res.body.userID).to.equal(exampleProperty.userID);
          done();
        });
      });
    });
    describe('with no token or invalid token', () => {
      it('should return a 401', done => {
        request.put(`${url}/api/property/${this.tempProperty._id}`)
        .send(updatedProperty)
        .set({
          Authorization: 'Bearer invalid token! ',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('with no body or invalid body', () => {
      it('should return a 400', done => {
        request.put(`${url}/api/property/${this.tempProperty._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
          'Content-Type': 'application/json',
        })
        .send('{')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('with invalid ID', () => {
      it('should return a 404 error', done => {
        request.put(`${url}/api/property/invalidID`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .send(updatedProperty)
        .end((err, res) => {
          console.log(err);
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('testing DELETE to /api/property/:id', () => {
    before(done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        exampleProperty.userID = this.tempUser._id.toString();
        new Property(exampleProperty).save()
        .then(property => {
          this.tempProperty = property;
          done();
        })
        .catch(done);
      })
      .catch(done);
    });
    after(() => {
      delete exampleProperty.userID;
    });
    describe('with valid ID & auth', () => {
      it('should return a 204', done => {
        request.delete(`${url}/api/property/${this.tempProperty._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
    describe('with no token or invalid token', () => {
      it('should return a 401 error', done => {
        request.delete(`${url}/api/property/${this.tempProperty._id}`)
        .set({
          Authorization: 'Bearer 1234FAKETOKEN',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('with invalid ID', () => {
      it('should return a 404 error', done => {
        request.delete(`${url}/api/property/invalidID`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          console.log(err);
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('testing GET to /api/property/', () => {
    beforeEach(done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        exampleProperty.userID = this.tempUser._id.toString();
        var i = 0;
        function createProperties(){
          i++;
          if(i >= 200) return;
          new Property(exampleProperty).save()
          .then(createProperties(i))
          .catch(done);
        }
        createProperties();
        done();
      })
      .catch(done);
    });
    after(() => {
      delete exampleProperty.userID;
    });
    describe('with valid token', () => {
      it('should return an array of Property IDs', done => {
        request.get(`${url}/api/property`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.body).to.be.length(50);
          expect(res.body).to.be.instanceOf(Array);
          done();
        });
      });
    });
    describe('with pagesize=100', () => {
      it('should return a list of 100 property IDs', done => {
        request.get(`${url}/api/property?pagesize=100`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.body).to.be.length(100);
          done();
        });
      });
    });
  });
});
