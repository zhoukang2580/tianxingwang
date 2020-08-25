//index.js
//获取应用实例
const app = getApp()
var isFirstShow = true;
var isOpenApp = false;
Page({
  data: {
    isEnter: false,
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
    console.log('args', args);

  },
  onService: function () {
    // service会话结束后回调 回调时间太长，不用该方案返回
    // console.log("会话结束")
    // this.back();
  },
  onEnter:function(){
    this.setData({ isEnter: true })
  },
  onShow: function () {
    console.log("onShow", this.data.isEnter);
    if (this.data.isEnter) {
      this.back();
    }
  },
  back: function () {
    this.setData({ isEnter: false })
    try {
      console.log("back");
      wx.navigateBack()
    } catch (e) {
      console.error(e);
    }
  }

})