const cordova = require("cordova");

module.exports = {
    prepare: function (ok,err) {
        cordova.exec(ok, err, 'QRScanner', 'prepare', []);
    },
    destroy: function (callback) {
        cordova.exec(callback, null, 'QRScanner', 'destroy', []);
    },
    scan: function (callback,err) {
        if (!callback) {
            throw new Error('No callback provided to scan method.');
        }
        cordova.exec(callback, err, 'QRScanner', 'scan', []);
    },
    cancelScan: function (callback) {
        cordova.exec(callback, null, 'QRScanner', 'cancelScan', []);
    },
    show: function (callback,err) {
        cordova.exec(callback, err, 'QRScanner', 'show', []);
    },
    hide: function (callback,err) {
        cordova.exec(callback, err, 'QRScanner', 'hide', []);
    },
    pausePreview: function (callback) {
        cordova.exec(callback, null, 'QRScanner', 'pausePreview', []);
    },
    resumePreview: function (callback) {
        cordova.exec(callback, null, 'QRScanner', 'resumePreview', []);
    },
    enableLight: function (callback) {
        cordova.exec(callback, errorCallback(callback), 'QRScanner', 'enableLight', []);
    },
    disableLight: function (callback) {
        cordova.exec(callback, errorCallback(callback), 'QRScanner', 'disableLight', []);
    },
    useCamera: function (index, callback,err) {
        cordova.exec(callback, err, 'QRScanner', 'useCamera', [index]);
    },
    useFrontCamera: function (callback,err) {
        var frontCamera = 1;
        if (callback) {
            this.useCamera(frontCamera, callback,err);
        } else {
            cordova.exec(null, null, 'QRScanner', 'useCamera', [frontCamera]);
        }
    },
    useBackCamera: function (callback,err) {
        var backCamera = 0;
        if (callback) {
            this.useCamera(backCamera, callback,err);
        } else {
            cordova.exec(null, null, 'QRScanner', 'useCamera', [backCamera]);
        }
    },
    openSettings: function (callback,err) {
        if (callback) {
            cordova.exec(callback,err, 'QRScanner', 'openSettings', []);
        } else {
            cordova.exec(null, null, 'QRScanner', 'openSettings', []);
        }
    },
    getStatus: function (callback) {
        if (!callback) {
            throw new Error('No callback provided to getStatus method.');
        }
        cordova.exec(callback, null, 'QRScanner', 'getStatus', []);
    }
};