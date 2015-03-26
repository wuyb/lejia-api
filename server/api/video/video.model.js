'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VideoSchema = new Schema({
  key: {type: String, required: true},
  name: {type: String},
  size: {type: Number, required: true},
  hash: {type: String, required: true},
  url: {type: String, require: true},
  description: {type: String},
  categories: [{type:Schema.Types.ObjectId, ref: 'Category'}],
  tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}],
  active: {type: Boolean, default: true},
  createdBy: {type: Schema.ObjectId, ref: 'User', required: true},
  createdAt: {type: Date, required: true},
  updatedBy: {type: Schema.ObjectId, ref: 'User', required: true},
  updatedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Video', VideoSchema);