var SAAdS3 = require('./lib/model/SAAdS3')
  , SAAdMemcached = undefined // defered until memcached is initialised
  , AWS = require('aws-sdk')
  , memcached = require('./lib/memcached');

// Important notes:
// 1) ElastiCache cannot be accessed outside of the EC2 network, unless you setup port forwarding on your machine
//


function getAd(ad) {
    console.log('getAd called');
    return SAAdMemcached.getAd(ad.key)
    .then(function(ad) {
        console.log('after get ad retrieved ad', ad);
        if (ad) {
            console.log('Cache hit, ad:', ad);
            return ad;
        } else return retrieveAdUpdateCache(ad)
    })
    .catch(function(err) {
        console.log('getAd', err.stack);
    });
}

function retrieveAdUpdateCache(ad) {
    console.log('Cache miss, ad:', ad);

    return SAAdS3.getAd(ad.key)
    .then(function(ad) {
        console.log('Retrieved ad from S3', ad);

        // Call putAd and immediately progress to the next statement (return ad)
        // so that we dont wait for cache to be updated, but still log error
        SAAdMemcached.putAd(ad)
        .then(function() {
            console.log('Cache for ad', ad.key, 'updated successfully');
        })
        .catch(function(err) {
            console.log('Error updating cache:', err.stack)
        });

        return ad;
    })
    .catch(function(err) {
        console.log('retrieveAdUpdateCache:', err.stack);
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


var sampleAd = {
    key: '_testAd000'
    //body: {campaign: 0, lineItem: 0, data: [1, 2, 3]}
};

memcached.initWithAutoDiscovery(function(err) {
    if (err) {
        console.log('Couldnt initialise memcached, err', err.stack);
        process.exit(1);
    }

    SAAdMemcached = require('./lib/model/SAAdMemcached');
    console.log('about to call getAd!!! ');
    getAd(sampleAd)
    .then(function(ad) {
        console.log('retrieve ad', ad);
    })
    .catch(function(err) {
        console.log('o kurwa, error', err.stack);
    });
})

//saveAd(sampleAd);
