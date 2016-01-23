'use strict';

let app = require('../app.js');
let redis = require('../redis');

let co = require('co');
let config = require('config');
let request = require('supertest').agent(app.listen(config.get('port')));
let expect = require('expect.js');

function wrapRequest (request) {
	request.end = request.end.bind(request)
	return request.end;
}

describe('Router:', function () {
	let cleanup = function (done) {
		co(function * () {
			yield redis.flushdb();
			done();
		});
	};

	beforeEach(function (done) {
		cleanup(done);
	});

	afterEach(function (done) {
		cleanup(done);
	});

	describe('GET /', function () {
		it('should show the summary information on page', function (done) {
			co(function * () {
				yield redis.set('totalMockCreated', 333);
				yield redis.set('totalMockRequests', 666);
				request
					.get('/')
					.expect(200)
					.end(function (err, res) {
						expect(res.text).to.match(/333 jsonp mock created/);
						expect(res.text).to.match(/666 mock request served/);
						done();
					});
			});			
		});
	});

	describe('POST /', function () {
		let mockConfig = {
			charset: 'utf-8',
			content: '{"a":1}'
		};

		it('should create a new mock', function (done) {
			co(function *() {		
				yield wrapRequest(
					request
						.post('/')
						.send(mockConfig)
						.expect(200)
				);
				let allJSONMocks = yield redis.hgetall('jsonmock');
				expect(Object.keys(allJSONMocks).length).to.be(1);
				done();
			}).catch(function (err) {
				setTimeout(function () {throw err; }, 0);
			});
		});

		it('should increase the totalMockCreated counter by 1', function (done) {
			request
				.post('/')
				.send(mockConfig)
				.end(function () {
					redis.get('totalMockCreated').then(function (counter) {
						expect(Number(counter)).to.be(1);
						done();
					});
				});
		});

		describe('when mock data exceed the 200K limit', function () {
			let fatMockConfig = {
				charset: 'utf-8',
				content: '{"abc":"' + '0123456789'.repeat(20000) + '"}'
			};

			it('should notincrease the totalMockCreated', function (done) {
				request
					.post('/')
					.send(fatMockConfig)
					.end(function () {
						redis.get('totalMockCreated').then(function (counter) {
							expect(Number(counter)).to.be(0);
							done();
						});
					});
			});

			it('should not create new mock', function (done) {
				request
					.post('/')
					.send(fatMockConfig)
					.end(function () {
						redis.hgetall('jsonmock').then(function (allJSONMocks) {
							expect(Object.keys(allJSONMocks).length).to.be(0);
							done();
						});
					});
			});

			it('should response with 500 code', function (done) {
				request
					.post('/')
					.send(fatMockConfig)
					.expect(500)
					.end(function (err, res) {
						expect(res.text).to.be('Mock data is limited to 200KB');
						done();
					});
			});
		});
	});

	describe('GET /:id', function () {
		let mockConfig = {
			charset: 'utf-8',
			delay: 0,
			content: '{"a":1}'
		};

		let mockConfigWithDelay = {
			charset: 'utf-8',
			delay: 500,
			content: '{"a":1}'
		};

		beforeEach(function (done) {
			co(function * () {
				yield redis.hmset('jsonmock', 'abc', JSON.stringify(mockConfig));
				yield redis.hmset('jsonmock', 'abcslow', JSON.stringify(mockConfigWithDelay));
				done();
			});
		});

		it('should response 404 if mockConfig for provided ID', function (done) {
			request
				.get('/donotexist?callback=abc')
				.expect(404)
				.end(done);
		});

		it('should response with Content-Type "application/javascript"', function (done) {
			request
				.get('/abc?callback=abc')
				.expect(200)
				.expect('Content-Type', /application\/javascript/)
				.end(done);
		});

		it('should response with mocked data', function (done) {
			request
				.get('/abc?callback=abc')
				.end(function (err, res) {
					let jsonBody = JSON.parse(res.text.match(/^[^\(]+\((.*)\)$/)[1]);
					expect(jsonBody).to.eql(JSON.parse(mockConfig.content));
					done();
				});
		});

		it('should delay response for configured time', function (done) {				
			let after500ms = false;
			setTimeout(() => {after500ms = true}, 500);
			request
				.get('/abcslow?callback=abc')
				.end(function () {
					expect(after500ms).to.be(true);
					done();
				});
		});

		it('should increase the totalMockRequests counter by 1', function (done) {
			request
				.get('/abc?callback=abc')
				.end(function () {
					redis.get('totalMockRequests').then(function (counter) {
						expect(Number(counter)).to.be(1);
						done();
					});
				});
		});
	});
});