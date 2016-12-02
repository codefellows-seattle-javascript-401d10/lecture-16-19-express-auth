'use strict';

// mock third party services
require('./lib/test-env');
const awsMock = require('./lib/aws-mock');

// npm modules
const expect = require('chai').expect;
const request = require('superagent');
// const debug = require('debug')('bookstagram:pic-router-test');

// app modules
const serverCtrl = require('./lib/server-ctrl');
const dbClean = require('./lib/db-clean');
// const mockPic = require('./lib/mock-pic');
const mockGallery = require('./lib/mock-gallery');

// module constants
const server = require('../server');
const url = `http://localhost:${process.env.PORT}`;

const examplePic = {
  name: 'map',
  desc: 'we do not want to get lost on this trip, we have to walk the whole way!',
  image: `${__dirname}/data/map.png`,
};

describe('testing pic-router', function(){

  before(done => serverCtrl.serverUp(server, done));

  after(done => serverCtrl.serverDown(server, done));

  afterEach(done => dbClean(done));

  describe('POST /api/gallery/:id/pic', function(){

    describe('with valid token and data', function(){

      before(done => mockGallery.call(this, done));

      it('should return a pic', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({Authorization: `Bearer ${this.tempToken}`})
        .field('name', examplePic.name)
        .field('desc', examplePic.desc)
        .attach('image', examplePic.image)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.desc).to.equal(examplePic.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          expect(res.body.imageURI).to.equal(awsMock.uploadMock.Location);
          done();
        });
      });
    });

  });

});
