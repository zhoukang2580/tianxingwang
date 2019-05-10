const fs = require("fs");
const path = require("path");
module.exports = function (ctx) {
    // console.log(ctx);
    if (!ctx.opts.platforms.includes("ios")) {
        return;
    }
    var ConfigParser = null;
    try {
        ConfigParser = ctx.requireCordovaModule('cordova-common').ConfigParser;
    } catch (e) {
        // fallback
        ConfigParser = ctx.requireCordovaModule('cordova-lib/src/configparser/ConfigParser');
    }
    var config = new ConfigParser(path.join(ctx.opts.projectRoot, "config.xml"));
    console.log(config.getPlugin('wechat'));
    const wechatPlugin = config.getPlugin("wechat");
    if (wechatPlugin) {
        const appid = wechatPlugin.variables['WECHATAPPID'];
        if (appid) {
            var pluginXmlStr = fs.readFileSync(path.join(ctx.opts.projectRoot,'wechat','plugin.xml'),{encoding:'utf8'});
            if(pluginXmlStr){
                pluginXmlStr=  pluginXmlStr.replace(/\$WECHATAPPID/,appid);
                fs.writeFileSync(path.join(ctx.opts.projectRoot,'wechat','plugin.xml'),pluginXmlStr,{encoding:"utf8"});
                console.log(pluginXmlStr);
            }
        } else {
            throw new Error("请先执行 sudo ionic cordova plugin save ./wechat --variable WECHATAPPID=微信appid");
        }
    } else {
        throw new Error("请先执行 sudo ionic cordova plugin save ./wechat --variable WECHATAPPID=微信appid");
    }
    // throw 'error';

}