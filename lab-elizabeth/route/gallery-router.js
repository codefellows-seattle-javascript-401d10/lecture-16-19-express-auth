'use strict';

// node modules
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

// npm modules
const debug = require('debug')('bookstagram:gallery-router');

// app modules
const Gallery = require('../model/gallery');
const bearerAuth = require('../lib/bearer-auth-middleware');

// module constants
const galleryRouter = module.exports = require('express').Router();

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('DELETE /api/gallery/:id');
  Gallery.findByIdAndRemove(req.params.id)
  .then(() => res.status(204).send())
  .catch(err => next(createError(404, err.message)));
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('GET /api/gallery/:id');
  Gallery.findById(req.params.id)
  .then(gallery => {
    if(gallery.userID.toString() !== req.user._id.toString())
      return next(createError(401, 'invalid user id'));
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next){
  debug('POST /api/gallery');
  if(!req.user) return next(createError(400, 'gallery required'));
  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then(gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT /api/gallery/:id');
  if(!req.user) return next(createError(400, 'gallery required'));
  Gallery.findById(req.params.id)
  .then(gallery => {
    if(gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid id'));
    return Gallery.findByIdAndUpdate(req.params.id, req.body, {new: true});
  })
  .then(gallery => {
    res.json(gallery);
  })
  .catch(err => next(createError(404, err.message)));
});
