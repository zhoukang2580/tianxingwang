const fs = require("fs");
const path = require("path");
function isReleaseBuild(ctx) {
    return ctx.opts.options && ctx.opts.options.release;
}
function getPackageName(ctx) {
    if (ctx.opts.platforms.includes("android")) {
        var ConfigParser = null;
        try {
            ConfigParser = ctx.requireCordovaModule("cordova-common").ConfigParser;
        } catch (e) {
            console.error(e)
            ConfigParser = ctx.requireCordovaModule(
                "cordova-lib/src/configparser/ConfigParser"
            );
        }
        var config = new ConfigParser(
            path.join(ctx.opts.projectRoot, "config.xml")
        );
        const packageName = config.packageName();
        console.log(`获取到的包名：${packageName}`);
        return packageName;
    }
    return "";
}
function modifyPluginFileProvider(ctx) {
    const packageName = getPackageName(ctx);
    console.log("modifyPluginFileProvider packageName = " + packageName);
    if (!packageName) {
        return
    }
    const projectRoot = ctx.opts.projectRoot;
    const pluginXml = path.resolve(projectRoot, 'plugins', 'cordova-hcp-plugin', 'plugin.xml');
    const androidManifest = path.resolve(projectRoot, 'platforms', 'android', 'app', 'src', "main", 'AndroidManifest.xml');
    if (fs.existsSync(pluginXml)) {
        let str = fs.readFileSync(pluginXml, { encoding: "utf8" });
        str = str.replace(/test\./g, "");
        const testconfig = str.replace(`${getReleasePkName(packageName)}.fileprovider`, `${getDebugPkName(packageName)}.fileprovider`);
        fs.writeFileSync(pluginXml, testconfig, { encoding: "utf8" });
    }
    if (fs.existsSync(androidManifest)) {
        let str = fs.readFileSync(androidManifest, { encoding: "utf8" });
        str = str.replace(/test\./g, "");
        const testconfig = str.replace(`${getReleasePkName(packageName)}.fileprovider`, `${getDebugPkName(packageName)}.fileprovider`);
        fs.writeFileSync(androidManifest, testconfig, { encoding: "utf8" });
    }
}
function restorePluginFileProvider(ctx) {
    if (ctx.opts.platforms.includes("android")) {
        var packageName = getPackageName(ctx);
        if (!isDebugPkName(packageName)) {
            return;
        }
        packageName = getReleasePkName(packageName);
        const projectRoot = ctx.opts.projectRoot;
        const pluginXml = path.resolve(projectRoot, 'plugins', 'cordova-hcp-plugin', 'plugin.xml');
        const androidManifest = path.resolve(projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
        if (fs.existsSync(pluginXml)) {
            const str = fs.readFileSync(pluginXml, { encoding: "utf8" });
            const testconfig = str.replace(`${getDebugPkName(packageName)}.fileprovider`, `${getReleasePkName(packageName)}.fileprovider`);
            fs.writeFileSync(pluginXml, testconfig, { encoding: "utf8" });
        }
        if (fs.existsSync(androidManifest)) {
            const str = fs.readFileSync(androidManifest, { encoding: "utf8" });
            const testconfig = str.replace(`${getDebugPkName(packageName)}.fileprovider`, `${getReleasePkName(packageName)}.fileprovider`);
            fs.writeFileSync(androidManifest, testconfig, { encoding: "utf8" });
        }
    }
}
function modifyAppPackage(ctx) {
    if (ctx.opts.platforms.includes("android")) {
        const packageName = getPackageName(ctx);
        if (isDebugPkName(packageName)) {
            return;
        }
        const projectRoot = ctx.opts.projectRoot;
        const configxml = path.resolve(projectRoot, 'config.xml');
        if (fs.existsSync(configxml)) {
            let str = fs.readFileSync(configxml, { encoding: "utf8" });
            str = str.replace(/test\./g, "");
            const testconfig = str.replace(getReleasePkName(packageName), `${getDebugPkName(packageName)}`);
            fs.writeFileSync(configxml, testconfig, { encoding: "utf8" });
        }
    }

}
function isDebugPkName(pkn) {
    return /^test\./.test(pkn);
}
function getDebugPkName(pkn) {
    return `test.${pkn.replace(/^(test\.)+/g, "")}`;
}
function getReleasePkName(pkn) {
    return pkn.replace(/^(test\.)+/g, "")
}
function restoreAppPackage(ctx) {
    if (ctx.opts.platforms.includes("android")) {
        const packageName = getPackageName(ctx);
        if (!isDebugPkName(packageName)) {
            return;
        }
        const projectRoot = ctx.opts.projectRoot;
        const configxml = path.resolve(projectRoot, 'config.xml');
        if (fs.existsSync(configxml)) {
            const str = fs.readFileSync(configxml, { encoding: "utf8" });
            const testconfig = str.replace(`${getDebugPkName(packageName)}`, `${getReleasePkName(packageName)}`);
            fs.writeFileSync(configxml, testconfig, { encoding: "utf8" });
        }
    }
}
module.exports = {
    restoreAppPackage: restoreAppPackage,
    isReleaseBuild: isReleaseBuild,
    getDebugPkName: getDebugPkName,
    getReleasePkName: getReleasePkName,
    getPackageName: getPackageName,
    modifyAppPackage: modifyAppPackage,
    restorePluginFileProvider: restorePluginFileProvider,
    modifyPluginFileProvider: modifyPluginFileProvider
}