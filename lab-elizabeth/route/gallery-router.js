'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('bookstagram:gallery-router');

const Gallery = require('../model/gallery');
const bearerAuth = require('../lib/bearer-auth-middleware');

const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next){
  debug('POST /api/gallery');

  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then(gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('GET /api/gallery/:id');

  Gallery.findById(req.params.id)
  .then(gallery => {
    console.log('userID', gallery.userID);
    console.log('req.user._id', req.user._id);
    if(gallery.userID.toString() !== req.user._id.toString())
      return next(createError(401, 'invalid user id'));
    res.json(gallery);
  })
  .catch(next);
});
