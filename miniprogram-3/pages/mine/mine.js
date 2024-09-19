// pages/mine/mine.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    visibleToFriends:wx.getStorageSync('visibleToFriends'),//可否通过通讯录找到我
    nickName:wx.getStorageSync('nickName'),
    signature:wx.getStorage('signature'),//用户的个性签名
    userPic:wx.getStorageSync('userPic'),//用户头像
    familyId:wx.getStorageSync('id'),//据此判断用户有没有家

    switchStatus:true,//初始化switch开关
  },
//编辑资料处理函数
editHandler(){
wx.navigateTo({
  url: '../information/information',
})
this.onShow()
},

  //退出登录处理函数
  exitHandler(){
    console.log("用户成功退出登录"),
    wx.reLaunch({
      url: '/pages/login/login'
    });
  },

  //箭头处理函数
  arrowHandler1(){
    wx.navigateTo({
      url: '../fridge/fridge',//这里放消息通知付费的页面!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    })
  },
  /*我的家庭*/
  arrowHandler2(){
    //如果还没创建家庭
    if(wx.getStorageSync('id')===null||wx.getStorageSync('id')===0){
    wx.navigateTo({
      url: '../family/family',
    })
  }
    //如果已经创建了家庭
   else{
      wx.navigateTo({
      url: '../family2/family2',
    })
  }
  },

  //禁止别人通过通讯录找到我——同时确保初始渲染无误
  arrowHandler5(e){
    console.log("e.detail.value: "+e.detail.value);
    //e.detail.value为true时，visibleToFriends为false——二者相反
    var that=this;
    that.setData({
        visibleToFriends:!e.detail.value
    })
    wx.request({
      url: 'http://localhost:8080/user/setVisibliToFriends', // 设置可见性的接口地址
      method: 'POST',
      data: {
        // 这里放GET请求需要的参数
        openid: wx.getStorageSync('openid'),
        visibleToFriends:!e.detail.value,
      },
      header: {
        'Authorization':wx.getStorageSync('token'),
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        console.log('设置可见性请求成功:', res.data);
        wx.setStorageSync('visibleToFriends', !e.detail.value)
      },
      fail(err) {
        console.error('设置可见性请求失败:', err);
      }
    });
  },
  arrowHandler6(){
    wx.navigateTo({
      url: '../help/help',//这里放帮助反馈的页面
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var app=getApp();
    app.getUserByOpenid(wx.getStorageSync('openid'));
    this.setData({
      signature:wx.getStorageSync('signature'),//用户的个性签名
      nickName:wx.getStorageSync('nickName'),//用户的昵称
      userPic:wx.getStorageSync('userPic'),//用户头像
      familyId:wx.getStorageSync('id'),

    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  var app=getApp();
  app.getUserByOpenid(wx.getStorageSync('openid'));
    wx.hideHomeButton();
    this.setData({
      signature:wx.getStorageSync('signature'),//用户的个性签名
      nickName:wx.getStorageSync('nickName'),//用户的昵称
      userPic:wx.getStorageSync('userPic'),//用户头像
      familyId:wx.getStorageSync('id'),

    })
  },
})