const gulp = require('gulp'),
    del = require('del'),
    minify = require('gulp-minify'),
    concat = require('gulp-concat');


gulp.task('deleteScriptsFolder', function() {
    return del('./app/temp/assets/scripts');
});

gulp.task('minifyMainFiles', ['deleteScriptsFolder'], function(callback) {
    return gulp.src(['./app/assets/scripts/idb.js', './app/assets/scripts/dbhelper.js', './app/assets/scripts/main.js'])
        .pipe(concat('app.js'))
        .pipe(minify({
            ext:{
                min:'.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest('./app/temp/assets/scripts/'))
});

gulp.task('minifyRestaurantFiles', ['deleteScriptsFolder'], function(callback) {
    return gulp.src(['./app/assets/scripts/idb.js', './app/assets/scripts/dbhelper.js', './app/assets/scripts/restaurant_info.js', './app/assets/scripts/toggleMenu.js'])
        .pipe(concat('restaurant.js'))
        .pipe(minify({
            ext:{
                min:'.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest('./app/temp/assets/scripts/'))
});

gulp.task('scripts', ['deleteScriptsFolder', 'minifyMainFiles', 'minifyRestaurantFiles']);