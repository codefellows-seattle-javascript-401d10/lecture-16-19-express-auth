'use strict';

//npm modules
const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('judy: gallery-route');
const createError = require('http-errors');


//app modules
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Gallery = require('../model/gallery.js');


//constants
const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next){
  debug('POST /api/gallery');

  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then( gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('GET /api/gallery/:id');
  Gallery.findById(req.params.id)
  .then( gallery => {
    if (gallery.userID.toString() !== req.user._id.toString())
      return next(createError(401, 'invalid user ID'));
    res.json(gallery);
  })
  .catch(next);
});


galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT /api/gallery/:id');

  Gallery.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then( (gallery) => {
    return res.json(gallery);
  })
  .catch(err => {
    if (err.name === 'ValidationError') return next(err);
    next(createError(404, err.message));
  });
});

galleryRouter.delete('/api/gallery/:id', function(req, res, next){
  debug('DELETE /api/gallery/:id');

  Gallery.findByIdAndRemove(req.params.id)
  .then( () => res.sendStatus(204))
  .catch(err => next(createError(404, err.message)));
});
