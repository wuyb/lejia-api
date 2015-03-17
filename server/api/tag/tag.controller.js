'use strict';

var _ = require('lodash');
var Tag = require('./tag.model');

// Get list of tags
exports.index = function(req, res) {
  Tag.find().populate('createdBy updatedBy').exec(function (err, tags) {
    if(err) { return handleError(res, err); }
    return res.json(200, tags);
  });
};

// Get a single tag
exports.show = function(req, res) {
  Tag.findById(req.params.id).populate('createdBy updatedBy').exec(function (err, tag) {
    if(err) { return handleError(res, err); }
    if(!tag) { return res.send(404); }
    return res.json(tag);
  }).populate('createdBy updatedBy');
};

// Creates a new tag in the DB.
exports.create = function(req, res) {
  req.body.createdBy = req.user;
  req.body.createdAt = Date.now();
  req.body.updatedBy = req.user;
  Tag.create(req.body, function(err, tag) {
    if(err) { return handleError(res, err); }
    return res.json(201, tag);
  });
};

// Updates an existing tag in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  req.body.updatedBy = req.user;
  req.body.updatedAt = Date.now();
  Tag.findById(req.params.id, function (err, tag) {
    if (err) { return handleError(res, err); }
    if(!tag) { return res.send(404); }
    var updated = _.merge(tag, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, tag);
    });
  });
};

// Softly deletes a tag from the DB.
// Only the activeness flag is updated.
exports.destroy = function(req, res) {
  Tag.findById(req.params.id, function (err, tag) {
    if(err) { return handleError(res, err); }
    if(!tag) { return res.send(404); }

    var updated = _.merge(tag, {active: false, updatedBy: req.user, updatedAt: Date.now()});
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, tag);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}