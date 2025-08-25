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
    land_detail: [],
    comments: [],
    landscapeLocation: '广东省河源市连平县大湖寨',
    latitude: null,
    longitude: null,
    mapReady: false, // 新增标志位，用于判断地图是否可以渲染
    needRefreshComments: false
  },

  async onLoad(options) {
    console.log("options:", options);
    var that = this;
    var app = getApp();

    // 解析传入的图片数组
    let allImages = [];
    if (options.allImages) {
      try {
        allImages = JSON.parse(options.allImages);
      } catch (e) {
        console.error('解析图片数组失败:', e);
      }
    }

    that.setData({
      myLandscapeName: decodeURIComponent(options.name),
      myLandscapeId: options.id,
      score: options.score,
      picture: options.picture,
    }, function () {
      that.getInfo();
    });
  },

  // 获取该景点的信息
  getInfo() {
    var that = this;
    wx.request({
      url: API_CONFIG.LANDSCAPE.GET_BY_ID,
      method: 'GET',
      data: {
        landscape_id: that.data.myLandscapeId,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: async (res) => {
        console.log('获取该景点信息的接口请求成功:', res.data.data);

        // 如果后端返回了图片路径，重新获取图片URLs
        if (res.data.data.images && res.data.data.images.length > 0) {
          try {
            const imageUrls = res.data.data.images;
            that.setData({
              land_detail: res.data.data,
              landscapeImages: imageUrls,
              latitude: res.data.data.latitude,
              longitude: res.data.data.longitude,
              mapReady: true // 数据准备好，允许地图渲染
            });
            if (res.data.data.images.length > 1) that.setData({
              indicatorDots: true
            })
          } catch (error) {
            console.error('获取景点图片失败:', error);
            that.setData({
              land_detail: res.data.data,
              latitude: res.data.data.latitude,
              longitude: res.data.data.longitude,
              mapReady: true // 数据准备好，允许地图渲染
            });
          }
        } else {
          that.setData({
            land_detail: res.data.data,
            latitude: res.data.data.latitude,
            longitude: res.data.data.longitude,
            mapReady: true // 数据准备好，允许地图渲染
          });
        }
      },
      fail: function (error) {
        console.log('获取单个景点信息失败:', error);
        wx.showToast({
          title: '网络错误，请重启小程序',
          icon: 'none',
          duration: 2000
        });
      }
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
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        scale: 18,
        name: this.data.myLandscapeName,
        address: this.data.landscapeLocation
      });
    } else {
      wx.showToast({
        title: '位置信息不完整',
        icon: 'none'
      });
    }
  }
})