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
var bower = require('bower');
var inquirer = require('inquirer');
var Promise = require('promise');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');

var BundleManager = require('./src/BundleManager');
var bundleManager = new BundleManager();

config.bowerOutput = 'public/bundles';

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

    gulp.task('bowerBundle:check', function (cb)
    {
        if ( ! bundleManager.bundles.length) return gutil.log('bowerBundle has nothing to do');

        var required = getRequiredPackages();

        getInstalledPackages()
            .then(function (packageList) {
                return _(required).pluck('name').difference(packageList).value();
            })
            .then(function (packagesToInstall) {
                if (packagesToInstall.length) {
                    return installPackages(packagesToInstall);
                }
            })
            .then(function () {
                logBundleBreakdown();
            })
            .then(cb);
    });

    gulp.task('bowerBundle:run', ['bowerBundle:check'], function ()
    {
        var streams = bundleManager.bundles.map(function (bundle) {

            var cssFilter   = filter('*.css');
            var jsFilter    = filter('*.js');
            var otherFilter = filter(['*', '!*.css', '!*.js']);

            return gulp.src(bundle.files(bower.config.directory))

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

/**
 * Get the list of currently installed packages from Bower's API.
 * @return {Promise}
 */
function getInstalledPackages()
{
    return new Promise(function (resolve, reject) {
        bower.commands.list().on('end', function (list) {
            resolve(Object.keys(list.pkgMeta.dependencies));
        });
    });
}

/**
 * Get a flattened array of required packages for all bundles combined.
 * @return {array}
 */
function getRequiredPackages()
{
    return _(bundleManager.bundles)
        .pluck('packages')
        .flatten()
        .value();
}

/**
 * Install the named packages with Bower programmatic API
 * @param  {array}   packages
 * @return {Promise}
 */
function installPackages(packages)
{
    gutil.log(
        'Packages missing, now installing '
        + packages.map(function (package) {
            return gutil.colors.cyan(package);
        }).join(', ')
    );

    return new Promise(function (resolve, reject) {
        bower.commands
            .install(packages, {}, { interactive: true })
            .on('prompt', function (prompts, callback) {
                inquirer.prompt(prompts, callback);
            })
            .on('end', resolve);
    });
}

/**
 * Logs the currently configured breakdown of bundles and their components
 * @return {void}
 */
function logBundleBreakdown()
{
    bundleManager.bundles.forEach(function (bundle) {
        gutil.log(
            'Bundling '
            + gutil.colors.cyan.apply(gutil.colors, _.pluck(bundle.packages, 'name'))
            + ' into '
            + gutil.colors.magenta(bundle.name + '.css')
            + ' and '
            + gutil.colors.magenta(bundle.name + '.js')
        );
    });
}
