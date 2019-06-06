var gulp = require('gulp'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css');
const path = require("path");
gulp.task('iconfont', async () => {
    let svg =path.join(__dirname,'../resources', 'svgs/*.svg');
    let fontName = 'iconfont';
    await gulp.src(svg)
        .pipe(
            iconfontCss({
                fontName: fontName,
                targetPath: 'font.css', //生成的css样式的路径
                fontPath: './' //生成的iconfont的路径
            })
        )
        .pipe(
            iconfont({
                fontHeight:1000,
                normalize:true,
                fontName: fontName, // required
                prependUnicode: true, // recommended option
                formats: ['ttf', 'eot', 'woff', 'svg','woff2'], // default, 'woff2' and 'svg' are available
                timestamp: new Date().getTime()
            })
        )
        .pipe(
            gulp.dest(path.join(__dirname,'../',"src",'assets','iconfont'))
        );
});
