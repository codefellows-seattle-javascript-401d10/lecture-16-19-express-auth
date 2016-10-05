'use strict';

// node modules
const fs = require('fs');

// npm modules
const expect = require('chai').expect;
const debug = require('debug')('slugram:pic-router-test');

// app modules
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');
const formRequest = require('./lib/form-request.js');

// module constants
const server = require('../server.js');
const url = 'http://localhost:3000';



const exampleUser = {
  username: 'judyvue',
  password: '1234',
  email: 'judyvue@fakeemail.com'
};

const exampleGallery = {
  name: 'beach adventure',
  desc: 'not enough sun screan ouch'
};


const examplePic = {
  name: 'sunburn',
  desc: 'owie',
  image: fs.createReadStream(`${__dirname}/data/shield.png`)
};



describe('testing route pic-router', function(){
  before(done => {
    if (!server.isRunning){
      server.listen(process.env.PORT), () => {
        server.isRunning = true;
        debug('server up');
        done();
      };
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
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('testing post /api/gallery/:id/pic', function(){
    debug();
    describe('with valid token and data', function() {
      before(done => {
        debug('create user');
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

      after(() => {
        debug('clean up userID from examplGallery');
        delete exampleGallery.userID;
      });

      before( done => {
        debug('create gallery');
        exampleGallery.userID = this.tempUser._id.toString();
        new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
      });

      it('should return a pic', (done) => {
        formRequest(`${url}/api/gallery/${this.tempGallery._id}/pic`, null, examplePic)
        .then( res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.desc).to.equal(examplePic.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          done();
        })
        .catch(done);
      });
    });
  });

});
