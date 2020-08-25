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
    isShowBtn: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    systemInfo: {
      windowWidth: 1,
      windowHeight: 1
    },
    isShareComplete: false,
    shareInfo: {
      title: "",
      imageUrl: "",
    }
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow: function () {
    console.log(this.data)
    if (this.data.isShareComplete) {
      wx.navigateBack()
    }
  },
  onLoad: function (args) {
    argsOnLoad = args;
    console.log(args);
    var options = wx.getLaunchOptionsSync();
    // console.log("Options ", options);
    const scenes = [
      1007,// 单人聊天会话中的小程序消息卡片
      1008,// 群聊会话中的小程序消息卡片
      1036,// 	App 分享消息卡片
      1044,// 	带 shareTicket 的小程序消息卡片
      1096,// 	聊天记录，打开小程序
      1131,// 	浮窗打开小程序
    ];
    if (scenes.find(s => s == options.scene)) {
      if (options.query) {
        console.log("来源小程序分享，路径参数 ", options.query);
        const query = options.query || {};
        var url = "/pages/index/index";
        if (query.shareArgs) {
          try {
            var toArgs = JSON.parse(query.shareArgs);
            for (var con in toArgs) {
              var tag = url.indexOf("?") > -1 ? "&" : "?";
              url = url + tag + con + "=" + toArgs[con];
            }
          }
          catch (e) {
            console.error(e);
          }
        }
        wx.reLaunch({
          url: url,
        })
        // if (query.shareInfo) {
        //   const shareInfo = JSON.parse(decodeURIComponent(query.shareInfo));
        //   path = shareInfo.path;
        //   this.setData({
        //     imageUrl: shareInfo.imageUrl,
        //     title: shareInfo.title
        //   })
        // }
      }
    } else {
      this.setData({
        isShowBtn:true
      })
      if (args && args.shareArgs) {
        const info = JSON.parse(decodeURIComponent(args.shareArgs));
        console.log("parameters", info);
        this.setData({
          shareInfo: {
            imageUrl: info.imageUrl,
            title: info.title
          }
        })
      }
    }
  },
  onShareAppMessage: function (e) {
    const that = this;
    // console.log(e);
    wx.showShareMenu({
      withShareTicket: true,
      complete: function () {
        that.setData({ isShareComplete: true });
      }
    })
  }
})