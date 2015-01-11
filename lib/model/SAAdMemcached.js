'use strict';

// Memcached client object can't be promisified

var Promise = require('bluebird')
  , memcached = require('../memcached.js').memcached

var CACHE_LIFETIME = 5; // 30 sec

function getAd(adKey) {
    return new Promise(function(resolve, reject) {
        console.log('inside new promise, memcached.get', memcached.get)
        memcached.client.get(adKey, function(err, data) {
            console.log('memcached get called, err', err, 'data', data)
            if (err) return reject(err);
            resolve(data);
        });
    });
}

function putAd(ad) {
    return new Promise(function(resolve, reject) {
        memcached.client.set(ad.key, ad.body, CACHE_LIFETIME, function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

module.exports = {
    getAd: getAd,
    putAd: putAd
}
