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
var BOWER_JSON = getBowerJson();

config.bower = _.defaults(config.bower || {}, {
    folder:       require('bower').config.directory,
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

    getBundlesForArgument(packages).forEach(function(bundle) {

        new Elixir.Task('bower', function() {
            var paths = prepGulpPaths(bundle.files(), output, bundle.name);

            logMissingPackages(bundle);
            this.log(paths.src, paths.output);

            return merge(
                bundleJs(paths),
                bundleCss(paths),
                bundleMisc(paths)
            );
        });
    });
});

/**
 * Prep the Gulp src and output paths.
 *
 * @param  {string|array} src
 * @param  {string}       optional output path
 * @param  {string}       optional bundle name
 * @return {object}
 */
var prepGulpPaths = function(src, output, bundleName) {
    return new Elixir.GulpPaths()
        .src(src, config.bower.folder)
        .output(output || config.get('public.bower.outputFolder') || 'public/bundles', bundleName + '.*');
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
        .pipe(filter('*.js'))
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
        .pipe(filter('*.css'))
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
        .pipe(filter(['*', '!*.css', '!*.js']))
        .pipe(gulp.dest(paths.output.baseDir))
    );
};

/**
 * Get the project's bower.json.
 *
 * @return {object}
 */
function getBowerJson()
{
    try {
        return JSON.parse(fs.readFileSync('bower.json')) || {};
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

function logMissingPackages(bundle)
{
    var missing = _(bundle.packages).reject('installed')
        .pluck('name').unique().value();

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