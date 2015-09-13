# laravel-elixir-bowerbundle [![Dependencies Status](https://david-dm.org/parsnick/laravel-elixir-bowerbundle.svg)](https://david-dm.org/parsnick/laravel-elixir-bowerbundle) [![Build Status](https://travis-ci.org/parsnick/laravel-elixir-bowerbundle.svg?branch=master)](https://travis-ci.org/parsnick/laravel-elixir-bowerbundle)

Concatenates [Bower](https://bower.io) dependencies into configurable bundles of .css and .js files.

This is a plugin for [Laravel's Elixir](https://github.com/laravel/elixir) build tool and provides the `bower()` method.

## Install
 `npm install laravel-elixir-bowerbundle --save`

## Usage
  ```js
  // gulpfile.js
  var elixir = require('laravel-elixir');

  // To enable the plugin, simply require the module after elixir
  require('laravel-elixir-bowerbundle');

  elixir(function(mix) {

    // Generate public/bundles/bundle.js containing
    // jquery and lodash libraries combined
    mix.bower(['jquery', 'lodash']);

    // Save the bundled file(s) in a different directory
    // and/or with a different name.
    mix.bower(['jquery', 'lodash'], 'public/vendor/all.js');

    // Publish all the bundles as defined in your bower.json, e.g.
    // {
    //    "bundles": {
    //      "admin": ["d3", "datatables"]
    //    }
    // }
    mix.bower();
  });
  ```

#### Specify which files you want from a package

The files to include from each package are determined by the package's "main" property. If needed, you can override this.

Example: the bootstrap bower package lists `bootstrap.less` as one of its main files. To get the compiled CSS instead, use an "overrides" property in your project's root `bower.json`.

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
