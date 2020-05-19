const fs = require("fs");
const path = require("path");
// const utils = require("./utils");
function delDir(p, delSelf) {
  let files = [];
  if (fs.existsSync(p)) {
    files = fs.readdirSync(p);
    files.forEach((file, index) => {
      let curPath = path.join(p, file);
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath, true); //递归删除文件夹
      } else {
        fs.unlinkSync(curPath, true); //删除文件
      }
    });
    if (delSelf) {
      fs.rmdirSync(p);
    }
  }
}

function copyDir(src, dst) {
  let paths = fs.readdirSync(src); //同步读取当前目录
  paths.forEach(function (fpath) {
    var _src = path.join(src, fpath);
    var _dst = path.join(dst, fpath);
    const stats = fs.statSync(_src);
    if (stats.isFile()) { //如果是个文件则拷贝 
      let readable = fs.createReadStream(_src);//创建读取流
      let writable = fs.createWriteStream(_dst);//创建写入流
      readable.pipe(writable);
    } else if (stats.isDirectory()) { //是目录则 递归 
      checkDirectory(_src, _dst, copyDir);
    }
  });
}
function checkDirectory(src, dst, callback) {
  try {
    fs.accessSync(dst, fs.constants.F_OK);
  } catch (err) {
    fs.mkdirSync(dst);
    callback(src, dst);
  }
  callback(src, dst);
};
function checkAngularJsonOutPutPath(ctx) {
  const json = fs.readFileSync(path.join(ctx.opts.projectRoot, 'angular.json'), { encoding: "utf8" });
  if (json) {
    const obj = JSON.parse(json);
    if (obj.projects.app.architect.build.options.outputPath != "www") {
      throw new Error(`请将 angular.json 文件中的 outputPath 的值更改为默认值 www ，然后重新编译 ionic cordova build android --prod --release`);
    }
  }
}
function copyProductionWwwToProjectRoot(ctx) {
  let statTime = Date.now();
  try {
    const json = fs.readFileSync(path.join(ctx.opts.projectRoot, 'angular.json'), { encoding: "utf8" });
    if (json) {
      const obj = JSON.parse(json);
      if (obj && obj.projects.app.architect.build.options.outputPath) {
        const outputPath = path.resolve(ctx.opts.projectRoot, obj.projects.app.architect.build.options.outputPath);
        console.log("dist", outputPath);
        const wwwPath = path.join(ctx.opts.projectRoot, 'www');
        if (fs.existsSync(wwwPath)) {
          statTime = Date.now();
          delDir(wwwPath, true);
          console.log("删除旧 www 耗时：", Date.now() - statTime);
        } else {
          throw new Error("请先执行编译操作 ionic cordova build android")
        }
        if (fs.existsSync(outputPath)) {
          if (!fs.existsSync(wwwPath, 'www')) {
            fs.mkdirSync(wwwPath);
          }
          copyDir(outputPath, wwwPath);
          console.log("拷贝www耗时：", Date.now() - statTime);
        }
      }
    }
  } catch (e) {
    console.error("拷贝www目录失败", e);
  }
}
function copyCordovaErrorHtml(ctx) {
  const wwwPath = path.join(ctx.opts.projectRoot, 'www');
  const name = 'cordovaError.html';
  const errorhtmlPath = path.join(ctx.opts.projectRoot, 'src', name);
  if (fs.existsSync(errorhtmlPath)) {
    fs.copyFileSync(errorhtmlPath, path.join(wwwPath, name), { encoding: "utf8" });
  }
}


