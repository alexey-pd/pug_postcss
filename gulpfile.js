'use strict';

const
      gulp = require('gulp'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      rename = require('gulp-rename'),
      pjson = require('./package.json'),
      dirs = pjson.config.directories,
      ghPagesUrl = pjson.config.ghPages,
      del = require('del');

      gulp.task('style', function(){
        const
          processors = [
            autoprefixer({ browsers:[ '>5%' ] })
          ];

          return gulp.src(dirs.src + '/styles/in.css')
                  .pipe(postcss(processors))
                  .pipe(rename('index.css'))
                  .pipe(gulp.dest(dirs.dist + '/assets/styles'))
      });

      gulp.task('del', function () {
        console.log('dist очищен');
        return del([
          dirs.dist + '/**/*'
        ]);
      });
