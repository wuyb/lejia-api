'use strict';

var winston = require('winston');
var config = require('../config/environment/');

var logger = new(winston.Logger)({
  transports: [
  ]
});

if (config.logger.console) {
  logger.add(new(winston.transports.Console)(), {}, true);
}
for (var i in config.logger.files) {
  var loggerConf = config.logger.files[i];
  logger.add(new(winston.transports.File)(loggerConf), {}, true);
}

module.exports = logger;