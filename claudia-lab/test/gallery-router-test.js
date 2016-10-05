'use strict';

//console -ag to find a specific string

//const debug = require('debug')('TastyToast:test');
const expect = require('chai').expect;
const request = require('superagent'); // makes ajax requests
const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

// APP MODULES
const server = require('../server.js');
const User = require('../model/user.js'); // used to mock token
const Gallery = require('../model/gallery.js');

//APP CONSTANTS
const url = `http://localhost:${process.env.PORT}`;
// example user for mock data
const exampleUser = {
  username: 'hellokitty',
  password: '1234',
  email: 'chicken@nuggets.com',
};

// example gallery for mock data
const exampleGallery = {
  name: 'at the club',
  description: 'best night ever',
};

describe('testing gallery router', function() {
/////////////////////////////////////////////////////
// Turn the server on and off
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
//remove all mock data after every test
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

// TESTING POST - SIGNUP
  describe('testing POST /api/gallery', () => {
    //create a user to mock a token
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save()) //returns a user
      .then(user => { //returns the
        this.tempUser = user; //store reference to make sure the id is generated correctly
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token; //store a reference so we cah make a proper request
        done();
      })
      .catch(done);
    });

    //test for POST response code 200
    describe('with valid body', () => {
      it ('should return a gallery', (done)=> {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery) //send it example gallery to test
        // makes the header
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.description).to.equal(exampleGallery.description);
          //user id has to be set to temp user id given by mongo
          expect(res.body.userID).to.equal(this.tempUser._id.toString()); //tempuser._id is an object - needs to turn to string
          let date = new Date(res.body.created).toString();
          expect(date).to.not.equal('Invalid Date');
          done();
        });
      }); //end it block
    });

    describe('with invalid token', () => {
      it ('should respond with 401 unauthorized', (done)=> {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        //don't set Authorization- no token provided
        //error generated in bearer-auth-middleware
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      }); //end it block
    }); //end testing POST 401

    describe('with no body or invalid body', () => {
      it ('should respond with 400 bad request', (done)=> {
        request.post(`${url}/api/gallery`)
        .set('Content-type', 'application/json')
        .set({Authorization: `Bearer ${this.tempToken}`})
        .send('asdfasdf')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      }); //end it block
    });//end testing POST 400

  }); //end describe testing POST

  // TESTING GET
  describe('testing GET /api/gallery', () => {

    //create a user to mock a token
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save()) //returns a user
      .then(user => { //returns the
        this.tempUser = user; //store reference to make sure the id is generated correctly
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token; //store a reference so we cah make a proper request
        done();
      })
      .catch(done);
    });
    // create example gallery
    before ( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    // delete gallery after tests are run
    after(() => {
      delete exampleGallery.userID;
    });

    describe('with a valid body', () => {
      it ('should return a gallery', (done)=> {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        // makes the header
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.description).to.equal(exampleGallery.description);
          //user id has to be set to temp user id given by mongo
          expect(res.body.userID).to.equal(this.tempUser._id.toString()); //tempuser._id is an object - needs to turn to string
          let date = new Date(res.body.created).toString();
          expect(date).to.not.equal('Invalid Date');
          done();
        });
      }); //end it block
    }); //end testing GET 200

    //Testing GET 404 not found
    describe('with valid request made with id that was not found', () => {
      it('should return error 404 not found', done => {
        request.get(`${url}/api/gallery/asdfasdf`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      }); //end it block
    }); //end describe testing 404

    //test for GET response code 401 - Unauthorized
    describe('with invalid token', () => {
      it ('should respond with 401 unauthorized', (done)=> {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({Authorization: 'asdf'})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      }); //end it block
    }); // end testing GET 401

  }); //end describe testing GET

// TESTING PUT
  describe('testing PUT /api/gallery', () => {
    //create a user to mock a token
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save()) //returns a user
      .then(user => { //returns the
        this.tempUser = user; //store reference to make sure the id is generated correctly
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token; //store a reference so we cah make a proper request
        done();
      })
      .catch(done);
    });
    // create example gallery
    before ( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    // delete gallery after tests are run
    after(() => {
      delete exampleGallery.userID;
    });

    describe('with valid body', () => {
      it ('should return an updated gallery', (done)=> {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send({name: 'bob', description: 'pictures of geese'})
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('bob');
          expect(res.body.description).to.equal('pictures of geese');
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          let date = new Date(res.body.created).toString();
          expect(date).to.not.equal('Invalid Date');
          this.tempGallery = res.body;
          done();
        });
      }); //end it block
    }); //end testing PUT 200

    describe('with no token provided', () => {
      it ('should respond with 401 unauthorized', (done)=> {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send({name: 'bob', description: 'pictures of geese'})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      }); //end it block
    }); //end testing PUT 401

    describe('with valid request but id not found', () => {
      it ('should respond with 404 not found', (done)=> {
        request.put(`${url}/api/gallery/fake`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .send({name: 'bob', description: 'pictures of geese'})
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      }); //end it block
    }); //end testing PUT 401

    describe('with invalid body', () => {
      it ('should respond with 400 bad request', (done)=> {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .set('Content-type', 'application/json')
        .set({Authorization: `Bearer ${this.tempToken}`})
        .send('asdfasdf')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      }); //end it block
    }); //end testing PUT 400

  }); //end describe testing PUT


  describe('testing DELETE /api/gallery', function(){
    //create a user to mock a token
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save()) //returns a user
      .then(user => { //returns the
        this.tempUser = user; //store reference to make sure the id is generated correctly
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token; //store a reference so we cah make a proper request
        done();
      })
      .catch(done);
    });
    // create example gallery
    before ( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    describe('successful deletion', () => {
      it ('should respond with 204 successful deletion', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          console.log(this.tempGallery.id);
          expect(res.status).to.equal(204);
          done();
        });
      }); // end it block
    }); //end testing 204

    describe('with invalid id', () => {
      it ('should respond with 404 not found', done => {
        request.delete(`${url}/api/gallery/blerg`) //invalid id
        .set({Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      }); // end it block
    }); // end testing 404
  }); //end testing DELETE routes

/////////////////////////////////////////////////////
}); //end describe testing gallery router
