var exec = require("cordova/exec");
exports.getStatusBarHeight = function () {
  return new Promise(function (resolve, reject) {
    exec(function (height) {
      if (height && window.devicePixelRatio) {
        height = height / window.devicePixelRatio;
      }
      resolve(height);
    }, function (error) {
      reject(error)
    },
      "Hcp",
      "getStatusBarHeight", [])
  })
}
exports.getUUID = function (arg0) {
  return new Promise(function (resolve, reject) {
    exec(
      function (uuid) {
        resolve(uuid);
      },
      function (error) {
        reject(error);
      },
      "Hcp",
      "getUUID",
      [arg0]
    );
  });
};
exports.loadHcpPage = function (arg0) {
  return new Promise(function (resolve, reject) {
    exec(
      function (openId) {
        resolve(openId);
      },
      function (error) {
        reject(error);
      },
      "Hcp",
      "loadHcpPage",
      [arg0]
    );
  });
};
exports.openHcpPage = function (arg0) {
  return new Promise(function(resolve, reject) {
    exec(
      function(openId) {
        resolve(openId);
      },
      function(error){
        reject(error);
      },
      "Hcp",
      "openHcpPage",
      [arg0]
    );
  });
};
exports.getHash = function (arg0) {
  return new Promise(function(resolve, reject) {
    exec(
      function(openId) {
        resolve(openId);
      },
      function(error) {
        reject(error);
      },
      "Hcp",
      "getHash",
      [arg0]
    );
  });
};
exports.getWebViewUrl = function () {
  return new Promise(function(resolve, reject) {
    exec(
      function(webviewUrl) {
        resolve(webviewUrl);
      },
      function(error) {
        reject(error);
      },
      "Hcp",
      "getWebViewUrl",
      []
    );
  });
};
exports.getStartIndexPath = function () {
  return new Promise(function(resolve, reject) {
    exec(
      function(startIndex) {
        resolve(startIndex);
      },
      function(error ){
        reject(error);
      },
      "Hcp",
      "getStartIndexPath",
      []
    );
  });
};
exports.loadHcpPage = function () {
  return new Promise(function(resolve, reject){
    exec(
      function(){
        resolve();
      },
      function(error){
        reject(error);
      },
      "Hcp",
      "loadHcpPage",
      []
    );
  });
};
exports.checkPathOrFileExists = function (arg0) {
  return new Promise(function(resolve, reject){
    exec(
      function(openId) {
        resolve(openId);
      },
      function(error) {
        reject(error);
      },
      "Hcp",
      "checkPathOrFileExists",
      [arg0]
    );
  });
};
exports.openAPK = function (arg0) {
  return new Promise(function(resolve, reject) {
    exec(
      function(openId){
        resolve(openId);
      },
      function(error){
        reject(error);
      },
      "Hcp",
      "openAPK",
      [arg0]
    );
  });
};
exports.saveHcpPath = function (arg0) {
  return new Promise(function(resolve, reject){
    exec(
      function(openId) {
        resolve(openId);
      },
      function(error){
        reject(error);
      },
      "Hcp",
      "saveHcpPath",
      [arg0]
    );
  });
};
