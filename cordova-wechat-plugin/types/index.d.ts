// Type definitions for Apache Cordova Device plugin
// Project: https://github.com/apache/cordova-plugin-device
// Definitions by: Microsoft Open Technologies Inc <http://msopentech.com>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
//
// Copyright (c) Microsoft Open Technologies Inc
// Licensed under the MIT license

/**
 * This plugin defines a global wechat object, which describes the wechat's hardware and software.
 * Although the object is in the global scope, it is not available until after the deviceready event.
 */
interface Wechat {
  getCode: (appId: string, servelink: string) => Promise<string>;
  isWXAppInstalled: (appId: string) => Promise<string>;
  pay: (payInfo: {
    appId: string;
    partnerId: string;
    prepayId: string;
    packageValue: string;
    nonceStr: string;
    timeStamp: string;
    sign: string;
  }) => Promise<any>;
  share: (shareInfo: {
    shareType: "WXTextObject"|"WXWebpageObject";
    appId: string;
    data: any;
    universalLink:string;
  }) => Promise<any>;
}

declare var wechat: Wechat;
