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
    
        watch('./app/assets/styles/*.scss', function() {
            gulp.start('cssInject');            
        });

        // produce new images of different sizes if originals change:
        watch('./img/*.jpg', function() {
            gulp.start('imagesRefresh');
        });

        watch(['./app/assets/scripts/**/*.js', './app/service-worker.js'], function() {
            gulp.start('scriptsRefresh');
        });
    });
    
    
    // inject css to html without reloading
    // when styles task run and complete
    gulp.task('cssInject', ['styles'], function() {
        return gulp.src('./app/temp/styles/styles.css')
                    .pipe(browserSync.stream());
    });


    gulp.task('imagesRefresh', ['responsive_images'], function() {
        browserSync.reload();
    });

    gulp.task('scriptsRefresh', ['scripts'], function() {
        browserSync.reload();
    })