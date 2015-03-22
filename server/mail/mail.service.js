'use strict';

var nodemailer = require('nodemailer');
var config = require('../config/environment');

var transporter = nodemailer.createTransport(config.mail.smtp);

function sendMail(receivers, title, body, callback) {
  var receiversStr = '';
  if (Object.prototype.toString.call(receivers) === '[object Array]') {
    receiversStr = receivers.join(',');
  } else {
    receiversStr = receivers;
  }
  var options = {
    from: config.mail.smtp.auth.user,
    to: receiversStr,
    subject: title,
    html: body
  };
  transporter.sendMail(options, function(error, info) {
    callback(error, info);
  });
}

function sendUserCreatedEmail(user, callback) {
  sendMail(user.email, '乐加运营管理账户开通',
    '<p>' + user.name + '，您好！</p>' +
    '<p> 您的乐加运营管理账户已经开通，请使用当前邮箱作为用户名登录。您的密码为 ' + user.password + '。请登录后及时修改密码。</p>' +
    '<p> 乐加机器人祝您工作顺利！</p>',
    callback
  );  
}


exports.sendMail = sendMail;
exports.sendUserCreatedEmail = sendUserCreatedEmail;