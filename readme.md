# laravel-elixir-bowerbundle [![Dependencies Status](https://david-dm.org/parsnick/laravel-elixir-bowerbundle.svg)](https://david-dm.org/parsnick/laravel-elixir-bowerbundle) [![Build Status](https://travis-ci.org/parsnick/laravel-elixir-bowerbundle.svg?branch=master)](https://travis-ci.org/parsnick/laravel-elixir-bowerbundle)

Concatenates and publishes [Bower](https://bower.io) dependencies as configurable bundles of .css and .js files.

This is a plugin for [Laravel's Elixir](https://github.com/laravel/elixir) build tool and provides the `bower()` method.

```js
elixir(function (mix) {

  // Create a single bundle.js file that contains jQuery and a couple
  // of plugins. Simply include bundle.js somewhere on your page and
  // it works - no shims, no need for multiple require()s
  mix.bower(['jquery', 'jquery-touchswipe', 'Scrollify']);

  // Save the concatenated files somewhere other than the default
  // location by passing a second argument. If you're creating
  // multiple bundles, you'll need this.
  mix.bower(['jquery', ...], 'public/vendor/bower.js');

  // What about packages that include CSS? Not a problem, it just works.
  // All stylesheets used in the named packages are concatenated together
  // to a single bundle.css file, much like the javascript.
  mix.bower(['jquery', 'leaflet']);
  // Even images and fonts are automatically published alongside the
  // css and js, assuming the package lists them as `main` files. And
  // if it doesn't, see "Specify which files you want from a package" below.

  // Don't like the idea of mixing your list of dependencies with your
  // build logic? You can use bower.json to store your bundle compositions, e.g.
  // {
  //    "bundles": {
  //      "frontend": ["jquery", "lodash"],
  //      "admin": ["angular", "angular-ui-router", "d3"]
  //    }
  // }
  // then call .bower() with a named bundle
  mix.bower('frontend');
  // or call without arguments to publish all the defined bundles
  mix.bower();

});
```

### Install from npm
```
npm install laravel-elixir-bowerbundle --save
```

### Usage
```js
// gulpfile.js
var elixir = require('laravel-elixir');
require('laravel-elixir-bowerbundle');

elixir(function(mix) {
  mix.bower(['jquery', 'lodash']);
});
```

<br>

##### Specify which files you want from a package

Bower packages have a `bower.json` file with a "main" property. This is how we know which
files from each package should be included in the bundle. You can override this in your
own `bower.json` with an "overrides" property.

Example: the bootstrap bower package lists `bootstrap.less` as one of its main files.
To get the compiled CSS instead, override the "main" property for the "bootstrap" package.

```json
{
  "overrides": {
    "bootstrap": {
      "main": [
        "dist/css/bootstrap.css",
        "dist/js/bootstrap.js"
      ]
    }
  }
}
```

<br>

##### Use your own build pipeline

Is the standard `mix.bower()` task not quite right for you? You can still use this package to
fetch the list of files for a bundle, then pass them to `gulp.src()` in your own custom gulp task. For example:

```js
// gulpfile.js
var elixir = require('laravel-elixir');
var bundle = require('laravel-elixir-bowerbundle');
var gulp   = require('gulp');

// Use elixir as normal, remembering to call your custom task
elixir(function (mix) {
  mix.task('customBowerTask')
     // ...
});

// Define your custom task
gulp.task('customBowerTask', function () {

  // Pass an array of package names to the bundle factory function,
  // then get the file list with .all(). You can also use .css(),
  // .js() or .misc() to get files of a certain type.
  var files = bundle(['jquery']).all();

  return gulp.src(files)
             .pipe()
              // ...
});
```

## Contributing
All contributions welcome.

## License
MIT