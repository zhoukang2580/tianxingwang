import { environment } from "../environments/environment";
export const CONFIG = {
  appDomain: {
    production: "sky-trip.com",
    debug: "testskytrip.com",
  },
  AppleStoreAppId: "id1347643172",
  wechat: {
    appId: "wx0839a418ccafdf36",
    universalLinks: "https://app.sky-trip.com/eskytripapp/",
  },
  getApiUrl() {
    if (!environment.mockProBuild && environment.production) {
      return "https://app." + this.appDomain.production;
    }
    return "http://test.app." + this.appDomain.debug;
  },
  accountSetting: {
    isShowTTS: false,
  },
  getDefaultLogoUrl() {
    if (!environment.mockProBuild && environment.production) {
      return "http://shared." + this.appDomain.production + "/img/logo.png";
    }
    return "http://test.shared." + this.appDomain.debug + "/img/logo.png";
  },
  /** 设置 true 小程序多跳转一个页面，用于审核,审核通过后，关闭即可 */
  forMiniApproval: false,
};
