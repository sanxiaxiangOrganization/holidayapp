// pages/community/community.js
Page({
  data: {
    comments: [
      { id: 1, text: "这是第一条评论这是第一条评论这是第一条评论这是第一条评论", author: "用户A", timestamp: "2024-07-27T10:00:00Z" },
      { id: 2, text: "这是第二条评论这是第二条评论这是第二条评论这是第二条评论", author: "用户B", timestamp: "2024-07-27T11:00:00Z" }
    ],
    commentText: '',
    isUserLogged: false, // 初始未登录
    author: '' // 作者名称，登录后获取
  },
  onLoad: function() {
    this.checkLoginStatus();
  },
  handleInput: function(e) {
    if (this.data.isUserLogged) {
      this.setData({
        commentText: e.detail.value
      });
    }
    else{
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
  }
});