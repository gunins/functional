var gulp = require('gulp'),
    rollup = require('rollup-stream'),
    source = require('vinyl-source-stream'),
    through = require('through2'),
    path = require('path'),
    del = require('del');

//function for taking streams and returning streams;
let chain = (cb) => {
    return through.obj(function(chunk, enc, next) {
        let push = this.push.bind(this);
        cb(chunk, enc).pipe(through.obj((chunk, enc, done) => {
            push(chunk);
            done();
            next();
        }))
    });
};

// extension for rollup, for executing any file in directory from src
let rollupStream = (srcDir) => chain((chunk) => {
    let dir = srcDir[srcDir.length - 1] === '/' ? srcDir.substring(0, srcDir.length - 1) : srcDir,
        baseDir = process.cwd() + dir + '/',
        {path} = chunk,
        moduleName = path.replace(baseDir, '');
    return rollup({
        entry:      path,
        format:     'umd',
        moduleName: moduleName
    }).pipe(source(moduleName));
});

gulp.task('clean', function() {
    return del([
        './dist'
    ]);
});

gulp.task('rollup', ['clean'], function() {
    return gulp.src('./src/**/*.js').pipe(rollupStream('/src/')).pipe(gulp.dest('./dist'));
});

gulp.task('default', ['rollup']);

