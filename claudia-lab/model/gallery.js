'use strict';

// NPM MODULES
const mongoose = require('mongoose'); // creates user Schema

const gallerySchema = mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},
  //new date created ever time a user is instantiated
  created: {type: Date, required: true, default: Date.now},
  userID: {type: mongoose.Schema.Types.ObjectId, required: true},
});

module.exports = mongoose.model('gallery', gallerySchema);
