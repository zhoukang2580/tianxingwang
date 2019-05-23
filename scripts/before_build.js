const fs = require("fs");
const path = require("path");
module.exports = function(ctx) {
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
    const xml = `
         <?xml version='1.0' encoding='utf-8'?>
          <resources>
            <cache-path path="" name="download"/>
          </resources>
      `.trim();
    const network_security_configxml = `
      <?xml version="1.0" encoding="utf-8"?>
      <network-security-config>
          <base-config cleartextTrafficPermitted="true" />
      </network-security-config>
      `.trim();
    if (!fs.existsSync(tgtXmlPath)) {
      fs.writeFileSync(tgtXmlPath, xml);
    } else {
      // <files-path name="name" path="path" /> 物理路径相当于Context.getFilesDir() + /path/
      // <cache-path name="name" path="path" /> 物理路径相当于Context.getCacheDir() + /path/
      // <external-path name="name" path="path" /> 物理路径相当于Environment.getExternalStorageDirectory() + /path/
      // <external-files-path name="name" path="path" /> 物理路径相当于Context.getExternalFilesDir(String) + /path/
      // <external-cache-path name="name" path="path" /> 物理路径相当于Context.getExternalCacheDir() + /path/
      let str = fs.readFileSync(tgtXmlPath, { encoding: "utf8" });
      if (!str.includes('<cache-path path="" name="download"/>')) {
      }
    }

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
  if (ctx.opts.platforms.includes("ios")) {
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
    console.log(config.getPlugin("wechat"));
    const wechatPlugin = config.getPlugin("wechat");
    if (wechatPlugin) {
      const appid = wechatPlugin.variables["WECHATAPPID"];
      if (appid) {
        var pluginXmlStr = fs.readFileSync(
          path.join(ctx.opts.projectRoot, "wechat", "plugin.xml"),
          { encoding: "utf8" }
        );
        if (pluginXmlStr) {
          pluginXmlStr = pluginXmlStr.replace(/\$WECHATAPPID/, appid);
          fs.writeFileSync(
            path.join(ctx.opts.projectRoot, "wechat", "plugin.xml"),
            pluginXmlStr,
            { encoding: "utf8" }
          );
          console.log(pluginXmlStr);
        }
      } else {
        throw new Error(
          "请先执行 sudo ionic cordova plugin save ./wechat --variable WECHATAPPID=微信appid"
        );
      }
    } else {
      throw new Error(
        "请先执行 sudo ionic cordova plugin save ./wechat --variable WECHATAPPID=微信appid"
      );
    }
    // throw 'error';
  }
};
