import * as md5 from "md5";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { UrlSegment, UrlSegmentGroup, Route } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import {
  AlertController,
  ToastController,
  ModalController
} from "@ionic/angular";
import { LanguageHelper } from "./languageHelper";
import { TimeoutError } from "rxjs";
export class AppHelper {
  static httpClient: HttpClient;
  private static _deviceName: string;
  private static _routeData: any;
  private static toastController: ToastController;
  private static alertController: AlertController;
  private static modalController: ModalController;
  static setModalController(modalController: ModalController) {
    this.modalController = modalController;
  }
  static setToastController(toastController: ToastController) {
    this.toastController = toastController;
  }
  static setAlertController(alertController: AlertController) {
    this.alertController = alertController;
  }
  static setRouteData(data: any) {
    this._routeData = data;
  }
  static toast(
    msg: any,
    duration = 1400,
    position?: "top" | "bottom" | "middle"
  ) {
    return new Promise<any>(async (resolve, reject) => {
      await this.dismissLayer();
      const t = await this.toastController.create({
        message:
          typeof msg === "string"
            ? msg
            : msg instanceof Error
            ? msg.message
            : typeof msg === "object" && msg.message
            ? msg.message
            : JSON.stringify(msg),
        position: position as any,
        duration: duration
      });
      if (t) {
        t.present();
      }
    });
  }
  static isFunction(fun: any) {
    return typeof fun === "function";
  }
  static alert(
    msg: any,
    userOp: boolean = false,
    confirmText: string = LanguageHelper.getConfirmTip(),
    cancelText: string = ""
  ) {
    return new Promise<boolean>(async (resolve, reject) => {
      await this.dismissLayer();
      const buttons = [
        {
          text: confirmText,
          handler: () => {
            resolve(true);
          }
        }
      ];
      if (userOp) {
        if (cancelText) {
          buttons.push({
            text: cancelText,
            handler: () => {
              resolve(false);
            }
          });
        }
      }
      (await this.alertController.create({
        header: LanguageHelper.getMsgTip(),
        message:
          typeof msg === "string"
            ? msg
            : msg instanceof Error
            ? msg.message
            : typeof msg === "object" && msg.message
            ? msg.message
            : JSON.stringify(msg),
        backdropDismiss: !userOp,
        buttons
      })).present();
    });
  }
  static getDefaultAvatar() {
    return "assets/images/defaultavatar.jpg";
  }
  static getDefaultLoadingImage() {
    return "assets/images/loading.gif";
  }
  static getRouteData() {
    return this._routeData;
  }
  static setHttpClient(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  static getDeviceId() {
    return new Promise<string>((resolve, reject) => {
      if (this.isH5()) {
        resolve("");
      }
      document.addEventListener(
        "deviceready",
        async () => {
          try {
            const hcp = window["hcp"]; // 插件获取
            if (!hcp) {
              reject("hcp 未安装");
              return;
            }
            const uuid = await hcp.getUUID();
            if (uuid) {
              resolve(`${uuid}`.replace(/-/g, "").toLowerCase());
            } else {
              reject("can't get uuid");
            }
          } catch (e) {
            reject(e);
          }
        },
        false
      );
    }).catch(ex => {
      return "";
    });
  }

  static async dismissLayer() {
    try {
      const a = await this.alertController.getTop();
      const t = await this.toastController.getTop();
      const m = await this.modalController.getTop();
      if (m) {
        m.dismiss();
      }
      if (a) {
        a.dismiss();
      }
      if (t) {
        t.dismiss();
      }
    } catch (e) {
      console.log(e);
    }
  }
  static getWechatAppId() {
    if (this.httpClient) {
      return new Promise<string>((resolve, reject) => {
        const subscription = this.httpClient
          .get("assets/config.xml", { responseType: "arraybuffer" })
          .subscribe(
            r => {
              // console.log(r);
              const fr = new FileReader();
              fr.readAsText(new Blob([r]));
              fr.onerror = e => {
                // console.error("读取出错");
                reject(e);
              };
              fr.onload = () => {
                // console.log("读取完成", fr.result);
                if (fr.result) {
                  const configXmlStr = fr.result as string;
                  if (
                    configXmlStr
                      .split("variable")
                      .find(item => item.includes("WECHATAPPID")) &&
                    configXmlStr
                      .split("variable")
                      .find(item => item.includes("WECHATAPPID"))
                      .split(" ")
                      .find(item => item.includes("value"))
                      .includes("=")
                  ) {
                    const appid = configXmlStr
                      .split("variable")
                      .find(item => item.includes("WECHATAPPID"))
                      .split(" ")
                      .find(item => item.includes("value"))
                      .split("=")[1]
                      .replace(/"/g, "");
                    resolve(appid);
                  } else {
                    reject("variable WECHATAPPID can not be found");
                  }
                } else {
                  reject("config.xml file does not exist");
                }
              };
            },
            e => {
              // console.error(e);
              reject(e);
            },
            () => {
              setTimeout(() => {
                if (subscription) {
                  subscription.unsubscribe();
                }
              }, 888);
            }
          );
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
    return new Promise<string>((resolve, reject) => {
      if (this.isH5()) {
        resolve("");
      }
      document.addEventListener(
        "deviceready",
        () => {
          const Device = window["device"]; // 插件获取
          resolve(Device.model);
        },
        false
      );
    }).catch(ex => {
      // this.alert(JSON.stringify(ex));
      return "";
    });
  }
  static isApp() {
    return !!window["cordova"];
  }
  static isH5() {
    return !window["cordova"];
  }
  static isWechatH5() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (
      ua.includes("micromessenger") &&
      window["__wxjs_environment"] != "miniprogram"
    ) {
      //判断是否是微信环境
      return true;
    }
    return false;
  }
  static isDingtalkH5() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes("dingtalk")) {
      return true;
    } else {
      return false;
    }
  }
  static isWechatMini() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (
      ua.includes("micromessenger") &&
      window["__wxjs_environment"] === "miniprogram"
    ) {
      //判断是否是微信环境
      return true;
    }
    return false;
  }
  static getStyle() {
    return AppHelper.getStorage("style") || "";
  }
  static getLanguage() {
    return AppHelper.getStorage<string>("language");
  }
  static checkQueryString(name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const r =
      window.location.search &&
      window.location.search.substr(1) &&
      window.location.search.substr(1).match(reg);
    if (r) {
      return true;
    }
    return false;
  }
  static getQueryString(name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const r =
      window.location.search &&
      window.location.search.substr(1) &&
      window.location.search.substr(1).match(reg);
    if (r) {
      return unescape(r[2]);
    }
    return "";
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
    } else {
      window.localStorage.setItem(key.toLowerCase(), null);
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
    const ticket =
      AppHelper.getQueryString("ticket") || AppHelper.getStorage("ticket");
    return ticket == "null" ? "" : ticket;
  }
  static _appDomain = "beeant.com";
  static _domain;
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
      let domainList = domain.split(".");
      let urlItems = [];
      urlItems.unshift(domainList.pop());
      while (domainList.length) {
        urlItems.unshift(domainList.pop());
        let mainHost = urlItems.join(".");
        let cookie = `${key}=${12345};domain=.${mainHost}`;
        document.cookie = cookie;
        if (keyR.test(document.cookie)) {
          document.cookie = `${cookie};expires=${expiredTime}`;
          return mainHost;
        }
      }
    }
    return this._appDomain;
  }
  static getRedirectUrl() {
    const url = this.getApiUrl();
    const domain = this.getDomain();
    return url.replace(this._appDomain, domain).replace("dev.", "");
  }
  static getApiUrl() {
    return "http://dev.app." + this._appDomain;
  }
  static getRoutePath(path: string) {
    const style = AppHelper.getStyle() || "";
    path =
      path && path.length > 0 ? `${path}${style ? "_" + style : ""}` : path;
    console.log(`get style=${style}, Route Path=`, path);
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
  static _queryParamers = {};
  static setQueryParamers() {
    let name: string = "";
    let value: string = "";
    let str = location.href;
    let num = str.indexOf("?");
    str = str.substr(num + 1);
    const arr = str.split("&");
    for (let i = 0; i < arr.length; i++) {
      num = arr[i].indexOf("=");
      if (num > 0) {
        name = arr[i].substring(0, num);
        value = arr[i].substr(num + 1);
        this._queryParamers[name] = decodeURIComponent(value);
      }
    }
  }
  static getQueryParamers() {
    return this._queryParamers as any;
  }

  static _events: {
    name: string;
    handle: (name: string, data: any) => void;
  }[] = [];
  static registerEvent(
    name: string,
    handle: (name: string, data: any) => void
  ) {
    this._events.push({ name, handle });
  }
  static triggerEvent(name: string, data: any) {
    this._events.forEach((item, index) => {
      if (item.name == name && item.handle) {
        item.handle(name, data);
      }
    });
  }

  static _callbackHandle: (name: string, data: any) => void;
  static setCallback(callbackHandle: (name: string, data: any) => void) {
    this._callbackHandle = callbackHandle;
  }
  static executeCallback(name: string, data: any) {
    if (this._callbackHandle) {
      this._callbackHandle(name, data);
    }
  }

  static redirect(url) {
    window.location.href = url;
  }
}
