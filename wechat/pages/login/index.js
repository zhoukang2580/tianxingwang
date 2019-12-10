//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function(args) {
    wx.login({
      success: (res) => {
        if (args && args.IsLogin) {
          var geturl = decodeURIComponent(args.getUrl);
          var domain = args.domain;
          var code = res.code
          wx.request({
            url: geturl,
            data: {
              IsLogin: true,
              domain: args.domain,
              ticket: args.ticket,
              code: res.code,
              SdkType: "Mini"
            },
            header: {},
            method: 'GET',
            dataType: 'json',
            success: function(r) {},
            fail: function(r) {

            },
            complete: (r) => {
              if (r && r.data && r.data.Data) {
                wx.setStorageSync("args", {
                  IsForbidOpenId: true,
                  ticket: r.data.Data.Ticket,
                  openid: r.data.Data.OpenId
                });
                wx.navigateBack();
              } else {
                wx.navigateBack();
              }
            },
          })
        } else if (args) {
          wx.getSetting({
            complete(getres) {
              if (getres && getres.authorize && getres.authSetting['scope.userInfo']) {
                wx.getUserInfo({
                  complete: function(infoRes) {
                    const userRes = infoRes.userInfo;
                    console.log("userRes", userRes);
                    let nickname = userRes && userRes.nickName ? userRes.nickName : "";
                    wx.setStorageSync("args", {
                      wechatminicode: res.code,
                      openid: args.openid,
                      ticket: args.ticket,
                      path: args.path,
                      gender: userRes.genger,
                      IsForbidOpenId: args.IsForbidOpenId,
                      nickName: nickname
                    });
                    wx.navigateBack();
                  }
                })
              } else {
                wx.authorize({
                  scope: 'scope.userInfo',
                  complete(res) {
                    wx.getUserInfo({
                      complete: function(infoRes) {
                        const userRes = infoRes.userInfo;
                        debugger;
                        let nickname = userRes && userRes.nickName ? userRes.nickName : "";
                        wx.setStorageSync("args", {
                          wechatminicode: res.code,
                          openid: args.openid,
                          ticket: args.ticket,
                          path: args.path,
                          gender: userRes.genger,
                          IsForbidOpenId: args.IsForbidOpenId,
                          nickName: nickname
                        });
                        wx.navigateBack();
                      }
                    })
                  }
                })
              }
            }
          })


        }

      }
    })
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
  }
})