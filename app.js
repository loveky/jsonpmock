'use strict';

const app = require('koa')();
const render = require('koa-ejs');
const charset = require('koa-charset');
const path = require('path');
const config = require('config');

const router = require('./router');

render(app, {
	root: path.join(__dirname, 'views'),
	layout: false,
	cache: config.get('cacheTemplate')
});

app.use(charset());
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;