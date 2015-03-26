/**
 * The script is used to manually create video categories in the db.
 *
 * Caution:
 * DO NOT run it on an already-seeded production server.
 * The script changes the categories' ids. As a result, the video-category relationship will be corrupted.
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./environment');
var mongoose = require('mongoose');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var Category = require('../api/video/category.model');
Category.find({}).remove(function() {
  Category.create(
    {name:'乐加育儿',value:'leplus'},
    {name:'最强育儿',value:'from-the-bests'},
    {name:'妈妈说',value:'from-mommy'},
    {name:'一人玩',value:'play-by-myself'},
    function(err){
      if (err) {
        console.log("failed to populate categories : " + JSON.stringify(err));
      }
      console.log('finished populating categories');
      mongoose.disconnect();
    });
});

