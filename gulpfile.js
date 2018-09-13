'use strict';

const
    gulp = require('gulp'),
    pjson = require('./package.json'),
    dirs = pjson.config.directories,
    ghPagesUrl = pjson.config.ghPages,
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    ghPages = require('gulp-gh-pages'),
    plumber = require('gulp-plumber'),
    pug = require('gulp-pug'),
    sourcemaps = require('gulp-sourcemaps'),
    cssnano = require('cssnano'),
    cssnext = require('postcss-cssnext'),
    mqpacker = require('css-mqpacker'),
    assets = require('postcss-assets'),
    flatten = require('gulp-flatten'),
    fs = require('fs'),
    atImport = require('postcss-import'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    svgSprite = require('gulp-svg-sprites'),
    grid = require('postcss-flexboxgrid'),
    clearfix = require('postcss-clearfix'),
    data = require('gulp-data'),
    range = require('postcss-input-range');

gulp.task('scripts', function() {
    gulp.src(dirs.src + dirs.scripts)
        .pipe(plumber({
            errorHandler: ''
        }))
        .pipe(concat(dirs.src + dirs.scripts))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dirs.dist + '/assets/scripts'))
        .pipe(browserSync.stream());
    gulp.src(dirs.src + dirs.scripts)
        .pipe(concat(dirs.src + dirs.scripts))
        .pipe(rename('app.js'))
        .pipe(gulp.dest(dirs.dist + '/assets/scripts'))
});

gulp.task('style', function() {

    const
        processors = [
            atImport(),
            cssnext({
                warnForDuplicates: false
            }),
            range(),
            assets({
                loadPaths: ['app/assets/images/'],
                relativeTo: 'app/assets/styles/'
            }),
            mqpacker({
                sort: true
            }),
            cssnano(),
        ];

    return gulp.src(dirs.src + '/blocks/_blocks.css')
        .pipe(plumber({
            errorHandler: ''
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.css'))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest(dirs.dist + '/assets/styles'))
        .pipe(browserSync.stream());
});

gulp.task('watch', function() {
    gulp.watch(dirs.src + '/blocks/**/*.pug', ['pug'])
    gulp.watch(dirs.src + '/templates/**/*.pug', ['pug'])
    gulp.watch(dirs.src + '/blocks/**/*.css', ['style'])
    gulp.watch(dirs.src + '/blocks/**/*.js', ['scripts'])
    gulp.watch(dirs.src + '/blocks/**/*.svg', ['svg-sprites'])

});

gulp.task('default', ['pug', 'style', 'scripts', 'copyAssets', 'svg-sprites', 'watch', 'browser-sync']);
gulp.task('build', ['pug', 'style', 'scripts', 'copyAssets', 'svg-sprites']);

gulp.task('del', function() {
    console.log('app clean');
    return del([
        dirs.dist + '/**/*'
    ]);
});

function delBlocksImports() {
    return new Promise((resolve, reject) => {
        fs.writeFile(`src/templates/_layout/_includes/blocks.pug`, ``, err => {
            if (err) {
                reject(`ERR>>> Failed to rewrite blocks.pug`);
            } else {
                resolve();
            }
        });
    });
}

function createStyleCore(){
  return new Promise((resolve, reject) => {
      fs.writeFile(`src/blocks/_blocks.css`, ``, err => {
        if (err) {
            reject(`ERR>>> Failed to rewrite blocks.css`);
        } else {
            resolve();
        }
    });
  });
}

gulp.task('delBlocks', function() {
    console.log('blocks clean');
    delBlocksImports();
    del([
        dirs.blocks + '/**/*'
    ])
    return createStyleCore();
});

gulp.task('browser-sync', function() {

    browserSync.init({
        server: {
            baseDir: "./app/"
        },
        port: 3000,
        startPath: '/index.html',
    });
});

gulp.task('reload', function() {
    browserSync.reload();
});

gulp.task('pug', function() {

    return gulp.src(dirs.src + '/templates/*.pug')
        .pipe(plumber({
            errorHandler: ''
        }))
        .pipe(data(file => require(dirs.src + '/data.json')))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(dirs.dist));
    browserSync.stream();
    browserSync.reload();
});

gulp.task('copyAssets', function() {
    gulp.src(dirs.src + '/blocks/**/*.{png,jpg,jpeg}')
        .pipe(flatten({
            includeParents: 0
        }))
        .pipe(gulp.dest(dirs.dist + '/assets/images'));
    gulp.src(dirs.src + '/fonts/**/*.{eot,woff,ttf,woff2}')
        .pipe(flatten({
            includeParents: 1
        }))
        .pipe(gulp.dest(dirs.dist + '/assets/fonts'));
});

gulp.task('pages', function() {
    console.log(ghPagesUrl);
    return gulp.src('./app/**/*')
        .pipe(ghPages());
});


gulp.task('svg-sprites', function() {
    console.log(dirs.dist + '/assets');
    return gulp.src(dirs.src + dirs.svgContent)
        .pipe(svgSprite({ mode: "symbols" }))
        .pipe(gulp.dest(dirs.src + '/templates/_layout/_includes/svg-sprite'))
});