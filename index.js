var SAAdS3 = require('./lib/model/SAAdS3')
  , memcached = require('./lib/memcached')
  , CachingController = undefined;

memcached.initWithAutoDiscovery(function(err) {
    if (err) {
        console.log('Couldnt initialise memcached, err', err.stack);
        process.exit(1);
    }

    // defered until memcached is initialised with auto discovery
    CachingController = require('./lib/controllers/caching');
    console.log('about to call getAd!!! ');

    CachingController.getAd(sampleAd)
    .then(function(ad) {
        console.log('retrieve ad', ad);
    })
    .catch(function(err) {
        console.log('o kurwa, error', err.stack);
    });
})

//caching.saveAd(sampleAd);
