var gulp   = require('gulp');
var Elixir = require('laravel-elixir');
var filter = require('gulp-filter');
var rework = require('gulp-rework');
var reworkUrl = require('rework-plugin-url');
var colors = require('gulp-util').colors;
var _ = require('lodash');
var fs = require('fs');
var merge = require('merge-stream');
var path = require('path');

var $ = Elixir.Plugins;
var config = Elixir.config;
var Bundle = require('./src/Bundle');
var Package = require('./src/Package');
var BOWER_JSON = readJsonIfExists('bower.json');

config.bower = _.defaults(config.bower || {}, {
    folder:       readJsonIfExists('.bowerrc').directory || 'bower_components',
    outputFolder: 'bundles'
});

Package.configure(BOWER_JSON.overrides || {}, config.bower.folder);

/*
 |----------------------------------------------------------------
 | Bower Assets Concatenation
 |----------------------------------------------------------------
 |
 | This task publishes all the javascript, CSS and other assets
 | needed by the named bower packages. Add an "overrides" to
 | bower.json to change the files that should be included.
 |
 */

Elixir.extend('bower', function(packages, output) {

    if (typeof output === 'undefined') output = {};

    // `output` argument can be given as:
    // 1. undefined
    // 2. a string (= path to use for everything)
    // 3. an object of paths { js, css, misc }
    var outputFolders = {
        js:   output.js || (typeof output === 'string' && output) || config.get('public.bower.outputFolder'),
        css:  output.css || (typeof output === 'string' && output) || config.get('public.bower.outputFolder'),
        misc: output.misc || (typeof output === 'string' && output) || config.get('public.bower.outputFolder')
    };

    getBundlesForArgument(packages).forEach(function(bundle) {

        new Elixir.Task('bower', function() {

            var jsPaths   = prepGulpPaths(bundle.js(), outputFolders.js, bundle.name + '.js');
            var cssPaths  = prepGulpPaths(bundle.css(), outputFolders.css, bundle.name + '.css');
            var miscPaths = prepGulpPaths(bundle.misc(), outputFolders.misc);

            logMissingPackages(bundle);
            this.log(
                prepGulpPaths(bundle.all(), '').src,
                _.pluck([jsPaths, cssPaths, miscPaths], 'output.path').join(', ') // all output folders as csv list
            );

            return merge(bundleJs(jsPaths), bundleCss(cssPaths), bundleMisc(miscPaths));
        });
    });
});

/**
 * Prep the Gulp src and output paths.
 *
 * @param  {string|array} src
 * @param  {string}       optional output path
 * @param  {string}       optional filename name
 * @return {object}
 */
var prepGulpPaths = function(src, output, filename) {
    return new Elixir.GulpPaths()
        .src(src, config.bower.folder)
        .output(output, filename);
};

/**
 * Combine javascript
 *
 * @param  {GulpPaths} paths
 * @return {stream}
 */
var bundleJs = function(paths) {
    return (
        gulp
        .src(paths.src.path)
        .pipe($.if(config.sourcemaps, $.sourcemaps.init({ loadMaps: true })))
        .pipe($.concat(paths.changeExtension(paths.output.name, '.js')))
        .pipe($.if(config.production, $.uglify()))
        .pipe($.if(config.sourcemaps, $.sourcemaps.write('.')))
        .pipe(gulp.dest(paths.output.baseDir))
    );
};

/**
 * Combine stylesheets.
 *
 * @param  {GulpPaths} paths
 * @return {stream}
 */
var bundleCss = function(paths) {
    return (
        gulp
        .src(paths.src.path)
        .pipe(rework(
            reworkUrl(function (url) {
                return /^(https?:)?\/\//.test(url) ? url : path.basename(url);
            })
        ))
        .pipe($.if(config.sourcemaps, $.sourcemaps.init({ loadMaps: true })))
        .pipe($.concat(paths.changeExtension(paths.output.name, '.css')))
        .pipe($.if(config.production, $.minifyCss()))
        .pipe($.if(config.sourcemaps, $.sourcemaps.write('.')))
        .pipe(gulp.dest(paths.output.baseDir))
    );
};

/**
 * Copy all other (non CSS, non JS) main files.
 *
 * @param  {GulpPaths} paths
 * @return {stream}
 */
var bundleMisc = function(paths) {
    return (
        gulp
        .src(paths.src.path)
        .pipe(gulp.dest(paths.output.baseDir))
    );
};

/**
 * Get contents of a .json file as an object.
 *
 * @param  {string} path
 * @return {object}
 */
function readJsonIfExists(path)
{
    try {
        return JSON.parse(fs.readFileSync(path)) || {};
    } catch (error) { // suppress 'no such file' error
        return {};
    }
}

/**
 * Normalise argument given to mix.bower() to an array of Bundle objects.
 *
 * @param  {mixed} arg
 * @return {array}
 */
function getBundlesForArgument(arg)
{
    // handles mix.bower(['package1', 'package2'])
    if (_.isArray(arg)) {
        return [new Bundle(arg)];
    }

    // handles mix.bower('namedBundle') where namedBundle is defined in bower.json
    if (_.isString(arg)) {
        return [new Bundle(BOWER_JSON.bundles[arg], arg)];
    }

    // handles mix.bower(), which uses all bundle definitions in bower.json
    return _.map(BOWER_JSON.bundles || [], function (packages, name) {
        return new Bundle(packages, name);
    });
}

/**
 * Log to console any packages that were requested but not installed.
 *
 * @param  {Bundle} bundle
 */
function logMissingPackages(bundle)
{
    var missing = _(bundle.packages).reject('installed')
        .pluck('name').unique().value();

    if ( ! missing.length) return;

    console.log('')
    console.log(
        colors.black.bgRed('!!! ' + bundle.name + ' is missing ' + colors.bold(missing.length) + ' package(s)')
    );
    _.forEach(missing, function (name) {
        console.log('   - ' + name);
    });
    console.log('   Try running ' + colors.cyan('bower install ' + missing.join(' ')));
    console.log('');
}

/**
 * Export a bundle factory function
 */
module.exports = function (bundles, output)
{
    return new Bundle(bundles, output);
};