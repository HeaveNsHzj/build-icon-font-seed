var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var map = require('map-stream');
var rename = require('gulp-rename');
var lodash = require('lodash');

var fontName = 'testIcon';
var className;
if (gulp.env.font) {
    fontName = gulp.env.font
}
className = gulp.env.css || fontName;


gulp.task('build', function () {

    var stream = gulp.src(['src/*.svg'])
        .pipe(iconfont({
            fontName: fontName,
            formats: ['ttf', 'eot', 'woff', 'svg'], // default, 'woff2' and 'svg' are available
        }));

    return Promise.all([
        new Promise(function (resolve) {
            stream.on('glyphs', function (glyphs) {
                var data = {
                    glyphs: glyphs,
                    fontName: fontName,
                    fontPath: '../fonts/',
                    className: className
                };
                var p1 = new Promise(function (resolve) {
                    gulp.src(`templates/iconfont.css`)
                        .pipe(renderTemplate(data))
                        .pipe(rename({basename: fontName}))
                        .pipe(gulp.dest('build/css/'))
                        .on('end', resolve)
                });
                var p2 = new Promise(function (resolve) {
                    gulp.src(`templates/iconfont.html`)
                        .pipe(renderTemplate(data))
                        .pipe(rename({basename: fontName}))
                        .pipe(gulp.dest('build/'))
                        .on('end', resolve);
                });
                return Promise.all([p1, p2]).then(resolve);
            })
        }),

        new Promise(function (resolve) {
            stream.pipe(gulp.dest('build/fonts/'))
                .on('end', resolve)
        })
    ]);
});

function renderTemplate(data) {
    return map(function (file, callback) {
        if (file.contents instanceof Buffer) {
            try {
                var css = lodash.template(String(file.contents))(data);
                file.contents = new Buffer(css);
                callback(null, file);
            } catch (err) {
                callback(err);
            }
        } else {
            callback(new Error('streams not supported'));
        }
    });
}