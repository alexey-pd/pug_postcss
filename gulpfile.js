'use strict';

const
      gulp          = require('gulp'),
      pjson         = require('./package.json'),
      dirs          = pjson.config.directories,
      ghPagesUrl    = pjson.config.ghPages,
      postcss       = require('gulp-postcss'),
      autoprefixer  = require('autoprefixer'),
      rename        = require('gulp-rename'),
      del           = require('del'),
      browserSync   = require('browser-sync').create(),
      ghPages       = require('gulp-gh-pages'),
      plumber       = require('gulp-plumber'),
      pug           = require('gulp-pug'),
      sourcemaps    = require('gulp-sourcemaps'),
      cssnano       = require('cssnano'),
      cssnext       = require('postcss-cssnext'),
      nested        = require('postcss-nested'),
      mqpacker      = require('css-mqpacker'),
      assets        = require('postcss-assets'),
      flatten       = require('gulp-flatten'),
      fs            = require('fs'),
      atImport      = require('postcss-import'),
      uglify        = require('gulp-uglify'),
      concat        = require('gulp-concat');

      gulp.task('style', function(){

         const
          processors = [
            atImport(),
            autoprefixer({ browsers:[ '>5%' ] }),
            nested(),
            assets({
              loadPaths: ['dist/assets/images/'],
              relativeTo: 'dist/assets/styles/'
            }),
            mqpacker({ sort: true }),
            cssnano()
          ];

          return gulp.src(dirs.src + dirs.styles)
            .pipe(plumber({ errorHandler: '' }))
            .pipe(concat('app.min.css'))
            .pipe(sourcemaps.init())
            .pipe(postcss(processors))
            .pipe(sourcemaps.write('/'))
            .pipe(gulp.dest(dirs.dist + '/assets/styles'))
            .pipe(browserSync.stream());
          });

      gulp.task('watch', function(){
          gulp.watch( dirs.src + '/blocks/**/*.css', ['style'])
          gulp.watch([dirs.src + '/blocks/**/*.pug', dirs.src + '/templates/**/*.pug'], ['pug'])
      });

      gulp.task('default', ['pug', 'style', 'copyPics', 'watch', 'browser-sync']);

      gulp.task('del', function () {
        console.log('app clean');
        return del([
          dirs.dist + '/**/*'
        ]);
      });

      gulp.task('delBlocks', function () {
        console.log('blocks clean');
        return del([
          dirs.blocks + '/**/*'
        ]);
      });

      gulp.task('browser-sync', function(){

          browserSync.init({
            server: {
              baseDir: "./app/"
              },
              port: 3000,
              startPath: '/index.html',
              // proxy: "gulp.dev"
            });
      });

      gulp.task('reload', function(){
          browserSync.reload();
      });

      gulp.task('pug', function() {

        return gulp.src(dirs.src + '/templates/*.pug')
          .pipe(plumber({ errorHandler: '' }))
          .pipe(pug())
          .pipe(gulp.dest(dirs.dist));
          browserSync.stream();
      });

      gulp.task('copyPics', function() {
        gulp.src(dirs.src + '/blocks/**/*.{png,jpg,jpeg}')
          .pipe(flatten({ includeParents: 0 }))
          .pipe(gulp.dest(dirs.dist + '/assets/images'));
      });

      gulp.task('pages', function() {
        return gulp.src('./app/**/*')
          .pipe(ghPages());
      });
