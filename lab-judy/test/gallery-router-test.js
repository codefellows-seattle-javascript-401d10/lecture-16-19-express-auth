'use strict';

// npm
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug');

// app
const server = require('../server.js');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

// const
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'judyvue',
  password: '1234',
  email: 'judyvue@fakeemail.com'
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
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

//POST tests
  describe('testing POST to /api/gallery', () => {
    before(done => {
      console.log('create user');
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

    //POST test 200 to return a gallery
    it('should return a gallery and status 200', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`
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

    //POST test 401 for unauthorized token
    it('should return status 401 for no token provided', (done) => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    //POST test 400 for bad request if no body or invalid body provided
    it('should return 400 for bad request if no body or invalid body provided', (done) => {
      request.post(`${url}/api/gallery`)
      .set('Content-type', 'application/json')
      .set({Authorization: `Bearer ${this.tempToken}`})
      .send('{')
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });


//GET tests
    describe('testing GET to /api/gallery/:id', () => {
      before(done => {
        console.log('create user');
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
        console.log('create gallery');
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

    //GET test 200 to return a gallery
      it('should return a gallery and status 200', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
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

    //GET test 401 for unauthorized token or no token
      it('should return status 401 for unauthorized token or no token given', (done) => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    //GET test 404 for bad request with invalid id
      it('should return 404 for id not found', (done) => {
        request.get(`${url}/api/gallery/`)
      .set({Authorization: `Bearer ${this.tempToken}`})
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
      });


//PUT tests
      describe('test PUT to /api/gallery/:id', () => {
        before(done => {
          console.log('create user');
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
          console.log('create gallery');
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

    //PUT test 200 for updated gallery properly returned
        it('should update gallery and return it with status 200', (done) => {
          debug('testing PUT request for status 200');
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .send({name: 'new beach', desc:'really sunny'})
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal('new beach');
        expect(res.body.desc).to.equal('really sunny');
        done();
      });
        });

    //PUT test 400 for passing invalid body
        it('should return status 400 for passing in invalid body', (done) => {
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .set('Content-type', 'application/json')
      .set({Authorization: `Bearer ${this.tempToken}`})
      .send('{')
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
        });
      });

    //PUT test 401 response w/ 'unauthorized' if bad token given
      it('should return status 401 and "unauthorized" for bad token or no token given', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .send({name: 'new beach', desc:'really sunny'})
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
      });


    //PUT test 404 for bad id given
      it('should return status 404 for bad id given', (done) => {
        request.put(`${url}/api/gallery/badid#`)
      .set({Authorization: `Bearer ${this.tempToken}`})
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
      });
      describe('testing DELETE routes', function(){
        before(done => {
          console.log('create user');
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
          console.log('create gallery');
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

    //Test DELETE for status 204
        it('should return status 204 for successful deletion', (done) => {
          request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({Authorization: `Bearer ${this.tempToken}`})
      .end((err, res) => {
        if (err) return done (err);
        expect(res.status).to.equal(204);
        done();
      });
        });

    //Test DELETE for status 404 for bad route
        it('should return 404 for route not found', (done) => {
          request.delete(`${url}/api/gallery/badid#`)
      .set({Authorization: `Bearer ${this.tempToken}`})
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
        });
      });
    });
  });
});
