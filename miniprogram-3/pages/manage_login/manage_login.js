// pages/manage_login/manage_login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //设定的管理员的名与密码
    managerName:"administrator",
    psd:"Dhcf8888",
  },
  onSubmit(event) {  
    const { username, password } = event.detail.value;  
    // 检查用户名和密码的逻辑  
    console.log('用户输入的管理员名:', username);  
    console.log('用户输入的密码:', password);  
    // 将用户输入与设定的管理员的名、密码进行比较
    if (username==this.data.managerName && password==this.data.psd) {
      console.log("匹配");
      //登录到管理员页面？？？？？？


    }
    else{
      console.log("不匹配");
      //显示管理员名或密码输入错误
      wx.showToast({
        title: "管理员名或密码输入错误",
        icon: "none",
        duration: 2000
    });
    }
  }  ,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})