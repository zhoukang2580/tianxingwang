import { RequestEntity } from "src/app/services/api/Request.entity";
import * as md5 from "md5";
import Big from "big.js";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import {
  UrlSegment,
  UrlSegmentGroup,
  Route,
  Router,
  ActivatedRoute,
} from "@angular/router";
import { HttpClient, HttpResponseBase } from "@angular/common/http";
import {
  AlertController,
  ToastController,
  ModalController,
  Platform,
  LoadingController,
} from "@ionic/angular";
import { LanguageHelper } from "./languageHelper";
import { TimeoutError } from "rxjs";
import * as uuidJs from "uuid-js";
import { FileHelperService } from "./services/file-helper.service";
import { CONFIG } from "src/app/config";
export class AppHelper {
  static httpClient: HttpClient;
  private static _deviceName: "ios" | "android";
  private static _routeData: any;
  private static configXmlText: string;
  private static toPage: { path: string; queryParams?: any };
  static toastController: ToastController;
  static alertController: AlertController;
  static modalController: ModalController;
  static fileService: FileHelperService;
  static _appDomain = !environment.mockProBuild
    ? CONFIG.appDomain.production
    : CONFIG.appDomain.debug;
  constructor() {}
  static _domain;
  static _queryParamers = {};
  static platform: Platform;
  static Router: Router;
  static ActivatedRoute: ActivatedRoute;
  static loadingController: LoadingController;
  static _events: {
    name: string;
    handle: (name: string, data: any) => void;
  }[] = [];

