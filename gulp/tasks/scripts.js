const gulp = require('gulp'),
    pump = require('pump'),
    uglify = require('gulp-uglify');


gulp.task('scripts', function (cb) {
    pump([
        gulp.src('./app/assets/scripts/*.js'),
        uglify(),
        gulp.dest('./app/assets/scripts/*.js')
    ],
    cb
    );
});



