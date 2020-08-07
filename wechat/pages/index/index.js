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
    console.log('args', args);
    const that = this;
    if (app.urls.homeUrl) {
      this.initLauch(args);
    } else {
      this.loadLaunchUrl(true,function (shopUrl) {
        if (shopUrl) {
          app.setLaunchUrl(shopUrl);
          that.initLauch(args);
        } else {
          that.showModal();
        }
      });
    }
    this.updateLaunchUrl(false);
  },
  shoLoading: function () {
    wx.showLoading({
      title: '',
    })
  },
  hideLoading: function () {
    wx.hideLoading({
      success: (res) => { },
    })
  },
  initLauch: function (args) {
    const that = this;
    wx.login({
      success: (res) => {
        var tag = app.urls.homeUrl.indexOf("?") > -1 ? "&" : "?";
        var url = app.urls.homeUrl + tag + "wechatminicode=" + res.code;
        if (args) {
          for (var a in args) {
            url += "&" + a + "=" + decodeURIComponent(args[a]);
          }
        }
        // console.log("url:", url)
        this.setData({
          url: url
        });
      },
      fail: function (err) {
        that.showModal();
      }
    })
  },
  showModal: function (errMsg) {
    wx.showModal({
      title: '提示',
      content: errMsg || '网络超时,请重试',
      showCancel: true,
      cancelText: '',
      cancelColor: '',
      confirmText: '确认',
      confirmColor: '',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  loadLaunchUrl: function (isShowLoading, callback) {
    const that = this;
    if (isShowLoading) {
      this.shoLoading();
    }
    wx.request({
      url: `${app.getBaseUrl()}/home/LaunchUrl?AppId=${app.getAppId()}`,
      success: function (rs) {
        if (rs.data && rs.data.Data) {
          const launchUrl= rs.data.Data.LaunchUrl;
          app.urls.homeUrl = launchUrl
          if(typeof callback=='function'){
            callback(launchUrl);
          }
        } else {
          that.showModal();
        }
      },
      fail: function () {
        that.showModal();
      },
      complete: function () {
        that.hideLoading();
      }
    })
  },
  updateLaunchUrl: function (isShowLoading) {
    const that = this;
    this.loadLaunchUrl(isShowLoading, function (shopUrl) {
      app.setLaunchUrl(shopUrl);
    });
  }

})