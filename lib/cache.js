/**
 * Cache abstraction for Mini-Monster
 *
 * Copyright (c) 2013 Calvin Alvin https://github.com/calvinalvin

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

'use strict';

var NodeCache = require('node-cache')
  , colors = require('colors');

module.exports = Cache;

// https://github.com/tcs-de/nodecache
// stdTTL: the standard ttl as number in seconds for every generated cache element. Default = 0 = unlimited
// checkperiod: The period in seconds, as a number, used for the automatic delete check interval. 0 = no periodic check
var _inMemoryCache = new NodeCache({
    stdTTL: 10800,
    checkperiod: 120
});

function Cache(options) {
	options = options || {};

	this.cacheTTL = options.inMemoryCacheTTL || 10800; // 3 hours
	this.debugMode = options.debugMode || true;
};


Cache.prototype.get = function(key, cb) {
	var self = this;

	_inMemoryCache.get(key, function (err, inMemoryValue) {
		if (inMemoryValue && inMemoryValue[key]) {
			if (self.debugMode == true)
            	console.log('minimonster: '.cyan + key + ' - In Memory Cache Hit');

            return cb(null, inMemoryValue[key]);
		}
		else {
			return cb(null, null);
		}
	});
};


Cache.prototype.set = function(key, value, cb) {
	var self = this;

	_inMemoryCache.set(key, value, self.cacheTTL, function (err, success) {
		if (err) console.log(err);

		if (self.debugMode == true)
        	console.log('minimonster: '.cyan + key + ' - In Memory Cache Set');

		return cb(null, success);
	});
};
