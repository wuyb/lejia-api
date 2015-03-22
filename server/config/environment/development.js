'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/api-dev'
  },

  // email options
  mail: {
    smtp: {
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      debug: true,
      auth: {
        user: 'yanbo.wu@qq.com',
        pass: 'Katrina10)'
      }
    }
  },

  seedDB: true
};
