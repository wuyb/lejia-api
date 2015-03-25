'use strict';

var User = require('./user.model');
var Role = require('./role.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var mail = require('../../mail/mail.service');
var crypto = require('crypto');
var logger = require('../../logger/')

var validationError = function(res, err) {
  return res.json(422, err);
};

var internalError = function(res, err) {
  return res.json(500, err);
}

function randomValueBase64(len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len);        // return required number of characters
}
/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({active:true}, '-salt -hashedPassword').populate('roles createdBy updatedBy').exec(function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user by admin.
 * The user's password will be generated randomly. It is sent to the user via email.
 * Email sending failure is not a fatal error, so here the error will be logged but 200 will be sent back. 
 */
exports.create = function (req, res, next) {
  req.body.roles = req.body.roles.map(function(r) {return r._id});

  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.password = randomValueBase64(8);
  newUser.createdBy = req.user._id;
  newUser.updatedBy = req.user._id;
  newUser.save(function(err, user) {
    if (err) return internalError(res, err);
    // send user his/her password
    mail.sendUserCreatedEmail(user, function(error, info) {
      if (error) {
        logger.log('error', 'Failed to send email : %s', JSON.stringify(error));
      }
      res.json(user.profile);
    });
  });
};


/**
 * Updates an existing user by admin.
 */
exports.update = function (req, res, next) {
  User.findById(req.body._id, function(err, user) {
    if (err) return validationError(res, err);
    if (user.locked) {
      return validationError(res, 'This account is locked.');
    }
    user.name = req.body.name;
    user.roles = req.body.roles.map(function(r) {return r._id});
    user.email = req.body.email;
    user.updatedBy = req.user._id;
    user.updatedAt = Date.now();
    user.save(function(err) {
      if (err) return validationError(res, err);
      res.send(200);
    })
  });
};
/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId).populate('roles').exec(function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user softly.
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if (err) return validationError(res, err);
    user.active = false;
    user.save(function(err) {
      if (err) return validationError(res, err);
      res.send(200);
    })
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if (user.locked) {
      return validationError(res, 'This account is locked.');
    }
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword').populate('roles').exec(function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

exports.allRoles = function(req, res, next) {
    Role.find({value: {$ne: 'user'}}, function (err, roles) {
      if(err) return res.send(500, err);
      res.json(200, roles);
    });
}

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
