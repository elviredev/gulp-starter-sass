// @ts-nocheck
// Initialize modules
const { src, dest, watch, series, parallel } = require('gulp')
const browsersync = require('browser-sync').create()
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const concat = require('gulp-concat')
const imagemin = require('gulp-imagemin')
const postcss = require('gulp-postcss')
const replace = require('gulp-replace')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

// Files Path Variables
const files = {
  scssPath: 'src/scss/**/*.scss',
  jsPath: 'src/js/**/*.js',
  imgPath: './src/img/**',
}

// Browser-Sync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './',
    },
    port: 3001,
    notify: false,
  })
  done()
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload()
  done()
}

// Compile SASS & Inject into Browser
function scssTask() {
  return src(files.scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/css/'))
    .pipe(browsersync.stream())
}

// JS Task
function jsTask() {
  return src(files.jsPath)
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(dest('dist/js/'))
    .pipe(browsersync.stream())
}

// Cachebusting task : contournement du cache
const cbString = new Date().getTime()
function cacheBustTask() {
  return src(['index.html'])
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
    .pipe(dest('.'))
}

// Optimize images
function imgTask() {
  return src(files.imgPath)
    .pipe(
      imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })
    )
    .pipe(dest('./dist/img/'))
}

// Watch files
function watchTask() {
  watch(
    [files.scssPath, files.jsPath, files.imgPath],
    parallel(scssTask, jsTask, imgTask, browserSyncReload)
  )
}

// Default task
exports.default = series(
  parallel(scssTask, jsTask, imgTask, browserSync),
  cacheBustTask,
  watchTask
)
