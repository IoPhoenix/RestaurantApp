const gulp = require('gulp'),
    responsiveImages = require('gulp-responsive'),
    imagemin = require('gulp-imagemin'),
    del = require('del');
    

gulp.task('deleteImagesFolder', function() {
    return del('assets/images');
});

// create images of different sizes and quality:
gulp.task('responsive_images', ['deleteImagesFolder'], function() {
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
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true})
        ]))
        .pipe(gulp.dest('assets/images/'));
});
