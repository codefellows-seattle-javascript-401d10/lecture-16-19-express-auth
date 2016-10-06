'use strict';

// node modules
const fs = require('fs');
const path = require('path');

// npm modules
const AWS = require('aws-sdk');
const multer = require('multer');
const createError = require('http-errors');
const debug = require('debug')('bookstagram:pic-router');

// app modules
const Pic = require('../model/pic');
// const User = require('../model/user');
const Gallery = require('../model/gallery');

// module constants
const s3 = new AWS.S3();
const upload = multer({dest: `${__dirname}/../data`});
const picRouter = module.exports = require('express').Router();

picRouter.post('/api/gallery/:galleryID/pic', upload.single('image'), function(req, res, next){
  debug('POST /api/gallery/:galleryID/pic');

  if(!req.file) return next(createError(400, 'no file found'));
  if(!req.file.path) return next(createError(500, 'file was not saved'));

  let ext = path.extname(req.file.originalname);
  let params = {
    ACL: 'public-read',
    Bucket: 'bookstagram-assets',
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  s3.upload(params, function(err, s3data){
    if(err) return next(err);
    Gallery.findById(req.params.galleryID)
    .then(gallery => {
      let picData = {
        name: req.body.name,
        desc: req.body.desc,
        imageURI: s3data.Location,
        galleryID: gallery._id,
      };
      return new Pic(picData).save();
    })
    .then(pic => res.json(pic))
    .catch(next);
  });

});
