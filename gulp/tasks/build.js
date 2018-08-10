const gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    cssnano = require('gulp-cssnano'),
    minify = require('gulp-minify'),
    browserSync = require('browser-sync').create();



gulp.task('previewBuild', function() {
    browserSync.init({
        notify: false,
        server: {
            baseDir: 'build'
        }
    }); 
});

// delete previous build:
gulp.task('deleteBuildFolder', function() {
    return del('./build/');
});


gulp.task('copyGeneralFiles', ['deleteBuildFolder'], function() {
    const pathsToCopy = [
        './app/**/*',
         '!./app/index.html',
         '!./app/restaurant.html',
         '!./app/service-worker.js',
         '!./app/assets/images/**',
         '!./app/assets/styles/**',
         '!./app/assets/scripts/**',
         '!./app/temp',
         '!./app/temp/**'
    ]
    return gulp.src(pathsToCopy).pipe(gulp.dest('./build'));
});


// optimize images:
gulp.task('optimizeImages', ['deleteBuildFolder'], function() {
    return gulp.src(['./app/assets/images/*'])
                // .pipe(imagemin([
                //     webp({
                //         quality: 75
                //     })
                // ]))
                // .pipe(extReplace(".webp"))
                .pipe(gulp.dest('./build/assets/images'));

});


gulp.task('useminTrigger', ['deleteBuildFolder'], function() {
    gulp.start('usemin');
});

// minify js and css files
gulp.task('usemin', ['styles', 'scripts'], function() {
    return gulp.src(['./app/index.html', './app/restaurant.html'])
                .pipe(usemin({
                    css: [function() {return rev()}, function() {return cssnano()}],
                    js: [function() {return rev()}, function() { return minify({
                        ext:{
                            min:'.js'
                        },
                        noSource: true
                    })}]
                }))
                .pipe(gulp.dest('./build'));
});



gulp.task('build', ['deleteBuildFolder', 'copyGeneralFiles', 'optimizeImages', 'useminTrigger']);