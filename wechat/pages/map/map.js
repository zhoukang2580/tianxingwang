// 引用百度地图微信小程序JSAPI模块 
// var bmap = require('../../lib/bmap-wx.min.js');
// var wxMarkerData = []; 

// pages/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: 113.324520,
    latitude: 23.099994,
    scale: 18,
    markers: [{
      id: 0,
      iconPath: "../../images/icon_cur_position.png",
      latitude: 23.099994,
      longitude: 113.324520,
      width: 50,
      height: 50
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    // 发起regeocoding检索请求 
    const title = options.hotelName;
    const lat = options.lat;
    const lng = options.lng;
    const scale = options.scale || 19;
    console.log(`酒店${title}所在的lat:${lat},lng:${lng}`);
    if (title) {
      wx.setNavigationBarTitle({
        title
      })
    }
    var that = this;
    if (!lat || !lng) {
      // BMap.regeocoding({
      //   fail: fail,
      //   success: success
      //   // iconPath: '../../img/marker_red.png',
      //   // iconTapPath: '../../img/marker_red.png'
      // }); 
      wx.getLocation({
        type: "wgs84",
        success: function(res) {
          var latitude = res.latitude;
          var longitude = res.longitude;
          //console.log(res.latitude);
          that.setData({
            latitude: res.latitude,
            longitude: res.longitude,
            scale,
            markers: [{
              latitude: res.latitude,
              longitude: res.longitude
            }]
          })
        }
      })
    } else {
      that.setData({
        latitude: lat,
        longitude: lng,
        scale,
        markers: [{
          latitude: lat,
          longitude: lng
        }]
      })
      // BMap.regeocoding({
      //   location: `${lat},${lng}`,
      //   fail: fail,
      //   success: success,
      //   iconPath: '../../images/icon_cur_position_sm.png',
      //   iconTapPath: '../../images/icon_cur_position_sm.png'
      // }); 
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})