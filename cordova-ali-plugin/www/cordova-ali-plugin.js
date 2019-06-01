var exec = require("cordova/exec");

exports.pay = function(arg0) {
  return new Promise((resolve, reject) => {
    exec(
      resource => {
        resolve(resource);
      },
      error => {
        reject(error);
      },
      "Ali",
      "pay",
      [arg0]
    );
  });
  //exec(success, error, 'cordova-ali-plugin', 'coolMethod', [arg0]);
};
