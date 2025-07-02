// pages/mine_holiday/mine_holiday.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userPic:wx.getStorageSync('userPic'),
    userName:wx.getStorageSync('nickName')
  },
//编辑资料处理函数
editHandler(){
  wx.navigateTo({
    url: '../edit_information/edit_information',
  })
  this.onShow()
  },
  
    //退出登录处理函数
    exitHandler(){
      console.log("用户成功退出登录"),
      wx.reLaunch({
        url: '/pages/cover/cover'
      });
    },
  
  
    feedbackHandler(){
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
        userName:wx.getStorageSync('userName'),//wx.getStorageSync('userName'),
        phoneNumber:wx.getStorageSync('phoneNumber'),//wx.getStorage('phoneNumber'),
        userPic:wx.getStorageSync('userPic'),
      })
      console.log("——————————————————————读到的用户的数据————————————————————");
      console.log(this.data.userName,"\n",this.data.phoneNumber,"\n",this.data.userPic,"\n");
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
    
    var app=getApp();
      wx.hideHomeButton();
      this.setData({
        userName:wx.getStorageSync('nickName'),//wx.getStorageSync('userName'),
        phoneNumber:wx.getStorageSync('phoneNumber'),//wx.getStorage('phoneNumber'),
        userPic:wx.getStorageSync('userPic'),
      })
      console.log("——————————————————————读到的用户的数据————————————————————");
      console.log("用户名:"+this.data.userName,"\n","手机号:"+this.data.phoneNumber,"\n","头像:"+this.data.userPic,"\n");
    },
  })