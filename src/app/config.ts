export const CONFIG = {
  // 该变量用于 启用 --prod 编译，若为true，访问的是测试库的地址，否则访问生产地址
  mockProBuild: true,
  isShowPrivacy: true,
  production: true,
  isShowVConsole:!!window["cordova"],
  isForWechatMiniApproval: false,
  isEnableTranslate: true,
  defaultStyle: "df",
  progressbarColor: "#08c261", // webview加载第三方应用进度条的颜色
  showNotUseWechatAccountTipTimeout: 5000,
  apiExcceedlogtime: 20 * 1000,// api请求超过某个时间，就发送一个日志到后台
  apiTimemoutTime:30*1000,
  appDomain: {
    production: "sky-trip.com",
    debug: "testskytrip.com",
    // production: "okoktrip.com",
    // debug: "okoktrip.com",
  },
  miPush: {
    appId: "2882303761518472718",
    appKey: "5771847252718",
  },
  vivoPush: {
    appId: "105507660",
    appKey: "bbeb418bd4191b6874fe8ae593f253e2",
    appSecret: "132bfa0c-c7f6-410a-aa9d-48d9cf93ca01",
  },
  oppoPush: {
    appId: "30445777",
    appKey: "21888b5426f247f28d60e23f9ff7ce9c",
    appSecret: "f5dfe6fef6a840758a1033c892f37029",
  },
  hwPush: {
    appId: "102060675",
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
    isShowMode: true,
    isShowLanguage: true,
  },
  getDefaultLogoUrl() {
    if (!this.mockProBuild && this.production) {
      return "http://shared." + this.appDomain.production + "/img/logo.png";
    }
    return "http://test.shared." + this.appDomain.debug + "/img/logo.png";
  },
};
