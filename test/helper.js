'use strict';

let helper = require('../helper');
let expect = require('expect.js');

describe('toNumber', function () {
	let toNumber = helper.toNumber;

	it('should accept string or number as first paramter', function () {
		expect(toNumber("15", 10, 20)).to.be(15);
		expect(toNumber(15, 10, 20)).to.be(15);
	});

	it('should return min value if value is smaller than min', function () {
		expect(toNumber("1", 10, 20)).to.be(10);
	});
	
	it('should return max value if value is bigger than max', function () {
		expect(toNumber("100", 10, 20)).to.be(20);
	});
});