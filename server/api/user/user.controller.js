'use strict';

var User = require('./user.model');
var Role = require('./role.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword').populate('roles').exec(function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user by admin.
 */
exports.create = function (req, res, next) {
  var roles = [];
  for (var i in req.body.roles) {
    roles.push(req.body.roles[i]._id);
  }
  req.body.roles = roles;
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.password = '123456';
  newUser.save(function(err, user) {
    console.log(JSON.stringify(err));
    if (err) return validationError(res, err);
    res.json(user.profile);
//    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
//    res.json({ token: token });
  });
};


/**
 * Updates an existing user by admin.
 */
exports.update = function (req, res, next) {
  User.findById(req.body._id, function(err, user) {
    if (err) return validationError(res, err);
    user.name = req.body.name;
    var roles = [];
    for (var i in req.body.roles) {
      roles.push(req.body.roles[i]._id);
    }
    req.body.roles = roles;
    user.roles = roles;
    user.email = req.body.email;
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
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
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
