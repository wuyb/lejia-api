/**
 * The script is used to manually create roles in the db.
 *
 * Caution:
 * DO NOT run it on an already-seeded production server.
 * The script changes the roles' ids. As a result, the user-role relationship will be corrupted.
 */

'use strict';

var Role = require('../api/user/role.model');

Role.find({}).remove(function() {
  Role.create(
    {name:'编辑',value:'editor'},
    {name:'运营',value:'operator'},
    {name:'论坛管理员',value:'moderator'},
    {name:'超级管理员',value:'admin'},
    {name:'普通用户',value:'user'},
    function(){
      console.log('finished populating roles');
    });

});

