//index.js
//获取应用实例
const app = getApp()
var homeUrl = "http://test.app.beeant.com";
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    showAuthorization: !!(app.globalData&&app.globalData.userInfo),
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow: function() {
    debugger;
    var args = wx.getStorageSync("args");
    var ticket=args && args.ticket;
    wx.login({
      success: (res) => {
        var geturl = homeUrl + "/Home/GetWechatUser";
        var code = res.code
        wx.request({
          url: geturl,
          data: {
            code: res.code,
            ticket: ticket,
            IsLogin: true,
            SdkType: "Mini"
          },
          header: {},
          method: 'GET',
          dataType: 'json',
          complete: (r) => {
            if (r && r.data && r.data.Data) {
              args = { openid: r.data.Data.OpenId, ticket: r.data.Data.Ticket };
              wx.setStorageSync("args", args);

              this.setUrl(args);
            }
            wx.navigateBack();
          }
        })
      }
    })
   
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
  },
  setUrl:function(args)
  {
    var url = homeUrl+"/home/index";
    if (args) {
      if (args.wechatminicode) {
        url += (url.includes("?") ? "&" : "?") + "wechatminicode=" + args.wechatminicode;
      }
      if (args.IsForbidOpenId) {
        url += (url.includes("?") ? "&" : "?") + "IsForbidOpenId=" + args.IsForbidOpenId;
      }
      if (args.ticket) {
        url += (url.includes("?") ? "&" : "?") + "ticket=" + args.ticket;
      }
      if (args.openid) {
        url += (url.includes("?") ? "&" : "?") + "wechatminiopenid=" + args.openid;
      }
      if (args.path) {
        url += (url.includes("?") ? "&" : "?") + "path=" + args.path;
      }
      if (args.nickName) {
        url += (url.includes("?") ? "&" : "?") + "wechatmininickname=" + args.nickName;
      }
      if (args.wechatPayResult) {
        url += (url.includes("?") ? "&" : "?") + "wechatPayResult=" + args.wechatPayResult;
      }
    }
    var orgUrl = this.data.url;
    if (orgUrl && orgUrl.indexOf(url) > -1) {
      return;
    }
    var lat;
    var lng;
    const st = Date.now();
    var that = this;
    wx.getLocation({
      complete: (res) => {
        lat = res && res.latitude;
        lng = res && res.longitude;
        if (lat && lng) {
          url += (url.includes("?") ? "&" : "?") + "lat=" + lat;
          url += (url.includes("?") ? "&" : "?") + "lng=" + lng;
        }
        that.setData({
          url: url
        });
        console.log(url);
      }
    })
    wx.clearStorageSync();
  }
})