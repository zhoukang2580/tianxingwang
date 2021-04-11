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
      this.loadLaunchUrl(true, function (shopUrl) {
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
          const launchUrl = rs.data.Data.LaunchUrl;
          app.urls.homeUrl = launchUrl
          if (typeof callback == 'function') {
            callback(launchUrl);
          }
        } else {
          if (isShowLoading) {
            that.showModal();
          }
        }
      },
      fail: function () {
        if (isShowLoading) {
          that.showModal();
        }
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
  },
  onShareAppMessage: function (options) {
    var that = this;
    // 设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      // title: "转发的标题",        // 默认是小程序的名称(可以写slogan等)
      // path: '/pages/share/share',        // 默认是当前页面，必须是以‘/’开头的完整路径
      // imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
        }
      },
      fail: function () {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          // 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      },
      complete: function () {
        // 转发结束之后的回调（转发成不成功都会执行）
      }
    };
    // 来自页面内的按钮的转发
    if (options.from == 'button') {
      var eData = options.target.dataset;
      console.log(eData.name);     // shareBtn
      // 此处可以修改 shareObj 中的内容
      // shareObj.path = '/pages/btnname/btnname?btn_name=' + eData.name;
    }
    // 返回shareObj
    return shareObj;
  }

})