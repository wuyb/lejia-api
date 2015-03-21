'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var RoleSchema = new Schema({
  name: {type: String, unique: true},
  value: {type: String, unique: true}
});

/**
 * Methods
 */
RoleSchema.methods = {
  
}

module.exports = mongoose.model('Role', RoleSchema);