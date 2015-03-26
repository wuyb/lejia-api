/**
 * The script is used to manually create roles in the db.
 *
 * Caution:
 * DO NOT run it on an already-seeded production server.
 * It removes all the users.
 * The script changes the admin user's id. This is not as severe as other scripts but still it can cause data loss.
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./environment');
var mongoose = require('mongoose');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var Role = require('../api/user/role.model');
var User = require('../api/user/user.model');

Role.find({value:'admin'}, function(error, adminRole) {
  User.find({}).remove(function() {
    User.create({
      provider: 'local',
      roles: adminRole,
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin',
      locked: true
    }, function(err){
        if (err) {
          console.log("failed to populate admins : " + JSON.stringify(err));
        }
        console.log('finished populating admins');
        mongoose.disconnect();
      }
    );
  });
});

