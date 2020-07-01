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