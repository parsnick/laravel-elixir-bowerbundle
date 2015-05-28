# laravel-elixir-bowerbundle
Concatenates [bower](https://bower.io) dependencies into configurable bundles of .css and .js files.
This is a plugin for [Laravel's Elixir](https://github.com/laravel/elixir) build tool and provides the `bowerBundle()` method.

## Example
```js
elixir(function(mix) {
  mix
    .bowerBundle('frontend', [
      'jquery',
      'lodash'
    ])
    .bowerBundle('mapping', ['leaflet'])
    .bowerBundle('admin', [
      'angular'
      'd3'
    ])
});
```
produces...
```sh
public/bundles/frontend.js # jquery and lodash libraries concatenated

public/bundles/mapping.js       # leaflet js
public/bundles/mapping.css      # leaflet css
public/bundles/layers.png, ...  # any other assets in leaflet package's "main" property

public/bundles/admin.js  # angular and d3 scripts concatenated
public/bundles/admin.css # angular and d3 styles concatenated
```

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
    mix.bowerBundle('frontend', ['jquery', 'lodash'])
  });
  ``` 
  
Caveat: Bower packages must be installed *and* listed as dependencies in your `bower.json` to be included in any bundle.

## Configuration
This plugin adds two properties to the elixir config: 
```js
elixir.config.bowerDir    = 'vendor/bower_components';
elixir.config.bowerOutput = 'public/bundles'
```
You can override these globally, or per-bundle with extra arguments to the `bowerBundle()` method.

## API
```js
/**
 * @param {string} bundleName   - used for naming the output file(s)
 * @param {array}  packages     - list of bower package names to include in this bundle
 * @param {string} jsOutputDir  - optional, defaults to value of elixir.config.bowerOutput
 * @param {string} cssOutputDir - optional, defaults to value of elixir.config.bowerOutput
 */
.bowerBundle(bundleName, packages, jsOutputDir, cssOutputDir)
```

## bower.json
Only want certain files from a bower package? Add an override to your bower.json - for more details, see [main-bower-files#overrides](https://github.com/ck86/main-bower-files#options)

## Alternatives
The [laravel-elixir-bower](https://github.com/Crinsane/laravel-elixir-bower) plugin may be a better choice 
if you have only a few dependencies in bower, and/or you want a single all-in-one bundle of vendor.css and vendor.js

Or you might prefer to use [bower-main](https://github.com/frodefi/bower-main) and [main-bower-files](https://github.com/ck86/main-bower-files) 
directly in your own custom tasks.
