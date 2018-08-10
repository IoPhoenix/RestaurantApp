const gulp = require('gulp'),
    minify = require('gulp-minify'),
    concat = require('gulp-concat');


gulp.task('minifyMainFiles', function(callback) {
    return gulp.src(['./app/assets/scripts/idb.js', './app/assets/scripts/dbhelper.js', './app/assets/scripts/main.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./app/temp/assets/scripts/'))
});

gulp.task('minifyRestaurantFiles', function(callback) {
    return gulp.src(['./app/assets/scripts/idb.js', './app/assets/scripts/dbhelper.js', './app/assets/scripts/restaurant_info.js', './app/assets/scripts/toggleMenu.js'])
        .pipe(concat('restaurant.js'))
        .pipe(gulp.dest('./app/temp/assets/scripts/'))
});

gulp.task('scripts', ['minifyMainFiles', 'minifyRestaurantFiles']);