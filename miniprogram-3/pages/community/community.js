// pages/community/community.js
Page({
  data: {
    comments: [],
    commentText: '',
    isUserLogged: true, // 初始未登录
    author: wx.getStorageSync('nickName'), // 作者名称，登录后获取

    chooseLandscape:false,//当用户点击“去评论”的时候，才会显示这个模块

    /*选择要评价的景点 */
    items: []
  },
  onLoad: function() {
    this.checkLoginStatus();
    // 获取所有评论，因为要渲染出来
    this.getAllComments()
  },
  handleInput: function(e) {
    if (this.data.isUserLogged) {
      this.setData({
        commentText: e.detail.value
      });
    } else {
      this.setData({
        commentText: e.detail.value
      });
    }
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
    var app=getApp()
    wx.request({
      url: 'http://localhost:8080/comment/getAllComment', // 后端获取所有景点的所有评论的接口
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: async function (res) {
        console.log('获取所有景点的所有评论的接口请求成功:', res.data);
        const comments = res.data;
        
        // 为每条评论添加 tourist_name
        for (let item of comments) {
          // 等待 getNameById 返回的 Promise 完成
          item.tourist_name = await app.getNameById(item.tourist_id);
        }

        // 更新 data 数据
        that.setData({
          comments: comments
        });
      }
    });
  },

  
  // 当点击"去评论"时
  chooseLandscape() {
    var that=this;
    that.getAllLand().then(() => {
      that.setData({
        chooseLandscape: true
      });
    }).catch((error) => {
      console.error("获取景点数据失败:", error);
    });
    
    
  },
  //选择要评价的景点后跳到去评价的页面
  radioChange(e) {
    console.log('radio发生change事件，携带name值为：', e.detail)

    const items = this.data.items
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value === e.detail.value
    }

    this.setData({
      items
    })
    wx.navigateTo({
      url: `../fillComment/fillComment?name=${e.detail.value}&id=${e.detail.id}`,// 去填写评价的页面
    });
  },

    //获取所有景点
    getAllLand(){
      var that=this
      // 创建一个 Promise 包装异步请求
    return new Promise((resolve, reject) => {
      //获取所有景点的信息
      wx.request({
        url: 'http://localhost:8080/landscape/getAll',//后端获取所有景点的接口
        method: 'GET',
         header:{
          'content-type': 'application/x-www-form-urlencoded',
        },
        success(res) {
          console.log('获取所有景点信息的接口请求成功:', res.data.data);
          that.setData({
            items:res.data.data
          }) 
          // 请求成功，执行 resolve
          resolve();
       },
        fail(error) {
          // 处理登录失败的情况
          console.log('获取所有景点信息失败:', error);
          wx.showToast({
              title: '网络错误，请重启小程序',
              icon: 'none',
              duration: 2000
          });
          // 请求失败，执行 reject
          reject(error);
        }
      })
    });
  },
});
