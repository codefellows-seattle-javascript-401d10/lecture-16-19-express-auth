'use strict';

const Router = require('express').Router;
const debug = require('debug')('logan:gallery-route');
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next){
  debug('POST /api/gallery');
  req.body.userID = req.user._id;
  new Gallery(req.body)
  .then( gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('GET /api/gallery/:id');
  Gallery.findById(req.params.id)
  .then(gallery => {
    if (gallery.userID !== req.user._id.toString()) return next(createError(401, 'invalid userID'));
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.put('/api/gallery/:id', bearerAuth,  jsonParser, function(req, res, next) {
  debug('PUT /api/gallery/:id');
  Gallery.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then(gallery => {
    if(gallery.userID.toString() !== req.user._id.toString())
      return next(createError(401, 'invalid userId'));
    res.json(gallery);
  })
  .catch(err => next(createError(404, err.message)));
});
