var gulp    = require('gulp');
var jasmine = require('gulp-jasmine');
var cover   = require('gulp-coverage');
var coveralls = require('gulp-coveralls');
var gutil   = require('gulp-util');

gulp.task('test', function () {
    gulp.src('spec/**/*Spec.js')
        .pipe(jasmine()).on('error', gutil.log);
});

gulp.task('test:coverage', function () {
    gulp.src('spec/**/*Spec.js')
        .pipe(cover.instrument({
            pattern: ['src/**/*.js']
        }))
        .pipe(jasmine()).on('error', gutil.log)
        .pipe(cover.gather())
        .pipe(cover.format([
            { reporter: 'lcov' }
        ]))
        .pipe(coveralls());
});

gulp.task('tdd', function () {
    gulp.watch(['spec/**/*.js', 'src/**/*.js'], ['test']);
});