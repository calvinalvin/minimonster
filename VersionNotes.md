### v0.1.6 | April 4, 2014
- supress mkdir error if cache directory already exists

### v0.1.4 | March 21, 2014
- fix issue where minification would fail if filePath to css or js file could not be found. Now it does a check to make sure the file exists and will skip if it doesn't

### v0.1.3 | March 21, 2014
- use util.log() instead of console.log() for debugMode=true