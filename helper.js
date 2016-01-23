'use strict';

exports.delay = function delay (timeInMS) {
	timeInMS = Number(timeInMS);

	return new Promise (function (resolve, reject) {
		setTimeout(function () {
			resolve();
		}, timeInMS);
	});
}

exports.toNumber = function toNumber(string, min, max) {
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
