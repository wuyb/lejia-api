/**
 * The script is used to manually create video categories in the db.
 *
 * Caution:
 * DO NOT run it on an already-seeded production server.
 * The script changes the categories' ids. As a result, the video-category relationship will be corrupted.
 */

'use strict';

var Category = require('../api/video/video.model');

Category.find({}).remove(function() {
  Category.create(
    {name:'乐加育儿',value:'leplus'},
    {name:'最强育儿',value:'from-the-bests'},
    {name:'妈妈说',value:'from-mommy'},
    {name:'一人玩',value:'play-by-myself'},
    function(){
      console.log('finished populating categories');
    });

});

