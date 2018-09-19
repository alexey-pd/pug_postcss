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
    cssnano = require('cssnano'),
    cssnext = require('postcss-cssnext'),
    cleancss = require('gulp-clean-css'),
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

var paths = {
    styles: {
        src: dirs.src + '/blocks/_blocks.css',
        build: dirs.dist + '/assets/styles'
    },
    scripts: {
        src: dirs.src + dirs.scripts,
        build: dirs.dist + '/assets/scripts'
    }
};

var templates = function (done) {
    done();
    return gulp.src(dirs.src + '/templates/*.pug')
        .pipe(plumber({
            errorHandler: ''
        }))
        .pipe(data(file => require(dirs.src + '/data.json')))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(dirs.dist))
        .pipe(browserSync.stream());
};

var styles = function (done) {
    done();
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
            cssnano()
        ];

    return gulp.src(paths.styles.src, { sourcemaps: true })
        .pipe(concat('app.min.css'))
        .pipe(postcss(processors))
        .pipe(cleancss())
        .pipe(rename({
            basename: 'app',
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.styles.build))
        .pipe(browserSync.stream());
};

var scripts = function (done) {
    done();
    return gulp.src(paths.scripts.src, { sourcemaps: true })
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest(paths.scripts.build))
        .pipe(browserSync.stream());
};

var copy = function (done) {
    done();
    gulp.src(dirs.src + '/blocks/**/*.{png,jpg,jpeg}')
        .pipe(flatten({
            includeParents: 0
        }))
        .pipe(gulp.dest(dirs.dist + '/assets/images'))
    gulp.src(dirs.src + '/fonts/**/*.{eot,woff,ttf,woff2}')
        .pipe(flatten({
            includeParents: 1
        }))
        .pipe(gulp.dest(dirs.dist + '/assets/fonts'));
};

var sprites = function (done) {
    done();
    return gulp.src(dirs.src + dirs.svgContent, { allowEmpty: true })
        .pipe(svgSprite({ mode: "symbols" }))
        .pipe(gulp.dest(dirs.src + '/templates/_layout/_includes/svg-sprite'));
};

var watch = function () {
    gulp.watch([dirs.src + '/blocks/**/*.pug',
    dirs.src + '/templates/**/*.pug'], templates)
    gulp.watch(dirs.src + '/blocks/**/*.css', styles)
    gulp.watch(dirs.src + '/blocks/**/*.js', scripts)
    gulp.watch(dirs.src + '/blocks/**/*.svg', sprites)
};

var sync = function () {
    browserSync.init({
        server: {
            baseDir: "./app/"
        },
        port: 3000,
        startPath: '/index.html',
    });
};

var clean = function (done) {
    done();
    console.log('app clean');
    return del([
        dirs.dist + '/**/*'
    ]);
};

var delBlocksImports = function () {
    return new Promise((resolve, reject) => {
        fs.writeFile(`src/templates/_layout/_includes/blocks.pug`, ``, err => {
            if (err) {
                reject(`ERR>>> Failed to rewrite blocks.pug`);
            } else {
                resolve();
            }
        });
    });
};

var createStyleCore = function () {
    return new Promise((resolve, reject) => {
        fs.writeFile(`src/blocks/_blocks.css`, ``, err => {
            if (err) {
                reject(`ERR>>> Failed to rewrite blocks.css`);
            } else {
                resolve();
            }
        });
    });
};

var delBlocks = function (done) {
    done();
    console.log('blocks clean');
    delBlocksImports();
    clean([
        dirs.blocks + '/**/*'
    ])
    return createStyleCore();
};

var pages = function () {
    console.log(ghPagesUrl);
    return gulp.src('./app/**/*')
        .pipe(ghPages());
};

gulp.task(clean);

gulp.task('default',
    gulp.series(
        clean,
        gulp.parallel(templates, styles, scripts, copy, sprites, watch, sync)));

gulp.task('build',
    gulp.parallel(clean, templates, styles, scripts, copy, sprites));