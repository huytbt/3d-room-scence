var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var rimraf = require('rimraf');
var source = require('vinyl-source-stream');
var _ = require('lodash');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');

var config = {
  entryFile: './src/index.js',
  outputDir: './dist/',
  outputFile: 'index.js'
};

// clean the output directory
gulp.task('clean', (cb) => {
  rimraf(config.outputDir, cb);
});

var bundler;
var getBundler = () => {
  if (!bundler) {
    bundler = watchify(browserify(config.entryFile, _.extend({debug: true}, watchify.args)));
  }
  return bundler;
};

var bundle = () => {
  return getBundler()
    .transform(babelify.configure({
      // Use all of the ES2015 spec
      presets: ['es2015']
    }))
    .bundle()
    .on('error', (err) => {
      console.log('Error: ' + err.message);
    })
    .pipe(source(config.outputFile))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(config.outputDir))
    .pipe(reload({stream: true}));
};

gulp.task('build-persistent', ['clean'], () => {
  return bundle();
});

gulp.task('build', ['build-persistent'], () => {
  process.exit(0); // eslint-disable-line
});

gulp.task('watch', ['build-persistent'], () => {

  browserSync({
    server: {
      baseDir: './'
    }
  });

  getBundler().on('update', () => {
    gulp.start('build-persistent');
  });
});

// WEB SERVER
gulp.task('serve', ['build-persistent'], () => {
  browserSync({
    server: {
      baseDir: './'
    }
  });
});
