// 引入配置
const { API_CONFIG, AUTH_UTILS, IMAGE_UTILS } = require('../../utils/config');

// pages/cover/cover.js
Page({
  data: {
    backgroundImages: [],
    isLoading: false
  },

  async onLoad() {
    console.log('封面页面加载开始');

    // 检查登录状态
    if (AUTH_UTILS.checkLoginStatus()) {
      console.log('用户已登录，跳转到主页');
      wx.switchTab({
        url: '/pages/landscape/landscape'
      });
      return;
    }

    // 加载封面图片
    await this.loadCovers();
  },

  // 加载封面图片
  async loadCovers() {
    try {
      console.log('开始加载封面图片...');
      const covers = await IMAGE_UTILS.getCovers();
  
      // 检查是否有封面图片数据（对象非空）
      if (covers && Object.keys(covers).length > 0) {
        // 将对象值转换为数组（假设值都是URL）
        const imageUrls = Object.values(covers);
  
        this.setData({
          backgroundImages: imageUrls
        });
        console.log('封面图片加载成功');
      } else {
        console.log('没有获取到封面图片数据，使用默认背景');
        this.setData({
          backgroundImages: ['https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/covers/login-bg.jpg']
        });
      }
    } catch (error) {
      console.error('加载封面图片失败:', error);
      // 使用默认封面图片
      this.setData({
        backgroundImages: ['https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/covers/login-bg.jpg']
      });
    }
  },

  // 微信登录处理函数
  async onWechatLogin() {
    if (this.data.isLoading) {
      return;
    }

    this.setData({ isLoading: true });

    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    try {
      const loginResult = await AUTH_UTILS.wechatLogin();

      if (loginResult.success) {
        wx.showToast({
          title: loginResult.message,
          icon: 'success',
          duration: 2000
        });

        // 更新全局数据
        const app = getApp();
        app.globalData.isLoggedIn = true;
        app.globalData.userInfo = loginResult.data;

        // 延迟跳转到主页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/landscape/landscape'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: loginResult.message,
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ isLoading: false });
      wx.hideLoading();
    }
  },

  // 管理员登录
  managerLogin() {
    wx.navigateTo({
      url: '/pages/manage_login/manage_login'
    });
  }
});