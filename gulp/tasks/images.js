const gulp = require('gulp'),
    responsiveImages = require('gulp-responsive'),
    extReplace = require('gulp-ext-replace'),
    del = require('del');
    

gulp.task('deleteImagesFolder', function() {
    return del('assets/images');
});

// create images of different sizes and format:
gulp.task('responsive_images', ['deleteImagesFolder'], function() {
    return gulp.src('./img/*.{png,jpg}')
    .pipe(responsiveImages({
        '*.jpg': [{
            width: 270,
            rename: { suffix: '_thumbnail' },
            format: 'webp'
        }, {
          width: 420,
          rename: { suffix: '_extra-small' },
          quality: 40,
           format: 'webp'
        }, {
          width: 540,
          rename: { suffix: '_small' },
          quality: 60,
           format: 'webp'
        }, {
          width: 445,
          rename: { suffix: '_medium' },
          quality: 60,
           format: 'webp'
        }, {
            width: 580,
            rename: { suffix: '_large_1x' },
            quality: 70,
             format: 'webp'
        }, {
            width: 580,
            rename: { suffix: '_large_2x' },
            quality: 80,
             format: 'webp'
        }],
        }, {
            // Global configuration for all images
            // Use progressive (interlace) scan for JPEG and PNG output
            progressive: true,
            // Strip all metadata
            withMetadata: false,
          }))
        .pipe(extReplace('.webp'))
        .pipe(gulp.dest('./app/assets/images/'));
});
