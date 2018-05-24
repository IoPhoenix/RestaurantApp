module.exports = function(grunt) {

    grunt.initConfig({
      uglify: {
        my_target: {
          files: {
            'js/app.js': ['js/dbhelper.js', 'js/main.js', 'js/restaurant_info.js', 'js/toggleMenu.js']
          }
        }
      },
      imagemin: {
        jpgs: {
            options: {
                progressive: true
            },
            files: [{
                expand: true,
                cwd: 'img/',
                src: ['*.jpg'],
                dest: 'images/'
            }]
        }
    },
  
      responsive_images: {
        dev: {
          options: {
            engine: 'im',
            sizes: [{
                name: false,
                suffix: '_extra-small',
                width: '420px',
                quality: 40
            }, {
                suffix: '_small',
                width: '540px',
                quality: 60
            },{
                suffix: '_medium',
                width: '445px',
                quality: 70
            },{
                suffix: '_large_1x',
                width: '580px',
                quality: 90
            },{
                suffix: '_large_2x',
                width: '580px',
                quality: 90,
                density: 144
            },{
                suffix: '_thumbnail',
                width: '270px',
                quality: 60
            }]
          },
  
          files: [{
            expand: true,
            src: ['*.{gif,jpg,png}'],
            cwd: 'img/',
            dest: 'images/'
          }]
        }
      },
  
      /* Clear out the images directory if it exists */
      clean: {
        dev: {
          src: ['images'],
        },
      },
  
      /* Generate the images directory if it is missing */
      mkdir: {
        dev: {
          options: {
            create: ['images']
          },
        },
      }
    });

 
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mkdir');


    grunt.registerTask('default', ['clean', 'mkdir', 'responsive_images', 'imagemin']);
  };  