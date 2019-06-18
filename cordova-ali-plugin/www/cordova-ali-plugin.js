var exec = require("cordova/exec");

exports.pay = function (arg0) {
  return new Promise((resolve, reject) => {
    exec(
      resource => {
        console.log("ali pay" + (typeof resource === "string" ? resource : JSON.stringify(resource)));
        // console.log(`ali resource`,resource);
        // if(resource.result&&typeof resource.result==='string'){
        //   resource.result=JSON.parse(resource.result);
        // }
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
