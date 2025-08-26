// 引入配置
const {
  API_CONFIG,
  IMAGE_UTILS,
  USER_UTILS
} = require('./utils/config');

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
      ]);

      console.log('图片资源预加载完成');
      wx.hideLoading();
    } catch (error) {
      console.error('图片资源预加载失败:', error);
      wx.hideLoading();
    }
  },

  // 更新标签栏图标
  async updateTabBarIcons() {
    // 检查是否已经更新过
    if (this.globalData.tabBarIconsUpdated) {
      return;
    }
    try {
      const tabbarIcons = await IMAGE_UTILS.getTabbarIcons();
      console.log('获取到的图标数据:', tabbarIcons);

      // 检查图标数据是否有效
      if (!tabbarIcons || typeof tabbarIcons !== 'object') {
        console.error('图标数据无效:', tabbarIcons);
        return;
      }

      // 更新标签栏图标
      wx.setTabBarItem({
        index: 0,
        iconPath: tabbarIcons["LANDSCAPE-NORMAL"],
        selectedIconPath: tabbarIcons["LANDSCAPE-ACTIVE"],
        success: () => {
          console.log('第0个标签栏图标更新成功');
        },
        fail: (err) => {
          console.error('第0个标签栏图标更新失败:', err);
        }
      });

      wx.setTabBarItem({
        index: 1,
        iconPath: tabbarIcons["COMMUNITY-NORMAL"],
        selectedIconPath: tabbarIcons["COMMUNITY-ACTIVE"],
        success: () => {
          console.log('第1个标签栏图标更新成功');
        },
        fail: (err) => {
          console.error('第1个标签栏图标更新失败:', err);
        }
      });
      console.log('标签栏图标更新成功');
      // 标记为已更新
      this.globalData.tabBarIconsUpdated = true;
    } catch (error) {
      console.error('标签栏图标更新失败:', error);
    }
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

  globalData: {
    isLoggedIn: false,
    userInfo: null,
    imageResources: {} // 缓存图片资源
  }
})