  static _callbackHandle: (name: string, data: any) => void;
  static setModalController(modalController: ModalController) {
    this.modalController = modalController;
  }
  static checkNetworkStatus() {
    document.addEventListener("online", onOnline, false);
    document.addEventListener("offline", onOffline, false);
    function onOffline() {
      AppHelper.toast("网络中断，请检查网络设置", 2000, "middle");
    }
    function onOnline() {}
  }
  static showLoading(message: string, duration = 0) {
    return this.loadingController.create({ message, duration }).then((l) => {
      l.present();
      return l;
    });
  }
  static hideLoading() {
    this.loadingController
      .getTop()
      .then((t) => {
        // console.log(t)
        if (t) {
          t.dismiss();
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
  static getHcpVersion() {
    return this.fileService && this.fileService.getLocalHcpVersion();
  }
  static setFileService(fileService: FileHelperService) {
    AppHelper.fileService = fileService;
  }
  static getAppVersion() {
    return this.fileService && this.fileService.getRunningVersion();
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
  static includeHanz(txt: string) {
    return /[\u4e00-\u9fa5]/gi.test(txt);
  }
  static toast(
    msg: any,
    duration = 1400,
    position?: "top" | "bottom" | "middle",
    userOp = false
  ) {
    return new Promise<any>(async (resolve, reject) => {
      await this.dismissAlertLayer();
      const t = await this.toastController.create({
        message: this.getMsg(msg),
        position: position as any,
        duration: userOp ? 0 : duration,
        buttons: userOp
          ? [{ icon: "close-circle-outline", side: "end", role: "cancel" }]
          : [],
      });
      if (t) {
        t.present();
        t.onDidDismiss()
          .then((_) => {
            resolve();
          })
          .catch((_) => {
            reject();
          });
      }
    });
  }
  static isFunction(fun: any) {
    return typeof fun === "function";
  }
  private static getMsg(msg: any) {
    if (this.isHttpFailureMsg(msg)) {
      return "网络错误";
    }
    return typeof msg === "string"
      ? msg
      : msg instanceof Error
      ? msg.message
      : msg && (msg.message || msg.Message)
      ? msg.message || msg.Message
      : JSON.stringify(msg);
  }
  private static isHttpFailureMsg(msg: any) {
    if (msg) {
      if (msg instanceof HttpResponseBase) {
        if (msg.statusText) {
          if (msg.statusText.toLowerCase().includes("unknown error")) {
            return true;
          }
        }
      }
      if (
        (msg.message || msg.Message || "")
          .toLowerCase()
          .includes("http failure response")
      ) {
        return true;
      }
    }
    return false;
  }
  static alert(
    msg: any,
    userOp: boolean = false,
    confirmText: string = LanguageHelper.getConfirmTip(),
    cancelText: string = ""
  ) {
    return new Promise<boolean>(async (resolve, reject) => {
      await this.dismissAlertLayer();
      const buttons = [];
      let ok = false;
      if (cancelText) {
        buttons.push({
          text: cancelText,
          role: "cancel",
          handler: () => {
            // resolve(false);
            ok = false;
          },
        });
      }
      if (confirmText) {
        buttons.push({
          text: confirmText,
          handler: () => {
            // resolve(true);
            ok = true;
          },
        });
      }
      const a = await this.alertController.create({
        header: LanguageHelper.getMsgTip(),
        message: this.getMsg(msg),
        backdropDismiss: !userOp,
        buttons,
      });
      await a.present();
      await a.onDidDismiss();
      if (userOp) {
        resolve(ok);
      } else {
        resolve();
      }
    });
  }
  static getDefaultAvatar() {
    return "assets/images/defaultavatar.jpg";
  }
  static getDefaultLoadingImage() {
    return "assets/loading.gif";
  }
  static getRouteData() {
    return this._routeData;
  }
  static setHttpClient(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  static async getDeviceId() {
    if (this.isH5()) {
      return Promise.resolve(
        `${environment.mockProBuild ? "_test_app_uuid_123456" : ""}`
      );
    }
    let local = ""; // AppHelper.getStorage<string>("_UUId_DeviceId_");
    await this.platform.ready();
    const wechat = window["hcp"];
    if (wechat && wechat.getUUID) {
      local = await wechat.getUUID();
    }
    if (local) {
      local = md5(local);
    }
    console.log("local uuid " + local);
    if (local) {
      return Promise.resolve(local);
    }
    // local = AppHelper.uuid().replace(/-/g, "");
    console.log(" 获取到的 uuid " + local);
    // AppHelper.setStorage<string>("_UUId_DeviceId_", local);
    return Promise.resolve(local);
  }
  static verifyIdNumber(id: string) {
    if (!id || id.length != 18) {
      return false;
    }
    id = id.trim();
    let code = id.substr(0, 17);
    const arr = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    let num = 0;
    for (let i = 0; i < 17; i++) {
      num += +id.substr(i, 1) * arr[i];
    }
    num %= 11;
    switch (num) {
      case 0: {
        code = `${code}1`;
        break;
      }
      case 1: {
        code = `${code}0`;
        break;
      }
      case 2: {
        code = `${code}X`;
        break;
      }
      default: {
        code = `${code}${12 - num}`;
        break;
      }
    }
    console.log(code, id);
    return code.toLowerCase() == id.toLowerCase();
  }
  static async dismissAlertLayer() {
    try {
      let i = 5;
      let a = await this.alertController.getTop();
      while (a && --i > 0) {
        await a.dismiss();
        a = await this.alertController.getTop();
      }
    } catch (e) {
      console.log(e);
    }
  }
  static async dismissToasttLayer() {
    try {
      let i = 5;
      let a = await this.toastController.getTop();
      while (a && --i > 0) {
        await a.dismiss();
        a = await this.toastController.getTop();
      }
    } catch (e) {
      console.error(e);
    }
  }
  static getWechatUniversalLinks() {
    return CONFIG.wechat.universalLinks;
  }
  static getAppStoreAppId() {
    return CONFIG.AppleStoreAppId;
  }
  private static async getPreferanceValue(key: string) {
    let value = "";
    try {
      const str = await this.getConfigXmlStr();
      const p = str.split("/>").find((it) => it.includes(key));
      value =
        p &&
        p
          .substring(p.indexOf(`value="`) + `value="`.length)
          .trim()
          .replace(/\"/g, "");
    } catch (e) {
      console.error("getPreferanceValue error", e);
    }
    return value;
  }
  static getConfigXmlStr() {
    if (this.configXmlText) {
      return Promise.resolve(this.configXmlText);
    }
    return new Promise<string>((resolve, reject) => {
      const subscription = this.httpClient
        .get("assets/config.xml", { responseType: "arraybuffer" })
        .subscribe(
          (r) => {
            // console.log(r);
            const fr = new FileReader();
            fr.readAsText(new Blob([r]));
            fr.onerror = (e) => {
              // console.error("读取出错");
              reject(e);
            };
            fr.onload = () => {
              // console.log("读取完成", fr.result);
              if (fr.result) {
                const configXmlStr = (fr.result || "") as string;
                this.configXmlText = configXmlStr;
                resolve(configXmlStr);
              } else {
                reject("config.xml file does not exist");
              }
            };
          },
          (e) => {
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
  static getWechatAppId() {
    return CONFIG.wechat.appId;
  }
  static setDeviceName(name: "ios" | "android") {
    this._deviceName = name;
  }
  static getDeviceName() {
    if (this.isH5()) {
      return "H5";
    }
    return new Promise<string>((resolve, reject) => {
      if (!window["cordova"]) {
        resolve("H5");
      }
      document.addEventListener(
        "deviceready",
        () => {
          const Device = window["device"]; // 插件获取
          resolve(Device.model);
        },
        false
      );
    }).catch((ex) => {
      // this.alert(JSON.stringify(ex));
      return "";
    });
  }
  static async getWechatCode(appId: string = "") {
    await AppHelper.platform.ready();
    if (!appId) {
      appId = CONFIG.wechat.appId;
    }
    const wechat = window["wechat"];
    if (wechat) {
      return wechat.getCode(appId, this.getWechatUniversalLinks());
    }
    return Promise.reject("cordova wechat plugin is unavailable");
  }
  static async isWXAppInstalled() {
    await AppHelper.platform.ready();
    if (window["wechat"]) {
      const appId = AppHelper.getWechatAppId();
      return window["wechat"]
        .isWXAppInstalled(appId)
        .then(() => true)
        .catch(() => false);
    }
    return false;
  }
  static async isAliPayAppInstalled() {
    await AppHelper.platform.ready();
    if (window["ali"]) {
      return window["ali"]
        .isAliPayInstalled("alipays://platformapi/startApp")
        .then(() => true)
        .catch(() => false);
    }
    return false;
  }
  static async payH5Url(
    url: string
  ): Promise<{ payReturnUrl: string; payResultCode: string }> {
    await AppHelper.platform.ready();
    if (window["ali"]) {
      return window["ali"].payH5Url(url, this.getWechatAppId());
    }
    return null;
  }
  static isApp() {
    return !!window["cordova"];
  }
  static isH5() {
    return !this.isApp();
  }
  static setRequestEntity(req: RequestEntity) {
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.TicketName = AppHelper.getTicketName();
    req.Domain = AppHelper.getDomain();
    const ticketName = AppHelper.getTicketName();
    if (ticketName != "ticket") {
      req[ticketName] = req.Ticket;
      req.Ticket = "";
    }
  }
  /**
   *  请注意，这个是异步方法，返回promise,是pda ，返回true，否则返回false，使用判断条件是，判断是否存在sim卡；
   */
  static async isPDAAsync() {
    return Promise.all([this.hasFrontCamera(), this.hasSimCard()])
      .then(() => false)
      .catch(() => true)
      .then((ispda) => {
        console.log("ispda " + ispda);
        return ispda;
      });
  }
  static isPDA() {
    return (
      AppHelper.isApp() && navigator.userAgent.toLowerCase().includes("pda")
    );
  }
  static async hasSimCard() {
    if (AppHelper.isApp()) {
      await this.platform.ready();
      const hcp = window["hcp"];
      if (hcp) {
        return hcp.hasSimCard();
      }
    }
    return Promise.reject(false);
  }
  static async hasFrontCamera() {
    if (AppHelper.isApp()) {
      await this.platform.ready();
      const hcp = window["hcp"];
      if (hcp) {
        return hcp.hasFrontCamera();
      }
    }
    return Promise.reject(false);
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
  static isWechatMiniAsync() {
    return new Promise<boolean>((resolve) => {
      function ready() {
        console.log(window["__wxjs_environment"] === "miniprogram"); // true
        resolve(window["__wxjs_environment"] === "miniprogram");
      }
      if (!window["WeixinJSBridge"] || !window["WeixinJSBridge"].invoke) {
        document.addEventListener("WeixinJSBridgeReady", ready, false);
        setTimeout(() => {
          resolve(false);
        }, 3000);
      } else {
        ready();
      }
    });
  }
  static isWechatMini() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (
      ua.includes("micromessenger") &&
      window["__wxjs_environment"] === "miniprogram"
    ) {
      // 判断是否是微信环境
      return true;
    }
    return false;
  }
  static getStyle() {
    return AppHelper.getStorage("style") || this._queryParamers["style"] || "";
  }
  static setStyle(style: string) {
    this._queryParamers["style"] = style || "";
    AppHelper.setStorage("style", style);
  }
  static getLanguage() {
    return AppHelper.getStorage<string>("language");
  }
  static getToPageAfterAuthorize() {
    return this.toPage || { path: "" };
  }
  static setToPageAfterAuthorize(data: { path: string; queryParams?: any }) {
    this.toPage = { ...data };
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
  /**
   *
   * @param name 要查询的 name
   * @param queryString 用于查询的查询字符串，如果是url地址，请截取?后面的字符串
   */
  static getValueFromQueryString(name: string, queryString: string) {
    queryString = queryString || "";
    queryString = queryString.includes("?")
      ? queryString.substring(queryString.indexOf("?") + 1)
      : queryString;
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const r = queryString.match(reg);
    if (r) {
      return decodeURIComponent(unescape(r[2]));
    }
    return "";
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
    let result: T;
    if (!key) {
      return (result || "") as T;
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
    result = result || (("" as any) as T);
    return result;
  }
  static getTicket() {
    const name = this.getTicketName();
    const ticket =
      this.getQueryParamers()[name] ||
      this.getStorage(name) ||
      this.getCookieValue(name);
    return ticket == "null" ? "" : ticket;
  }

  static getTicketName() {
    const ticketName =
      this.getQueryParamers()["ticketName"] ||
      this.getStorage("ticketName") ||
      this.getCookieValue("ticketName");
    return !ticketName || ticketName == "null" ? "ticket" : ticketName;
  }

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
  static getCookieValue(name: string) {
    const reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    const arr = document.cookie.match(reg);
    if (arr && arr.length > 1) {
      return unescape(arr[2]);
    } else {
      return null;
    }
  }
  static getRedirectUrl() {
    const url = this.getApiUrl();
    const domain = this.getDomain();
    return url.replace(this._appDomain, domain).replace("test.", "");
  }
  static getApiUrl() {
    return CONFIG.getApiUrl();
  }
  static getRoutePath(path: string) {
    const style = AppHelper.getStyle() || "";
    if (path.lastIndexOf("_") != -1) {
      path = path.substring(0, path.lastIndexOf("_"));
    }
    const query = path.includes("?") ? path.substr(path.indexOf("?")) : "";
    if (query) {
      path = path.substr(0, path.indexOf("?"));
    }
    path = this.getNormalizedPath(path);
    path =
      path && path.length > 0 ? `${path}${style ? "_" + style : ""}` : path;
    // if (query) {
    //   path += query;
    // }
    console.log(`get style=${style}, Route Path=${path}`);
    if (path) {
      return `/${path}`;
    }
    return path;
  }
  static getNormalizedPath(path: string) {
    if (!path) {
      return path;
    }
    path = decodeURIComponent(path);
    path = path.includes("?") ? path.split("?")[0] : path;
    path = path.includes("#") ? path.split("#")[1] : path;
    path = path.startsWith("/") ? path.substr(1) : path;
    return path;
  }
  static md5Digest(content: string, toLowerCase: boolean = true) {
    if (toLowerCase) {
      return `${md5(content)}`.toLowerCase();
    }
    return md5(content);
  }
  static processPath() {
    const query = AppHelper.getQueryParamers();
    const hrefPath = AppHelper.getNormalizedPath(window.location.href);
    if (query) {
      if (
        query.style != undefined &&
        query.style != null &&
        query.style.toLowerCase() != "undefined" &&
        query.style.toLowerCase() != "null"
      ) {
        this.setStyle(query.style || "");
      }
      if (hrefPath) {
        if (!query.path) {
          query.path = hrefPath;
        }
      }
      if (
        query.unroutehome &&
        (query.unroutehome as string).toLowerCase().includes("true")
      ) {
        if ((query.unroutehome as string).includes("#")) {
          const [unroutehome, path] = (query.unroutehome as string).split("#");
          query.unroutehome = unroutehome;
          query.path = path;
        }
      }
      const path2 = query.path;
      query.path = AppHelper.getNormalizedPath(path2);
    }
  }
  static initlizeQueryParamers() {
    let name: string = "";
    let value: string = "";
    let str = decodeURIComponent(location.href);
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
  static setQueryParamers(key: string, value: string) {
    try {
      this._queryParamers[key] = value;
    } catch (ex) {}
  }
  static removeQueryParamers(key: string) {
    try {
      this._queryParamers[key] = null;
    } catch (ex) {}
  }
  static getQueryParamers() {
    return this._queryParamers as any;
  }
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
  static getJsonHtml(name: string, data: any, html: string) {
    // 得到HTML
    if (Object.prototype.toString.apply(data) === "[object Array]") {
      const el = document.createElement("div");
      el.innerText = "<div>" + html + "</div>";
      const arrayHtmls = el.querySelectorAll(
        "[DataLoaderArray='@" + name + "']"
      );
      for (let i = 0; i < arrayHtmls.length; i++) {
        let replaceHtml = "";
        const arrayHtml = arrayHtmls[i].outerHTML;
        if (data && data.length > 0) {
          for (let j = 0; j < data.length; j++) {
            replaceHtml += this.getJsonHtml(name, data[j], arrayHtml);
          }
        }
        html = html.replace(arrayHtml, replaceHtml);
      }
    } else if (Object.prototype.toString.apply(data) === "[object Object]") {
      for (let d of data) {
        const nextName = name == "" ? d : name + "." + d;
        let replaceName = "@" + nextName;
        if (typeof data[d] === "object" && !data[d]) {
          html = this.replaceAll(html, replaceName, data[d]);
        } else if (
          typeof data[d] === "object" ||
          Object.prototype.toString.apply(data[d]) === "[object Array]"
        ) {
          html = this.getJsonHtml(
            nextName,
            data[d] == null ? [] : data[d],
            html
          );
        } else {
          html = this.replaceAll(html, replaceName, data[d]);
        }
      }
    }
    return html;
  }
  static replaceAll(source: string, oldString: string, newString: string) {
    // 替换所有
    newString = !newString ? "" : newString;
    const reg = new RegExp("\\" + oldString, "g");
    return source.replace(reg, newString);
  }
  static uuid() {
    const uuid = uuidJs.create();
    return `${uuid}`.replace(/-/g, "");
  }
  static add(...args: number[]) {
    if (args && args.length) {
      let res = 0;
      for (let i = 0; i < args.length; i++) {
        res = new Big(args[i]).add(res);
      }
      return res;
    }
    return 0;
  }
  static multiply(op1: number, op2: number) {
    return new Big(op1).times(op2);
  }
  static div(op1: number, op2: number) {
    return new Big(op1).div(op2);
  }
  static getDate(datestr: string | number) {
    if (datestr && typeof datestr == "string") {
      return new Date(datestr.replace(/-/g, "/").replace("T", " "));
    }
    return new Date(datestr);
  }
  static getAddDaysDate(addDays: number = 0) {
    let d = new Date();
    if (addDays) {
      d = new Date(d.getTime() + addDays * 24 * 3600 * 1000);
    }
    let m = `${d.getMonth() + 1}`;
    let day = `${d.getDate()}`;
    if (+m < 10) {
      m = `0${m}`;
    }
    if (+day < 10) {
      day = `0${day}`;
    }
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
