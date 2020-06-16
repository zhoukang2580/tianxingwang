//index.js
//获取应用实例
const app = getApp()
let argsOnLoad;
Page({
  data: {
    isOpenSetting: false,
    isShowCancel:true
  },

  onShow: function(args) {
    console.log('onshow address', args);
  },
  onLoad: function(args) {
    argsOnLoad=args;
    console.log(args);
    this.checkAuth();
  },
  checkAuth: function() {
    const that = this;
    wx.getSetting({
      success: function(res) {
        that.getAddress(res);
      },
      fail: function(e) {
        console.error(e);
        that.setData({
          error: e
        });
      }
    })
  },
  getAddress: function(res) {
    const that = this;
    const raiseAuth = res && res.authSetting && res.authSetting['scope.address'] != undefined;
    console.log(res, '是否询问过用户？', raiseAuth);
    const hasAddressAuth = res.authSetting && !!res.authSetting['scope.address'];
    if (!hasAddressAuth) {
      if (raiseAuth) {
        that.setData({
          isOpenSetting: raiseAuth
        })
      } else {
        this.chooseAddress();
      }
    } else {
      this.chooseAddress();
    }
  },
  onOpenSetting: function(e) {
    console.log(e.detail)
    this.chooseAddress();
  },
  onUserCurPos: function(e) {
    console.log(e.detail)
  },
  chooseAddress: function() {
    const that = this;
    wx.chooseAddress({
      success: function(address) {
        console.log("chooseAddress success", address);
        // cityName: "广州市"
        // countyName: "海珠区"
        // detailInfo: "新港中路397号"
        // errMsg: "chooseAddress:ok"
        // nationalCode: "510000"
        // postalCode: "510000"
        // provinceName: "广东省"
        // telNumber: "020-81167888"
        // userName: "张三
 
        var value=JSON.stringify(address);
        that.setStep(decodeURIComponent(value));
      },
      fail: function(e) {
        console.error(e);
        that.setStep("false");
      },
      complete:res=>{
        this.setData({isShowCancel:res&&res.errMsg&&res.errMsg.includes("fail")})
      }
    })
  },
  onCancel: function(e) {
    this.setStep("false");
  },
  setStep:function(value){
    app.setStep(wx,argsOnLoad,value);
  },
  
})