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
      return "http://app." + this.appDomain.production;
    }
    return "http://test.app." + this.appDomain.debug;
  },
  accountSetting: {
    isShow: false,
  },
  getDefaultLogoUrl() {
    if (!environment.mockProBuild && environment.production) {
      return "http://shared." + this.appDomain.production + "/img/logo.png";
    }
    return "http://test.shared." + this.appDomain.debug + "/img/logo.png";
  }
};
