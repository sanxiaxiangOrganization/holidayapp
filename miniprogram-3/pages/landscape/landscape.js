// pages/landscape/landscape.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    background: ['/images/A (1).jpg', '/images/A (2).jpg', '/images/A (3).jpg'],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 2000,
    duration: 500,


    landscapeList:[
      {picture:'/images/A (1).jpg',name:'县工委旧址'},
      {picture:'/images/dhz/4.jpg',name:'大湖寨'},
      {picture:'/images/hxw/1.jpg',name:'何新屋'},
      {picture:'/images/hxw/1.jpg',name:'何新屋'},
      {picture:'/images/hxw/1.jpg',name:'何新屋'}
    ],
  },
  changeIndicatorDots() {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  navigateToDetail(){
    wx.navigateTo({
      url: '../landscape_detail/landscape_detail',
    })
    console.log("导航点击");
  },
  changeAutoplay() {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },

  intervalChange(e) {
    this.setData({
      interval: e.detail.value
    })
  },

  durationChange(e) {
    this.setData({
      duration: e.detail.value
    })
  },
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