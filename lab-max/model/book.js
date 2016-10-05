'use strict';

const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  name: {type: String, required: true},
  desc: {type: String, required: true},
  year: {type: Number, required: true},
  libraryID: {type: mongoose.Schema.Types.ObjectId, required: true},
  imageURI: {type: String, required: true, unique: true},
  created: {type: Date, default: Date.now},
});

module.exports = mongoose.model('book', bookSchema);
