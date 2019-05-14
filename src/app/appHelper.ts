import * as md5 from "md5";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { UrlSegment, UrlSegmentGroup, Route } from "@angular/router";
export class AppHelper {
  private static _deviceName: string;
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
    return !window["cordova"];
  }
  static isDingtalkH5() {
    return !window["cordova"];
  }
  static isWechatMini() {
    return !window["cordova"];
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
    console.log("AppHelper.getDomain=" + AppHelper.getDomain());
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
    if(!key){
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
  static getDomain() {
    if (AppHelper.isH5()) {
      return AppHelper.getQueryString("domain");
    }
    return ""; // 插件获取
  }
  static getApiUrl() {
    if (!environment.production) {
      if (environment.localhost) {
        return "http://dev.app.beeant.com";
      }
      return "http://test.app.testskytrip.com";
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
}
