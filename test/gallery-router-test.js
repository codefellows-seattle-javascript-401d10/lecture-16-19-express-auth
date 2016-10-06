'use strict';

//npm
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

//app
const User = require('../model/user.js');
const server = require('../server.js');
const Gallery = require('../model/gallery.js');

//const
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'logan rogers',
  password: '1234',
  email: 'l@logan.net',
};
const exampleGallery = {
  name: 'beach fun',
  desc: 'too much sand',
};

mongoose.Promise = Promise;

describe('test /api/gallery', function(){

  before( done => {
    if (!server.isRunning){
      server.listen(process.env.PORT, () => {
        console.log('server up');
        done();
      });
      return;
    }
    done();
  });

  after( done => {
    if (server.isRunning){
      server.close(err => {
        if (err) return done(err);
        console.log('server down');
        done();
      });
      return;
    }
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  describe('testing POST to /api/gallery', () =>{

    before( done => {
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

    it('should return a gallery', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return a status of 400 for invalid or no body', done => {
      request.post(`${url}/api/gallery`)
      .set('Content-Type', 'application/json')
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .send('bad parse')
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });

    it('should return a status of 401', done => {
      request.post(`${url}/api/gallery`)
      .set({
        Authorization: 'Bearer ',
      })
      .send(exampleGallery)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });
  });

  describe('testing GET to /api/gallery', () =>{

    before( done => {
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

    before( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    after( () => {
      delete exampleGallery.userID;
    });

    it('should return a gallery/:id', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });
  });
});
