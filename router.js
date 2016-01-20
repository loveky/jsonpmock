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

function toNumber(string, min, max) {
	string += '';
	if (string.match(/^\s*\d+\s*$/)) {
		var value = parseInt(string, 10);
		
		if (value < min) {
			value = min;
		}

		if (value > max) {
			value = max;
		}

		return value;
	}
	else {
		return min;
	}
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
		let body = this.request.body;
		body.content = body.content.trim();
		if (body.content.length > 200000) {
			this.code = 500;
			this.body = 'Mock data is limited to 200KB';
		}
		else {
			body.delay = toNumber(body.delay, 0, 10000)
			let mockConfig = JSON.stringify(body);
			let key = md5(mockConfig);
			yield redis.hmset('jsonmock', key, mockConfig);
			yield redis.incr('totalMockCreated');
			this.body = {path: router.url('mock', key)};
		}

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
			this.type = 'application/javascript'
			this.charset = mockConfig.charset;
		}
		else {
			this.code = 404;
		}
	});

module.exports = router;