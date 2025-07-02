// pages/cover/cover.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAuthorized: false, // 初始时假设用户未授权
    isCreated:wx.getStorageSync('isCreated'),//用于判断用户是否已经创建过
  },
  
//用户第一次登录的处理函数
onGetUserProfile() {
  console.log("————————————————————第一次登录————————————————————");
  var that=this;
  setTimeout(function () {
    wx.hideLoading()
  }, 2000)
  wx.getUserInfo({
    success: (res) => {
      console.log("用户信息", res.userInfo);
      //将用户的昵称和头像保存下来
      var nickName=wx.setStorageSync('nickName', "测试号（仅测试用")//后面要改？？？？？？？？？？？？？？？？？
      wx.setStorageSync('userPic', res.userInfo.avatarUrl)

      //创建用户
      that.createUser(that,nickName);
    //登录成功后跳转到主页
    wx.reLaunch({
      url: '../landscape/landscape',
    })
    },
    fail: (err) => {
      console.log("用户拒绝授权", err);
    }
  });
 },
//当用户不是第一次登录小程序的时候点击按钮触发的事件
loginHandler(){
  console.log("该用户不是第一次登录");
  console.log("本地存储的用户id：",wx.getStorageSync('tourist_id'));
   let name = wx.getStorageSync('nickName');
  var app=getApp();
  //因为不是第一次，所以就不再提示用户绑定手机号了
  app.globalData.firstLogin=false;
//如果本地没有存储用户的用户名和密码，则调用接口获取
  wx.request({
    url: 'http://127.0.0.1:8080/tourist/getById',//后端获取游客信息的接口
    method: 'GET',
    data: {
      tourist_id:wx.getStorageSync('tourist_id'),
    },
    header:{
      'content-type': 'application/x-www-form-urlencoded',
    },
    success(res) {
      console.log('获取该游客信息的接口请求成功:', res.data);
    //登录成功后跳转到主页
      wx.reLaunch({
        url: '../landscape/landscape',
      })
    }
    })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var app = getApp();
    var that = this;
    // 调用微信用户登录的接口
    wx.login({
      success(res) {
        console.log(res);
        app.globalData.code = res.code;
        wx.setStorageSync('code', res.code);
         // 检查用户的授权状态
        wx.getSetting({
          success: (res) => {
            if (res.authSetting['scope.userInfo']) {
              // 用户已经授权
              that.setData({ isAuthorized: true });
            }
          }
        });
      },
      fail: function(error) {
        // 处理登录失败的情况
        console.log('登录失败:', error);
      }
    });
  },
  //管理员登录——只有一个账号，数对账号才可以到管理员页面
  managerLogin(){
    //跳转到管理员用户名+密码登录页面
    wx.reLaunch({
      url: '../manage_login/manage_login',
    })
  },

//创建用户
createUser(that,name){
   that.setData({
      isCreated:1
    })
    wx.setStorage('isCreated', 1)
    wx.request({
      url: 'http://127.0.0.1:8080/tourist/add', // 增加游客的接口地址
      method: 'POST', 
      data: {
        tourist_name:name,
        tourist_password:"",//默认密码是123456
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
     
      success:(res)=> {
        console.log('创建用户请求成功:', res.data);
        //将用户的id保存到本地，后面要用
        wx.setStorageSync('tourist_id', res.data.data)      
      },
      fail:(err) =>{ 
        console.error('创建用户请求失败:', err);
      },
    })
  },
  onShow: function () {
    wx.hideHomeButton();
  }

})