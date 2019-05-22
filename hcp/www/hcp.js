var exec = require('cordova/exec');

exports.update = function (arg0) {
   return new Promise((resolve,reject)=>{
    exec(openId => {
        resolve(openId);
    }, error => {
        reject(error)
    }, 'Hcp', 'update', [arg0]);
   });
};
