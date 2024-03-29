'use strict';

var _ = require('lodash');
var Video = require('./video.model');
var Category = require('./category.model');
var config = require('../../config/environment');
var logger = require('../../logger/');
var auth = require('../../auth/auth.service');

var qiniu = require('qiniu');
qiniu.conf.ACCESS_KEY = config.storage.qiniu.accessKey;
qiniu.conf.SECRET_KEY = config.storage.qiniu.secretKey;

var uptoken = new qiniu.rs.PutPolicy(config.storage.qiniu.bucket);

function downloadUrl(key) {
  var baseUrl = qiniu.rs.makeBaseUrl(config.storage.qiniu.bucket + '.qiniudn.com', key);
  var policy = new qiniu.rs.GetPolicy();
  return policy.makeRequest(baseUrl);
}

// Get list of video categories
exports.categories = function(req, res) {
  Category.find({}, function(err, categories) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, categories);
  });
}

// Get list of videos
exports.index = function(req, res) {
  var categoryName = req.query.category;
  if (categoryName) {
    if (categoryName === 'none') {
      Video.find({'category': {$exists: false}, 'active':true}).populate('createdBy updatedBy tags category').exec(function(err, videos) {
        if(err) { return handleError(res, err); }
        return res.json(200, videos);
      });
    } else {
      Category.findOne({'value': categoryName}, function(err, category) {
        if (err) {
          return handleError(res, err);
        }
        if (!category) {
          return res.send(404);
        }
        Video.find({'category': {$exists: true, $eq: category._id}, 'active':true}).populate('createdBy updatedBy tags category').exec(function(err, videos) {
          if(err) { return handleError(res, err); }
          return res.json(200, videos);
        });
      });
    }
  } else {
    Video.find({'active': true}).populate('createdBy updatedBy tags category').exec(function (err, videos) {
      if(err) { return handleError(res, err); }
      return res.json(200, videos);
    });
  }
};

// Get a single video
exports.show = function(req, res) {
  Video.findById(req.params.id).populate('createdBy updatedBy tags category').exec(function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    return res.json(video);
  });
};

// Updates an existing video in the DB.
exports.update = function(req, res) {
  Video.findById(req.params.id).populate('createdBy').exec(function (err, video) {
    if (err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    if (video.createdBy._id.toString() !== req.user._id && !auth.isAdmin(req.user)) {
      return res.send(403, 'Forbidden');
    }
    if(req.body._id) { delete req.body._id; }
    req.body.updatedBy = req.user;
    req.body.updatedAt = Date.now();
    req.body.category = req.body.category._id;
    var updated = _.merge(video, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, video);
    });
  });
};

// Softly deletes a video from the DB.
exports.destroy = function(req, res) {
  Video.findById(req.params.id).populate('createdBy').exec(function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    if (video.createdBy._id.toString() != req.user._id && !auth.isAdmin(req.user)) {
      return res.send(403, 'Forbidden');
    }
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

exports.getDownloadUrl = function(req, res) {
  var url = downloadUrl(req.query.key);
  logger.log('info', 'Generated download url : %s', url);
  return res.json({url: url});
}

function handleError(res, err) {
  return res.send(500, err);
}