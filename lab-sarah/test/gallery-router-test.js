'use strict';

//npm modules
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

//app modules
const server = require('../server.js');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'piper',
  password: '4747',
  email: 'piper@sarah.com',
};

const exampleGallery = {
  name: 'mountain adventure',
  description: 'too much uphill',
};

const updateGallery = {
  name: 'updated adventure',
  description: 'too many updates',
};

//config
mongoose.Promise = Promise;

describe('test /api/gallery', function() {
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
    if (server.isRunning){
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
    .then(() => done())
    .catch(done);
  });

  describe('testing POST requests to /api/gallery', () => {
    before(done => {
      console.log('create user');
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
        expect(res.body.description).to.equal(exampleGallery.description);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    }); // end of it 'should return a gallery'

    it('should return a status of 400 for invalid or no body', done => {
      request.post(`${url}/api/gallery`)
      .set('Content-Type', 'application/json')
      //you want it to get past the authorization (bearerAuth), but then fail when it tries to use the JSON parser to parse the 'asdf' body
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .send('asdf')
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });

    });

    it('should return a status of 401 for unauthorized post', done => {
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
  }); //end of POST tests

  describe('testing GET requests to /api/gallery/:id', () => {
    //make a temp user
    before(done => {
      console.log('create user');
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

    //make a temp gallery
    before(done => {
      console.log('create gallery');
      exampleGallery.userID = this.tempUser._id;
      new Gallery(exampleGallery).save()
      .then(gallery => {
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
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.description).to.equal(exampleGallery.description);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    }); //end of it 'should return a gallery'

//no token provided
    it('should return a 401 status of unauthorized', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: 'Bearer ',
      })
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    }); //end of it 'should return a 401 status'

    //id that was not found
    it('should return a 404 status with id that wasnt found', done => {
      request.get(`${url}/api/1234`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    }); //end of it 'should return a 404 status'

  }); //end of GET tests

  describe('testing PUT requests to /api/gallery/:id', () => {
    //create a temp user
    before(done => {
      console.log('create user');
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

    //make a temp gallery
    before(done => {
      console.log('create gallery');
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then(gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    after(() => {
      delete exampleGallery.userID;
    });

    it('should update a gallery', (done) => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .send(updateGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(updateGallery.name);
        expect(res.body.description).to.equal(updateGallery.description);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        let date = new Date(res.body.created).toString();
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return a 401 error if no token provided', (done) => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .send(updateGallery)
      .set({
        Authorization: 'Bearer ',
      })
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return a 400 error for invalid body', (done) => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .send('asdf')
      .set('Content-Type', 'application/json')
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });

    it('should return a 404 status for id not found', (done) => {
      request.put(`${url}/api/gallery/1234`)
      .send(updateGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

  }); //end of PUT tests

  // describe('testing DELETE requests', () => {
  //   //create a user and a gallery and then delete that gallery
  //   //create a temp user
  //   before(done => {
  //     new User(exampleUser)
  //     .generatePasswordHash(exampleUser.password)
  //     .then(user => user.save())
  //     .then(user => {
  //       this.tempUser = user;
  //       return user.generateToken();
  //     })
  //     .then(token => {
  //       this.tempToken = token;
  //       done();
  //     })
  //     .catch(done);
  //   });
  //
  //   before(done => {
  //     console.log('create gallery');
  //     exampleGallery.userID = this.tempUser._id.toString();
  //     new Gallery(exampleGallery).save()
  //     .then(gallery => {
  //       this.tempGallery = gallery;
  //       done();
  //     })
  //     .catch(done);
  //   });
  //
  //   after(() => {
  //     delete exampleGallery.userID;
  //   });
  //
  //   it('should delete gallery', (done) => {
  //     request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
  //     .set({
  //       Authorization: `Bearer ${this.tempToken}`,
  //     })
  //     .end((err, res) => {
  //       expect(res.status).to.equal(204);
  //       done();
  //     })
  //     .catch(done);
  //   });
  // }); //end of DELETE tests

}); //end of all tests
