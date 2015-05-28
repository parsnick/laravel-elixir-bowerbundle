/**
 * Combines vendor scripts and styles into single .js and .css bundles.
 *
 * Scripts and styles come from vendor/bower_components, and depend on the "main"
 * property in each package's bower.json.
 * This can be overridden using the "overrides" property in our bower.json in the
 * project root.
 */

var gulp = require('gulp');
var elixir = require('laravel-elixir');
var config = elixir.config;
var bowerMain = require('bower-main'); // this plugin only gets a certain file extension and separates out the result to { normal, minified, minifiedNotFound }
var mainBowerFiles = require('main-bower-files'); // this plugin finds all the... well, main bower files and returns array
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');
var frep = require('gulp-frep');
var merge2 = require('merge2');
var merge = require('merge-stream');
var path = require('path');

var bowerPath;

elixir.bowerBundles = [];
config.bowerDir     = config.bowerDir || 'vendor/bower_components';
config.bowerOutput  = config.bowerOutput || 'public/bundles';

elixir.extend('bowerBundle', function (bundleName, packages, jsOutputDir, cssOutputDir)
{
    bowerPath = __dirname + '/../../' + config.bowerDir;

    console.log(bowerPath);

    var bundleConfig = {
        name: bundleName,
        includes: packages,
        output: {
            js:  jsOutputDir  || config.bowerOutput,
            css: cssOutputDir || config.bowerOutput
        }
    };

    elixir.bowerBundles.push(bundleConfig);

    // Call the individual subtasks
    gulp.task('bowerBundle', [
        'bowerBundle:info',
        'bowerBundle:css',
        'bowerBundle:js',
        'bowerBundle:misc'
    ]);

    // Print out the bundle config
    gulp.task('bowerBundle:info', function ()
    {
        elixir.bowerBundles.forEach(function (bundle)
        {
            gutil.log(
                'Bundling ' +
                bundle.includes.map(function (packageName) {
                    return gutil.colors.cyan(packageName);
                }).join(', ') +
                ' into ' +
                gutil.colors.magenta(bundle.name + '.css') +
                ' and ' +
                gutil.colors.magenta(bundle.name + '.js')
            );
        });
    });

    // Bundle up the CSS
    gulp.task('bowerBundle:css', function ()
    {
        var bundleStreams = elixir.bowerBundles.map(function (bundle)
        {
            return getBowerStream('css', minify, bundle.includes)
                .pipe(concat(bundle.name + '.css'))
                .pipe(gulpif(!config.production, sourcemaps.write()))
                .pipe(gulp.dest(bundle.output.css));
        });

        return merge.apply(this, bundleStreams);
    });

    // Bundle up the javascript
    gulp.task('bowerBundle:js', function ()
    {
        var bundleStreams = elixir.bowerBundles.map(function (bundle)
        {
            return getBowerStream('js', uglify, bundle.includes)
                .pipe(concat(bundle.name + '.js'))
                .pipe(gulpif(!config.production, sourcemaps.write()))
                .pipe(gulp.dest(bundle.output.js));
        });

        return merge.apply(this, bundleStreams);
    });

    // Copy across any images, etc.
    gulp.task('bowerBundle:misc', function ()
    {
        var bundleStreams = elixir.bowerBundles.map(function (bundle)
        {
            return gulp.src(filterByPackage(mainBowerFiles('**/*.!(css|js)'), bundle.includes))
                .pipe(gulp.dest(config.bowerOutput));
        });

        return merge.apply(this, bundleStreams);
    });

    // Watch bower config for changes
    var toWatch = ['bower.json', 'gulpfile.js'];
    this.registerWatcher('bowerBundle:css', toWatch);
    this.registerWatcher('bowerBundle:js', toWatch);
    this.registerWatcher('bowerBundle:misc', toWatch);

    return this.queueTask('bowerBundle');
});

/**
 * Get the package name from a file path.
 *
 * @param {string} filePath
 * @returns {string}
 */
function getPackageFromPath(filePath)
{
    return path.relative(bowerPath, filePath).split('/').shift();
}


/**
 * Given an array of all files, returns only those from the named packages.
 *
 * @param {array} files
 * @param {array} packages
 * @return {array}
 */
function filterByPackage(files, packages)
{
    if ( ! packages) return files;

    return files.filter(function (file) {
        return packages.indexOf(getPackageFromPath(file)) > -1;
    });
}

/**
 * Get the main bower files from the given packages, including minified versions (returned separately).
 *
 * @param {string} ext
 * @param {array|undefined} packages
 * @returns {*}
 */
function getMainFiles(ext, packages)
{
    var main = bowerMain(ext, 'min.' + ext);

    return {
        normal: filterByPackage(main.normal, packages),
        minified: filterByPackage(main.minified, packages),
        minifiedNotFound: filterByPackage(main.minifiedNotFound, packages)
    };
}

/**
 * Get stream of bower component files.
 *
 * If production flag is not set, uses full uncompressed source.
 * If production flag is set, uses vendor minified source where exists,
 * otherwise minifies the full source using the provided minifier.
 *
 * @param {string} ext
 * @param {*} minifier
 * @param {array|undefined} packages
 * @returns {*}
 */
function getBowerStream(ext, minifier, packages)
{
    var bowerFiles = getMainFiles(ext, packages || []);

    var stream = gulp.src(bowerFiles.normal);

    if (config.production)
    {
        stream = merge2(
            gulp.src(bowerFiles.minified)
                .pipe(frep({ '//# sourceMappingURL=': '//' })), // remove maps from vendor provided minified versions (not published so causes 404s)
            gulp.src(bowerFiles.minifiedNotFound)
                .pipe(concat('tmp.min.' + ext))
                .pipe(minifier())
        );
    }
    else
    {
        stream.pipe(sourcemaps.init())
    }

    return stream;
}
