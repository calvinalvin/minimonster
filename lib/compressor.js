/**
 * Compressor abstraction for MiniMonster
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


var fs = require('fs')
  , path = require('path')
  , compressor = require('node-minify')
  , colors = require('colors')
  , util = require('util');

module.exports = Compressor;

var FILE_EXT = /\.[0-9a-z]+$/i;


function Compressor(options) {
  options = options || {};

  // the name of the directory to store a cache of minified files
  this.cachePath = options.cacheDirectoryName 
           ? '/./' + options.cacheDirectoryName 
           : "/./_mm";

  // the extension to append to minified files
  // for instance, with cacheExtension set to ".mini" jquery.js becomes jquery.mini.js
  this.extension = options.cacheExtension || ".mini";

  // if debugMode == true, then you get verbose logging to winston (console by default)
  this.debugMode = options.debugMode || false;
  this.cssCompressor = options.cssCompressor || 'yui-css'; // sqwish, yui-css
  this.jsCompressor = options.jsCompressor || 'uglifyjs'; // gcc, yui-js, uglifyjs
};


var readFileSystem = function(filePath, cb) {
  fs.readFile(filePath, "utf-8", function (err, data) {
    if (err) 
      util.log(err);

    cb(err, data);
  });
};


var doMinification = function(filePath, cachePath, method, extension, cb) {
  var self = this;
  var base = path.basename(filePath);
  var dir = path.dirname(filePath);
  var cacheDir = path.normalize(dir + cachePath) + "/";
  var fileType = base.match(FILE_EXT);
  var cacheFile = cacheDir + base.replace(fileType, extension + '.' + method + fileType);

  if (fileType == '.js') {
    if (method === 'uglifyjs' || method === 'yui-js' || method === 'gcc' ) {
      new compressor.minify({
        type: method,
        fileIn: filePath,
        fileOut: cacheFile,
        callback: function(err, min) {
          return cb(err, min);
        }
      });
    }
    else {
      util.log('minimonster error: '.red + ' compression method ' + method + ' unsupported');
    }
  }
  else if (fileType == '.css') {
    if (method === 'yui-css' || method === 'sqwish') {
      new compressor.minify({
        type: method,
        fileIn: filePath,
        fileOut: cacheFile,
        callback: function(err, min) {
          return cb(err, min);
        }
      });
    }
    else {
      util.log('minimonster error: '.red + ' compression method ' + method + ' unsupported');
    }
  }
  else {
    util.log('minimonster: error'.red + ' file type ' + fileType + ' not supported');
    return cb(null, null);
  }
};

/*
** Tries to read a minified version of the file from the cacheDir
** if the cached version does not exist then it will minify the file and cache it
** @returns the minified file 
*/
Compressor.prototype.minify = function(filePath, cb) {
  var self = this;
  var base = path.basename(filePath);
  var dir = path.dirname(filePath);
  var cacheDir = path.normalize(dir + self.cachePath) + "/";
  var fileType = base.match(FILE_EXT);
  var compressionMethod = "__undefined__";

  if (fileType == '.js')
    compressionMethod = self.jsCompressor;
  else if (fileType == '.css')
    compressionMethod = self.cssCompressor;

  var cacheFile = cacheDir + base.replace(fileType, self.extension + '.' + compressionMethod + fileType);

  // Match nodejs version for compatibility
  var exists = (process.version.match(/^v0\.[4-6]{1}\.[0-9]{2}$/)) 
         ? path.exists 
         : fs.exists;


  exists(filePath, function (fileExists) {
    if (!fileExists) {
      util.log('minimonster: '.red + filePath + ' - does not exist');
      cb(new Error('filePath does not exist: '+ filePath));
      return;
    }

    exists(cacheDir, function (dirExists) {
      if (dirExists) {
        exists(cacheFile, function (cacheFileExists) {
          if (cacheFileExists) {
            var cst = fs.statSync(cacheFile);
            var ost = fs.statSync(filePath);

            // Compare modified times if the original file is newer than the cached file rebuild
            if (ost.mtime > cst.mtime) {
              // cache is old so re-minify and re-cache
              if (self.debugMode == true)
                util.log('minimonster: '.cyan + filePath + ' - Cached mini out of date. Re-minifying');

              doMinification(filePath, self.cachePath, compressionMethod, self.extension, cb);
            }
            else {
              // return the cached file
              if (self.debugMode == true)
                util.log('minimonster: '.cyan + cacheFile + ' - Cached file found');

              readFileSystem(cacheFile, cb);
            }
          } 
          else {
            // minify and cache
            if (self.debugMode == true)
              util.log('minimonster: '.cyan + filePath + ' - Minifying');

            doMinification(filePath, self.cachePath, compressionMethod, self.extension, cb);
          }
        });
      } 
      else {
        try {
          fs.mkdirSync(cacheDir, 0755);
        } 
        catch (mkdirErr) {
          util.log('minimonster: '.red + mkdirErr);
          if (mkdirErr.code !== 'EEXIST') {
            throw mkdirErr;
          }
        }

        if (self.debugMode == true)
          util.log('minimonster: '.cyan + filePath + ' - Minifying');

        doMinification(filePath, self.cachePath, compressionMethod, self.extension, cb);
      }
    });
  });
};