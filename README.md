Connect/express middelware for serving front-end applications with
[browserify][]. Install via `npm`:

    npm install connect-browserify

Basic usage is as follows:

```javascript
var express = require('express');
var browserify = require('connect-browserify');

app = express();
app.use('/js/app.js', browserify({
  entry: 'src/app.js',            // entry for your application

  requirements: ['src/views.js'], // additional modules to require, will
                                  // be exposed under id relative to
                                  // entry, e.g. './views' in current
                                  // example

  transforms: ['coffeeify'],        // transforms to use

  bundle: function(bundle) {      // optional, configure browserify instance
    // configure bundle
    return bundle
  },

  pipes: function(stream) {       // optional, apply post-bundle-transforms
    return stream                 // Receives the browserify bundle stream
      .pipe(uglifyStream);        // Must return another stream
  },

  contentType: 'text/javascript', // optional, Content-type header to use, by
                                  // default this equals to 'application/javascript'

  extensions: ['.js', '.coffee'], // to consider non-js files as
                                  // CommonJS modules

  debug: true                     // see browserify docs, other options are
}));

app.listen(3000);
```

This middleware will start watching directory of entry file for changes and
rebuild bundle accordingly and caching the result for future requests.

You should never use this middleware in production — use nginx for serving
pre-built bundles to a browser.

[browserify]: http://browserify.org


![viewcount](https://viewcount.jepso.com/count/andreypopp/connect-browserify.png)
