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
    score: 4.5,
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
      that.getTheComments();
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
              landscapeImages: imageUrls
            });
            if(res.data.data.images.length > 1) that.setData({indicatorDots:true})
          } catch (error) {
            console.error('获取景点图片失败:', error);
            that.setData({
              land_detail: res.data.data
            });
          }
        } else {
          that.setData({
            land_detail: res.data.data
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

  // 获取该景区的所有评论
  getTheComments() {
    var that = this;
    var app = getApp();

    wx.request({
      url: API_CONFIG.COMMENT.GET_BY_LANDSCAPE || 'http://localhost:8080/comment/getCommentOfLandscape',
      method: 'GET',
      data: {
        landscape_id: that.data.myLandscapeId,
      },
      header: {
        'content-type': 'application/json',
      },
      success: async function (res) {
        console.log('获取景点评论的接口请求成功:', res);

        if (res.statusCode === 200) {
          let comments = [];

          // 处理后端返回的数据（直接返回数组）
          if (Array.isArray(res.data)) {
            comments = res.data;
          } else if (res.data && res.data.code === 1 && Array.isArray(res.data.data)) {
            comments = res.data.data;
          } else {
            console.error('评论数据格式错误:', res.data);
            return;
          }

          // 为每条评论添加 tourist_name
          for (let item of comments) {
            try {
              item.tourist_name = await app.getNameById(item.tourist_id);
            } catch (error) {
              console.error('获取用户名失败:', error);
              item.tourist_name = '匿名用户';
            }
          }

          that.setData({
            comments: comments
          });
        } else {
          console.error('获取评论失败，状态码:', res.statusCode);
          wx.showToast({
            title: '获取评论失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function (error) {
        console.error('获取该景点的所有评论失败:', error);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 添加获取用户评论功能
  getUserComments(tourist_id) {
    var that = this;

    wx.request({
      url: API_CONFIG.COMMENT.GET_BY_TOURIST || 'http://localhost:8080/comment/getCommentOfTourist',
      method: 'GET',
      data: {
        tourist_id: tourist_id
      },
      header: {
        'content-type': 'application/json',
      },
      success: function (res) {
        console.log('获取用户评论成功:', res);

        if (res.statusCode === 200) {
          let comments = [];

          if (Array.isArray(res.data)) {
            comments = res.data;
          } else if (res.data && res.data.code === 1 && Array.isArray(res.data.data)) {
            comments = res.data.data;
          }

          // 可以在这里进一步处理用户评论数据
          console.log('用户评论列表:', comments);
          return comments;
        }
      },
      fail: function (error) {
        console.error('获取用户评论失败:', error);
      }
    });
  },

  navigateToComment() {
    wx.navigateTo({
      url: `../fillComment/fillComment?name=${this.data.myLandscapeName}&id=${this.data.myLandscapeId}`,
    });
  },

  goToIntro() {
    this.setData({
      currentPage: 'introduction',
    });
  },

  goToComments() {
    this.setData({
      currentPage: 'comments',
    });
  },

  getLocationByName: function () {
    var that = this;
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        address: "广东省河源市连平县大湖镇" + that.data.myLandscapeName,
        key: '', // 需要配置腾讯地图API密钥
      },
      success: function (res) {
        if (res.data.status === 0) {
          var location = res.data.result.location;
          that.setData({
            latitude: location.lat,
            longitude: location.lng,
          });
          that.navigateToLocation();
        } else {
          wx.showToast({
            title: '无法获取位置',
            icon: 'none',
          });
        }
      },
      fail: function () {
        wx.showToast({
          title: '网络错误',
          icon: 'none',
        });
      },
    });
  },

  navigateToLocation: function () {
    var that = this;
    console.log("——————————————————————导航到景区————————————————————————");
    if (that.data.latitude && that.data.longitude) {
      wx.openLocation({
        latitude: that.data.latitude,
        longitude: that.data.longitude,
        scale: 18,
        name: that.data.myLandscapeName,
        address: that.data.landscapeLocation
      });
    } else {
      wx.showToast({
        title: '位置未获取到',
        icon: 'none',
      });
    }
  },

  makePhoneCall: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.land_detail.telephone,
      success: function () {
        console.log("电话拨打成功");
      },
      fail: function () {
        console.log("电话拨打失败");
      }
    });
  }
})