'use strict';

var express = require('express');
var controller = require('./video.controller');
var auth = require('../../auth/auth.service');
var config = require('../../config/environment');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);

// TODO moves this to storage/index.js and add generic storage.configure to eliminate the tight coupling
//      refer to auth/index.js and sub-folders for an example
if (config.storage.type === 'qiniu') {
  router.get('/token/upload', auth.isAuthenticated(), controller.uploadToken);
  router.post('/callback/upload', auth.isAuthenticated(), controller.onFileUploaded);
  router.get('/url/download', auth.isAuthenticated(), controller.getDownloadUrl);
  console.log("Qiniu Registered");
}
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;