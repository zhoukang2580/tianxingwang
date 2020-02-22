var exec = require("cordova/exec");
exports.getUUID = function(arg0) {
  return new Promise((resolve, reject) => {
    exec(
      uuid => {
        resolve(uuid);
      },
      error => {
        reject(error);
      },
      "Hcp",
      "getUUID",
      [arg0]
    );
  });
};
exports.loadHcpPage = function(arg0) {
  return new Promise((resolve, reject) => {
    exec(
      openId => {
        resolve(openId);
      },
      error => {
        reject(error);
      },
      "Hcp",
      "loadHcpPage",
      [arg0]
    );
  });
};
exports.openHcpPage = function(arg0) {
  return new Promise((resolve, reject) => {
    exec(
      openId => {
        resolve(openId);
      },
      error => {
        reject(error);
      },
      "Hcp",
      "openHcpPage",
      [arg0]
    );
  });
};
exports.getHash = function(arg0) {
  return new Promise((resolve, reject) => {
    exec(
      openId => {
        resolve(openId);
      },
      error => {
        reject(error);
      },
      "Hcp",
      "getHash",
      [arg0]
    );
  });
};
exports.getWebViewUrl = function() {
  return new Promise((resolve, reject) => {
    exec(
      webviewUrl => {
        resolve(webviewUrl);
      },
      error => {
        reject(error);
      },
      "Hcp",
      "getWebViewUrl",
      []
    );
  });
};
exports.getStartIndexPath = function() {
  return new Promise((resolve, reject) => {
    exec(
      startIndex => {
        resolve(startIndex);
      },
      error => {
        reject(error);
      },
      "Hcp",
      "getStartIndexPath",
      []
    );
  });
};
exports.loadHcpPage = function() {
  return new Promise((resolve, reject) => {
    exec(
      () => {
        resolve();
      },
      error => {
        reject(error);
      },
      "Hcp",
      "loadHcpPage",
      []
    );
  });
};
exports.checkPathOrFileExists = function(arg0) {
  return new Promise((resolve, reject) => {
    exec(
      openId => {
        resolve(openId);
      },
      error => {
        reject(error);
      },
      "Hcp",
      "checkPathOrFileExists",
      [arg0]
    );
  });
};
exports.openAPK = function(arg0) {
  return new Promise((resolve, reject) => {
    exec(
      openId => {
        resolve(openId);
      },
      error => {
        reject(error);
      },
      "Hcp",
      "openAPK",
      [arg0]
    );
  });
};
exports.saveHcpPath = function(arg0) {
  return new Promise((resolve, reject) => {
    exec(
      openId => {
        resolve(openId);
      },
      error => {
        reject(error);
      },
      "Hcp",
      "saveHcpPath",
      [arg0]
    );
  });
};
