/**
 * The script is used to manually create roles in the db.
 *
 * Caution:
 * DO NOT run it on an already-seeded production server.
 * The script changes the admin user's id. This is not as severe as other scripts but still it can cause data loss.
 */

'use strict';

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
    }, function() {
        console.log('finished populating admins');
      }
    );
  });
});

