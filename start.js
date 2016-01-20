'use strict';

let app = require('./app');
let config  = require('config');

app.listen(config.get('port'));
console.log(`Server running at port ${config.get('port')}...`);