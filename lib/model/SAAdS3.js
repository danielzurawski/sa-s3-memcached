'use strict';

var AWS = require('aws-sdk')
  , Promise = require('bluebird')
  , s3 = Promise.promisifyAll(new AWS.S3())

var BUCKET_NAME = 'awesome-ads';

module.exports = {
    getAd: getAd,
    putAd: putAd
}

function getAd(adKey) {
    var params = {
        Bucket: BUCKET_NAME,
        Key: adKey
    };

    return s3.getObjectAsync(params);
}

function putAd(ad) {
    var params = {
        Bucket: BUCKET_NAME,
        Key: ad.key,
        Body: JSON.stringify(ad.body)
    };

    return s3.putObjectAsync(params);
}
