var SAAdMemcached = require('../model/SAAdMemcached')
  , SAAdS3 = require('../model/SAAdS3');

function getAd(ad) {
    return SAAdMemcached.getAd(ad.key)
    .then(function(cachedAd) {
        console.log('Cache hit, ad:', ad);
        return cachedAd;
    })
    .catch(function(err) {
        // When it fails retrieving from Memcached for whatever reason
        // e.g. network connectivity or just missing, get from S3 and try to cache
        return retrieveAdUpdateCache(ad)
    });
}

function retrieveAdUpdateCache(ad) {
    console.log('Cache miss, ad:', ad);

    return SAAdS3.getAd(ad.key)
    .then(function(S3Ad) {
        // Call putAd and immediately progress to the next statement (return ad)
        // so that we dont wait for cache to be updated, but still log error
        // if cache update fails - independently
        SAAdMemcached.putAd(ad.key, S3Ad)
        .then(function() {
            console.log('Cache for ad', ad.key, 'updated successfully.');
        })
        .catch(function(err) {
            console.log('Updating cache failed:', err.stack);
        });

        return S3Ad;
    });
}

// THIS IS JUST TO CREATE 1 AD IN S3 (this will be normally done from the daashboard app)
// function saveAd(ad) {
//     console.log('save ad called', ad);

//     SAAdS3.putAd(ad)
//     .then(function(resp) {
//         console.log('saveAd response, etag', resp);
//     })
//     .catch(function(err) {
//         console.log('Save ad error', err.stack);
//     });
// }

module.exports = {
    getAd: getAd
};
