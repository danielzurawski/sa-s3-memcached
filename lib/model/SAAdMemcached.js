'use strict';

// Memcached client object can't be promisified

var Promise = require('bluebird')
  , memcached = require('../memcached.js').memcached

var CACHE_LIFETIME = 5; // 30 sec

function getAd(key) {
    return new Promise(function(resolve, reject) {
        memcached.client.get(key, function(err, data) {
            if (err) return reject(err);
            resolve(JSON.parse(data));
        });
    });
}

function putAd(key, body) {
    return new Promise(function(resolve, reject) {
        memcached.client.set(key, JSON.stringify(body), CACHE_LIFETIME, function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

module.exports = {
    getAd: getAd,
    putAd: putAd
}
