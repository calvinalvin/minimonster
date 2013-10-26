/**
 * MiniMonster
 * Nodejs minification middelware + in memory caching
 * compresses and minifies css and js files with in memory caching support
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

var Cache = require('./cache')
  , Compressor = require('./compressor')
  , path = require('path')
  , colors = require('colors');

module.exports = MiniMonster;

var FILE_EXT = /\.[0-9a-z]+$/i;

function MiniMonster(options) {
    options = options || {};

    this.useInMemoryCache = options.useInMemoryCache || true;
    this.inMemoryCacheTTL = options.inMemoryCacheTTL || 10800; // 3 hours

    this.cacheDirectoryName = options.cacheDirectoryName || "_mm";

    // path of the cache directory to store a cache of minified files
    this.cachePath = options.cacheDirectoryName 
                     ? '/./' + options.cacheDirectoryName 
                     : "/./_mm";

    // the extension to append to minified files
    // for instance, with cacheExtension set to ".mini" jquery.js becomes jquery.mini.js
    this.extension = options.cacheExtension || ".mini";

    this.debugMode = options.debugMode || true;

    this.cssCompressor = options.cssCompressor || 'yui-css'; // sqwish, yui-css
    this.jsCompressor = options.jsCompressor || 'gcc'; // gcc, yui-js, uglifyjs
    this.cache = null;

    if (this.useInMemoryCache == true) {
        if (this.debugMode == true)
            console.log('minimonster: '.cyan +  'initializing cache');

        this.cache = new Cache(options); 
    } 
}


/*
** minifies and returns the minified file to the callback
*/
MiniMonster.prototype.minify = function(filePath, callback) {
    var self = this;
    var base = path.basename(filePath);
    var dir = path.dirname(filePath);
    var cacheDir = path.normalize(dir + self.cachePath) + "/";
    var fileType = base.match(FILE_EXT);

    if (fileType == '.js')
        compressionMethod = self.jsCompressor;
    else if (fileType == '.css')
        compressionMethod = self.cssCompressor;

    var cacheKey = cacheDir + base.replace(fileType, self.extension + '.' + compressionMethod + fileType);

    // then chcek filesystem for cached version
    // if none exist then minify and serve
    var compressor = new Compressor({
        cacheDirectoryName: self.cacheDirectoryName,
        cacheExtension: self.cacheExtension,
        useInMemoryCache: self.useInMemoryCache,
        inMemoryCacheTTL: self.inMemoryCacheTTL,
        debugMode: self.debugMode
    });

    // first check memory if minify exists
    if (self.useInMemoryCache == true) {
        self.cache.get(cacheKey, function (err, data) {
            if (data) return callback(null, data);

            // not in cache so minify
            return compressor.minify(filePath, function (err, data) {
                // save in memory cache for later use
                self.cache.set(cacheKey, data, function (err, reply) {
                    return callback(null, data);
                });
            });     
        });
    }
    else {
        return compressor.minify(filePath, callback);  
    }
};
