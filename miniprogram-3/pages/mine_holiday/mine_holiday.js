// 引入配置
const { AUTH_UTILS, USER_UTILS, IMAGE_UTILS, PHONE_UTILS, USER_INFO_UTILS } = require('../../utils/config');

// pages/mine_holiday/mine_holiday.js
Page({
  data: {
    userInfo: null,
    userPic: '',
    userName: '',
    phoneNumber: '', // 脱敏后的手机号
    rawPhoneNumber: '', // 原始手机号，用于编辑
    // 图标资源
    editIcon: '',
    assessmentIcon: '',
    orderIcon: '',
    feedbackIcon: '',
    // 统计数据
    statisticsData: {
      totalLandscapes: 0,
      totalComments: 0,
      totalScores: 0
    }
  },

  async onLoad() {
    // 检查登录状态
    if (!AUTH_UTILS.checkLoginStatus()) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/cover/cover'
        });
      }, 1500);
      return;
    }

    // 加载图标
    await this.loadIcons();

    // 加载用户信息
    this.loadUserInfo();
  },

  onShow() {
    // 页面显示时刷新用户信息
    if (AUTH_UTILS.checkLoginStatus()) {
      this.loadUserInfo();
    }
  },

  // 加载图标
  async loadIcons() {
    try {
      const icons = await IMAGE_UTILS.getIcons();
      this.setData({
        editIcon: icons.EDIT || icons.edit || icons.PENCIL || icons.pencil || '/images/edit.png',
        assessmentIcon: icons.ASSESSMENT || icons.assessment || icons.STAR || icons.star || '/images/assessment.png',
        orderIcon: icons.ORDER || icons.order || icons.LIST || icons.list || '/images/order.png',
        feedbackIcon: icons.FEEDBACK || icons.feedback || icons.MESSAGE || icons.message || '/images/feedback.png'
      });
    } catch (error) {
      console.error('加载图标失败:', error);
      // 使用默认图标
      this.setData({
        editIcon: '/images/edit.png',
        assessmentIcon: '/images/assessment.png',
        orderIcon: '/images/order.png',
        feedbackIcon: '/images/feedback.png'
      });
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const userInfo = AUTH_UTILS.getCurrentUser();
      const localUserName = wx.getStorageSync('nickName');
      const localUserPic = wx.getStorageSync('userPic');
      const localPhoneNumber = wx.getStorageSync('phoneNumber');

      this.setData({
        userInfo: userInfo,
        userName: localUserName || userInfo?.tourist_name || '未设置',
        userPic: localUserPic || userInfo?.user_pic || '',
        phoneNumber: PHONE_UTILS.formatPhoneDisplay(localPhoneNumber), // 脱敏显示
        rawPhoneNumber: localPhoneNumber || '未设置' // 原始手机号
      });

      // 如果有用户ID，获取最新的用户信息
      if (userInfo?.tourist_id) {
        const result = await USER_UTILS.getUserById(userInfo.tourist_id);
        if (result.success) {
          const freshUserInfo = result.data;
          this.setData({
            userName: freshUserInfo.tourist_name || '未设置',
            userPic: freshUserInfo.user_pic || '',
            phoneNumber: PHONE_UTILS.formatPhoneDisplay(freshUserInfo.phone_number), // 脱敏显示
            rawPhoneNumber: freshUserInfo.phone_number || '未设置' // 原始手机号
          });

          // 更新本地存储
          wx.setStorageSync('nickName', freshUserInfo.tourist_name);
          if (freshUserInfo.user_pic) {
            wx.setStorageSync('userPic', freshUserInfo.user_pic);
          }
          if (freshUserInfo.phone_number) {
            wx.setStorageSync('phoneNumber', freshUserInfo.phone_number);
          }
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  // 快速修改用户名
  quickEditName() {
    wx.showModal({
      title: '修改用户名',
      editable: true,
      placeholderText: '请输入新的用户名',
      content: this.data.userName === '未设置' ? '' : this.data.userName,
      success: async (res) => {
        if (res.confirm && res.content) {
          const newName = res.content.trim();
          if (newName && newName !== this.data.userName) {
            await this.updateUserName(newName);
          }
        }
      }
    });
  },

  // 更新用户名
  async updateUserName(newName) {
    wx.showLoading({
      title: '更新中...',
      mask: true
    });

    try {
      const result = await USER_UTILS.updateUserInfo({
        tourist_name: newName
      });

      if (result.success) {
        this.setData({
          userName: newName
        });
        wx.setStorageSync('nickName', newName);
        wx.showToast({
          title: '用户名更新成功',
          icon: 'success'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('更新用户名失败:', error);
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 编辑资料
  editHandler() {
    wx.navigateTo({
      url: '/pages/edit_information/edit_information'
    });
  },

  // 我的评价
  assessmentHandler() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 我的订单
  orderHandler() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 意见反馈
  feedbackHandler() {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  // 退出登录
  exitHandler() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          AUTH_UTILS.logout();

          // 清除全局数据
          const app = getApp();
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });

          // 跳转到登录页
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/cover/cover'
            });
          }, 1000);
        }
      }
    });
  }
});