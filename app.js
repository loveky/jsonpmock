'use strict';

const app = require('koa')();
const render = require('koa-ejs');
const charset = require('koa-charset');
const path = require('path');

const router = require('./router');

render(app, {
	root: path.join(__dirname, 'views'),
	layout: false,
	cache: false
});

app.use(charset());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
console.log('Server running at port 3000...');