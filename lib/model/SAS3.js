var AWS = require('aws-sdk');

var s3 = new AWS.S3();
var BUCKET_NAME = 'saAds'

module.exports = {
    createAdsBucket: createAdsBucket
    listBuckets: listBuckets
};

function createAdsBucket() {
    s3.createBucket({Bucket: 'saAds'}, function() {

    });
}


s3.listBuckets(function(err, data) {
  for (var index in data.Buckets) {
    var bucket = data.Buckets[index];
    console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
  }
});
