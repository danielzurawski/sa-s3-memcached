var assert = require('assert')
  , mockery = require('mockery')
  , Promise = require('bluebird')
  , CachingControllerPath = '../lib/controllers/caching';

var MEMCACHED_ADS = {}
  , S3_ADS = {'test-ad': { hi: 1,  }};

var mockFakeMemcached = {
    getAd: function (adKey) {
        console.log('(mock) retrieving adKey from Memcached mock:', adKey);
        var ad = MEMCACHED_ADS[adKey]
        if (ad) ad._source = 'memcached';

        // can be undefined - that means its a cache miss
        return Promise.resolve(ad);
    },
    putAd: function(key, body) {
        return new Promise(function(resolve, reject) {
            console.log('(mock) setting adKey in Memcached mock:', key);
            if (! key) throw new Error('(mock) ad key not provided to memcached put')
            MEMCACHED_ADS[key] = body;
            resolve();
        });
    }
};

var mockFakeS3 = {
    getAd: function(adKey) {
        return new Promise(function(resolve, reject) {
            console.log('(mock) retrieving adKey from S3 mock:', adKey);
            var ad = S3_ADS[adKey];

            if (ad) {
                ad._source = 'S3';
                resolve(ad);
            }
            else reject(new Error('(mock) ad not found in S3'));
        });
    }// ,
    // putAd: function(ad) {
    //     return new Promise(function(resolve, reject) {
    //         S3_ADS[ad.key] = ad.body;
    //         resolve();
    //     });
    // }
};

describe('Test retrieving ads using s3 and memcached mocks', function() {
    mockery.registerAllowable(CachingControllerPath);
    mockery.registerMock('../model/SAAdMemcached', mockFakeMemcached);
    mockery.registerMock('../model/SAAdS3', mockFakeS3);
    mockery.enable({ useCleanCache: true });

    var cachingController  = require(CachingControllerPath);

    it('should have a cache miss, retrieve it from s3 with _source:=S3 and put in cache', function() {
        var ad = { key: 'test-ad' };
        cachingController.getAd(ad)
        .then(function(data) {
            assert.equal(data.hi, 1, 'should\'ve retrieved ad from s3 with hi:=1');
            assert.equal(data._source, 'S3', 'data _source be S3')
        })
    });

    it('should have a cache hit and retrieve it from memcached with _source:=memcached', function() {
        cachingController.getAd({ key: 'test-ad' })
        .then(function(data) {
            assert.equal(data.hi, 1);
            assert.equal(data._source, 'memcached', 'data _source should be memcached')
        })
    });
});
