//index.js
//获取应用实例
const app = getApp();
var isFirstShow = true;
var isOpenApp = false;
let argsOnLoad;
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
    argsOnLoad=args;
  },
  onShow:function(args){
    console.log("onShow",args);
  },
  onShareAppMessage: function (e) {
    console.log(e);
    wx.showShareMenu({
      withShareTicket: true,
      success: (res) => {
        wx.navigateBack();
      },
      fail: (e) => {
       
      }
    })
  },
  onCancel: function () {
    wx.navigateBack();
  }
})