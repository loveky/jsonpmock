'use strict';

const Redis = require('ioredis');
const config = require('config');

let redis = new Redis(config.get('redis'));

module.exports = redis;