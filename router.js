'use strict';

const router = require('koa-router')();
const md5 = require('md5');
const koaBody = require('koa-body')();
const redis = require('./redis');


router
	.get('/', function * (next) {
		yield this.render('index');
	})
	.post('/', koaBody, function * (next) {
		let mockString = JSON.stringify(this.request.body);
		let key = md5(mockString);
		yield redis.hmset('jsonmock', key, mockString);
		yield redis.incr('totalMockCreated');
		this.body = {key: key};
	})
	.get('/:id', function * (next) {

	});

module.exports = router;