// 引入配置
const {
  API_CONFIG,
  IMAGE_UTILS
} = require('../../utils/config');

// pages/manager/manager.js
Page({
  data: {
    background: [],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 2000,
    duration: 500,
    landscapeList: []
  },

  async onLoad(options) {
    var that = this;
    var app = getApp();

    // 加载轮播图
    await this.loadBanners();

    // 获取所有景点
    that.getAllLand();
  },

  // 加载轮播图
  async loadBanners() {
    try {
      const banners = await IMAGE_UTILS.getBanners();
      // 检查是否有轮播图数据
      if (banners && Object.keys(banners).length > 0) {
        // 获取所有轮播图URL（假设所有值都是URL）
        const bannerUrls = Object.values(banners);

        this.setData({
          background: bannerUrls
        });
      }
    } catch (error) {
      console.error('加载轮播图失败:', error);
    }
  },

  /*编辑景点信息*/
  editLand(e) {
    var that = this;
    console.log("e:", e.currentTarget);
    /*将对应景点的名字当参数传给页面*/
    const name = e.currentTarget.dataset.name;
    const id = e.currentTarget.dataset.id;
    // 跳转到编辑景点的页面
    wx.navigateTo({
      url: `../edit_landscape/edit_landscape?name=${name}&id=${id}`,
    });
  },

  /*新增景点信息*/
  addLand() {
    // 跳转到新增景点的页面
    wx.navigateTo({
      url: '../edit_landscape/edit_landscape',
    });
  },

  /*删除景点*/
  deleteLand(e) {
    var that = this;
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除景点"${name}"吗？此操作不可撤销。`,
      success: function (res) {
        if (res.confirm) {
          // 用户点击确定
          wx.request({
            url: API_CONFIG.LANDSCAPE.DELETE || 'http://localhost:8080/landscape/delete',
            method: 'DELETE',
            data: {
              landscape_id: id
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log('删除景点响应:', res);

              if (res.statusCode === 200) {
                // 处理后端统一返回格式
                if (res.data && res.data.code === 1) {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 1500
                  });
                  // 重新获取景点列表
                  that.getAllLand();
                } else {
                  wx.showToast({
                    title: res.data.msg || '删除失败',
                    icon: 'none',
                    duration: 2000
                  });
                }
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            },
            fail: function (error) {
              console.error('删除景点失败:', error);
              wx.showToast({
                title: '网络错误',
                icon: 'none',
                duration: 2000
              });
            }
          });
        }
      }
    });
  },

  // 获取所有景点
  getAllLand() {
    var that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.LANDSCAPE.ALL,
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        success(res) {
          console.log('获取所有景点信息的接口请求成功:', res);

          if (res.statusCode === 200) {
            let landscapeData = [];

            // 处理后端统一返回格式
            if (res.data && res.data.code === 1) {
              landscapeData = res.data.data || [];
            } else if (res.data && Array.isArray(res.data)) {
              landscapeData = res.data;
            } else {
              console.error('景点数据格式错误:', res.data);
              wx.showToast({
                title: '数据格式错误',
                icon: 'none',
                duration: 2000
              });
              reject(new Error('数据格式错误'));
              return;
            }

            that.setData({
              landscapeList: landscapeData
            });
            resolve();
          } else {
            console.error('获取景点失败，状态码:', res.statusCode);
            wx.showToast({
              title: '获取景点失败',
              icon: 'none',
              duration: 2000
            });
            reject(new Error('获取景点失败'));
          }
        },
        fail(error) {
          console.error('获取所有景点信息失败:', error);
          wx.showToast({
            title: '网络错误，请重启小程序',
            icon: 'none',
            duration: 2000
          });
          reject(error);
        }
      });
    });
  }
})