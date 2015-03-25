'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({ secret: config.secrets.session });

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findById(req.user._id).populate('roles').exec(function (err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);

        req.user = user;
        next();
      });
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      for (var i in req.user.roles) {
        if (req.user.roles[i].value === roleRequired) {
          next();
          return;
        }
      }
      res.send(403);
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasOneOfRoles(rolesRequired) {
  if (!rolesRequired || rolesRequired.length === 0) throw new Error('Required roles needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      for (var i in req.user.roles) {
        if (rolesRequired.indexOf(req.user.roles[i].value)) {
          next();
          return;
        }
      }
      res.send(403);
    });
}

function isAdmin(user) {
  for (var i in user.roles) {
    if (user.roles[i].value === 'admin') {
      return true;
    }
  }
  return false;
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*5 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.json(404, { message: 'Something went wrong, please try again.'});
  var token = signToken(req.user._id, req.user.roles);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.hasOneOfRoles = hasOneOfRoles;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.isAdmin = isAdmin;