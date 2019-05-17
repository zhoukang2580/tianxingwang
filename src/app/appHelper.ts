import * as md5 from "md5";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { UrlSegment, UrlSegmentGroup, Route } from "@angular/router";
import { HttpClient } from '@angular/common/http';
export class AppHelper {
  private static httpClient: HttpClient;
  private static _deviceName: string;
  static setHttpClient(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  static getUUID() {
    return new Promise<string>((resolve, reject) => {
      if (this.isH5()) {
        resolve("");
      }
      document.addEventListener(
        "deviceready",
        () => {
          const Device = window["device"]; // 插件获取
          resolve(Device.uuid);
        },
        false
      );
    });
  }
  static getWechatAppId() {
    if (this.httpClient) {
      return new Promise<string>((resolve, reject) => {
        const subscription = this.httpClient.get('assets/config.xml', { responseType: "arraybuffer" })
          .subscribe(r => {
            // console.log(r);
            const fr = new FileReader();
            fr.readAsText(new Blob([r]));
            fr.onerror = (e) => {
              // console.error("读取出错");
              reject(e);
            }
            fr.onload = () => {
              // console.log("读取完成", fr.result);
              if (fr.result) {
                const configXmlStr = fr.result as string;
                if (configXmlStr.split('variable').find(item => item.includes("WECHATAPPID")) &&
                  configXmlStr.split('variable').find(item => item.includes("WECHATAPPID")).split(" ").find(item => item.includes("value")).includes("=")) {
                  const appid = configXmlStr.split('variable').find(item => item.includes("WECHATAPPID")).split(" ").find(item => item.includes("value")).split("=")[1].replace(/"/g, "");
                  resolve(appid);
                } else {
                  reject("variable WECHATAPPID can not be found");
                }
              } else {
                reject("config.xml file does not exist");
              }
            }
          }, e => {
            // console.error(e);
            reject(e);
          }, () => {
            setTimeout(() => {
              if (subscription) {
                subscription.unsubscribe();
              }
            }, 888);
          });
      });

    }
    return Promise.reject("httpclient is null");
  }
  static setDeviceName(name: string) {
    this._deviceName = name;
  }
  static getDeviceName() {
    if (this.isH5()) {
      return "H5";
    }
    return this._deviceName; // 返回ios或android
  }
  static isApp() {
    return !!window["cordova"];
  }
  static isH5() {
    return !window["cordova"];
  }
  static isWechatH5() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('micromessenger')) {    //判断是否是微信环境
      return true;
    }
    return false;
  }
  static isDingtalkH5() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('dingtalk')) {
      return true;
    } else {
      return false;
    }
  }
  static isWechatMini() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('micromessenger')) {    //判断是否是微信环境
      // wx.miniProgram.getEnv(function (res) {
      //   wx.miniProgram.getEnv((res) => {
      //     if (res.miniprogram) {//在小程序中
      //       return true;
      //     }
      //   });
      // })
      return true;
    }
    return false;
  }
  static getStyle() {
    return AppHelper.getCookie("style") || "";
  }
  static getLanguage() {
    return AppHelper.getCookie("language");
  }
  static getQueryString(name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const r = window.location.search && window.location.search.substr(1) && window.location.search.substr(1).match(reg);
    if (r) {
      return unescape(r[2]);
    }
    return "";
  }
  static setCookie(name: string, value: string, time: number = 0) {

    const exp = moment(+moment() + time);
    document.cookie = `${name}=${escape(value)};path=/;expires=${moment
      .utc(exp)
      .toDate()}`;
  }
  static getCookie(name) {
    const arr = document.cookie && document.cookie.match(
      new RegExp("(^|)" + name + "=([^;]*)(;|$)")
    );
    if (arr) {
      return unescape(arr[2]);
    }
    return null;
  }
  /**
   * 
   * @param key 不区分大小写
   * @param value 
   */
  static setStorage<T>(key: string, value: T) {
    if (!key) {
      return;
    }
    if (value) {
      window.localStorage.setItem(key.toLowerCase(), JSON.stringify(value));
    }
  }
  /**
   * 
   * @param key 不区分大小写
   */
  static getStorage<T>(key: string) {
    let result: T = null;
    if (!key) {
      return result;
    }
    const local = window.localStorage.getItem(key.toLowerCase()) as any;
    if (local) {
      try {
        result = JSON.parse(local);
      } catch (e) {
        if (!environment.production) {
          console.log("getStorage", e);
        }
        result = local as T;
      }
    }
    return result;
  }
  static getTicket() {
    return AppHelper.getQueryString("ticket") || AppHelper.getCookie("ticket");
  }
  static _domain = "";
  static getDomain() {
    AppHelper._domain = AppHelper._domain || AppHelper.getQueryString("domain");
    if (AppHelper._domain) {
      return AppHelper._domain;
    }
    if (AppHelper.isH5()) {
      let key = `mh_${Math.random()}`;
      let keyR = new RegExp(`(^|;)\\s*${key}=12345`);
      let expiredTime = new Date(0);
      let domain = document.domain;
      let domainList = domain.split('.');
      let urlItems = [];
      urlItems.unshift(domainList.pop());
      while (domainList.length) {
        urlItems.unshift(domainList.pop());
        let mainHost = urlItems.join('.');
        let cookie = `${key}=${12345};domain=.${mainHost}`;
        document.cookie = cookie;
        if (keyR.test(document.cookie)) {
          document.cookie = `${cookie};expires=${expiredTime}`;
          return mainHost;
        }
      }
    }
    if (!environment.production) {
      return "sky-trip.com";
    }
    if (environment.production) {
      return "sky-trip.com";
    }
  }

  static getApiUrl() {
    if (!environment.production) {
      return "http://dev.app.sky-trip.com";
    }
    if (environment.production) {
      return "https://app.sky-trip.com";
    }
  }
  static getRoutePath(path: string) {
    const style = AppHelper.getStyle() || "";
    path =
      path && path.length > 0
        ? `${path}${style ? "_" + style : ""}`
        : path;
    console.log(`get style=${style} Route Path=`, path);
    if (path) {
      return `/${path}`;
    }
    return path;
  }
  static matchDefaultRoute(
    url: UrlSegment[],
    group: UrlSegmentGroup,
    route: Route
  ) {
    try {
      // console.log(url, group, route, route.loadChildren);
      let path: string = null;
      if (url.length === 1) {
        path = url[0].path;
        console.log("path", path);
        path = path.match(new RegExp(`${path}_*`, "gi"))
          ? path.substring(0, path.lastIndexOf("_"))
          : path;
        // const pathExists = fetch(route.loadChildren.toString());
      }
      console.log("matchDefaultRoute path after", path);
      return path && url[0].path.match(new RegExp(`${path}_*`, "gi"))
        ? (route.redirectTo = `/${path}`) && {
          consumed: [new UrlSegment(path, {})]
        }
        : {
          consumed: [new UrlSegment("", {})]
        };
    } catch (e) {
      console.error("matchDefaultRoute", e);
    }

  }
  static md5Digest(content: string, toLowerCase: boolean = true) {
    if (toLowerCase) {
      return `${md5(content)}`.toLowerCase();
    }
    return md5(content);
  }
  static _queryParamers={};
  static setQueryParamers() {
    let name:string="";
    let value:string="";
    var str = location.href;
    var num = str.indexOf("?");
    str = str.substr(num + 1);
    var arr = str.split("&");
    for (var i = 0; i < arr.length; i++) {
      num = arr[i].indexOf("=");
      if (num > 0) {
        name = arr[i].substring(0, num);
        value = arr[i].substr(num + 1);
        this._queryParamers[name]=decodeURIComponent(value);
      }
    }
  }
  static getQueryParamers() {
    return this._queryParamers as any;
  }
}
