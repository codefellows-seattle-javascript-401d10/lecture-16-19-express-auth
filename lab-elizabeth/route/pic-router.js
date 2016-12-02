'use strict';

// node modules
const fs = require('fs');
const path = require('path');

// npm modules
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const createError = require('http-errors');
const debug = require('debug')('bookstagram:pic-router');

// app modules
const Pic = require('../model/pic');
const Gallery = require('../model/gallery');
const bearerAuth = require('../lib/bearer-auth-middleware');

AWS.config.setPromisesDependency(require('bluebird'));

// module constants
const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({dest: dataDir});
const picRouter = module.exports = require('express').Router();

function s3UploadPromise(params){
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if(err) return reject(err);
      resolve(s3data);
    });
  });
}

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

  Gallery.findById(req.params.galleryID)
  .catch(err => Promise.reject(createError(404, err.message)))
  .then(() => s3UploadPromise(params))
  .catch(err => err.status ? Promise.reject(err) : Promise.reject(createError(500, err.message)))
  .then(s3data => {
    del([`${dataDir}/*`]);
    let picData = {
      name: req.body.name,
      desc: req.body.desc,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      galleryID: req.params.galleryID,
    };
    return new Pic(picData).save();
  })
  .then(pic => res.json(pic))
  .catch(err => {
    del([`${dataDir}/*`]);
    next(err);
  });
});

picRouter.delete('/api/gallery/:galleryID/pic/:picID', bearerAuth, function(req, res, next){
  debug('DELETE /api/gallery/:galleryID/pic/:picID');

  Pic.findById(req.params.picID)
  .catch(err => Promise.reject(createError(404, err.message)))
  .then(pic => {
    if(pic.galleryID.toString() !== req.params.galleryID)
      return Promise.reject(createError(400, 'bad request'));
    let params = {
      Bucket: 'bookstagram-assets',
      Key: pic.objectKey,
    };
    return s3.deleteObject(params).promise();
  })
  .catch(err => err.status ? Promise.reject(err) : Promise.reject(createError(500, err.message)))
  .then(() => {
    return Pic.findByIdAndRemove(req.params.picID);
  })
  .then(() => res.sendStatus(204))
  .catch(next);
});
