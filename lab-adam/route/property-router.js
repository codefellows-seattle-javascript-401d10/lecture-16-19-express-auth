'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const debug = require('debug')('stellegram:property-route');

const Property = require('../model/property.js');
const bearerAuth =require('../lib/bearer-auth-middleware.js');
const pageMiddleware = require('../lib/pagination-middleware.js');

const propertyRouter = module.exports = Router();

propertyRouter.post('/api/property', bearerAuth, jsonParser, function(req, res, next){
  debug('POST /api/property');
  req.body.userID = req.user._id;
  new Property(req.body).save()
  .then(property => res.json(property))
  .catch(err => next(err));
});

propertyRouter.get('/api/property/:id', bearerAuth, function(req, res, next){
  debug('GET /api/property/:id');
  Property.findById(req.params.id)
  .then(property => {
    if(property.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user ID'));
    res.json(property);
  })
  .catch(err => next(createError(404, err.message)));
});

propertyRouter.get('/api/property/', bearerAuth, pageMiddleware, function(req, res, next){
  debug('GET /api/property to return list of IDs');
  let offset = parseInt(req.query.offset);
  let pagesize = parseInt(req.query.pagesize);
  let page = parseInt(req.query.page);
  let skip = (offset) + pagesize * (page - 1);
  Property.find().skip(skip).limit(pagesize)
  .then(property => {
    res.json(property);
  })
  .catch(err => next(createError(404, err.message)));
});


propertyRouter.put('/api/property/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT /api/property/:id');
  Property.findById(req.params.id)
  .then(property => {
    if(property.userID.toString() === req.user._id.toString()) {
      Property.findByIdAndUpdate(req.params.id, req.body, {new:true})
      .then(property => {
        res.json(property);
        next();
      });
    } else {
      next(createError(401, 'invalid user ID. not authorized to modify Property'));
    }
  })
  .catch(err => next(createError(404, err.message)));
});

propertyRouter.delete('/api/property/:id', bearerAuth, function(req, res, next){
  debug('PUT /api/property/:id');
  Property.findById(req.params.id)
  .then(property => {
    if(property.userID.toString() === req.user._id.toString()) {
      Property.findById(req.params.id).remove()
      .then(() => res.status(204).send());
    } else {
      next(createError(401, 'invalid user ID. not authorized to modify Property'));
    }
  })
  .catch(err => next(createError(404, err.message)));
});
