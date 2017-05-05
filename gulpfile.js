const gulp = require('gulp'),
    bump = require('gulp-bump'),
    rollup = require('rollup-stream'),
    source = require('vinyl-source-stream'),
    through = require('through2'),
    del = require('del'),
    mocha = require('gulp-mocha'),
    fs = require('fs');

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

let getFiles = (dir, files_) => {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
};

let excludePaths = getFiles(process.cwd() + '/src');

// extension for rollup, for executing any file in directory from src
let rollupStream = (srcDir) => chain((chunk) => {
    let dir = srcDir[srcDir.length - 1] === '/' ? srcDir.substring(0, srcDir.length - 1) : srcDir,
        baseDir = process.cwd() + dir + '/',
        {path} = chunk,
        moduleName = path.replace(baseDir, ''),
        excluded = excludePaths.filter(file => file !== path);
    return rollup({
        entry:      path,
        format:     'umd',
        moduleName: moduleName,
        external:   excluded
    }).pipe(source(moduleName));
});

gulp.task('clean', () => {
    return del([
        './dist',
        './target'
    ]);
});

gulp.task('rollup', ['clean'], () => {
    return gulp.src('./src/**/*.js', {read: false})
        .pipe(rollupStream('/src/'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('test', ['rollup'], () => {
    return gulp.src([
        './test/functional/**/*.js'
    ], {read: false}).pipe(mocha({reporter: 'list'}));

});

gulp.task('bump:patch', ['test'], function() {
    gulp.src('./*.json')
        .pipe(bump({type: 'patch'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bump:minor', function() {
    gulp.src('./*.json')
        .pipe(bump({type: 'minor'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bump:major', function() {
    gulp.src('./*.json')
        .pipe(bump({type: 'major'}))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['rollup']);

