'use strict';

//node module
const fs = require('fs');
const path = require('path');

const AWS = require('aws-sdk');

const multer = require('multer');
const createError = require('http-errors');
const debug = require('debug')('sarahgram:pic-router');

const Pic = require('../model/pic.js');
const Gallery = require('../model/gallery.js');

//module constants
//s3 will be the interface to AWS
const s3 = new AWS.S3();
const upload = multer({dest: `${__dirname}/../data`});
//following two lines is same as the third line
// const Router = require('express').Router
// const picRouter = module.exports = Router();
const picRouter = module.exports = require('express').Router();

picRouter.post('/api/gallery/:galleryID/pic', upload.single('image'), function(req, res, next){
  debug('POST /api/gallery/:galleryID/pic');
  //multer will add all the properties to the pic, and can see them by console.logging req.file
  console.log('req.file', req.file);
  //did the file get parsed by multer?
  if (!req.file)
    return next(createError(400, 'no file found'));
    //did the file get saved by multer?
  if (!req.file.path)
    return next(createError(500, 'file was not saved'));

  let ext = path.extname(req.file.originalname); // '.png'

  let params = {
    //sets it so everyone can see it.
    ACL: 'public-read',
    //have to make a bucket on aws website first, and call it sarahgram-assets
    Bucket: 'sarahgram-assets',
    //whatever you want the file to be called is the key
    //req.file.filename is created by multer
    Key: `${req.file.filename}${ext}`,
    //the thing we actually send
    //req.file.path is where multer saved it on your machine
    Body: fs.createReadStream(req.file.path),
  };

  s3.upload(params, function(err, s3data){
    if (err) return next(err);
    //create a picture
    Gallery.findById(req.params.galleryID)
    .catch()
    .then(gallery => {
      //this is going to store new picture in mongo db
      let picData = {
        name: req.body.name,
        description: req.body.description,
        //when you console.log s3data, you see that it has location property with url of image
        imageURI: s3data.Location,
        galleryID: gallery._id,
      };
      return new Pic(picData).save();
    })
    .then(pic => res.json(pic))
    .catch(next);
  });
});
