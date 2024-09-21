// pages/landscape_detail/landscape_detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //哪个景点
    myLandscapeName:"大湖寨",
    /*景点的照片*/
    dhzList: [
      '/images/dhz/1.jpg',
      '/images/dhz/2.jpg',
      '/images/dhz/3.jpg',
      '/images/dhz/4.jpg'
    ],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that=this
   //进入该页面时传过来的参数指明了用户想要看哪个景点
    that.setData({
      myLandscapeName:options
    }, function() {
      // 在 setData 完成后执行
      console.log("此时myLandscapeName的值为", that.data.myLandscapeName);
    });
  },

  getSwiperList(){

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