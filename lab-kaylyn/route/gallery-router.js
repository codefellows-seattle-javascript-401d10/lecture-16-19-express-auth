'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('catgram:debug');

const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next){
  debug('POST /api/gallery');
  console.log(req.user, 'HAHAH');
  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then( gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('GET /api/gallery/:id');
  Gallery.findById(req.params.id)
  .then(gallery => {
    console.log('userId', gallery.userID);
    console.log('req.user._id', req.user._id);
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid userid'));
    res.json(gallery);
  })
  .catch(err => next(createError(404, err.message)));
});

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT /api/gallery/:id');
  Gallery.findById(req.params.id)
  .then(gallery => {
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid userid'));
    return Gallery.findByIdAndUpdate(req.params.id, req.body, {new:true});
  })
  .then(gallery => {
    res.json(gallery);

  })
  .catch(err => next(createError(404, err.message)));
});

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('DELETE /api/gallery/:id');
  Gallery.findByIdAndRemove(req.params.id)
  .then(() => res.status(204).send())
  .catch(err => next(createError(404, err.message)));
});
