const compressing = require("compressing");
const path = require("path");
const fs = require("fs");
// const md5 = require("md5");
const fread = require("fs-readdir-recursive");
const crypto = require("crypto");
// const { spawn } = require("child_process");
function hashFile(filename) {
  return new Promise(function (s) {
    var hash = crypto.createHash("md5"),
      stream = fs.createReadStream(filename);
    //stream.pipe(writeStream);
    //console.log('Hashing: ', filename);
    stream.on("data", function (data) {
      hash.update(data, "utf8");
    });
    stream.on("end", function () {
      s(hash.digest("hex"));
    });
  });
}
module.exports = async function (ctx) {
  var wwwPath = path.join(ctx.opts.projectRoot, "www");
  if (!fs.existsSync(wwwPath)) {
    console.log("www目录不存在");
    return;
  }

  if (fs.existsSync(path.join(wwwPath, 'filesHash.json'))) {
    console.log("删除旧的 filesHash.json");
    fs.unlinkSync(path.join(wwwPath, 'filesHash.json'));
  }
  var ConfigParser = null;
  try {
    ConfigParser = ctx.requireCordovaModule("cordova-common").ConfigParser;
  } catch (e) {
    // fallback
    ConfigParser = ctx.requireCordovaModule(
      "cordova-lib/src/configparser/ConfigParser"
    );
  }
  var config = new ConfigParser(
    path.join(ctx.opts.projectRoot, "config.xml")
  );
  const packageName = config.packageName();
  console.log("version ",config.version());
  console.log("packageName  ",config.version());
  console.log("ios_CFBundleIdentifier ",config.ios_CFBundleIdentifier());
  console.log("android_packageName ",config.android_packageName());


  const zipFileName = packageName + "." + (ctx.opts.platforms.includes("ios") ? "ios" : "android") + ".zip";
  const destZipFilePath = path.join(wwwPath, "assets", zipFileName);
  if (fs.existsSync(destZipFilePath)) {
    console.log(`删除旧 ${zipFileName}.zip`);
    fs.unlinkSync(destZipFilePath);
  }
  var files = fread(
    wwwPath,
    p => !p.includes(".zip") || !p.includes("filesHash.json")
  );
  var md5JsonFiles = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const hashStart = Date.now();
    const hash = await hashFile(path.join(wwwPath, file));
    const hashEnd = Date.now();
    // console.log(`处理 ${i + 1}/${files.length} 个文件`);
    md5JsonFiles.push({
      file: file.replace(/\\/g, "/"),
      // size: bs.length,
      hash: hash,
      // hashTime: hashEnd - hashStart
    });
  }
  fs.writeFileSync(
    path.join(wwwPath, "filesHash.json"),
    JSON.stringify(md5JsonFiles, null, 2),
    { encoding: "utf8" }
  );
  var compressingComplete = false;
  var s = Date.now();
  await compressing.zip
    .compressDir(wwwPath, path.join(ctx.opts.projectRoot, zipFileName))
    .then(() => {
      console.log(`压缩文件 success ${zipFileName}`);
      if (fs.existsSync(destZipFilePath)) {
        fs.unlinkSync(destZipFilePath);
        console.log(`成功删除文件${destZipFilePath}`);
      }
      const delZipFile = packageName + "." + (ctx.opts.platforms.includes("ios") ? "android" : "ios") + ".zip";
      const delFile = path.join(ctx.opts.projectRoot, delZipFile);
      if (fs.existsSync(delFile)) {
        fs.unlinkSync(delFile);
        console.log(`成功删除文件 ${delFile}`);
      }
      // s = Date.now();
      // fs.copyFileSync(
      //   path.join(ctx.opts.projectRoot, "DongmeiIonic.zip"),
      //   destZipFilePath
      // );
      // console.log(`拷贝zip文件完成，耗时：【${Date.now() - s}】ms`);
      compressingComplete = true;
    })
    .catch(err => {
      console.error("压缩处理异常", err);
      compressingComplete = true;
    });
  console.log(
    `压缩文件处理完成 compressingComplete=${compressingComplete},耗时${Date.now() -
    s}ms`
  );
  // // 解压缩
  // compressing.zip.uncompress('nodejs-compressing-demo.zip', 'nodejs-compressing-demo3')
  //     .then(() => {
  //         console.log('success');
  //     })
  //     .catch(err => {
  //         console.error(err);
  //     });
};
