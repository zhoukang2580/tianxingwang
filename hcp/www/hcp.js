var exec = require('cordova/exec');

exports.openHcpPage = function (arg0) {
   return new Promise((resolve,reject)=>{
    exec(openId => {
        resolve(openId);
    }, error => {
        reject(error)
    }, 'Hcp', 'openHcpPage', [arg0]);
   });
};
exports.getHash = function (arg0) {
    return new Promise((resolve,reject)=>{
     exec(openId => {
         resolve(openId);
     }, error => {
         reject(error)
     }, 'Hcp', 'getHash', [arg0]);
    });
 };
exports.saveHcpPath = function (arg0) {
    return new Promise((resolve,reject)=>{
     exec(openId => {
         resolve(openId);
     }, error => {
         reject(error)
     }, 'Hcp', 'saveHcpPath', [arg0]);
    });
 };
