const gulp = require('gulp'),
    del = require('del'),
    concat = require('gulp-concat');

// remove previous versions of js files
gulp.task('deleteMainScript', function() {
    return del('./app/temp/scripts/app.js');
});

gulp.task('deleteRestaurantScript', function() {
    return del('./app/temp/scripts/restaurant.js');
});


gulp.task('concatRestaurantScripts', ['deleteRestaurantScript'], function() {
    return gulp.src(['./app/assets/scripts/dbhelper.js', './app/assets/scripts/restaurant_info.js', './app/assets/scripts/toggleMenu.js'])
    .pipe(concat('restaurant.js'))
    .pipe(gulp.dest('./app/temp/scripts'))
});


gulp.task('concatMainScripts', ['deleteMainScript'], function() {
    return gulp.src(['./app/assets/scripts/dbhelper.js', './app/assets/scripts/main.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./app/temp/scripts'))
});

gulp.task('scripts', ['concatRestaurantScripts', 'concatMainScripts']);