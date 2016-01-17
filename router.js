'use strict';

const router = require('koa-router')();

router
	.get('/', function * (next) {
		yield this.render('index');
	})
	.post('/', function * (next) {
		this.body = {success: true};
	})
	.get('/:id', function * (next) {

	});

module.exports = router;