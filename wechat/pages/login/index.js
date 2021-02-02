//index.js
//获取应用实例
const app = getApp()
let argsOnLoad;
Page({
  data: {
    isShowAuthorizeButton: false,
    motto: 'Hello World',
    isOpenSetting: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
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
  },
  onLogin: function (e) {
    const userInfo = e && e.detail && e.detail.userInfo;
    if(!userInfo){
      this.setStep("false");
    }else{
      this.requestUrl(userInfo);
    }
  },
  onCancel: function (e) {
    this.setStep("false");
  },
  onOpenSetting: function (e) {
    if (!e || !e.detail || !e.detail.errMsg || e.detail.errMsg.includes("fail")) {
      this.setStep("false");
    } else {
      console.log("用户信息", e.detail);
      this.requestUrl(e.detail);
    }
  },
  checkAuth: function () {
    const that = this;
    wx.getSetting({
      success: function (res) {
        const raiseAuth = res && res.authSetting && res.authSetting['scope.userInfo'] != undefined;
        console.log(res, '是否询问过用户？', raiseAuth);
        const hasAuth = res.authSetting && !!res.authSetting['scope.userInfo'];
        if (!hasAuth) {
          that.setData({
            isOpenSetting: raiseAuth,
            isShowAuthorizeButton: !raiseAuth
          })
        } else {
          that.getUserInfo();
        }
      },
      fail: function (e) {
        console.error(e);
        that.setStep("false");
        that.setData({
          error: e
        });
      },
      complete: function (res) {
        if (res && res.errMsg && res.errMsg.includes("fail")) {
          that.setStep("false")
        }
      }
    })
  },
  onLoad: function (args) {
    argsOnLoad = args;
    this.checkAuth();
  },
  getUserInfo:function(userInfo){
    const that=this;
    wx.getUserInfo({
      success: function (info) {
        console.log(info);
        that.requestUrl(info.userInfo);
      },
      fail: function (err) {
        console.error(err);
        that.setStep("false");
      }
    })
  },
  onOpenSetting: function (e) {
    console.log(e.detail)
    const that = this;
    this.getUserInfo(e.detail);
  },
  cacheUserInfoToStorage: function (userInfo) {
    const that = this;
    let nickname = userInfo && userInfo.nickName ? userInfo.nickName : "";
    const local = wx.getStorageSync("args");
    wx.setStorageSync("args", {
      ...local,
      wechatminicode: that.data.code,
      openid: that.data.openid,
      ticket: that.data.ticket,
      path: that.data.path,
      gender: userInfo && userInfo.gender || "",
      IsForbidOpenId: that.data.IsForbidOpenId,
      nickName: nickname
    });
  },
  requestUrl: function (userInfo) {
    const args = argsOnLoad;
    const that = this;
    wx.login({
      success: (res) => {
        var value = JSON.stringify({
          wechatminicode: res.code,
          nickName: userInfo && userInfo.nickName || "",
          gender: userInfo && userInfo.gender || "",
          province: userInfo && userInfo.province || "",
          city: userInfo && userInfo.city || "",
          country: userInfo && userInfo.country || "",
          avatarUrl: userInfo && userInfo.avatarUrl || "",
        })
        this.setStep(decodeURIComponent(value));
      },
      fail: function (err) {
        that.setStep("false");
      }
    })
  },
  setStep: function (value) {
    try {
      app.setStep(wx, argsOnLoad, value);
    } catch (e) {
      console.error(e);
    }
  }
})