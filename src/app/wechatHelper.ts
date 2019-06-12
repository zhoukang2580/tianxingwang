import { state } from '@angular/animations';
import * as md5 from "md5";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { UrlSegment, UrlSegmentGroup, Route } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { LanguageHelper } from './languageHelper';
import { AppHelper } from './appHelper';
import { RequestEntity } from './services/api/Request.entity';
interface JssdkResult {
  appid: string;// ""
  noncestr: string;// "40354f68401a44b697f1e746bfc90390"
  signature: string;// "39a2d6e18fe3a19110897d116755e588173b49a5"
  timestamp: string;// "636946736617144771"
}
const jsApiList = [
  'updateAppMessageShareData',
  'updateTimelineShareData',
  'onMenuShareTimeline',//（即将废弃）
  'onMenuShareAppMessage',//（即将废弃）
  'onMenuShareQQ',//（即将废弃）
  'onMenuShareWeibo',
  'onMenuShareQZone',
  'startRecord',
  'stopRecord',
  'onVoiceRecordEnd',
  'playVoice',
  'pauseVoice',
  'stopVoice',
  'onVoicePlayEnd',
  'uploadVoice',
  'downloadVoice',
  'chooseImage',
  'previewImage',
  'uploadImage',
  'downloadImage',
  'translateVoice',
  'getNetworkType',
  'openLocation',
  'getLocation',
  'hideOptionMenu',
  'showOptionMenu',
  'hideMenuItems',
  'showMenuItems',
  'hideAllNonBaseMenuItem',
  'showAllNonBaseMenuItem',
  'closeWindow',
  'scanQRCode',
  'chooseWXPay',
  'openProductSpecificView',
  'addCard',
  'chooseCard',
  'openCard'];
export class WechatHelper {
  static jssdkUrlConfig: {
    pageUrlHash: string;
    config: JssdkResult
  }[] = [];

  static wx = window['wx'];

  static openId:string;
  static getHashedCurPageUrl() {
    return md5(encodeURIComponent(window.location.href.substring(0, window.location.href.indexOf("#"))));
  }
  static async getJssdk() {
    if (!this.jssdkUrlConfig.find(item => item.pageUrlHash == this.getHashedCurPageUrl())) {
      console.log("接口获取");
      const jssdkInfo = await this.requestJssdk();
      if (jssdkInfo) {
        this.jssdkUrlConfig = this.jssdkUrlConfig.filter(item => item.pageUrlHash !== this.getHashedCurPageUrl());
        this.jssdkUrlConfig.push({ pageUrlHash: this.getHashedCurPageUrl(), config: jssdkInfo });
        return jssdkInfo;
      }
      return Promise.reject("");
    } else {
      console.log("直接返回");
      console.log(this.jssdkUrlConfig[this.getHashedCurPageUrl()], this.jssdkUrlConfig, this.getHashedCurPageUrl());
      return Promise.resolve(this.jssdkUrlConfig.find(item => item.pageUrlHash == this.getHashedCurPageUrl()).config);
    }
  }
  static requestJssdk() {
    const req = new RequestEntity();
    const pageUrl = encodeURIComponent(window.location.href.substring(0, window.location.href.indexOf("#")));
    req.Method = "ApiPasswordUrl-wechat-jssdk";
    req.Data = {
      Url: pageUrl
    };
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.Domain = AppHelper.getDomain();
    if (req.Data && typeof req.Data != 'string') {
      req.Data = JSON.stringify(req.Data);
    }
    const formObj = Object.keys(req)
      .map(k => `${k}=${req[k]}`)
      .join("&");
    const url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy?domain="+AppHelper.getDomain();
    return new Promise<JssdkResult>((resolve, reject) => {
      AppHelper.httpClient
      .post(url, formObj, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        observe: "body"
      }).subscribe((r: any) => {
        alert(r.Data.appid);
        if (!r.Status || !r.Data) {
          return reject(r.Message || r.Code);
        }
        resolve(r.Data);
      });
    });

  }
  static async ready() {
    if (!this.wx) {
      console.log("jssdk加载失败，wx对象不存在");
      return Promise.reject(LanguageHelper.getJSSDKNotExistsTip());
    }
    const info = await this.getJssdk();

    if (!info) {
      console.log("接口请求错误");
      return Promise.reject("");
    }
    return new Promise<boolean>((resove) => {
      this.wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: info.appid, // 必填，公众号的唯一标识
        timestamp: info.timestamp, // 必填，生成签名的时间戳
        nonceStr: info.noncestr, // 必填，生成签名的随机串
        signature: info.signature,// 必填，签名
        jsApiList: jsApiList// 必填，需要使用的JS接口列表
      });
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
      // config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
      // 则须把相关接口放在ready函数中调用来确保正确执行。
      // 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
      this.wx.ready(() => {
        resove(true);
      });
      this.wx.error((err) => {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，
        // 具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        resove(false);
        AppHelper.alert(err);
      });
    });
  }
}
