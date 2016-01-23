'use strict';

const Redis = require('ioredis');
const config = require('config');

let redis = new Redis(config.get('redis'));

redis.on('error', function(err) {
    if (err) {
        redis.disconnect();

        if (err.code == 'ECONNREFUSED') {
            console.error('Redis connection refused, may be redis server error.');
        }
    }
});

module.exports = redis;