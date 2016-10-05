'use strict';

// node modules
const fs = require('fs');
const path = require('path'); // has a param name extname that can give us the ext of the file

// npm modules
const AWS = require('aws-sdk');
const multer = require('multer');
const debug = require('debug')('leegram:pic-router');
const createError = require('http-errors');

// app modules
const Pic = require('../model/pic.js');
// const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');
// const bearerAuth = require('../lib/bearer-auth-middleware.js');

// module constants
const s3 = new AWS.S3();
const upload = multer({dest: `${__dirname}/../data`});
const picRouter = module.exports = require('express').Router();

picRouter.post('/api/gallery/:galleryID/pic', upload.single('image'), function(req, res, next) {
  debug('POST /api/gallery/:galleryID/pic');
  console.log('req.file', req.file);
  if(!req.file)
    return next(createError(400, 'no file found'));//can multer find?
  if(!req.file.path)
    return next(createError(500, 'file was not saved'));//can multer save?

  let ext = path.extname(req.file.originalname); //'.jpg'

  let params = {
    ACL: 'public-read',
    Bucket: 'leegram-assets',
    Key: `${req.file.filename}${ext}`, //name of the file
    Body: fs.createReadStream(req.file.path),
  };

  s3.upload(params, function(err, s3data){
    if(err) return next(err);
    Gallery.findById(req.params.galleryID)
    .then( gallery => {
      let picData = {
        name: req.body.name,
        desc: req.body.desc,
        imageURI: s3data.Location,
        galleryID: gallery._id,
      };
      return new Pic(picData).save();
    })
    .then( pic => res.json(pic))
    .catch(next);
  });
});
