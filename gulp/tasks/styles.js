const gulp = require('gulp'),
    sass = require('gulp-sass');


gulp.task('styles', function() {
    return gulp.src('./app/assets/styles/*.scss')
            .pipe(sass.sync().on('error', sass.logError))
            .pipe(sass({ outputStyle: 'compressed' }))
            .pipe(gulp.dest('./app/temp/assets/styles'));
});