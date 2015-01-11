/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// THIS MODULE IMPLEMENTS MEMCACHE AUTO DISCOVERY TO DYNAMICALLY ADJUST ITSELF                                         //
// TO THE CURRENT NUMBER OF AVAILABLE NODES IN ELASTICACHE, USING THE AWS-SDK                                          //
// THE POINT IS THAT IF YOU ADD AN EXTRA NODE, IT WILL BE AUTOMATICALLY PICKED UP                                      //
// WITHOUT REBOOTING THE SERVICE AND SIMIARLY IF A NODE GOES DOWN IT WILL SWITCH                                       //
// TO ANOTHER NODE                                                                                                     //
//                                                                                                                     //
// SOURCE: http://stackoverflow.com/questions/17046661/how-do-you-implement-aws-elasticache-auto-discovery-for-node-js //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var util = require('util'),
    AWS = require('aws-sdk'),
    elasticache = undefined,
    Memcached = require('memcached'),
    memcached = { client: undefined };

var AWS_REGION = 'eu-west-1'; // Just as a sample I'm using the EU West region
var CACHE_CLUSTER_ID = 'awesome-ads-test';
var CACHE_ENDPOINTS = [];
var CLIENT_OPTIONS = {
    timeout: 2000,
    retries: 0
};

function init(callback) {
    console.log('init memcached with auto-discovery');
    AWS.config.update({ region: AWS_REGION });
    elasticache = new AWS.ElastiCache();
    getElastiCacheEndpoints(callback);
}

function getElastiCacheEndpoints(callback) {
    elasticache.describeCacheClusters({ CacheClusterId: CACHE_CLUSTER_ID, ShowCacheNodeInfo: true }, function(err, data) {
        if (! err) {
            util.log('Describe Cache Cluster Id:' + CACHE_CLUSTER_ID);
            if (data.CacheClusters[0].CacheClusterStatus == 'available') {
                var endpoints = [];

                data.CacheClusters[0].CacheNodes.forEach(function(n) {
                    var e = n.Endpoint.Address+':'+n.Endpoint.Port;
                    endpoints.push(e);
                });

                if (!sameEndpoints(endpoints, CACHE_ENDPOINTS)) {
                    util.log('Memached Endpoints changed');
                    CACHE_ENDPOINTS = endpoints;
                    if (memcached.client)
                        memcached.client.end();
                    memcached.client = new Memcached(CACHE_ENDPOINTS, CLIENT_OPTIONS);

                    //setupListeners();
                    process.nextTick(logElastiCacheEndpoints);
                    setInterval(getElastiCacheEndpoints, 60000); // From now on, update every 60 seconds
                }
            } else {
                setTimeout(getElastiCacheEndpoints, 10000); // Try again after 10 seconds until 'available'
            }
        } else {
            util.log('Error describing Cache Cluster:'+err);
        }

        // On initial initialisation call callback
        if (callback) callback(err);
    });
}

function sameEndpoints(list1, list2) {
    if (list1.length != list2.length)
        return false;
    return list1.every(function(e) {
        return list2.indexOf(e) > -1;
    });
}

function logElastiCacheEndpoints() {
    CACHE_ENDPOINTS.forEach(function(e) {
        util.log('Memcached Endpoint: '+e);
    });
}

module.exports = {
    initWithAutoDiscovery: init,
    memcached: memcached // pass by reference
};
