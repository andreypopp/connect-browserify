connect-browserify
==================

Browserify middleware for Connect/Express apps

Install from ``npm``::

  % npm install connect-browserify

and then use in your connect/express app like this::

  express = require('express');
  browserify = require('connect-browserify');
  coffeeify = require('coffeeify');

  app = express();
  app.use('/js/app.js', browserify.serve({
    entry: 'src/app.js',            // entry for your application

    requirements: ['src/views.js'], // additional modules to require, will
                                    // be exposed under id relative to
                                    // entry, e.g. './views' in current
                                    // example

    shims: {                        // shims for non-CommonJS components
      jquery: {                     // uses browserify-shim package,
        path: 'src/vendor/jquery',  // see its docs for details
        exports: '$',
        depends: []
      }
    },

    watch: true,                    // watch entry's directory for changes and
                                    // rebuild

    transforms: [coffeeify],        // transforms to use

    debug: true,                    // see browserify docs, other options are
    insertGlobals: true,            // also supported and will be passed to
                                    // browserify bundle() calll

    contentType: 'text/javascript', // Content-type header to use, by default
                                    // this equals to 'application/javascript'

    extensions: ['.js', '.coffee'], // experimental option of a fork of
                                    // browserify at andreypopp/node-browserify,
                                    // allows to consider non-js files as
                                    // CommonJS modules
    })
  );

  app.listen(3000);

This middleware will start watching directory of entry file for changes, rebuild
bundle accordingly and caching the result for future requests. You can prevent
this behaviour by passing ``watch: false`` as ``options`` key.

You should never use this middleware in production — use nginx for serving
pre-built bundles to a browser.

.. _browserify: http://browserify.org
