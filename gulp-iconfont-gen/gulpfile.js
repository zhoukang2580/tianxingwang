var gulp = require("gulp"),
  iconfont = require("gulp-iconfont"),
  iconfontCss = require("gulp-iconfont-css");
var fs = require("fs");
const path = require("path");
// try {
//   fs.unlinkSync(path.join(__dirname, `../src/assets/${fontName}/font.css`));
//   fs.unlinkSync(
//     path.join(__dirname, `../src/assets/${fontName}/${fontName}.ttf`)
//   );
//   fs.unlinkSync(
//     path.join(__dirname, `../src/assets/${fontName}/${fontName}.eot`)
//   );
//   fs.unlinkSync(
//     path.join(__dirname, `../src/assets/${fontName}/${fontName}.woff`)
//   );
//   fs.unlinkSync(
//     path.join(__dirname, `../src/assets/${fontName}/${fontName}.svg`)
//   );
//   fs.unlinkSync(
//     path.join(__dirname, `../src/assets/${fontName}/${fontName}.woff2`)
//   );
// } catch (e) {
//   console.log(e);
// }
gulp.task("iconfont", async () => {
  let fontName = "iconfont";
  let svg = path.join(__dirname, "../src/assets/svgs", "svgs/*.svg");
  const dist = path.join(__dirname, "../src", "assets", "iconfont");
  console.log(dist);
  await gulp
    .src(svg)
    .pipe(
      iconfontCss({
        fontName: fontName,
        targetPath: "font.css", //生成的css样式的路径
        fontPath: "./" //生成的iconfont的路径
      })
    )
    .pipe(
      iconfont({
        fontHeight: 1000,
        normalize: true,
        fontName: fontName, // required
        prependUnicode: true, // recommended option
        formats: ["ttf", "eot", "woff", "svg", "woff2"], // default, 'woff2' and 'svg' are available
        timestamp: new Date().getTime()
      })
    )
    .pipe(gulp.dest(dist));
});
