import { AppVersion } from "@ionic-native/app-version/ngx";
import { AppHelper } from "./appHelper";
import { CONFIG } from "./config";
import { ApiService } from "./services/api/api.service";
import { RequestEntity } from "./services/api/Request.entity";
const cache_push_device_token_key = "pushDeviceToken";
const cache_push_device_manufacturer_key = "pushDevice_manufacturer_key";
export class CordovaPushPluginHelper {
  private static deviceToken: string;
  private static initPushPromise: Promise<{ deviceToken: string }>;
  private static apiService: ApiService;
  private static appversion: AppVersion;
  private static manufacturer: string;
  private static isInitPush=false;
  private static async initIosPush(resv, rej) {
    try {
      const PushNotification = window["PushNotification"];
      const push = PushNotification.init({
        ios: {
          alert: true,
          badge: true,
          sound: true,
          clearBadge: true,
        },
      });
      push.on("error", (err) => {
        AppHelper.alert(err);
        console.error("异常，");
        console.error(err);
      });
      push.on("notification", (d) => {
        console.log("notification 收到通知");
        console.log(d);
      });
      push.on("registration", (d) => {
        console.log("registration 返回");
        console.log(d);
        if (d) {
          CordovaPushPluginHelper.deviceToken = d.registrationId;
          resv({ deviceToken: d.registrationId });
        }
      });
    } catch (e) {
      rej(e);
    }
  }
  private static async getManufacturer() {
    if (AppHelper.platform.is("android")) {
      if (!this.manufacturer) {
        this.manufacturer = AppHelper.getStorage(
          cache_push_device_manufacturer_key
        );
      }
      if (this.manufacturer) {
        return this.manufacturer;
      }
      const pushN = window["PushNotification"];
      const push = pushN.AndroidPushNotification;
      const manufacturer = await push.getManufacturer();
      this.manufacturer = manufacturer;
      if (manufacturer) {
        AppHelper.setStorage(cache_push_device_manufacturer_key, manufacturer);
      }
      return manufacturer;
    }
    return "";
  }
  private static async initAndroidPush(resv, rej) {
    try {
      if (!AppHelper.isApp() && CONFIG.mockProBuild) {
        window["PushNotification"] = {} as any;
        window["PushNotification"].AndroidPushNotification = {} as any;
        window["PushNotification"].AndroidPushNotification.registerViVoToken =
          async () => "16302890761340500732349";
        window["PushNotification"].AndroidPushNotification.getManufacturer =
          async () => "vivo";
        window[
          "PushNotification"
        ].AndroidPushNotification.subscribeAndroidMessage = async () => "vivo";
        window["PushNotification"].AndroidPushNotification.initViVoPush =
          async () => "16302890761340500732349";
      }

      const pushN = window["PushNotification"];
      const push = pushN.AndroidPushNotification;
      setTimeout(() => {
        if (!CordovaPushPluginHelper.deviceToken) {
          rej("获取token失败");
        }
      }, 2 * 60 * 1000);
      const m = await this.getManufacturer();
      console.log("initAndroidPush getManufacturer " + m);
      if (this.isHw(m)) {
        push.subscribeAndroidMessage(CONFIG.hwPush.appId);
        push
          .getAndroidToken(CONFIG.hwPush.appId)
          .then((t) => {
            console.log("android token", t);
            if (t) {
              CordovaPushPluginHelper.deviceToken = t;
              resv(t);
              this.checkAndBindDeviceToken();
            }
          })
          .catch((e) => {
            console.error("PushPlugin 插件尚未初始化");
            console.error(e);
            rej(e);
          });
      }
      if (this.isMi(m)) {
        push
          .registerMiPush(CONFIG.miPush.appId, CONFIG.miPush.appKey)
          .then((regId) => {
            if (regId) {
              CordovaPushPluginHelper.deviceToken = regId;
              resv(regId);
              this.checkAndBindDeviceToken();
            }
          })
          .catch((e) => {
            console.error(e);
          });
        push.subscribeAndroidMessage();
      }
      if (this.isVivo(m)) {
        push.subscribeAndroidMessage();
        await push
          .registerViVoToken(
            CONFIG.vivoPush.appId,
            CONFIG.vivoPush.appKey,
            CONFIG.vivoPush.appSecret
          )
          .then((regId) => {
            console.log("registerViVoToken regid " + regId);
            if (regId) {
              CordovaPushPluginHelper.deviceToken = regId;
              resv(regId);
              this.checkAndBindDeviceToken();
            }
          })
          .catch((e) => {
            console.error(e);
          });
        push.initViVoPush();
      }
      if (this.isOppo(m)) {
        push.subscribeAndroidMessage();
        await push
          .getOppoRegisterId(CONFIG.oppoPush.appKey, CONFIG.oppoPush.appSecret)
          .then((regId) => {
            if (regId) {
              CordovaPushPluginHelper.deviceToken = regId;
              resv(regId);
              this.checkAndBindDeviceToken();
            }
          })
          .catch((e) => {
            console.error(e);
          });
      }
    } catch (e) {
      console.error("initAndroidPush ", e);
      rej(e);
    }
  }
  private static async initPushNotification() {
    try {
      if (this.initPushPromise) {
        return this.initPushPromise;
      }
      this.initPushPromise = new Promise(async (resv, rej) => {
        if (AppHelper.platform.is("ios")) {
          await this.initIosPush(resv, rej);
        } else {
          await this.initAndroidPush(resv, rej);
        }
      });
      return this.initPushPromise;
    } catch (e) {
      AppHelper.alert(e);
      console.error(e);
    }
  }
  private static async setBadge(badge: number) {
    await AppHelper.platform.ready();
    const badgeCtrl = window["cordova.plugins.notification.badge"];
    if (badgeCtrl) {
      badgeCtrl.set(badge);
    }
  }
  private static async clearBadge() {
    try {
      await AppHelper.platform.ready();
      const badgeCtrl = window["cordova.plugins.notification.badge"];
      if (badgeCtrl) {
        badgeCtrl.clear();
      }
    } catch (e) {
      console.error(e);
    }
  }
  static async initPush(appversion: AppVersion, apiService: ApiService) {
    try {

      if(CordovaPushPluginHelper.isInitPush){
        return;
      }
      CordovaPushPluginHelper.isInitPush=true;
      this.apiService = apiService;
      this.appversion = appversion;
      window.addEventListener(
        "receiveandroidpushmessage",
        function (androidNotification) {
          console.log("收到消息通知 ", androidNotification);
        }
      );
      await AppHelper.platform.ready();
      this.clearBadge();
      this.initPushNotification();
    } catch (e) {
      console.error(e);
    }
  }
  private static async checkAndBindDeviceToken() {
    const isBind = await this.checkIsBindToken();
    console.log("checkAndBindDeviceToken " + isBind);
    if (!isBind) {
      await this.bindPushDeviceToken(this.deviceToken);
    }
  }
  private static async checkIsBindToken() {
    if (!CordovaPushPluginHelper.deviceToken) {
      await this.initPushNotification();
      if (!CordovaPushPluginHelper.deviceToken) {
        return true;
      }
    }
    return (
      AppHelper.getStorage(cache_push_device_token_key) ==
      CordovaPushPluginHelper.deviceToken
    );
  }
  private static async bindPushDeviceToken(deviceToken: string) {
    console.log("bindPushDeviceToken deviceToken " + deviceToken);
    try {
      if (!deviceToken) {
        return;
      }
      const appId = await this.getAppId();
      console.log("bindPushDeviceToken appId " + appId);
      if (!appId) {
        return;
      }
      const req = new RequestEntity();
      req.Method = "ApiPasswordUrl-Push-Bind";
      const ua = navigator.userAgent;
      const m = await this.getManufacturer();
      let pltInfo = this.getPlatformInfo(m);
      if (pltInfo.platformType == "unknow") {
        pltInfo = this.getPlatformInfo(ua);
      }
      req.Data = {
        DeviceToken: deviceToken,
        AppId: appId,
        PlatformType: pltInfo.platformType,
        PlatformName: pltInfo.platformName,
      };
      const res = await this.apiService.getPromise<any>(req);
      if (res && res.Status) {
        AppHelper.setStorage(cache_push_device_token_key, this.deviceToken);
      } else if (res && res.Message) {
        // AppHelper.alert(res.Message);
        console.error(res.Message);
      }
    } catch (e) {
      console.error(e);
    }
  }
  private static async getAppId() {
    if (this.appversion && AppHelper.isApp()) {
      return this.appversion.getPackageName();
    }
    const configXml = await AppHelper.getConfigXmlStr();
    if (configXml) {
      const arr = configXml.split(" ");
      const a = arr.find((it) => it.includes("id="));
      if (a) {
        const b = a.replace(/"/g, "").replace("id=", "").trim();
        if (b) {
          return b;
        }
      }
    }
    return "";
  }
  private static getPlatformInfo(testStr: string) {
    let platformType: "xiaomi" | "huawei" | "vivo" | "oppo" | "unknow" =
      "unknow";
    let platformName = "未知";
    if (this.isMi(testStr)) {
      platformType = "xiaomi";
      platformName = "小米";
    }
    if (this.isHw(testStr)) {
      platformType = "huawei";
      platformName = "华为";
    }
    if (this.isOppo(testStr)) {
      platformType = "oppo";
      platformName = "oppo";
    }
    if (this.isVivo(testStr)) {
      platformType = "vivo";
      platformName = "vivo";
    }
    platformName =
      platformType == "unknow"
        ? (`${testStr.substr(0, 20)}` as any)
        : platformName;
    platformType =
      platformType == "unknow"
        ? (`${testStr.substr(0, 20)}` as any)
        : platformType;
    return {
      platformName,
      platformType,
    };
  }
  private static isMi(testStr: string) {
    return /xiaomi|mi\s|redmi|mix\s/i.test(testStr);
  }
  private static isHw(testStr: string) {
    return /huawei|honor/i.test(testStr);
  }
  private static isVivo(testStr: string) {
    return /vivo/i.test(testStr);
  }
  private static isOppo(testStr: string) {
    return /oppo/i.test(testStr);
  }
}
