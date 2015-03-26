'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CategorySchema = new Schema({
  name: {type: String, unique: true},
  value: {type: String, unique: true}
});

/**
 * Methods
 */
CategorySchema.methods = {
  
}

module.exports = mongoose.model('Category', CategorySchema);