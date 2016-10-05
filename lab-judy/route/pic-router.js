'use strict';



//node module
const path = require('path');
const fs = require('fs');

//npm modules
const AWS = require('aws-sdk');
const multer = require('multer');
const createError = require('http-errors');
const debug = require('debug')('judy: pic-router');


//app modules
const User = require('../model/user');
const Pic = require('../model/pic');
const Gallery = require('../model/gallery');

const s3 = new AWS.S3(); //interface to AWS S3
const upload = multer({dest: `${__dirname}/../data`});
const picRouter = module.exports = require('express').Router();


picRouter.post('/api/gallery/:galleryID/pic', upload.single('image'), function(req, res, next){
  debug('POST /api/gallery/:galleryID/pic');
  console.log('req.file ', req.file);

  if(!req.file)
    return next(createError(400, 'no file found'));
  if(!req.file.path)
    return next(createError(500, 'file was not saved'));

  let ext = path.extname(req.file.originalname); //.png
  let params = {
    ACL: 'public-read',
    Bucket: 'judyvue-bucket',
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  s3.upload(params, function(err, s3data){
    if(err) return next(err);
    // create a picture
    Gallery.findById(req.params.galleryID)
    .then(gallery => {
      let picData = {
        name: req.body.name,
        desc: req.body.desc,
        imageURI: s3data.Location,
        galleryID: gallery._id
      };
      return new Pic(picData).save();
    })
    .then( pic => res.json(pic))
    .catch(next);
  });
});
