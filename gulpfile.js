var gulp    = require('gulp');
var jasmine = require('gulp-jasmine');
var console = require('better-console');
var gutil   = require('gulp-util');

gulp.task('test', function () {
  console.log(process.cwd());
    console.clear();
    gulp.src(__dirname + '/spec/**/*Spec.js')
        .pipe(jasmine( { includeStackTrace: true }))
        .on('error', gutil.log);
});

gulp.task('tdd', function () {
    gulp.watch(['spec/**/*.js', 'src/**/*.js'], ['test']);
});