var exec = require('cordova/exec');

exports.getCode = (appId,universalLink) => {
    return new Promise((resolve, reject) => {
        exec(openId => {
            resolve(openId);
        }, error => {
            reject(error)
        }, 'Wechat', 'getCode', [appId,universalLink]);
    });
};
exports.isWXAppInstalled = () => {
    return new Promise((resolve, reject) => {
        exec((res) => {
            resolve(res);
        }, error => {
            reject(error)
        }, 'Wechat', 'isWXAppInstalled', []);
    })
}
exports.pay = (payInfo,universalLink) => {
    return new Promise((resolve, reject) => {
        exec(() => {
            resolve();
        }, error => {
            reject(error)
        }, 'Wechat', 'pay', [payInfo,universalLink]);
    });
};
