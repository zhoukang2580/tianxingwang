
var exec = require("cordova/exec");
exports.callNumber = function (number, bypassAppChooser) {
    return new Promise(function (resolve, reject) {
        exec(function success(r) {
            resolve(r);
        }, function failure(e) {
            reject(e)
        }, "CallNumber", "callNumber", [number, bypassAppChooser])
    })
}

