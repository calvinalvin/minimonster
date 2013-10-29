minimonster
===========

Nodejs css/js minification middleware for connect/express with in-memory caching support


#### minimonster was created because I needed a css/js minification middleware for my express stack that had the following requirements:

- switch between different minification frameworks out there (google closure, yui, uglify, swish)
- add in memory support so minified css and js could be served from memory instead of hitting the disk every time
- graceful degredation on any type of failure
- module could be used as an object outside of middleware (express/connect) environment


### Usage

You can just drop minimonster into your express middleware stack. The minimum you need is the ```src``` options, which is the directory path to the directory containing all your public css and js files.

```javascript
app.use(minimonster.minify({ 
        src: __dirname + '/public'
}));
```


### Usage with more options

```javascript
app.use(minimonster.minify({ 
        src: __dirname + '/public', // required
        useInMemoryCache: true, // defaults to true
        inMemoryCacheTTL: 10800, // defaults to 3 hours
        cacheDirectoryName:  "_mm", // defaults to "_mm"
        cacheExtension: ".mini", // defaults to ".mini"
        debugMode: false, // defaults to false
        cssCompressor: 'yui-css', // defaults to "yui-css"
        jsCompressor:  'uglifyjs', // defaults to "uglifyjs"
        maxAge: 86400000 // default to 1 day
}));
```

### Description of options

- ##### src ```string``` required
This is the path to the public directory containing all your css and js files. This is the folder minimonster will look into to compress and serve files from.

- ##### useInMemoryCache ```boolean``` defaults to true
Flag telling minimonster to store results in memory cache or not. If this is set to true then minimonster will agressively cache all minified content into it's in-memory cache so that it minimizes physical disk access. This is recommended for high performance production environments.

- ##### inMemoryCacheTTL ```number``` defaults to 10800
Time to live in milliseconds of in memory cache objects before eviction

- ##### cacheDirectoryName ```string``` defaults to "_mm"
Name of the directory that cached versions of the minified files are saved into. This is not to be confused with the in memory cache. Once a file has been minified, it will be stored into this directory so that minification does not need to happen again. As minification is a relatively CPU intensive process, we do not want to minify something we've already minified.

- ##### cacheExtension ```string``` defaults to ".mini"
This gets appended to the name of minified files. For instance if you have a file called ```application.js``` the new minified file will be called ```application.mini.js```

- ##### debugMode ```boolean``` defaults to false
Gives verbose output to console if set to true

- ##### cssCompressor ```string``` defaults to "yui-css"
The compression engine for css files. Options are "yui-css", "sqwish"

- ##### jsCompressor ```string``` defaults to "uglifyjs"
The compression engine for js files. Options are "gcc" (google closure compiler), "yui-js", "uglifyjs"

- ##### maxAge ```number``` defaults to 1 day
The maxAge of the [http Cache-Control headers](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html) for static files in milliseconds. 
