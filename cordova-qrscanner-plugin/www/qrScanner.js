const exec = require("cordova/exec");

module.exports = {
    prepare: function (callback,err) {
        exec(callback, err, 'QRScanner', 'prepare', []);
    },
    destroy: function (callback) {
        exec(callback, null, 'QRScanner', 'destroy', []);
    },
    scan: function (callback,err) {
        if (!callback) {
            throw new Error('No callback provided to scan method.');
        }
        exec(callback, err, 'QRScanner', 'scan', []);
    },
    cancelScan: function (callback) {
        exec(callback, null, 'QRScanner', 'cancelScan', []);
    },
    show: function (callback,err) {
        exec(callback, err, 'QRScanner', 'show', []);
    },
    hide: function (callback,err) {
        exec(callback, err, 'QRScanner', 'hide', []);
    },
    pausePreview: function (callback) {
        exec(callback, null, 'QRScanner', 'pausePreview', []);
    },
    resumePreview: function (callback) {
        exec(callback, null, 'QRScanner', 'resumePreview', []);
    },
    enableLight: function (callback) {
        exec(callback, errorCallback(callback), 'QRScanner', 'enableLight', []);
    },
    disableLight: function (callback) {
        exec(callback, errorCallback(callback), 'QRScanner', 'disableLight', []);
    },
    useCamera: function (index, callback,err) {
        exec(callback, err, 'QRScanner', 'useCamera', [index]);
    },
    useFrontCamera: function (callback,err) {
        var frontCamera = 1;
        if (callback) {
            this.useCamera(frontCamera, callback,err);
        } else {
            exec(null, null, 'QRScanner', 'useCamera', [frontCamera]);
        }
    },
    useBackCamera: function (callback,err) {
        var backCamera = 0;
        if (callback) {
            this.useCamera(backCamera, callback,err);
        } else {
            exec(null, null, 'QRScanner', 'useCamera', [backCamera]);
        }
    },
    openSettings: function (callback,err) {
        if (callback) {
            exec(callback,err, 'QRScanner', 'openSettings', []);
        } else {
            exec(null, null, 'QRScanner', 'openSettings', []);
        }
    },
    getStatus: function (callback) {
        if (!callback) {
            throw new Error('No callback provided to getStatus method.');
        }
        exec(callback, null, 'QRScanner', 'getStatus', []);
    }
};