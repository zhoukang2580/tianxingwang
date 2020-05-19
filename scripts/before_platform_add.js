const fs = require('fs');
const path = require("path");
module.exports = function (context) {
    // replaceAuthorities(context);
}
function replaceAuthorities(ctx) {
    console.log("================replaceAuthorities ");
    const pluginxmlPath = path.join(ctx.opts.projectRoot, 'cordova-hcp-plugin/plugin.xml');
    const pluginxml = fs.readFileSync(pluginxmlPath, {
        encoding: "utf8"
    });
    const configxmlpath = path.join(ctx.opts.projectRoot, 'config.xml');
    const configxml = fs.readFileSync(configxmlpath, { encoding: "utf8" });
    const arr = configxml.match(/id="(.+?)"/i);
    if (arr && arr.length) {
        // console.log(arr[1])
        const pkgname = arr[1];
        if (pkgname) {
            const str = pluginxml.replace(/android:authorities=".+\.fileprovider/i, `android:authorities="${pkgname}.fileprovider`);
            // console.log(str);
            fs.writeFileSync(pluginxmlPath, str, { encoding: "utf8" })
        }
    }
}
// replaceAuthorities();