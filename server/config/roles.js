/**
 * The script is used to manually create roles in the db.
 *
 * Caution:
 * DO NOT run it on an already-seeded production server.
 * The script changes the roles' ids. As a result, the user-role relationship will be corrupted.
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./environment');
var mongoose = require('mongoose');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var Role = require('../api/user/role.model');

Role.find({}).remove(function() {
  Role.create(
    {name:'编辑',value:'editor'},
    {name:'运营',value:'operator'},
    {name:'论坛管理员',value:'moderator'},
    {name:'超级管理员',value:'admin'},
    {name:'普通用户',value:'user'},
    function(err){
      if (err) {
        console.log("failed to populate roles : " + JSON.stringify(err));
      }
      console.log('finished populating roles');
      mongoose.disconnect();
    });

});

