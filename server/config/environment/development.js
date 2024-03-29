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
      host: 'smtp.exmail.qq.com',
      port: 465,
      secure: true,
      debug: true,
      auth: {
        user: 'no-reply@lejiakids.com',
        pass: 'fortestnow9'
      }
    }
  },

  logger: {
    console: true,
    files: [
      {
        name: 'info',
        filename: 'info.log',
        level: 'info'
      },
      {
        name: 'error',
        filename: 'error.log',
        level: 'error'
      }
    ]
  },

  storage: {
    type: 'qiniu',
    qiniu : {
      accessKey: 'dTP2hWUCOedt5LmxOKZj4ZgZnouQHxnTtMXxOAiD',
      secretKey: '3jRNyETS0R9F6I1JfqUdz_yghYPZA3aioga1c_d4',
      bucket: 'test19'
    }
  },

  seedDB: false
};
