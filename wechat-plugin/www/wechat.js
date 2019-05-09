var exec = require('cordova/exec');

exports.getOpenId = (appId) => {
    return new Promise((resolve, reject) => {
        exec(openId => {
            resolve(openId);
        }, error => {
            reject(error)
        }, 'Wechat', 'getOpenId', [appId]);
    });
};
