// 引入配置
const { API_CONFIG } = require('../../utils/config');

// pages/community/community.js
Page({
  data: {
    comments: [],
    commentText: '',
    isUserLogged: true, // 初始未登录
    author: wx.getStorageSync('nickName'), // 作者名称，登录后获取
    chooseLandscape: false, // 当用户点击"去评论"的时候，才会显示这个模块
    items: [] // 选择要评价的景点
  },

  onLoad: function() {
    this.checkLoginStatus();
    // 获取所有评论，因为要渲染出来
    this.getAllComments()
  },

  handleInput: function(e) {
    this.setData({
      commentText: e.detail.value
    });
  },

  checkLoginAndPublish: function() {
    if (!this.data.isUserLogged) {
      this.login();
      return;
    }

    const newComment = {
      text: this.data.commentText,
      author: this.data.author,
      timestamp: new Date().toISOString() // 使用当前时间戳
    };
    this.setData({
      comments: [newComment, ...this.data.comments], // 添加新评论
      commentText: '' // 清空输入框
    });
  },

  login: function() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          isUserLogged: true,
          author: res.userInfo.nickName
        });
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  checkLoginStatus: function() {
    // 这里可以模拟检查登录状态，实际开发中应从后端获取
    this.setData({
      isUserLogged: false // 模拟未登录状态
    });
  },

  // 获取所有景点的所有评论
  async getAllComments() {
    var that = this;
    var app = getApp();

    wx.request({
      url: API_CONFIG.COMMENT.GET_ALL || 'http://localhost:8080/comment/getAllComment',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: async function (res) {
        console.log('获取所有景点的所有评论的接口请求成功:', res);

        // 处理后端统一返回格式
        if (res.statusCode === 200) {
          let comments = [];

          // 适配后端返回格式 {code: 1, msg: "success", data: ...}
          if (res.data && res.data.code === 1) {
            comments = res.data.data || [];
          } else if (res.data && Array.isArray(res.data)) {
            comments = res.data;
          } else {
            console.error('评论数据格式错误:', res.data);
            wx.showToast({
              title: '数据格式错误',
              icon: 'none',
              duration: 2000
            });
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

          // 更新 data 数据
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
      fail: function(error) {
        console.error('获取所有评论失败:', error);
        wx.showToast({
          title: '网络错误，请重启小程序',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 当点击"去评论"时
  chooseLandscape() {
    var that = this;
    that.getAllLand().then(() => {
      that.setData({
        chooseLandscape: true
      });
    }).catch((error) => {
      console.error("获取景点数据失败:", error);
    });
  },

  // 选择要评价的景点后跳到去评价的页面
  radioChange(e) {
    console.log('radio发生change事件，携带值为：', e.detail);

    const items = this.data.items;
    const selectedValue = e.detail.value; // 这是景点名称

    // 调试：输出items数组结构
    console.log('items数组:', items);

    // 通过景点名称查找对应的景点信息
    const selectedItem = items.find(item => item.name === selectedValue);

    console.log('找到的景点信息:', selectedItem);

    if (selectedItem && selectedItem.landscape_id) {
      // 更新选中状态
      for (let i = 0, len = items.length; i < len; ++i) {
        items[i].checked = items[i].name === selectedValue;
      }

      this.setData({
        items
      });

      // 跳转到评论页面
      wx.navigateTo({
        url: `../fillComment/fillComment?name=${selectedItem.name}&id=${selectedItem.landscape_id}`,
      });
    } else {
      console.error('未找到选中的景点信息:', selectedValue);
      console.error('可用的景点:', items.map(item => ({ name: item.name, id: item.landscape_id })));
      wx.showToast({
        title: '选择的景点信息有误',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 添加关闭选择景点弹窗的方法
  closeLandscapeSelection() {
    this.setData({
      chooseLandscape: false
    });
  },

  // 获取所有景点
  getAllLand() {
    var that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.LANDSCAPE.ALL || 'http://localhost:8080/landscape/getAll',
        method: 'GET',
        header: {
          'content-type': 'application/json',
        },
        success(res) {
          console.log('获取所有景点信息的接口请求成功:', res);

          if (res.statusCode === 200) {
            let landscapeData = [];

            // 适配后端返回格式
            if (res.data && res.data.code === 1) {
              landscapeData = res.data.data || [];
            } else if (res.data && Array.isArray(res.data)) {
              landscapeData = res.data;
            } else {
              console.error('景点数据格式错误:', res.data);
              reject(new Error('数据格式错误'));
              return;
            }

            // 调试：输出景点数据结构
            console.log('处理后的景点数据:', landscapeData);

            // 确保每个景点都有必要的属性
            const processedData = landscapeData.map(item => ({
              ...item,
              value: item.name, // 为了兼容，添加value属性
              checked: false
            }));

            that.setData({
              items: processedData
            });

            console.log('设置到items的数据:', processedData);
            resolve();
          } else {
            console.error('获取景点失败，状态码:', res.statusCode);
            reject(new Error('获取景点失败'));
          }
        },
        fail(error) {
          console.error('获取所有景点信息失败:', error);
          wx.showToast({
            title: '网络错误，请重试',
            icon: 'none',
            duration: 2000
          });
          reject(error);
        }
      });
    });
  },
});