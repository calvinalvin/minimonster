/**
 * MiniMonster middleware for connect/express
 *
 * MIT License copyright (c) 2013 Calvin Alvin https://github.com/calvinalvin

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

var MiniMonster = require('./minimonster')
  , url = require('url')
  , colors = require('colors');

var FILE_EXT = /\.[0-9a-z]+$/i;

exports.minify = function(options) {
    options = options || {};

    var src = options.src;
    var maxAge = options.maxAge || 86400000; // default to 1 day
    var useInMemoryCache = options.useInMemoryCache || true;
    var debugMode = options.debugMode || false;

    if (typeof src === 'undefined')
        throw new Error('minimonster middleware parameter "src" is required');

    var minimonster = new MiniMonster(options);

    return function(req, res, next) {
        var path = url.parse(req.url).pathname;
        var fileType = path.match(FILE_EXT);

        if ((path.match(/\.js$/) || path.match(/\.css$/)) && !path.match(/min/)) {            
            minimonster.minify(src + path, function (err, data) {
                if (err) return next();

                res.setHeader('Expires', new Date(Date.now() + maxAge).toUTCString());
                res.setHeader('Cache-Control', 'public, max-age=' + (maxAge / 1000));

                if (fileType == '.js') {
                    if (debugMode == true)
                        console.log('minimonster: '.cyan + path + ' - 200 OK');

                    res.setHeader('Content-Type', 'text/javascript');
                    return res.send(200, data);
                }
                else if (fileType == '.css') {
                    if (debugMode == true)
                        console.log('minimonster: '.cyan + path + ' - 200 OK');

                    res.setHeader('Content-Type', 'text/css');
                    return res.send(200, data);
                }
                else {
                    if (debugMode == true)
                        console.log('minimonster: '.cyan + path + ' - 404 Not Found');

                    return next();
                }
            });
        }
        else {
            if (debugMode == true)
                console.log('minimonster: '.cyan + path + ' - Skipping - Not supported');

            return next();
        }      
    };
}