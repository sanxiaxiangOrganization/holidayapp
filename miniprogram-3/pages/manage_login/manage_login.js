// 引入配置
const { API_CONFIG } = require('../../utils/config');

// pages/manage_login/manage_login.js
Page({
  data: {
    username: '',
    password: ''
  },

  // 处理用户名输入
  onUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 处理密码输入
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 提交登录表单
  onSubmit: function() {
    const { username, password } = this.data;

    // 验证输入
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    console.log('用户输入的管理员名:', username);
    console.log('用户输入的密码:', password);

    // 显示登录中状态
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    // 调用后端验证接口
    this.validateManager(username, password);
  },

  // 验证管理员登录
  validateManager: function(username, password) {
    var that = this;

    wx.request({
      url: API_CONFIG.MANAGER.LOGIN || 'http://localhost:8080/manager/login',
      method: 'POST',
      data: {
        manager_name: username,
        manager_password: password
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: function(res) {
        console.log('管理员登录响应:', res);
        wx.hideLoading();

        if (res.statusCode === 200) {
          // 处理后端统一返回格式
          if (res.data && res.data.code === 1) {
            // 登录成功，保存管理员信息
            wx.setStorageSync('manager_id', res.data.data.manager_id);
            wx.setStorageSync('manager_name', res.data.data.manager_name);

            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500,
              success: () => {
                setTimeout(() => {
                  that.managerLogin();
                }, 1500);
              }
            });
          } else {
            // 登录失败
            wx.showToast({
              title: res.data.msg || '用户名或密码错误',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          console.error('管理员登录失败，状态码:', res.statusCode);
          wx.showToast({
            title: '登录失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function(error) {
        console.error('管理员登录请求失败:', error);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 管理员登录成功，跳转到管理员页面
  managerLogin: function() {
    wx.reLaunch({
      url: '../manager/manager',
    })
  },

  onLoad: function(options) {
    // 页面加载时的初始化逻辑
  },

  onReady: function() {
    // 页面初次渲染完成
  },

  onShow: function() {
    // 页面显示
  },

  onHide: function() {
    // 页面隐藏
  },

  onUnload: function() {
    // 页面卸载
  },

  onPullDownRefresh: function() {
    // 下拉刷新
  },

  onReachBottom: function() {
    // 上拉触底
  },

  onShareAppMessage: function() {
    // 分享
  }
})