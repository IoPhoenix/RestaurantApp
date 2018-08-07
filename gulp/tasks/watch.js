const gulp = require('gulp'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync').create();
    
 
gulp.task('watch', function() {
    
        browserSync.init({
            notify: false,
            server: {
                baseDir: 'app'
            }
        });
    
        watch(['./app/index.html', './app/restaurant.html', ], function() {
            // auto refresh html
           browserSync.reload();
        });
    
        watch('./app/assets/styles/**/*.css', function() {
            gulp.start('cssInject');
        });

        watch('./app/assets/scripts/**/*.js', function() {
            gulp.start('scriptsRefresh');
        });

        // produce new images of different sizes if originals change:
        watch('./img/*.jpg', function() {
            gulp.start('imagesRefresh');
        });
    });
    
    
    // inject css to html without reloading
    // when styles task run and complete
    gulp.task('cssInject', function() {
        return gulp.src('./app/assets/styles/styles.css')
                    .pipe(browserSync.stream());
    });


    gulp.task('scriptsRefresh', ['scripts'], function() {
        browserSync.reload();
    });

    gulp.task('imagesRefresh', ['optimizeImages'], function() {
        browserSync.reload();
    });