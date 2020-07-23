//index.js
//获取应用实例
const app = getApp()
var isFirstShow = true;
var isOpenApp = false;
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (args) {
    console.log('args',args);
    wx.login({
      success: (res) => {
        var tag = app.urls.homeUrl.indexOf("?") > -1 ? "&" : "?";
        var url = app.urls.homeUrl + tag + "wechatminicode=" + res.code;
        if (args) {
          for (var a in args) {
            url += "&" + a + "=" + decodeURIComponent(args[a]);
          }
        }
        this.setData({
          url: url
        });
      },
      fail: function (err) {
        wx.showModal({
          title: '提示',
          content: '网络超时,请重试',
          showCancel: true,
          cancelText: '',
          cancelColor: '',
          confirmText: '确认',
          confirmColor: '',
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    })
  },


})