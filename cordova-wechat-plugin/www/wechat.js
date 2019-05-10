var exec = require('cordova/exec');

exports.getCode = (appId) => {
    return new Promise((resolve, reject) => {
        exec(openId => {
            resolve(openId);
        }, error => {
            reject(error)
        }, 'Wechat', 'getCode', [appId]);
    });
};
exports.pay = (payInfo) => {
    return new Promise((resolve, reject) => {
        exec(() => {
            resolve();
        }, error => {
            reject(error)
        }, 'Wechat', 'pay', [payInfo]);
    });
};
