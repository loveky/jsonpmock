'use strict';

const Redis = require('ioredis');

// TODO: read connection info per environment
let redis = new Redis();

module.exports = redis;