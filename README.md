minimonster
===========

Nodejs css/js minification middleware for connect/express with in-memory caching support


#### minimonster was created because I needed a css/js minification middleware for my express stack that had the following requirements:

- switch between different minification frameworks out there (google closure, yui, uglify, swish)
- add in memory support so minified css and js could be served from memory instead of hitting the disk every time
- graceful degredation on any type of failure


### Usage

You can just drop minimonster into your express middleware stack. The minimum you need is the ```src``` options, which is the directory path to the directory containing all your public css and js files.

```javascript
app.use(minimonster.minify({ 
        src: __dirname + '/public'
}));
```

