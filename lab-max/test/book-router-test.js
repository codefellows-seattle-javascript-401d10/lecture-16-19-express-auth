'use strict';

const fs = require('fs');

const expect = require('chai').expect;
const debug = require('debug')('meekslib:book-router-test');

const User = require('../model/user.js');
const Library = require('../model/library.js');
const Book = require('../model/book.js');
const formRequest = require('./lib/form-request.js');

const server = require('../server.js');
const url = 'http://localhost:3000';

const exampleUser = {
  username: 'meeks',
  password: '12345',
  email: 'meeks@meeks.com',
};

const exampleLibrary = {
  name: 'maxs travels',
  genre: 'travel',
};

const exampleBook = {
  name: 'The Adventure of Code',
  desc: 'max learns to code at codefellows',
  year: 2016,
  image: fs.createReadStream(`${__dirname}/data/book.png`),
};

describe('testing book-router', function(){

  before(done => {
    debug('before module book-router-test');
    if (!server.isRunning) {
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
    debug('after module book-router-test');
    if (server.isRunning) {
      server.close(() => {
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
      Library.remove({}),
      Book.remove({}),
    ])
    .then(() => done())
    .catch(done);
  });

  describe('testing POST /api/library/:id/book', function(){
    describe('with valid data and no token', function(){

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
        })
        .then(() => {
          debug('create gallery');
          exampleLibrary.userID = this.tempUser._id.toString();
          new Library(exampleLibrary).save()
          .then( library => {
            this.tempLibrary = library;
            done();
          });
        })
        .catch(done);
      });

      after( () => {
        delete exampleLibrary.userID;
      });

      it('should return a book', done => {
        formRequest(`${url}/api/library/${this.tempLibrary._id}/book`, exampleBook)
        .then( res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.name).to.equal(exampleBook.name);
          expect(res.body.desc).to.equal(exampleBook.desc);
          expect(res.body.year).to.equal(exampleBook.year);
          expect(res.body.libraryID).to.equal(this.tempLibrary._id.toString());
          done();
        })
        .catch(done);
      });
    });
  });
});
