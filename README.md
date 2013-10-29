minimonster
===========

Nodejs css/js minification middleware for connect/express with in-memory caching support

==========

###### minimonster was created because I needed a css/js minification middleware for my express stack that had the following requirements:

- switch between different minification frameworks out there (google closure, yui, uglify, swish)
- add in memory support so minified css and js could be served from memory instead of hitting the disk every time
- graceful degredation on any type of failure
