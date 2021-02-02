//index.js
//获取应用实例
const app = getApp();
var isFirstShow = true;
var isOpenApp = false;
let argsOnLoad;

Page({
  data: {
    title: "跳转",
    isJump: false
  },
  onShow: function () {
    if (this.data.isJump) {
      this.back();
    }
  },
  onLoad: function (args) {
    argsOnLoad = args;
    this.setData({
      title: args.title
    })
    if (!args.appId || !args.jumpWechatMiniPath) {
      wx.navigateBack()
    }
  },
  back: function () {
    try {
      wx.navigateBack()
    } catch (e) {
      console.error(e);
    }
  },
  onJump: function () {
    const that = this;
    const query = argsOnLoad;
    console.log("query", query)
    if (query) {
      const data = Object.keys(query).filter(k => k != "jumpWechatMiniPath" && k != "appId" && k != "title")
        .map(k => `${k}=${query[k]}`)
        .join("&")
      const path = query.jumpWechatMiniPath + (data ? ("?" + data) : "");
      console.log("path=", path)
      wx.navigateToMiniProgram({
        appId: query.appId,
        path,
        fail: function (e) {
          console.error(e);
          that.back();
        },
        success: function () {
          console.log("跳转成功");
          that.setData({ isJump: true })
        }
      });
    } else {
      this.back();
    }
  }
})