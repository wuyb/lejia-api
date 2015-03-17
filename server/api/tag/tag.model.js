'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TagSchema = new Schema({
  name: {type: String, required: true, unique: true},
  active: {type: Boolean, default: true},
  createdBy: {type: Schema.ObjectId, ref: 'User', required: true},
  createdAt: {type: Date, required: true},
  updatedBy: {type: Schema.ObjectId, ref: 'User', required: true},
  updatedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Tag', TagSchema);