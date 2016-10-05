'use strict';

const Router = require('express').Router;
const debug = require('debug')('meekslib:library-router');
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const Library = require('../model/library.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const libraryRouter = module.exports = Router();

libraryRouter.post('/api/library', bearerAuth, jsonParser, function(req, res, next){
  debug('POST /api/library');
  req.body.userID = req.user._id;
  new Library(req.body).save()
  .then( library => res.json(library))
  .catch(next);
});

libraryRouter.get('/api/library/:id', bearerAuth, function(req, res, next){
  debug('GET /api/library/:id');
  Library.findById(req.params.id)
  .then( library => {
    if(library.userID.toString() !== req.user._id.toString())
      return next(createError(401, 'invalid user id'));
    res.json(library);
  })
  .catch(err => next(createError(404, err.message)));
});

libraryRouter.put('/api/library/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT /api/library/:id');
  Library.findById(req.params.id)
  .then( library => {
    if(library.userID.toString() === req.user._id.toString()){
      Library.findByIdAndUpdate(req.params.id, req.body, {new:true})
      .then( library => res.json(library))
      .catch(next);
    }
    else {
      next(createError(401, 'invalid user id'));
    }
  })
  .catch(err => next(createError(404, err.message)));
});

libraryRouter.delete('/api/library/:id', bearerAuth, function(req, res, next){
  debug('DELETE /api/library/:id');
  Library.findById(req.params.id)
  .then( library => {
    if(library.userID.toString() === req.user._id.toString()){
      Library.findByIdAndRemove(req.params.id)
      .then(() => res.status(204).send())
      .catch(next);
    }
    else {
      return next(createError(401, 'invalid user id'));
    }
  })
  .catch(err => next(createError(404, err.message)));
});
