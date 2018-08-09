const gulp = require('gulp'),
    sass = require('gulp-sass'),
    cssimport = require('gulp-cssimport');


gulp.task('styles', function() {
    return gulp.src('./app/assets/styles/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(cssimport())
        .pipe(gulp.dest('./app/temp/assets/styles/'));
});