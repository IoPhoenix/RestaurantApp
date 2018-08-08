const gulp = require('gulp');


gulp.task('styles', function() {
    const pathsToCopy = [
        './app/assets/styles/styles.min.css'
    ];
    return gulp.src(pathsToCopy).pipe(gulp.dest('./app/temp/styles'));
});