'use strict';

const path = require('path');
const fs = require('fs');

const multer = require('multer');
const AWS = require('aws-sdk');
const createError = require('http-errors');
const debug = require('debug')('meekslib:book-router');

const Library = require('../model/library.js');
const Book = require('../model/book.js');

const s3 = new AWS.S3();
const upload = multer({dest: `${__dirname}/../data`});
const bookRouter = module.exports = require('express').Router();

bookRouter.post('/api/library/:libraryID/book', upload.single('image'), function(req, res, next){
  debug('POST /api/library/:libraryID/book');
  if(!req.file)
    return next(createError(400, 'no file found'));
  if(!req.file.path)
    return next(createError(500, 'file was not found'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: 'meekslib-assets',
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  s3.upload(params, function(err, s3data){
    if(err) return next(err);
    Library.findById(req.params.libraryID)
    .then(library => {
      let bookData = {
        name: req.body.name,
        desc: req.body.desc,
        year: req.body.year,
        imageURI: s3data.Location,
        libraryID: library._id,
      };
      return new Book(bookData).save();
    })
    .then(book => res.json(book))
    .catch(next);
  });
});
