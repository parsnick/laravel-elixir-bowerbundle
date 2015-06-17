# laravel-elixir-bowerbundle
Concatenates [Bower](https://bower.io) dependencies into configurable bundles of .css and .js files.
This is a plugin for [Laravel's Elixir](https://github.com/laravel/elixir) build tool and provides the `bowerBundle()` method.

#### Why another plugin?
To satisfy the following requirements:*

1. create **multiple bundles**, each consisting of any number of Bower packages
2. **no further build steps required** - fonts, images, etc. copied across to the bundle directory automatically
3. CSS and JS concatenated **in the order defined**
4. **no silent failure** if a package is not installed
5. **minimal configuration**, no more than specifying which packages to include
6. **no redundancy** with the existing bower.json "dependencies" property
7. **minification** of CSS and JS and **external sourcemaps**


<small>* if these are in fact easily achieved with an existing solution, please drop me a line!</small>

## Usage
1. Grab the module from npm
  ```sh
  npm install laravel-elixir-bowerbundle --save
  ```

2. Load the module in your gulpfile.js
  ```js
  require('laravel-elixir-bowerbundle');
  ```

3. Configure your bundles
  ```js
  elixir(function(mix) {
    mix
      // Create a frontend.js file containing jquery and lodash libraries
      .bowerBundle('frontend', ['jquery', 'lodash'])
      // ...
  });
  ```

#### Create bundles in a different output directory

Bundles are created in `public/bundles` by default, as set on the elixir config object:
```js
elixir.config.bowerOutput = 'public/bundles'
```
You can also override this per-bundle with an extra argument in your recipe:
```js
mix.bowerBundle('libs', ['jquery', 'lodash'], 'public/vendor')`
```

#### Use a custom directory for your bower_components

Since this plugin uses Bower's programmatic API, you don't need to do anything special - just set your custom components directory in a [.bowerrc file](http://bower.io/docs/config/) as normal:
```js
{
  "directory": "vendor/bower_components"
}
```

#### Use bower.json for your bundle definitions
If you want to keep your dependencies separate from your build script, use the "bundles" property in your project's root `bower.json`:
```json
{
  "bundles": {
    "frontend": [
      "jquery",
      "lodash"
    ],
    "admin": [
      "datatables",
      "d3"
    ]
  }
}
```
And in your elixir recipe:
```js
  mix.bowerBundle();           // generates all bundles, or
  mix.bowerBundle('frontend'); // generates the named bundle
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

## Alternatives
The [laravel-elixir-bower](https://github.com/Crinsane/laravel-elixir-bower) plugin may be a better choice if you have only a few dependencies in bower, and/or you want a single all-in-one bundle of vendor.css and vendor.js

> use bowerBundle api

Or you might prefer to use [bower-main](https://github.com/frodefi/bower-main) and [main-bower-files](https://github.com/ck86/main-bower-files)
directly in your own custom tasks.
