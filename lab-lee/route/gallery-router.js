'use strict';

// npm modules
const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('leegram:gallery-route');
const createError = require('http-errors');

// app modules
const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

// module constants
const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/gallery');
  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then( gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('GET /api/gallery/:id');
  Gallery.findById(req.params.id)
  .then( gallery => {
    if (gallery.userID.toString() !== req.user._id.toString())
      return next(createError(401, 'invalid userid'));
    res.json(gallery);
  })
  .catch( err => {
    if (err.name === 'ValidationError') return next(err);
    next(createError(404, err.message));
  });
});

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('hit route PUT /api/gallery/:id');
  Gallery.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then( gallery => res.json(gallery))
  .catch( err => {
    if (err.name === 'ValidationError') return next(err);
    next(createError(404, err.message));
  });
});

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('hit route DELETE /api/gallery/:id');
  Gallery.findByIdAndRemove(req.params.id)
  .then( () => res.sendStatus(204))
  .catch( err => next(createError(404, err.message)));
});

galleryRouter.get('/api/gallery', bearerAuth, jsonParser, function(req, res, next) {
  debug('hit route GET /api/gallery');
  Gallery.find()
  .then( galleries => res.json(galleries))
  .catch( err => {
    if (err.name === 'ValidationError') return next(err);
    next(createError(404, err.message));
  });
});
