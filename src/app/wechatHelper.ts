import { ApiService } from "./services/api/api.service";
import { delay } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import * as md5 from "md5";
import { LanguageHelper } from "./languageHelper";
import { AppHelper } from "./appHelper";
import { RequestEntity } from "./services/api/Request.entity";
import { environment } from "src/environments/environment";
interface JssdkResult {
  appid: string; // ""
  noncestr: string; // "40354f68401a44b697f1e746bfc90390"
  signature: string; // "39a2d6e18fe3a19110897d116755e588173b49a5"
  timestamp: string; // "636946736617144771"
}
const jsApiList = [
  "updateAppMessageShareData",
  "updateTimelineShareData",
  "onMenuShareTimeline", //（即将废弃）
  "onMenuShareAppMessage", //（即将废弃）
  "onMenuShareQQ", //（即将废弃）
  "onMenuShareWeibo",
  "onMenuShareQZone",
  "startRecord",
  "stopRecord",
  "onVoiceRecordEnd",
  "playVoice",
  "pauseVoice",
  "stopVoice",
  "onVoicePlayEnd",
  "uploadVoice",
  "downloadVoice",
  "chooseImage",
  "previewImage",
  "uploadImage",
  "downloadImage",
  "translateVoice",
  "getNetworkType",
  "openLocation",
  "getLocation",
  "hideOptionMenu",
  "showOptionMenu",
  "hideMenuItems",
  "showMenuItems",
  "hideAllNonBaseMenuItem",
  "showAllNonBaseMenuItem",
  "closeWindow",
  "scanQRCode",
  "chooseWXPay",
  "openProductSpecificView",
  "addCard",
  "chooseCard",
  "openCard",
];
export class WechatHelper {
  private static isFirstTime = true;
  private static isReadyFinishSource = new BehaviorSubject(false);
  static isReadyFinishObservable = WechatHelper.isReadyFinishSource.asObservable();
  static LaunchUrl: string;
  static jssdkUrlConfig: JssdkResult;
  static wx = window["wx"];
  private static timeoutids: { [key: string]: any } = {};
  static getOpenId() {
    return AppHelper.getCookieValue("wechatopenid");
  }
  static getMiniOpenId() {
    return AppHelper.getCookieValue("wechatminiopenid");
  }
  static async shareText(text: string) {
    const openId = this.getOpenId();
    await AppHelper.platform.ready();
    const wechat = window["wechat"];
    const appId = await this.getAppId();
    if (wechat) {
      return wechat.share({
        appId,
        shareType: "WXTextObject",
        universalLink: AppHelper.getWechatUniversalLinks(),
        data: text,
      });
    }
  }
  static wechatMiniShare(parameters: any) {
    let p = "";
    if (parameters) {
      if (typeof parameters == "object" && Object.keys(parameters).length) {
        p = encodeURIComponent(JSON.stringify(parameters));
      }
    } else {
      p = parameters;
    }
    const url = `/pages/share/index?shareArgs=${p}`;
    WechatHelper.wx.miniProgram.navigateTo({ url });
  }
  static async getCode() {
    return AppHelper.getWechatCode();
  }
  static async getAppId() {
    return AppHelper.getWechatAppId();
  }
  static async shareWebpage(data: {
    webTitle: string;
    webpageUrl: string;
    webDescription: string;
    universalLink?: string;
  }) {
    const openId = this.getOpenId();
    await AppHelper.platform.ready();
    const wechat = window["wechat"];
    const appId = await this.getAppId();
    if (wechat) {
      return wechat.share({
        appId,
        shareType: "WXWebpageObject",
        universalLink:
          data.universalLink || AppHelper.getWechatUniversalLinks(),
        data: {
          ...data,
          openId,
        },
      });
    }
  }
  static getHashedCurPageUrl() {
    const href = window.location.href;
    const url = href.substring(0, href.indexOf("#")).trim();
    console.log(
      "getHashedCurPageUrl window.location.href",
      window.location.href,
      `url=${url}`
    );
    return md5(url);
  }
  static async getJssdk() {
    if (!this.jssdkUrlConfig) {
      const jssdkInfo = await this.requestJssdk().catch((_) => null);
      console.log("接口获取 jssdkInfo", jssdkInfo);
      if (jssdkInfo) {
        this.jssdkUrlConfig = jssdkInfo;
        return Promise.resolve(this.jssdkUrlConfig);
      }
      return Promise.reject("接口获取 jssdkInfo 失败");
    } else {
      console.log("从 jssdkUrlConfig 直接返回");
      console.log(
        `this.jssdkUrlConfig`,
        this.jssdkUrlConfig,
        `this.getHashedCurPageUrl()=${this.getHashedCurPageUrl()}`,
        this.jssdkUrlConfig
      );
      return Promise.resolve(this.jssdkUrlConfig);
    }
  }
  static requestJssdk() {
    const req = new RequestEntity();
    if (
      window.navigator.userAgent.indexOf("iPhone") == -1 &&
      window.navigator.userAgent.indexOf("miniProgram") == -1
    ) {
      this.LaunchUrl = window.location.href;
    }
    let pageUrl =
      this.LaunchUrl.indexOf("#") > -1
        ? this.LaunchUrl.substring(0, this.LaunchUrl.indexOf("#"))
        : this.LaunchUrl;
    // if (pageUrl.includes("?")) {
    //   pageUrl = pageUrl.substr(0, pageUrl.indexOf("?"));
    // }
    pageUrl = window.btoa(pageUrl);
    req.Method = "ApiPasswordUrl-wechat-jssdk";
    req.Url = AppHelper.getApiUrl() + "/Home/WechatJsSdk";
    const paramters = AppHelper.getQueryParamers();
    if (paramters) {
      for (var p in paramters) {
        req[p] = paramters[p];
      }
    }
    req.Data = {
      Url: pageUrl,
    };
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.Domain = AppHelper.getDomain();
    if (req.Data && typeof req.Data != "string") {
      req.Data = JSON.stringify(req.Data);
    }
    const formObj = Object.keys(req)
      .map((k) => `${k}=${req[k]}`)
      .join("&");
    const url =
      req.Url ||
      AppHelper.getApiUrl() + "/Home/Proxy?domain=" + AppHelper.getDomain();
    return new Promise<JssdkResult>((resolve, reject) => {
      AppHelper.httpClient
        .post(url, formObj, {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          observe: "body",
        })
        .subscribe((r: any) => {
          if (!r || !r.Status || !r.Data) {
            return reject(!r ? " WechatJsSdk 接口异常" : r.Message || r.Code);
          }
          resolve(r.Data);
        });
    });
  }

