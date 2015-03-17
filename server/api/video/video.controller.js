'use strict';

var _ = require('lodash');
var Video = require('./video.model');

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

function handleError(res, err) {
  return res.send(500, err);
}