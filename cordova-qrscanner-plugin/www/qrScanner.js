module.exports = {
    prepare: function (callback) {
        cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'prepare', []);
    },
    destroy: function (callback) {
        cordova.exec(doneCallback(callback, true), null, 'QRScanner', 'destroy', []);
    },
    scan: function (callback) {
        if (!callback) {
            throw new Error('No callback provided to scan method.');
        }
        var success = function (result) {
            callback(null, result);
        };
        cordova.exec(success, errorCallback(callback), 'QRScanner', 'scan', []);
    },
    cancelScan: function (callback) {
        cordova.exec(doneCallback(callback), null, 'QRScanner', 'cancelScan', []);
    },
    show: function (callback) {
        cordova.exec(doneCallback(callback, true), null, 'QRScanner', 'show', []);
    },
    hide: function (callback) {
        cordova.exec(doneCallback(callback, true), null, 'QRScanner', 'hide', []);
    },
    pausePreview: function (callback) {
        cordova.exec(doneCallback(callback), null, 'QRScanner', 'pausePreview', []);
    },
    resumePreview: function (callback) {
        cordova.exec(doneCallback(callback), null, 'QRScanner', 'resumePreview', []);
    },
    enableLight: function (callback) {
        cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'enableLight', []);
    },
    disableLight: function (callback) {
        cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'disableLight', []);
    },
    useCamera: function (index, callback) {
        cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'useCamera', [index]);
    },
    useFrontCamera: function (callback) {
        var frontCamera = 1;
        if (callback) {
            this.useCamera(frontCamera, callback);
        } else {
            cordova.exec(null, null, 'QRScanner', 'useCamera', [frontCamera]);
        }
    },
    useBackCamera: function (callback) {
        var backCamera = 0;
        if (callback) {
            this.useCamera(backCamera, callback);
        } else {
            cordova.exec(null, null, 'QRScanner', 'useCamera', [backCamera]);
        }
    },
    openSettings: function (callback) {
        if (callback) {
            cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'openSettings', []);
        } else {
            cordova.exec(null, null, 'QRScanner', 'openSettings', []);
        }
    },
    getStatus: function (callback) {
        if (!callback) {
            throw new Error('No callback provided to getStatus method.');
        }
        cordova.exec(doneCallback(callback), null, 'QRScanner', 'getStatus', []);
    }
};