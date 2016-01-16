'use strict';

const router = require('koa-router')();

router
	.get('/', function * (next) {
		yield this.render('index');
	})
	.post('/', function * (next) {
		// Create a new mock
	})
	.get('/:id', function * (next) {

	});

module.exports = router;