  static async ready() {
    console.log("window.location.href ", window.location.href);
    if (!this.wx) {
      console.log("jssdk加载失败，wx对象不存在");
      return Promise.reject(LanguageHelper.getJSSDKNotExistsTip());
    }
    let err;
    const info = await this.getJssdk().catch((_) => {
      err = _;
      this.jssdkUrlConfig = null;
      return null;
    });

    if (!info) {
      console.log("接口请求错误");
      return Promise.reject(err || "获取jssdk 失败");
    }
    return new Promise<boolean>((resove) => {
      this.wx.config({
        debug: false && !environment.production, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: info.appid, // 必填，公众号的唯一标识
        timestamp: info.timestamp, // 必填，生成签名的时间戳
        nonceStr: info.noncestr, // 必填，生成签名的随机串
        signature: info.signature, // 必填，签名
        jsApiList: jsApiList, // 必填，需要使用的JS接口列表
      });
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
      // config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
      // 则须把相关接口放在ready函数中调用来确保正确执行。
      // 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
      this.wx.ready(() => {
        resove(true);
        // if (AppHelper.platform.is("ios")) {
        //   if (WechatHelper.isFirstTime) {
        //     WechatHelper.isFirstTime = false;
        //     setTimeout(() => {
        //       WechatHelper.isReadyFinishSource.next(true)
        //     }, 3000);
        //   } else {
        //     WechatHelper.isReadyFinishSource.next(true)
        //   }
        // } else {
        // }
        WechatHelper.isReadyFinishSource.next(true);
      });
      this.wx.error((err) => {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，
        // 具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        resove(false);
        this.jssdkUrlConfig = null;
        //alert(JSON.stringify(err));
      });
    });
  }
  static async scan() {
    const ok = await WechatHelper.ready();
    return new Promise<string>((resolve, reject) => {
      WechatHelper.wx.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        success: (res) => {
          resolve(res.resultStr);
          return false;
        },
        fail: (err) => {
          // AppHelper.alert(err);
          console.error(err);
          reject(err);
          return false;
        },
      });
    });
  }

  static checkStep(
    key,
    apiService: ApiService,
    callback,
    timeout = 3000,
    count = 0
  ) {
    if (count > 30) {
      AppHelper.alert("操作超时,请重新操作");
      if (this.timeoutids[key]) {
        clearTimeout(this.timeoutids[key]);
      }
      if (typeof callback == "function") {
        callback();
      }
      return;
    }
    const tid = setTimeout(async () => {
      const result = await this.getMiniResult(key, apiService);
      if (result) {
        if (this.timeoutids[key]) {
          clearTimeout(this.timeoutids[key]);
        }
        callback(result);
      } else {
        this.checkStep(key, apiService, callback, 1000, count++);
      }
    }, timeout);
    this.timeoutids[key] = tid;
  }

  private static async getMiniResult(key, apiService: ApiService) {
    const req = new RequestEntity();
    const token = (apiService.apiConfig && apiService.apiConfig.Token) || "";
    // console.log("token " + token, "key=" + key);
    req.Data = {};
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.Domain = AppHelper.getDomain();
    if (req.Data && typeof req.Data != "string") {
      req.Data = JSON.stringify(req.Data);
    }
    req.Token = token;
    req.Timeout = 2000;
    const sign = apiService.getSign(req);
    req.Url =
      AppHelper.getApiUrl() +
      "/home/CheckStep?key=" +
      key +
      "&token=" +
      token +
      "&sign=" +
      sign;
    const formObj = Object.keys(req)
      .map((k) => `${k}=${req[k]}`)
      .join("&");
    return new Promise<any>((resolve, reject) => {
      AppHelper.httpClient
        .post(req.Url, formObj, {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          observe: "body",
        })
        .subscribe(
          (r: any) => {
            if (!r.Status) {
              return resolve(null);
            }
            resolve(r.Data);
          },
          (err) => {
            return resolve(null);
          }
        );
    });
  }
}
