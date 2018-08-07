const gulp = require('gulp'),
    responsiveImages = require('gulp-responsive'),
    del = require('del'),
    imagemin = require('gulp-imagemin');
    

gulp.task('deleteImagesFolder', function() {
    return del('./dist/images/');
});

// create images of different sizes and quality:
gulp.task('responsive_image', ['deleteImagesFolder'], function() {
    return gulp.src('./img/*.{png,jpg}')
    .pipe(responsiveImages({
        // Resize JPG images to different sizes:
        '*.jpg': [{
            width: 270,
            rename: { suffix: '_thumbnail' },
        }, {
          width: 420,
          rename: { suffix: '_extra-small' },
          quality: 40
        }, {
          width: 540,
          rename: { suffix: '_small' },
          quality: 60
        }, {
          width: 445,
          rename: { suffix: '_medium' },
          quality: 60
        }, {
            width: 580,
            rename: { suffix: '_large_1x' },
            quality: 70
        }, {
            width: 580,
            rename: { suffix: '_large_2x' },
            quality: 80
        }],
        }, {
            // Global configuration for all images
            // Use progressive (interlace) scan for JPEG and PNG output
            progressive: true,
            // Strip all metadata
            withMetadata: false,
          }))
        .pipe(gulp.dest('./app/assets/images/'));
});

// optimize images:
gulp.task('optimizeImages', ['responsive_image'], function() {
    return gulp.src(['./app/assets/images/*'])
                .pipe(imagemin([
                    imagemin.jpegtran({progressive: true}),
                    imagemin.optipng({optimizationLevel: 5})
                ]))
                .pipe(gulp.dest('./app/assets/images'));
});