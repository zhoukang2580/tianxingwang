export const CONFIG = {
  // 该变量用于 启用 --prod 编译，若为true，访问的是测试库的地址，否则访问生产地址
  mockProBuild: false,
  production: true,
  isShowVConsole: false,
  showNotUseWechatAccountTipTimeout: 5000,
  isForWechatMiniApproval: false, // 小程序审核期间，请设置为true，通过后，设置false
  appDomain: {
    production: "okoktrip.com",
    debug: "okoktrip.com",
  },
  appTitle: "毅博商旅",
  AppleStoreAppId: "",
  wechat: {
    appId: "wxb617241a0e6aac3e",
    universalLinks: `https://app.okoktrip.com/ybslapp/`,
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
