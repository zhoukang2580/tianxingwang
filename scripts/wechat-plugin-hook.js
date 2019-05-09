// https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/index.html
// {
//     // The type of hook being run
//     hook: 'before_plugin_install',

//     // Absolute path to the hook script that is currently executing
//     scriptLocation: '/foo/scripts/appBeforePluginInstall.js',

//     // The CLI command that lead to this hook being executed
//     cmdLine: 'cordova plugin add plugin-withhooks',

//     // The options associated with the current operation.
//     // WARNING: The contents of this object vary among the different
//     // operations and are currently not documented anywhere.
//     opts: {
//       projectRoot: '/foo',

//       cordova: {
//         platforms: ['android'],
//         plugins: ['plugin-withhooks'],
//         version: '0.21.7-dev'
//       },

//       // Information about the plugin currently operated on.
//       // This object will only be passed to plugin hooks scripts.
//       plugin: {
//         id: 'plugin-withhooks',
//         pluginInfo: { /* ... */ },
//         platform: 'android',
//         dir: '/foo/plugins/plugin-withhooks'
//       }
//     },

//     // A reference to Cordova's API
//     cordova: { /* ... */ }
//   }
const path = require("path");
const fs = require('fs');
module.exports = function (context) {
    const cordovaCommon = context.requireCordovaModule('cordova-common');
    Object.keys(cordovaCommon).map(k => {
        console.dir(key);
    })
    console.dir(cordovaCommon);
    // Make sure android platform is part of build
    if (!context.opts.platforms.includes('android')) return;
    const projectRoot = context.opts.projectRoot;
    const platformRoot = path.join(context.opts.projectRoot, 'platforms/android');
    const configxmlPath = path.join(context.opts.projectRoot, 'config.xml');
    const configxmlStr = fs.readFileSync(configxmlPath, { encoding: "utf8" });
    var packageName = configxmlStr.split(" ")
        .find(item => item.includes('id=') && item.includes('.') && item.split(".").length >= 3);
    packageName = packageName && packageName.includes('=') && packageName.split("=")[1];
    packageName=packageName&&packageName.replace(/"/g,'');
    if (packageName) {
        console.log("packageName ",packageName);
        var checkFilePath =path.join(platformRoot,'app','src','main','java');
        packageName.split(".").forEach(p=>{
            checkFilePath = path.join(checkFilePath,p);
        });
        checkFilePath=path.join(checkFilePath,'wxapi');
        console.log("checkFilePath",checkFilePath);

        var fexists = fs.existsSync(checkFilePath);
        console.log("fexists",fexists);
        if (!fexists) {
            fs.mkdirSync(checkFilePath, { recursive: true });
        }
         fexists = fs.existsSync(checkFilePath);
        if(fexists){
            console.log(context.opts.plugin);
            const wechatPluginDirName = context.opts.cordova.plugins.find(item=>item.includes("wechat-plugin"));
            if(context.opts.cordova.plugins&&wechatPluginDirName){
                const srcPath = path.join(projectRoot,'plugins',wechatPluginDirName,'src','android','wxapi','WXEntryActivity.java');
                const distPath = path.join(checkFilePath,'WXEntryActivity.java');
                if(fs.existsSync(srcPath)){
                    console.log("srcPath",srcPath);
                    fs.copyFileSync(srcPath,distPath);
                    if(fs.existsSync(distPath)){
                      const distFile =   fs.readFileSync(distPath,{encoding:"utf8"});
                      if(distFile){
                         const str= distFile.replace(/^package.*;/g,"package "+packageName+".wxapi;");
                         console.log(str);
                          fs.writeFileSync(distPath,str,{encoding:"utf8"});
                      }
                    }
                }
            }
        }
    }
    // throw new Error("测试"+checkFilePath);
}