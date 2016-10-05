'use strict';

// npm
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const debug = require('debug')('catgram:gallery-router');
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
  desc: 'not enough sun screan ouch',
};

// config
mongoose.Promise = Promise;

describe('test /api/gallery', function(){

  before(done => {
    if (!server.isRunning){
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
    if(server.isRunning){
      server.close(err => {
        if (err) return done(err);
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
      Gallery.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  describe('testing POST to /api/gallery', () => {
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
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    describe('testing invalid POST if invalid body', () => {

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

      it('should return a status code of 400', done => {
        request.post(`${url}/api/gallery`)
        .send({})
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .set('Content-type', 'application/json')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });

      describe('testing invalid POST if no token found', () => {

        it('should return a status code of 401', done => {
          request.post(`${url}/api/gallery`)
          .send(exampleGallery)
          .set({})
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
        });
      });
    });
  });

  describe('testing GET to /api/gallery/:id', () => {

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

    after(() => {
      delete exampleGallery.userID;
    });

    it('should return a gallery', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    describe('testing invalid GET requests', () => {

      describe('testing invalid GET request if id not found', () => {

        it('should return a status code of 404', done => {
          request.get(`${url}/api/gallery/666`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).to.equal(404);
            done();
          });
        });
      });

      describe('testing invalid GET request if no token found', () => {

        it('should return a status code 0f 401', done => {
          request.get(`${url}/api/gallery/${this.tempGallery._id}`)
          .set({})
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
        });
      });
    });
  });

  describe('testing PUT to /api/gallery', () => {

    describe('testing valid PUT requests', () => {

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

      after(() => {
        delete exampleGallery.userID;
      });

      it('should return a status code of 200', done => {
        let updatedGallery = {
          name: 'updated name',
          desc:'updated description',
        };
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err)return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(res.body.name).to.equal(updatedGallery.name);
          expect(res.body.desc).to.equal(updatedGallery.desc);
          this.tempGallery = res.body;
          done();
        });
      });
    });

    describe('testing invalid PUT request for invalid body', () => {

      let updatedGallery = ('string');
      it('should return a status code of 400', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .set('Content-type', 'application/json')
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });

      describe('testing invalid PUT requests for token not found', () => {

        let updatedGallery = {
          name: 'updated name',
          desc:'updated description',
        };

        it('should return a status code of 401', done => {
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
          .set('Content-type', 'applications/json')
          .send(updatedGallery)
          .set({})
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
        });
      });
    });
  });


    describe('testing DELETE routes to /api/gallery/:id', function(){
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
            exampleGallery.userID = this.tempUser._id.toString();
            new Gallery(exampleGallery).save()
            .then( gallery => {
              this.tempGallery = gallery;
              done();
            });
          })
          .catch(done);
        });

        after( () => {
          delete exampleGallery.userID;
        });

        it('should return a 204 status code for successful delete', done => {
          request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
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
            exampleGallery.userID = this.tempUser._id.toString();
            new Gallery(exampleGallery).save()
            .then( gallery => {
              this.tempGallery = gallery;
              done();
            });
          })
          .catch(done);
        });

        after( () => {
          delete exampleGallery.userID;
        });

        it('should return a 401 status code for no token/bad token', done => {
          request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
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
          delete exampleGallery.userID;
        });

        it('should return a 404 status code for invalid id', done => {
          request.delete(`${url}/api/gallery/666`)
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
