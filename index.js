/**
 * BowerBundle extension for Laravel's Elixir
 *
 * @license MIT
 */
var gulp = require('gulp');
var elixir = require('laravel-elixir');
var config = elixir.config;
var gutil = require('gulp-util');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var rework = require('gulp-rework');
var reworkUrl = require('rework-plugin-url');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var uglifyJs = require('gulp-uglify');
var Promise = require('promise');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');

var BundleManager = require('./src/BundleManager');
var bundleManager = new BundleManager();

config.bowerOutput = 'public/bundles';
config.bowerDir = config.bowerDir || 'bower_components';

elixir.extend('bowerBundle', function (bundleName, packages, outputDir) {

    // .bowerBundle()
    if (arguments.length === 0) {
        bundleManager.addAll(config.bowerOutput);
    }

    // .bowerBundle(bundleName)
    if (arguments.length === 1) {
        bundleManager.addNamed(bundleName, config.bowerOutput);
    }

    if (arguments.length >= 2) {

        // .bowerBundle(bundleName, outputDir)
        if (typeof packages === 'string') {
            bundleManager.addNamed(bundleName, packages)
        }
        // .bowerBundle(bundleName, ['jquery', 'angular'])
        // .bowerBundle(bundleName, ['jquery', 'angular'], outputDir)
        else {
            bundleManager.add(bundleName, packages, outputDir || config.bowerOutput)
        }
    }

    gulp.task('bowerBundle', [
        'bowerBundle:check',
        'bowerBundle:run'
    ]);

    gulp.task('bowerBundle:check', function ()
    {
        if ( ! bundleManager.bundles.length) return gutil.log('bowerBundle has nothing to do');

        var noFiles = [];

        bundleManager.bundles.forEach(function (bundle) {

            var packageNames = _.pluck(bundle.packages, 'name');

            gutil.log(
                'Bundling '
                + gutil.colors.cyan.apply(gutil.colors, packageNames)
                + ' into '
                + gutil.colors.magenta(bundle.name + '.css')
                + ' and '
                + gutil.colors.magenta(bundle.name + '.js')
            );

            bundle.packages.forEach(function (package) {
                package.loadBowerJson();

                var missingDependencies = _.difference(Object.keys(
                    package.dependencies
                ), packageNames);

                if (missingDependencies.length) {
                    gutil.log(
                        '  ! '
                        + gutil.colors.cyan(package.name)
                        + ' depends on '
                        + gutil.colors.cyan.apply(gutil.colors, missingDependencies)
                        + ', which is not included in '
                        + gutil.colors.magenta(bundle.name)
                        + ' bundle'
                    );
                }

                if (package.files().length == 0) {
                    noFiles.push(package.name);
                }
            });
        });

        if (noFiles.length) {
            var colors = gutil.colors;
            gutil.log(colors.bgRed('  ! No files found for package(s) ' + colors.cyan.bold.apply(colors, noFiles)));
            gutil.log('  Possible causes:');
            gutil.log('  1. the package is not installed');
            gutil.log('       ' + colors.bold('fix:') + ' run ' + colors.magenta('bower install ' + noFiles.join(' ')));
            gutil.log('  2. the bower directory is not set - are your packages in ' + colors.magenta(config.bowerDir) + '?');
            gutil.log('       ' + colors.bold('fix:') + ' ensure ' + colors.magenta('elixir.config.bowerDir') + ' points to your bower directory');
            gutil.log('  3. the package lists no files in its bower.json "main" property');
            gutil.log('       ' + colors.bold('fix:') + ' add an ' + colors.magenta('"overrides"') + ' to your project\'s bower.json');
        }
    });

    gulp.task('bowerBundle:run', ['bowerBundle:check'], function ()
    {
        var streams = bundleManager.bundles.map(function (bundle) {

            var cssFilter   = filter('*.css');
            var jsFilter    = filter('*.js');
            var otherFilter = filter(['*', '!*.css', '!*.js']);

            return gulp.src(bundle.files(config.bowerDir))

                .pipe(cssFilter)
                .pipe(rework(reworkUrl(function (url) {
                    return isRelative(url) ? path.basename(url) : url;
                })))
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(concat(bundle.name + '.css'))
                .pipe(minifyCss())
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest(bundle.outputDir))
                .pipe(cssFilter.restore())

                .pipe(jsFilter)
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(concat(bundle.name + '.js'))
                .pipe(uglifyJs())
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest(bundle.outputDir))
                .pipe(jsFilter.restore())

                .pipe(otherFilter)
                .pipe(gulp.dest(bundle.outputDir))
            ;
        });

        return merge.apply(this, streams);
    });

    return this.queueTask('bowerBundle');
});

/**
 * Check if the given path is relative, not absolute.
 * @param  {string}  str
 * @return {Boolean}
 */
function isRelative(str)
{
    return ! /^(https?:)?\/\//.test(str);
}
