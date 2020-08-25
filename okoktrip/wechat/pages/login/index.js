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