'use strict';

const
      gulp = require('gulp'),
      pjson = require('./package.json'),
      dirs = pjson.config.directories,
      ghPagesUrl = pjson.config.ghPages,
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      rename = require('gulp-rename'),
      del = require('del'),
      browserSync = require('browser-sync').create(),
      ghPages = require('gulp-gh-pages'),
      plumber = require('gulp-plumber'),
      pug = require('gulp-pug'),
      sourcemaps = require('gulp-sourcemaps'),
      cssnano = require('cssnano'),
      cssnext = require('postcss-cssnext'),
      nested = require('postcss-nested'),
      mqpacker = require('css-mqpacker'),
      assets   = require('postcss-assets'),
      flatten = require('gulp-flatten'),
      fs = require('fs'),
      atImport = require('postcss-import'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat');

      var path = {
        css: [
          '/blocks/**/**.css',
        ]
      };


      gulp.task('style', function(){
        const
          processors = [
            atImport(),
            autoprefixer({ browsers:[ '>5%' ] }),
            nested(),
            assets({
              loadPaths: ['/assets/'],
              relativeTo: '/assets/styles/'
            }),
            mqpacker({ sort: true }),
            cssnano(),

          ];

          return gulp.src(dirs.src + path.css)
                  .pipe(plumber({ errorHandler: '' }))
                  .pipe(concat('app.css'))
                  .pipe(sourcemaps.init())
                  .pipe(postcss(processors))
                  .pipe(sourcemaps.write('/'))
                  .pipe(gulp.dest(dirs.dist + '/assets/styles'))
                  .pipe(browserSync.stream());
      });

      gulp.task('watch', function(){
          gulp.watch(dirs.src + '/blocks/**/*.css', ['style'])
          gulp.watch(dirs.src + '/templates/**/*.pug', ['pug'])
      });

      gulp.task('default', ['pug', 'style', 'watch']);

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

    gulp.task('copyPics', function() {
      gulp.src(dirs.src + '/blocks/**/*.{png,jpg,jpeg}')
      .pipe(flatten({ includeParents: 0} ))
      .pipe(gulp.dest(dirs.dist + '/assets/images'));
    });

    gulp.task('pages', function() {
      return gulp.src('./dist/**/*')
        .pipe(ghPages());
    });
