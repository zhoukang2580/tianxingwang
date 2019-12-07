//index.js
//获取应用实例
const app = getApp()

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
  onShow: function() {
    var args = wx.getStorageSync("args");
    var url = "https://app.sky-trip.com";
    if (args) {
      if (args.wechatminicode)
      {
        url += (url.includes("?") ? "&" : "?") + "wechatminicode=" + args.wechatminicode;
      }
      if (args.IsOpen) {
        url += (url.includes("?") ? "&" : "?")+"IsOpen=" + args.IsOpen;
      }
      if (args.openid) {
        url += (url.includes("?") ? "&" : "?") +"openid=" + args.openid;
      }
      if (args.ticket) {
        url += (url.includes("?") ? "&" : "?") +"ticket=" + args.ticket;
      }
      if (args.path) {
        url += (url.includes("?") ? "&" : "?") +"path=" + args.path;
      }
      if (args.wechatPayResult) {
        url += (url.includes("?") ? "&" : "?") + "wechatPayResult=" + args.wechatPayResult;
      }
    }
   
    this.setData({
      url: url
    });
    wx.clearStorageSync();
  },
  onLoad: function(args) {

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
  }
})