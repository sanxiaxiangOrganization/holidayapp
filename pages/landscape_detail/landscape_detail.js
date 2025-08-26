// 引入配置
const {
  API_CONFIG,
  IMAGE_UTILS
} = require('../../utils/config');

// pages/landscape_detail/landscape_detail.js
Page({
  data: {
    myLandscapeName: "",
    myLandscapeId: "",
    picture: "",
    landscapeImages: [], // 动态加载的景点图片
    indicatorDots: false,
    autoplay: true,
    interval: 2000,
    duration: 500,
    currentPage: 'introduction',
    description: '',
    comments: [],
    latitude: null,
    longitude: null,
    mapReady: true, // 新增标志位，用于判断地图是否可以渲染
  },

  async onLoad(options) {
    console.log("options:", options);
    const images = options.images 
      ? options.images.split(',').map(url => url.trim()): [];
    var that = this;
    var app = getApp();

    that.setData({
      myLandscapeName: decodeURIComponent(options.name),
      picture: options.picture,
      landscapeImages: images,
      latitude: options.latitude,
      longitude: options.longitude,
      description:options.description
    });
  },

  navigateToLocation: function () {
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              that._openLocation();
            },
            fail() {
              wx.showToast({
                title: '需要位置权限才能导航',
                icon: 'none'
              });
            }
          });
        } else {
          that._openLocation();
        }
      }
    });
  },

  _openLocation: function () {
    if (this.data.latitude && this.data.longitude) {
      wx.openLocation({
        latitude: parseFloat (this.data.latitude),
        longitude: parseFloat (this.data.longitude),
        scale: 18,
        name: this.data.myLandscapeName,
        fail: (err) => {
          console.error('地图打开失败原因：', err); 
        }
      });
    } else {
      wx.showToast({
        title: '位置信息不完整',
        icon: 'none'
      });
    }
  }
})