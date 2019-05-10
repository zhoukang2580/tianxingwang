const path = require("path");
const fs = require('fs');
const readDirRecursive = require('fs-readdir-recursive');
module.exports = function (ctx) {
    if (!ctx.opts.platforms.includes('ios')) {
        return;
    }

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
