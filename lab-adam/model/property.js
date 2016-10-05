'use strict';

const mongoose = require('mongoose');

const propertySchema = mongoose.Schema({
  name: {type: String, required: true},
  created: {type: Date, required: true, default: Date.now},
  description: {type: String, required: true},
  address: {type: String, required: true},
  spareBedrooms: {type: Number, required: true},
  userID: {type: mongoose.Schema.Types.ObjectId, required: true},
});

module.exports = mongoose.model('property', propertySchema);
