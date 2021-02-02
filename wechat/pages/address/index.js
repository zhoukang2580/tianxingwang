//index.js
//获取应用实例
const app = getApp()
let argsOnLoad;
Page({
  data: {
    isOpenSetting: false,
    isShowCancel: true
  },

  onShow: function (args) {
    console.log('onshow address', args);
  },
  onLoad: function (args) {
    argsOnLoad = args;
    console.log(args);
    if (args && args.description) {
      this.setData({
        description: args.description || ""
      })
    }
    this.checkAuth();
  },
  checkAuth: function () {
    const that = this;
    wx.getSetting({
      success: function (res) {
        that.getAddress(res);
      },
      fail: function (e) {
        console.error(e);
        that.setData({
          error: e
        });
      }
    })
  },
  getAddress: function (res) {
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
  onOpenSetting: function (e) {
    console.log(e.detail)
    this.chooseAddress();
  },
  onUserCurPos: function (e) {
    console.log(e.detail)
  },
  chooseAddress: function () {
    const that = this;
    wx.chooseAddress({
      success: function (address) {
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

        var value = JSON.stringify(address);
        that.setStep(decodeURIComponent(value));
      },
      fail: function (e) {
        console.error(e);
        that.setStep("false");
      },
      complete: res => {
        this.setData({ isShowCancel: res && res.errMsg && res.errMsg.includes("fail") })
      }
    })
  },
  onCancel: function (e) {
    this.setStep("false");
  },
  setStep: function (value) {
    app.setStep(wx, argsOnLoad, value);
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