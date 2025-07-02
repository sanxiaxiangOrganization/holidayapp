// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  //获取景区评分
  getScore(id) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:8080/landscape/getScoreOfLandscape',
        method: 'GET',
        data: {
          landscape_id: id,
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        success(res) {
          console.log('获取该景点评分的接口请求成功:', res.data);
          if(res.data.data!==null)
          resolve(res.data.data); // 返回评分数据
          else resolve(0)
        },
        fail(error) {
          console.log('获取该景点评分失败:', error);
          wx.showToast({
            title: '网络错误，请重启小程序',
            icon: 'none',
            duration: 2000,
          });
          reject(error); // 抛出错误
        }
      });
    });
  },
// 根据 tourist_id 获取用户名
getNameById(tourist_id) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://127.0.0.1:8080/tourist/getById', // 后端获取游客信息的接口
      method: 'GET',
      data: {
        tourist_id: tourist_id,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success(res) {
        if(res.data.data!==null)
        resolve(res.data.data.tourist_name);  // 返回名字
        else resolve("")
      },
      fail(err) {
        reject(err);
      }
    });
  });
},
  

  globalData: {
    firstLogin:true//判断用户是不是第一次登录，如果是第一次登录，则提示用户绑定手机号
  }
})
