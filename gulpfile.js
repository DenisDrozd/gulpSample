'use strict';

const gulp = require('gulp'),
    del = require('del'),
    less = require('gulp-less'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    removeHtmlComments = require('gulp-remove-html-comments'),
    minifyHTML = require('gulp-minify-html-2'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    imagemin = require('gulp-imagemin'),
    fileinclude = require('gulp-file-include'),
    babel = require('gulp-babel'),
    webpack = require('webpack-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

const path = {
    build: {
        html: 'dist/',
        htmlPages: 'dist/pages/',
        css: 'dist/styles/',
        cssLib: 'dist/styles/lib/',
        js: 'dist/js/',
        img: 'dist/images/',
        fonts: 'dist/fonts/'
    },
    src: {
        html: 'src/*.html',
        htmlPages: 'src/pages/**/*.html',
        css: 'src/styles/*.*',
        js: 'src/js/**/*.*',
        img: 'src/images/**/*.*',
        fonts: 'src/fonts/*',
        manifest: 'src/*.webmanifest'
    },
    watch: {
        html: 'src/**/*.html',
        htmlPages: 'src/pages/**/*.html',
        css: 'src/styles/**/*.*',
        js: 'src/js/**/*.*',
        img: 'src/images/**/*.*',
        fonts: 'src/fonts/*'
    },
    clean: './dist'
};

gulp.task('html', () => {
    const opts = {spare:true};

    return gulp.src(path.src.html)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error %>") }))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(removeHtmlComments())
        .pipe(minifyHTML(opts))
        .pipe(plumber.stop())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('htmlPages', function () {
    var opts = {spare:true};

    return gulp.src(path.src.htmlPages)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error %>") }))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(removeHtmlComments())
        .pipe(minifyHTML(opts))
        .pipe(plumber.stop())
        .pipe(gulp.dest(path.build.htmlPages))
        .pipe(reload({stream: true}));
});

gulp.task('css', () => {
    return gulp.src(path.src.css)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error %>") }))
        .pipe(less())
        .pipe(cssnano())
        .pipe(postcss([ autoprefixer() ]))
        //.pipe(rename({suffix: '.min'}))
        .pipe(plumber.stop())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('js', () => {
    return gulp.src([ path.src.js ])
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error %>") }))
        .pipe(webpack({
            mode: 'production'
        }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: [ '@babel/env' ]
        }))
        .pipe(concat('all.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('image', () => {
    return gulp.src(path.src.img)
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts', () => {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(reload({stream: true}));
});

gulp.task('manifest', () => {
    return gulp.src(path.src.manifest)
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});


gulp.task('build', gulp.series([
    'html',
    'htmlPages',
    'css',
    'js',
    gulp.parallel('image', 'fonts', 'manifest')
]));

gulp.task('watch', () => {
    gulp.watch( path.watch.html, gulp.series(['html']) );
    gulp.watch( path.watch.htmlPages, gulp.series(['htmlPages']) );
    gulp.watch( path.watch.css, gulp.series(['css']) );
    gulp.watch( path.watch.js, gulp.series(['js']) );
    gulp.watch( path.watch.img, gulp.series(['image']) );
    gulp.watch( path.watch.fonts, gulp.series(['fonts']) );
});

const config = {
    server: {
        baseDir: "./dist"
    },
    tunnel: false,
    host: 'localhost',
    port: 1112
};

gulp.task('webserver', (done) => {
    browserSync(config);
    done();
});

gulp.task('clean', () => del([ path.clean ]));

gulp.task('default', gulp.series(['build', 'webserver', 'watch']));