module.exports = function (ctx) {
  checkAngularJsonOutPutPath(ctx);
  copyCordovaErrorHtml(ctx);
  if (ctx.opts.platforms.includes("android")) {
    const projectRoot = ctx.opts.projectRoot;
    const tgtXmlPath = path.resolve(
      projectRoot,
      "platforms/android/app/src/main/res/xml",
      "file_paths.xml"
    );
    const network_security_configxmlPath = path.resolve(
      projectRoot,
      "platforms/android/app/src/main/res/xml",
      "network_security_config.xml"
    );
    console.log("路径：", tgtXmlPath);
    // <files-path name="name" path="path" /> 物理路径相当于Context.getFilesDir() + /path/
    // <cache-path name="name" path="path" /> 物理路径相当于Context.getCacheDir() + /path/
    // <external-path name="name" path="path" /> 物理路径相当于Environment.getExternalStorageDirectory() + /path/
    // <external-files-path name="name" path="path" /> 物理路径相当于Context.getExternalFilesDir(String) + /path/
    // <external-cache-path name="name" path="path" /> 物理路径相当于Context.getExternalCacheDir() + /path/
    const xml = `
         <?xml version='1.0' encoding='utf-8'?>
          <resources>
            <cache-path path="" name="download"/>
            <files-path path="" name="update"/>
          </resources>
      `.trim();
    const network_security_configxml = `
      <?xml version="1.0" encoding="utf-8"?>
      <network-security-config>
          <base-config cleartextTrafficPermitted="true" />
      </network-security-config>
      `.trim();
    fs.writeFileSync(tgtXmlPath, xml);
    const configxml = path.resolve(
      projectRoot,
      "config.xml"
    );
    const assetsConfigxml = path.resolve(
      projectRoot,
      "src",
      "assets",
      "config.xml"
    );
    if (fs.existsSync(assetsConfigxml)) {
      fs.unlinkSync(assetsConfigxml);
    }
    fs.copyFileSync(configxml, assetsConfigxml);
    // fs.writeFileSync(
    //   network_security_configxmlPath,
    //   network_security_configxml
    // );

    // var rootdir = path.join(
    //     projectRoot,
    //   "platforms",
    //   "android",
    //   "app",
    //   "src",
    //   "main",
    //   "AndroidManifest.xml"
    // );
    // console.log("projectroot", rootdir);
    // fs.readFile(rootdir, { encoding: "utf-8" }, function(err, data) {
    //   if (err) {
    //     console.info(err);
    //     throw err;
    //   }
    //   var str = 'android:networkSecurityConfig="@xml/network_security_config"';
    //   if (data.indexOf(str) == -1) {
    //     data = data.replace(
    //       /<application/g,
    //       '<application  android:networkSecurityConfig="@xml/network_security_config"'
    //     );
    //     fs.writeFileSync(rootdir, data, { encoding: "utf8" });
    //   }
    // });
    // const chcpJsonFilePath = path.join(__dirname, "../chcp.json");
    // if (fs.existsSync(chcpJsonFilePath)) {
    //   var chcpJson = fs.readFileSync(chcpJsonFilePath, { encoding: "utf8" });
    //   if (chcpJson) {
    //     chcpJson = JSON.parse(chcpJson);
    //   }
    //   const configXml = fs.readFileSync(path.join(__dirname, "../config.xml"), {
    //     encoding: "utf8",
    //   });
    //   if (configXml && chcpJson) {
    //     const version = configXml
    //       .split(" ")
    //       .find(
    //         item => item.includes("version") && item.split(".").length >= 3
    //       );
    //     if (version) {
    //       var versionNumber = version.split("=")[1];
    //       if (versionNumber) {
    //         versionNumber = JSON.parse(versionNumber);
    //         const d = {
    //           updateDesc: chcpJson.updateDesc || "",
    //           version: versionNumber,
    //         };
    //         console.log(d);
    //         fs.writeFileSync(
    //           path.join(__dirname, "../chcp.json"),
    //           JSON.stringify(d, null, 2),
    //           {
    //             encoding: "utf8",
    //           }
    //         );
    //       }
    //     }
    //   }
    // }
  }
  // console.log(ctx);
  // if (ctx.opts.platforms.includes("ios")) {
  //   var ConfigParser = null;
  //   try {
  //     ConfigParser = ctx.requireCordovaModule("cordova-common").ConfigParser;
  //   } catch (e) {
  //     // fallback
  //     ConfigParser = ctx.requireCordovaModule(
  //       "cordova-lib/src/configparser/ConfigParser"
  //     );
  //   }
  //   var config = new ConfigParser(
  //     path.join(ctx.opts.projectRoot, "config.xml")
  //   );
  //   // console.log(config);
  //   const wechatPlugin = config.getPlugin("cordova-wechat-plugin");
  //   if (wechatPlugin) {
  //     const appid = wechatPlugin.variables["WECHATAPPID"];
  //     console.log("WECHATAPPID",appid);
  //     if (appid) {
  //       var pluginXmlStr = fs.readFileSync(
  //         path.join(ctx.opts.projectRoot, "cordova-wechat-plugin", "plugin.xml"),
  //         { encoding: "utf8" }
  //       );
  //       if (pluginXmlStr) {
  //         pluginXmlStr = pluginXmlStr.replace(/<preferance name='WECHATAPPID' default=?.+\/>/, `<preferance name='WECHATAPPID' default='${appid}'/>`);
  //         fs.writeFileSync(
  //           path.join(ctx.opts.projectRoot, "cordova-wechat-plugin", "plugin.xml"),
  //           pluginXmlStr,
  //           { encoding: "utf8" }
  //         );
  //         console.log(pluginXmlStr);
  //       }
  //     } else {
  //       throw new Error(
  //         "请先执行 sudo ionic cordova plugin save ./cordova-wechat-plugin --variable WECHATAPPID=微信appid"
  //       );
  //     }
  //   } else {
  //     throw new Error(
  //       "请先执行 sudo ionic cordova plugin save ./cordova-wechat-plugin --variable WECHATAPPID=微信appid"
  //     );
  //   }
  //   // throw 'error';
  // }
  if (ctx.opts.platforms.includes("ios")) { return; }
  if (fs.existsSync(path.join(ctx.opts.projectRoot, 'build-extras.gradle'))) {
    fs.copyFileSync(path.join(ctx.opts.projectRoot, 'build-extras.gradle'), path.join(ctx.opts.projectRoot, 'platforms', 'android', 'app', 'build-extras.gradle'));
  }
};
