const utils = require("./utils");
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
        const packageName = utils.getPackageName(ctx);
        var zipFilePath = path.join(ctx.opts.projectRoot, `${packageName}.${ctx.opts.platforms.includes('android') ? "android" : "ios"}.zip`);
        const zipfilehash = await hashFile(zipFilePath).then(hash => {
            const newPath = zipFilePath.replace(".zip", `.${hash}.zip`);
            fs.renameSync(zipFilePath, `${newPath}`);
            return hash;
        }).catch(e => {
            if (fs.existsSync(zipFilePath)) {
                fs.unlinkSync(zipFilePath);
            }
            console.error(e);
        })
        if (ctx.opts.options && ctx.opts.options.release) {
            const releaseApkDir = path.join(ctx.opts.projectRoot, "platforms", "android", "app", "build", "outputs", "apk", "release");
            var apkhash = await hashFile(path.join(releaseApkDir, 'app-release.apk'));
            var releaseHashedApkName = `${packageName}.${apkhash}.apk`;
            releaseBuild(releaseHashedApkName, releaseApkDir);
            generateVersionJson('android', apkhash, zipfilehash);
        } else {
            const debugApkDir = path.join(ctx.opts.projectRoot, "platforms", "android", "app", "build", "outputs", "apk", "debug");
            const apkhash = await hashFile(path.join(debugApkDir, 'app-debug.apk'));
            var debugHashedApkName = `${packageName}.${apkhash}.apk`;
            debugBuild(debugHashedApkName, debugApkDir);
            generateVersionJson('android', apkhash, zipfilehash);
        }
        function releaseBuild(releaseHashedApkName, releaseApkDir) {
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
        function debugBuild(debugHashedApkName, debugApkDir) {
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
        console.log("ios build platformRoot", platformRoot);
        var ConfigParser = null;
        try {
            ConfigParser = ctx.requireCordovaModule('cordova-common').ConfigParser;
        } catch (e) {
            // fallback
            ConfigParser = ctx.requireCordovaModule('cordova-lib/src/configparser/ConfigParser');
        }
        var config = new ConfigParser(path.join(ctx.opts.projectRoot, "config.xml"));
        const packageName = config.packageName();
        var zipFilePath = path.join(ctx.opts.projectRoot, `${packageName}.${ctx.opts.platforms.includes('android') ? "android" : "ios"}.zip`);
        hashFile(zipFilePath).then(hash => {
            const newPath = zipFilePath.replace(".zip", `.${hash}.zip`);
            fs.renameSync(zipFilePath, `${newPath}`);
            generateVersionJson('ios', '', hash);
        }).catch(e => {
            if (fs.existsSync(zipFilePath)) {
                fs.unlinkSync(zipFilePath);
            }
            console.error(e);
        })
    }
}
function generateVersionJson(plt, apkmd5, md5) {
    const configxmlpath = path.join(__dirname, '../config.xml');
    const configxml = fs.readFileSync(configxmlpath, { encoding: "utf8" });
    const arr = configxml.match(/id="(.+?)"/i);
    const versions = configxml.match(/version="(.+?)"/i);
    if (arr && arr.length && arr[1]) {
        const pkgname = arr[1];
        const jsonfilePath = path.join(__dirname, `../${pkgname}.${plt}.json`);
        let one = fs.existsSync(jsonfilePath) ? fs.readFileSync(jsonfilePath, { encoding: "utf8" }) : "";
        if (one) {
            try {
                one = JSON.parse(one);
            } catch (e) {
                console.error(e);
                one = {};
            }
        } else {
            one = {};
        }
        const version = versions && versions[1] || "";
        const json = {
            DownloadUrl: ``,
            ApkDownloadUrl: ``,
            Ignore: true,
            EnabledHcpUpdate: true,
            EnabledAppUpdate: true,
            ...one,
            Md5: `${md5}`,
            ApkMd5: `${apkmd5}`,
            Version: version,
            UpdateDescriptions: []
        }
        fs.writeFileSync(jsonfilePath, JSON.stringify(json, null, 2), { encoding: "utf8" });
    }
}
generateVersionJson('android', 'ddd', 'ccc')