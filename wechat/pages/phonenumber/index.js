//index.js
//获取应用实例
const app = getApp()
let argsOnLoad;
Page({
  data: {
    isOpenSetting: false,
    isShowCancel: true
  },

  onShow: function (args) {
    console.log('onshow address', args);
  },
  onLoad: function (args) {
    argsOnLoad = args;
    if (args && args.isLogin) {
      const that = this;
      wx.login({
        success: (res) => {
          argsOnLoad.wechatminicode=res.code;
        },
        fail: function (err) {}
      })
    }
},


onGetPhoneNumber: function (e) {
  // 需要获取手机号的时候要短信验证 开发者工具不能短信验证 就会这个问题
  // errMsg: "getPhoneNumber:fail Error: 用户绑定的手机需要进行验证，请在客户端完成短信验证步骤"
  console.log(e.detail);
  if (!e || !e.detail || !e.detail.errMsg || e.detail.errMsg.includes("fail")) {
    this.setStep("false");
  } else {
    /**
     encryptedData: "3sZl0bXjuZX6SNrCDoLFO8jw=="
     errMsg: "getPhoneNumber:ok"
     iv: "PvSPWiY67q2zdozYccyjK3oTw=="
     */
    e.detail.wechatminicode=argsOnLoad.wechatminicode;
    this.setStep(JSON.stringify(e.detail));
  }
},
onCancel: function (e) {
  this.setStep("false");
},
setStep: function (value) {
  app.setStep(wx, argsOnLoad, value);
},
})