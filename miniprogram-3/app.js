// 引入配置
const { API_CONFIG, IMAGE_UTILS, AUTH_UTILS, USER_UTILS } = require('./utils/config');

// app.js
App({
  onLaunch() {
    console.log('应用启动');
    console.log('用户数据存储路径:', wx.env.USER_DATA_PATH);

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 预加载图片资源
    this.preloadImages();

    // 检查登录状态
    this.checkLoginStatus();
  },

  // 预加载图片资源
  async preloadImages() {
    try {
      wx.showLoading({
        title: '加载资源中...',
        mask: true
      });

      // 预加载所有图片资源
      await Promise.all([
        IMAGE_UTILS.getIcons(),
        IMAGE_UTILS.getBanners(),
        IMAGE_UTILS.getTabbarIcons(),
        IMAGE_UTILS.getCovers()
      ]);

      // 更新标签栏图标
      await this.updateTabBarIcons();

      console.log('图片资源预加载完成');
      wx.hideLoading();
    } catch (error) {
      console.error('图片资源预加载失败:', error);
      wx.hideLoading();
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = AUTH_UTILS.checkLoginStatus();
    const userInfo = AUTH_UTILS.getCurrentUser();

    this.globalData.isLoggedIn = isLoggedIn;
    this.globalData.userInfo = userInfo;

    console.log('登录状态检查:', { isLoggedIn, userInfo });
  },

  // 获取景区评分
  async getScore(landscapeId) {
    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: API_CONFIG.LANDSCAPE.SCORE,
          method: 'GET',
          data: { landscape_id: landscapeId },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(res.data.data || 0);
            } else {
              reject(new Error('获取评分失败'));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
      return response;
    } catch (error) {
      console.error('获取景点评分失败:', error);
      return 0;
    }
  },

  // 更新标签栏图标
  async updateTabBarIcons() {
    try {
      const tabbarIcons = await IMAGE_UTILS.getTabbarIcons();

      // 更新标签栏图标
      wx.setTabBarItem({
        index: 0,
        iconPath: tabbarIcons.LANDSCAPE_NORMAL,
        selectedIconPath: tabbarIcons.LANDSCAPE_ACTIVE
      });

      wx.setTabBarItem({
        index: 1,
        iconPath: tabbarIcons.COMMUNITY_NORMAL,
        selectedIconPath: tabbarIcons.COMMUNITY_ACTIVE
      });

      wx.setTabBarItem({
        index: 2,
        iconPath: tabbarIcons.MINE_NORMAL,
        selectedIconPath: tabbarIcons.MINE_ACTIVE
      });

      console.log('标签栏图标更新成功');
    } catch (error) {
      console.error('标签栏图标更新失败:', error);
    }
  },

  // 获取景区评分
  getScore(id) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.LANDSCAPE.SCORE,
        method: 'GET',
        data: {
          landscape_id: id,
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        success(res) {
          console.log('获取该景点评分的接口请求成功:', res.data);
          if(res.data.data !== null)
            resolve(res.data.data);
          else resolve(0)
        },
        fail(error) {
          console.log('获取该景点评分失败:', error);
          reject(error);
        }
      });
    });
  },

  // 根据用户ID获取用户名
  async getNameById(touristId) {
    try {
      const result = await USER_UTILS.getUserById(touristId);
      return result.success ? result.data.tourist_name : '';
    } catch (error) {
      console.error('获取用户名失败:', error);
      return '';
    }
  },

  // 根据景点ID获取景点名称
  async getLandscapeNameById(landscape_id) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.API_CONFIG.LANDSCAPE.GET_BY_ID || `http://localhost:8080/landscape/getById`,
        method: 'GET',
        data: {
          landscape_id: landscape_id
        },
        header: {
          'content-type': 'application/json',
        },
        success: function(res) {
          if (res.statusCode === 200 && res.data) {
            // 处理不同的返回格式
            if (res.data.code === 1 && res.data.data) {
              resolve(res.data.data.name || '未知景点');
            } else if (res.data.name) {
              resolve(res.data.name);
            } else {
              resolve('未知景点');
            }
          } else {
            reject(new Error('获取景点名称失败'));
          }
        },
        fail: function(error) {
          console.error('获取景点名称失败:', error);
          reject(error);
        }
      });
    });
  },

  globalData: {
    isLoggedIn: false,
    userInfo: null,
    imageResources: {} // 缓存图片资源
  }
})