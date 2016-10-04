'use strict';

// npm
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

// app
const server = require('../server.js');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

// const
const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'slugbyte',
  password: '1234',
  email: 'slug@slug.slug',
};
const exampleGallery = {
  name: 'beach adventure',
  desc: 'not enough sun screan ouch'
};

// config
mongoose.Promise = Promise;

describe('test /api/gallery', function(){
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
        if (err) return done(err);
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
      Gallery.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  describe('testing POST to /api/gallery', () => {
    describe('Testing with a valid body', function() {
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

      it('should return a gallery', done => {
        request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        done();
      });
      });
    });

    describe('Testing if no token was provided', function() {
      it('should return 401', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: `Bearer ${''}`,
        })
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
      });
    });
    
    describe('Testing if no body or id was provided', function() {
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
      
      it('should return 400', done => {
        request.post(`${url}/api/gallery`)
        .send({wrongProperty:'1' })
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

  describe('testing GET to /api/gallery/:id', () => {
    beforeEach(done => {
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

    beforeEach( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    describe('Testing with valid id', () => {
      after(() => {
        delete exampleGallery.userID;
      });

      it('should return a gallery with valid id', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.desc).to.equal(exampleGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          let date = new Date(res.body.created).toString();
          expect(date).to.not.equal('Invalid Date');
          done();
        });
      });
    });

    describe('Testing if no token was provided ', () => {
      it('should return 401 ', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${''}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('Testing with an id that was not found ', () => {
      it('should return 404', done => {
        request.get(`${url}/api/gallery/888`)
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

  describe('testing DELETE to /api/gallery/:id', () => {
    
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

    before( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    describe('Testing DELETE /api/gallery/:id  with valid id', () => {
      it('should DELETE a gallery with valid id', done => {
        console.log('this.tempGallery', this.tempGallery);
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          expect(err).to.be.null;
          done();
        });
      });
    });
  }); 
});
