'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('bookstagram:gallery-router-test');

const server = require('../server');
const User = require('../model/user');
const Gallery = require('../model/gallery');

const url = `http://localhose:${process.env.PORT}`;

const exampleUser = {
  username: 'J.R.R.Tolkien',
  password: '1ring',
  email: 'hobbits@theshire.middleearth',
};

const exampleGallery = {
  name: 'That trip to Mordor',
  desc: 'the eagles said they would meet us, they were late',
};

mongoose.Promise = Promise;

describe('gallery-router', function(){

  before(done => {
    if(!server.isRunning){
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        debug('server up, mate!');
        done();
      });
      return;
    }
    done();
  });

  after(done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then(() => done())
    .catch(done);
  });

});
