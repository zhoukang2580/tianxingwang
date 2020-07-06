var exec = require('cordova/exec');

exports.getCode = function (appId, universalLink) {
    return new Promise(function (resolve, reject) {
        exec(function (openId) {
            resolve(openId);
        }, function (error) {
            reject(error)
        }, 'Wechat', 'getCode', [appId, universalLink]);
    });
};
exports.isWXAppInstalled = function (appId) {
    return new Promise(function (resolve, reject) {
        exec(function (res) {
            resolve(res);
        }, function (error) {
            reject(error)
        }, 'Wechat', 'isWXAppInstalled', [appId]);
    })
}
exports.pay = function (payInfo, universalLink) {
    return new Promise(function (resolve, reject) {
        exec(function () {
            resolve();
        }, function (error) {
            reject(error)
        }, 'Wechat', 'pay', [payInfo, universalLink]);
    });
};
exports.share = function (shareInfo, universalLink) {
    return new Promise(function (resolve, reject) {
        exec(function () {
            resolve();
        }, function (error) {
            reject(error)
        }, 'Wechat', 'share', [shareInfo, universalLink]);
    });
};
