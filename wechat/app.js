const md5=require("./utils/md5.js")
//app.js
App({
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          if (this.globalData) {
            this.globalData.showAuthorization = true;
          }
        }
      }
    })
  },
  globalData: {
    userInfo: null
  },
  urls:{
    homeUrl: "http://test.app.testskytrip.com",
    stepUrl:"http://test.app.testskytrip.com/home/CreateStep"
  },
  setStep:function(wx,args,value){
    wx.navigateBack();
    if(!args || !args.key || !args.token)
    {
      return;
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const sign=this.getSign(timestamp,args.token,"");
    var url=this.urls.stepUrl;
    wx.request({
        url: url,
        data: {
          Key: args.key,
          Token:args.token,
          Sign:sign,
          Timestamp:timestamp,
          Value: value
        },
        timeout:5000,
        header: {},
        method: 'GET',
        dataType: 'json',
        complete: (r) => {
          // if (!r || !r.data || !r.data.Status) {
          //   wx.showModal({
          //     cancelColor: '',
          //     cancelText: '',
          //     complete: (res) => {},
          //     confirmColor: '',
          //     confirmText: '确认',
          //     content: '网络超时请重试',
          //     fail: (res) => {},
          //     showCancel: true,
          //     success: (result) => {},
          //     title: '网络超时',
          //   })
          // }           
      
        }
      })
  },
  getSign(timestamp,token,data) {
    return md5.hexMD5(
      `${typeof data=== "string" ? data : JSON.stringify(data)}${
        timestamp
      }${token}`
    );
  }
})