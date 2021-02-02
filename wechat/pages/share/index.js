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
  onShow: function (data) {
    console.log("onShow data ", data)
    if (this.data.isShareComplete) {
      wx.navigateBack()
    }
  },
  onLoad: function (args) {
    argsOnLoad = args;
    const that=this;
    console.log("share onload ", args);
    var lanchOpt = wx.getLaunchOptionsSync();
    var options = {};
    if (args) {
      try {
        options = { query: JSON.parse(decodeURIComponent(args.shareArgs)) };
      } catch (e) {
        console.error(e)
      }
    }
    // console.log("Options ", options);
    const scenes = [
      1045,//	  朋友圈广告
      1007,//   单人聊天会话中的小程序消息卡片
      1008,//   群聊会话中的小程序消息卡片
      1036,// 	App 分享消息卡片
      1044,// 	带 shareTicket 的小程序消息卡片
      1096,// 	聊天记录，打开小程序
      1131,// 	浮窗打开小程序
    ];
    console.log("来源小程序分享，路径参数 ", options.query, "lanchOpt ", lanchOpt);
    const query = options.query;
    const globalScene = app.globalData.enterScene;
    const isEnter = typeof globalScene == 'number';
    if (scenes.find(s => s == lanchOpt.scene || (isEnter && s == globalScene))&&app.globalData.isGoToDetail) {
      app.globalData.isGoToDetail = false;
      if (query) {
        var url = "/pages/index/index";
        try {
          const qdata = Object.keys(query).map(k => `${k}=${query[k]}`).join("&");
          if (qdata) {
            url += `?${qdata}`;
          }
          wx.reLaunch({
            url,
            fail(e) {
              console.error(e)
            },
            success(e) {
              console.log('success', e)
            }
          })
        }
        catch (e) {
          console.error(e);
        }
      }
    } else {
      this.setData({
        isShowBtn: true
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
    console.log("onShareAppMessage", e, "getLaunchOptionsSync ", wx.getLaunchOptionsSync());
    wx.showShareMenu({
      withShareTicket: true,
      complete: function (evt) {
        console.log(" wx.showShareMenu complete", evt);
        that.setData({ isShareComplete: true });
      }
    })
  }
})