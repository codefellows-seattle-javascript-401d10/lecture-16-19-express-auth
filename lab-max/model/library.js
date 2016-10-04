'use strict';

const mongoose = require('mongoose');

const librarySchema = mongoose.Schema({
  name: {type: String, required: true},
  genre: {type: String, required: true},
  created: {type: Date, required: true, default: Date.now},
  userID: {type: mongoose.Schema.Types.ObjectId, required: true},
});

module.exports = mongoose.model('library', librarySchema);
