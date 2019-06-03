const path = require("path");
const fs = require('fs');
const readDirRecursive = require('fs-readdir-recursive');
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
    // console.log("after build ", ctx);
    if (ctx.opts.platforms.includes('android')) {
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
        if (ctx.opts.options && ctx.opts.options.release) {
            const releaseApkDir = path.join(ctx.opts.projectRoot, "platforms", "android", "app", "build", "outputs", "apk", "release");
            var releaseHashedApkName = `${packageName}.${await hashFile(path.join(releaseApkDir, 'app-release.apk'))}.apk`;
            releaseBuild(releaseHashedApkName,releaseApkDir);
        } else {
            const debugApkDir = path.join(ctx.opts.projectRoot, "platforms", "android", "app", "build", "outputs", "apk", "debug");
            var debugHashedApkName = `${packageName}.${await hashFile(path.join(debugApkDir, 'app-debug.apk'))}.apk`;

            debugBuild(debugHashedApkName,debugApkDir);
        }
        function releaseBuild(releaseHashedApkName,releaseApkDir) {
            const releaseFiles = readDirRecursive(releaseApkDir, f => f.includes(".apk") && f.includes(packageName));
            for (let i = 0; i < releaseFiles.length; i++) {
                if (fs.existsSync(path.join(releaseApkDir, releaseFiles[i]))) {
                    console.log("release 删除旧的 " + releaseFiles[i]);
                    fs.unlinkSync(path.join(releaseApkDir, releaseFiles[i]));
                }
            }

            if (fs.existsSync(path.join(releaseApkDir, 'app-release.apk'))) {
                fs.copyFileSync(path.join(releaseApkDir, 'app-release.apk'), path.join(releaseApkDir, releaseHashedApkName));
                console.log(`拷贝 release apk 完成 ${path.join(releaseApkDir, releaseHashedApkName)}`);
            }
        }
        function debugBuild(debugHashedApkName,debugApkDir) {
            const debugFiles = readDirRecursive(debugApkDir, f => f.includes(".apk") && f.includes(packageName));
            for (let i = 0; i < debugFiles.length; i++) {
                if (fs.existsSync(path.join(debugApkDir, debugFiles[i]))) {
                    console.log("debug 删除旧的 " + debugFiles[i]);
                    fs.unlinkSync(path.join(debugApkDir, debugFiles[i]));
                }
            }
            if (fs.existsSync(path.join(debugApkDir, 'app-debug.apk'))) {
                fs.copyFileSync(path.join(debugApkDir, 'app-debug.apk'), path.join(debugApkDir, debugHashedApkName));
                console.log(`拷贝 debug apk 完成 ${path.join(debugApkDir, debugHashedApkName)}`);
            }
        }
    }
    if (ctx.opts.platforms.includes('ios')) {
        const projectRoot = ctx.opts.projectRoot;
        const platformRoot = path.join(projectRoot, 'platforms', 'ios');
        console.log(platformRoot);
        const plistFile = readDirRecursive(platformRoot).find(item => item.includes("-Info.plist"));
        if (plistFile) {
            var plistFileStr = fs.readFileSync(path.join(platformRoot, plistFile), { encoding: "utf8" });
            if (plistFileStr) {
                var ConfigParser = null;
                try {
                    ConfigParser = ctx.requireCordovaModule('cordova-common').ConfigParser;
                } catch (e) {
                    // fallback
                    ConfigParser = ctx.requireCordovaModule('cordova-lib/src/configparser/ConfigParser');
                }
                var config = new ConfigParser(path.join(ctx.opts.projectRoot, "config.xml"));
                console.log(config.getPlugin('cordova-wechat-plugin'));
                const wechatPlugin = config.getPlugin("cordova-wechat-plugin");
                if (wechatPlugin) {
                    const appid = wechatPlugin.variables['WECHATAPPID'];
                    if (appid) {
                        plistFileStr = plistFileStr.replace(/\$WECHATAPPID/, appid);
                        // console.log(plistFileStr);
                        fs.writeFileSync(path.join(platformRoot, plistFile), plistFileStr, { encoding: "utf8" });
                    } else {
                        throw new Error("请先执行 sudo ionic cordova plugin save ./cordova-wechat-plugin --variable WECHATAPPID=微信appid");
                    }
                } else {
                    throw new Error("请先执行 sudo ionic cordova plugin save ./cordova-wechat-plugin --variable WECHATAPPID=微信appid");
                }

            }
        }
    }
}
