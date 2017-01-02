'use strict';

const
      gulp = require('gulp'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      rename = require('gulp-rename'),
      pjson = require('./package.json'),
      dirs = pjson.config.directories,
      ghPagesUrl = pjson.config.ghPages,
      del = require('del'),
      browserSync = require('browser-sync').create(),
      ghPages = require('gulp-gh-pages'),
      plumber = require('gulp-plumber'),
      pug = require('gulp-pug'),
      sourcemaps = require('gulp-sourcemaps');

      gulp.task('style', function(){
        const
          processors = [
            autoprefixer({ browsers:[ '>5%' ] })
          ];

          return gulp.src(dirs.src + '/styles/some.css')
                  .pipe(plumber({ errorHandler: '' }))
                  .pipe(sourcemaps.init())
                  .pipe(rename('main.css'))
                  .pipe(postcss(processors))
                  .pipe(sourcemaps.write('/'))
                  .pipe(gulp.dest(dirs.dist + '/assets/styles'))
                  .pipe(browserSync.stream());
      });

      gulp.task('del', function () {
        console.log('dist очищен');
        return del([
          dirs.dist + '/**/*'
        ]);
      });

      gulp.task('pug', function() {

      return gulp.src(dirs.src + '/templates/*.pug')
        .pipe(plumber({ errorHandler: '' }))
        .pipe(pug())
        .pipe(gulp.dest(dirs.dist));
    });
