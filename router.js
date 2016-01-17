'use strict';

const router = require('koa-router')();
const md5 = require('md5');
const koaBody = require('koa-body')();
const redis = require('./redis');


function delay (timeInMS) {
	timeInMS = Number(timeInMS);

	return new Promise (function (resolve, reject) {
		setTimeout(function () {
			resolve();
		}, timeInMS);
	});
}

router
	.get('/', function * (next) {
		let totalMockCreated = yield redis.get('totalMockCreated');
		let totalMockRequests = yield redis.get('totalMockRequests');
		yield this.render('index', {
			totalMockCreated: totalMockCreated,
			totalMockRequests: totalMockRequests
		});
	})
	.post('/', koaBody, function * (next) {
		let mockConfig = JSON.stringify(this.request.body);
		let key = md5(mockConfig);
		yield redis.hmset('jsonmock', key, mockConfig);
		yield redis.incr('totalMockCreated');
		this.body = {path: router.url('mock', key)};
	})
	.get('mock', '/:key', function * (next) {
		let key = this.params.key;
		let mockConfig = (yield redis.hmget('jsonmock', key))[0];
		let callbackName = this.request.query.callback;
		if (mockConfig && callbackName) {
			mockConfig = JSON.parse(mockConfig);

			if (mockConfig.delay > 0) {
				yield delay(mockConfig.delay);
			}

			yield redis.incr('totalMockRequests');

			this.body = [callbackName, '(', mockConfig.content, ')'].join('');
		}
		else {
			this.code = 404;
		}
	});

module.exports = router;