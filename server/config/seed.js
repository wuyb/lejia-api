/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Role = require('../api/user/role.model');
var User = require('../api/user/user.model');

Role.find({}).remove(function() {
  Role.create(
    {name:'编辑',value:'editor'},
    {name:'运营',value:'operator'},
    {name:'论坛管理员',value:'moderator'},
    {name:'超级管理员',value:'admin'},
    {name:'普通用户',value:'user'},
    function(){
      console.log('finished populating roles');
      Role.find({value:'admin'}, function(error, adminRole) {
        User.find({}).remove(function() {
          User.create({
            provider: 'local',
            roles: adminRole,
            name: 'Admin',
            email: 'admin@admin.com',
            password: 'admin'
          }, function() {
              console.log('finished populating users');
            }
          );
        });
      });
    });

});

