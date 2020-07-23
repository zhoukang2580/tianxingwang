//index.js
//获取应用实例
const app = getApp()
let argsOnLoad;
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function(args) {
    argsOnLoad = args;
    let that=this;
    if (args) {
      wx.requestPayment({
        timeStamp: args.timeStamp,
        nonceStr: args.nonceStr,
        package: decodeURIComponent(args.package),
        signType: args.signType,
        paySign: args.paySign,
        success: (res) => {
          var payResult = res.errMsg == "requestPayment:ok" ? "success" : res.errMsg;
          if(payResult=="success") {
              that.setStep(args.number);
          }
          else{
            that.setStep("false");
          }
        },
        fail:function(res){
          that.setStep("false");
        }
      })
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  setStep: function (value) {
    try {
      app.setStep(wx, argsOnLoad, value);
    } catch (e) {
      console.error(e);
    }
  }
})