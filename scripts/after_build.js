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
        var zipFilePath=path.join(ctx.opts.projectRoot,`${packageName}.${ctx.opts.platforms.includes('android')?"android":"ios"}.zip`);
        hashFile(zipFilePath).then(hash=>{
            const newPath = zipFilePath.replace(".zip",`.${hash}.zip`);
            fs.renameSync(zipFilePath,`${newPath}`);
        }).catch(e=>{
            if(fs.existsSync(zipFilePath)){
                fs.unlinkSync(zipFilePath);
            }
            console.error(e);
        })
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
        console.log("ios build platformRoot",platformRoot);
        var ConfigParser = null;
        try {
            ConfigParser = ctx.requireCordovaModule('cordova-common').ConfigParser;
        } catch (e) {
            // fallback
            ConfigParser = ctx.requireCordovaModule('cordova-lib/src/configparser/ConfigParser');
        }
        var config = new ConfigParser(path.join(ctx.opts.projectRoot, "config.xml"));
        const packageName = config.packageName();
        var zipFilePath=path.join(ctx.opts.projectRoot,`${packageName}.${ctx.opts.platforms.includes('android')?"android":"ios"}.zip`);
        hashFile(zipFilePath).then(hash=>{
            const newPath = zipFilePath.replace(".zip",`.${hash}.zip`);
            fs.renameSync(zipFilePath,`${newPath}`);
        }).catch(e=>{
            if(fs.existsSync(zipFilePath)){
                fs.unlinkSync(zipFilePath);
            }
            console.error(e);
        })
    }
}
