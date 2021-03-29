export const CONFIG = {
  // 该变量用于 启用 --prod 编译，若为true，访问的是测试库的地址，否则访问生产地址
  mockProBuild: true,
  isShowPrivacy: true,
  production: true,
  isShowVConsole: !!window["cordova"],
  isForWechatMiniApproval: false,
  isEnableTranslate: true,
  defaultStyle: "df",
  showNotUseWechatAccountTipTimeout: 5000,
  appDomain: {
    production: "sky-trip.com",
    debug: "testskytrip.com",
    // production: "okoktrip.com",
    // debug: "okoktrip.com",
  },
  appTitle: "天行商旅",
  // appTitle: "毅博商旅",
  AppleStoreAppId: "id1347643172",
  wechat: {
    appId: "wx0839a418ccafdf36",
    universalLinks: "https://app.sky-trip.com/eskytripapp/",
  },
  getApiUrl() {
    if (!this.mockProBuild && this.production) {
      return "https://app." + this.appDomain.production;
    }
    return "http://test.app." + this.appDomain.debug;
  },
  accountSetting: {
    isShowTTS: false,
  },
  getDefaultLogoUrl() {
    if (!this.mockProBuild && this.production) {
      return "http://shared." + this.appDomain.production + "/img/logo.png";
    }
    return "http://test.shared." + this.appDomain.debug + "/img/logo.png";
  },
};
