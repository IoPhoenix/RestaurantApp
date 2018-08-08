const gulp = require('gulp'),
    del = require('del'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify');

    // remove previous version of minified js
    gulp.task('deleteMinifiedScripts', function() {
        return del(['./app/assets/scripts/app.min.js', './app/assets/scripts/restaurant.min.js']);
    });

    gulp.task('minifyRestaurantScript', ['deleteMinifiedScripts'], function() {
        return gulp.src(['./app/assets/scripts/dbhelper.js', './app/assets/scripts/restaurant_info.js', './app/assets/scripts/toggleMenu.js'])
        .pipe(concat('restaurant.js'))
          .pipe(minify({
            ext:{
                min:'.min.js'
            },
            noSource: true
          }))
          .pipe(gulp.dest('./app/assets/scripts/'))
      });


    gulp.task('scripts', ['minifyRestaurantScript'], function() {
        return gulp.src(['./app/assets/scripts/dbhelper.js', './app/assets/scripts/main.js'])
        .pipe(concat('app.js'))
          .pipe(minify({
            ext:{
                min:'.min.js'
            },
            noSource: true
          }))
          .pipe(gulp.dest('./app/assets/scripts/'))
      });

   