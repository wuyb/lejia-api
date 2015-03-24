'use strict';

var _ = require('lodash');
var Video = require('./video.model');
var config = require('../../config/environment');
var logger = require('../../logger/');

var qiniu = require('qiniu');
qiniu.conf.ACCESS_KEY = config.storage.qiniu.accessKey;
qiniu.conf.SECRET_KEY = config.storage.qiniu.secretKey;

var uptoken = new qiniu.rs.PutPolicy(config.storage.qiniu.bucket);

// Get list of videos
exports.index = function(req, res) {
  Video.find().populate('createdBy updatedBy tags').exec(function (err, videos) {
    if(err) { return handleError(res, err); }
    return res.json(200, videos);
  });
};

// Get a single video
exports.show = function(req, res) {
  Video.findById(req.params.id).populate('createdBy updatedBy tags').exec(function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    return res.json(video);
  });
};

// Creates a new video in the DB.
exports.create = function(req, res) {
  req.body.createdBy = req.user;
  req.body.createdAt = Date.now();
  req.body.updatedBy = req.user;
  Video.create(req.body, function(err, video) {
    if(err) { return handleError(res, err); }
    return res.json(201, video);
  });
};

// Updates an existing video in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  req.body.updatedBy = req.user;
  req.body.updatedAt = Date.now();
  Video.findById(req.params.id, function (err, video) {
    if (err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    var updated = _.merge(video, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, video);
    });
  });
};

// Softly deletes a video from the DB.
exports.destroy = function(req, res) {
  Video.findById(req.params.id, function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    var updated = _.merge(video, {active: false, updatedBy: req.user, updatedAt: Date.now()});
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, video);
    });
  });
};

exports.uploadToken = function(req, res) {
  var token = uptoken.token();
  logger.log('info', 'Generated upload token: %s', token);
  return res.json({uptoken: token});
}

exports.onFileUploaded = function(req, res) {
  // TODO This is supposed to be a callback for qiniu upload.
  //      Now we are simulating it by posting it directly from client side.
  //      This must be fixed.
  var video = {
    key: req.query.name,
    hash: req.query.hash,
    name: req.query.originalName,
    size: req.query.size,
    url: 'http://' + config.storage.qiniu.bucket + '.qiniudn.com/' + req.query.name,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  Video.create(video, function(err, video) {
    if(err) { return handleError(res, err); }
    return res.json({name: req.query.name, success: true});
  });
}

exports.downloadToken = function(req, res) {
  //
}

function handleError(res, err) {
  return res.send(500, err);
}