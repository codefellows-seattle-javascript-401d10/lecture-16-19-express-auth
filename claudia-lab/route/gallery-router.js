'use strict';

// NPM MODULES
const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('TastyToast:gallery-router');
const createError = require('http-errors');

//APP MOUDLES
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const Gallery = require('../model/gallery.js');
const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next){
  debug('POST /api/gallery');
  req.body.userID = req.user._id; //bearerAuth creates user
  new Gallery(req.body).save() //save new gallery
  //gallery is returned and passed in to function
  .then(gallery => res.json(gallery))
  .catch(next); //caught in error middleware, don't need to add any errors
});

//bearerAuth finds a user based on token
//get request has {bearer: 938102301923}
galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('GET /api/gallery/:id');
  Gallery.findById(req.params.id)
  //gallery is returned and passed in to function
  .then(gallery => {
    //gallery object for user in database and user making request
    if (gallery.userID.toString() !== req.user._id.toString()) //._id is an object! have to convert to string
      return next(createError(401, 'invalid user id'));
    res.json(gallery);
  })
  .catch(err => next(createError(404, err.message)));
});

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT /api/gallery/:id');
  Gallery.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then(gallery => {
    if (gallery.userID.toString() !== req.user._id.toString())
      return next(createError(401, 'unauthorized user'));
    res.json(gallery);
  })
  //update the data
  .catch(err => next(createError(404, err.message)));
});

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('DELETE /api/gallery/:id');
  Gallery.findByIdAndRemove(req.params.id)
  .then(gallery => {
    if (gallery.userID.toString() !== req.user._id.toString())
      return next(createError(401, 'unauthorized id'));
    res.sendStatus(204);
  })
  .catch(err => next(createError(404, err.message)));
});
