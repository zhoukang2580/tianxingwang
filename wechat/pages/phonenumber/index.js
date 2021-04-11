//index.js
//获取应用实例
const app = getApp()
let argsOnLoad;
Page({
  data: {
    isOpenSetting: false,
    isShowCancel: true,
    description:""
  },

  onShow: function (args) {
    console.log('onshow address', args);
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
  onLoad: function (args) {
    argsOnLoad = args;
    if(args&&args.description){
      this.setData({
        description:args.description||""
      })
    }
    if (args && args.isLogin) {
      const that = this;
      wx.login({
        success: (res) => {
          argsOnLoad.wechatminicode=res.code;
        },
        fail: function (err) {}
      })
    }
},


onGetPhoneNumber: function (e) {
  // 需要获取手机号的时候要短信验证 开发者工具不能短信验证 就会这个问题
  // errMsg: "getPhoneNumber:fail Error: 用户绑定的手机需要进行验证，请在客户端完成短信验证步骤"
  console.log(e.detail);
  if (!e || !e.detail || !e.detail.errMsg || e.detail.errMsg.includes("fail")) {
    this.setStep("false");
  } else {
    /**
     encryptedData: "3sZl0bXjuZX6SNrCDoLFO8jw=="
     errMsg: "getPhoneNumber:ok"
     iv: "PvSPWiY67q2zdozYccyjK3oTw=="
     */
    e.detail.wechatminicode=argsOnLoad.wechatminicode;
    this.setStep(JSON.stringify(e.detail));
  }
},
onCancel: function (e) {
  this.setStep("false");
},
setStep: function (value) {
  app.setStep(wx, argsOnLoad, value);
},
})