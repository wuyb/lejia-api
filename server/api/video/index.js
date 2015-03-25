'use strict';

var express = require('express');
var controller = require('./video.controller');
var auth = require('../../auth/auth.service');
var config = require('../../config/environment');

var router = express.Router();

router.get('/', auth.hasOneOfRoles(['admin', 'editor']), controller.index);

// TODO moves this to storage/index.js and add generic storage.configure to eliminate the tight coupling
//      refer to auth/index.js and sub-folders for an example
if (config.storage.type === 'qiniu') {
  router.get('/token/upload', auth.hasOneOfRoles(['admin', 'editor']), controller.uploadToken);
  router.post('/callback/upload', auth.hasOneOfRoles(['admin', 'editor']), controller.onFileUploaded);
  router.get('/url/download', auth.hasOneOfRoles(['admin', 'editor']), controller.getDownloadUrl);
  console.log("Qiniu Registered");
}
router.get('/:id', auth.hasOneOfRoles(['admin', 'editor']), controller.show);
router.post('/', auth.hasOneOfRoles(['admin', 'editor']), controller.create);
router.put('/:id', auth.hasOneOfRoles(['admin', 'editor']), controller.update);
router.patch('/:id', auth.hasOneOfRoles(['admin', 'editor']), controller.update);
router.delete('/:id', auth.hasOneOfRoles(['admin', 'editor']), controller.destroy);

module.exports = router;