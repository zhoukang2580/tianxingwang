//index.js
//获取应用实例
const app = getApp()
let argsOnLoad;
Page({
  data: {
    isOpenSetting: false,
    isShowCancel: true
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
  onShow: function (args) {
    console.log('onshow address', args);
  },
  onLoad: function (args) {
    argsOnLoad = args;
    console.log(args);
    if(args&&args.description){
      this.setData({
        description:args.description||""
      })
    }
    this.checkAuth();
  },
  checkAuth: function () {
    const that = this;
    wx.getSetting({
      success: function (res) {
        that.getLocation(res);
      },
      fail: function (e) {
        console.error(e);
        that.setData({
          error: e
        });
      }
    })
  },

  onOpenSetting: function (e) {
    console.log("onOpenSetting", e.detail);
    this.getLocation();
  },
  onCancel: function (e) {
    this.setStep("false");
  },
  getLocation: function (res) {
    const hasAuth = res && res.authSetting && res.authSetting['scope.userLocation'];
    const denyed = !hasAuth && (res && res.authSetting && res.authSetting['scope.userLocation'] != undefined);
    if (!hasAuth) {
      if (denyed) {
        this.setData({
          isOpenSetting: !!denyed
        })
      } else {
        this.chooseLocation();
      }
    } else {
     this.chooseLocation();
    }
  },
  chooseLocation:function(){
    wx.chooseLocation({
      complete: (res) => {
        if (res && res.errMsg && res.errMsg.includes('fail')) {
          this.setStep("false");
        } else {
          if (res && res.latitude !=undefined&& res.longitude!=undefined) {
            this.setData({
              isShowCancel: false
            })
            this.getLatLngDone(res.latitude, res.longitude, res.name, res.address, res.poiid || "");
          } else {
            this.setStep("false");
          }
        }
        console.log(res);
      },
    })
  },
  setStep: function (value) {
    app.setStep(wx, argsOnLoad, value);
  },
  getLatLngDone: function (lat, lng, name, address, poiid) {
    this.setStep(JSON.stringify({
      latitude: lat,
      longitude: lng,
      name,
      address,
      poiid
    }));
  },
  loadCity: function (longitude, latitude) {
    var page = this;
    var ak = argsOnLoad && argsOnLoad.ak || "BFddaa13ba2d76f4806d1abb98ef907c";
    wx.request({
      url: 'https://api.map.baidu.com/geocoder/v2/?ak=' + ak + '&location=' + latitude + ',' + longitude + '&output=json',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        var city = res.data && res.data.result && res.data.result.addressComponent && res.data.result.addressComponent;
        console.log('解析到的地址：', city);
        if (res.data && res.data.result && res.data.result.addressComponent && res.data.result.addressComponent.city) {
          var city = res.data.result.addressComponent.city;
          page.setData({
            currentCity: city
          });
        } else {
          page.setData({
            currentCity: "获取定位失败"
          });
        }
      },
      fail: function () {
        page.setData({
          currentCity: "获取定位失败"
        });
      },
    })
  },
})