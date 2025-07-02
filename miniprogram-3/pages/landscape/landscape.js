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


    landscapeList:[]/*//不要看这个，这不是示例[
      {pic_url:'/images/A (1).jpg',name:'县工委旧址'},
      {pic_url:'/images/dhz/4.jpg',name:'大湖寨'},
      {pic_url:'/images/hxw/1.jpg',name:'何新屋'},
      {pic_url:'/images/hxw/1.jpg',name:'何新屋'},
      {pic_url:'/images/hxw/1.jpg',name:'何新屋'}
    ]*/
  },
  changeIndicatorDots() {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  navigateToDetail(e){
    var that=this
    console.log("e:",e.currentTarget);
    /*将对应景点的名字当参数传给页面*/
    const name=e.currentTarget.dataset.name
    const id=e.currentTarget.dataset.id
    const picture=e.currentTarget.dataset.picture
    wx.navigateTo({
      url: `../landscape_detail/landscape_detail?name=${name}&id=${id}&score=${that.data.landscapeList[e.currentTarget.dataset.index].score}&picture=${picture}`,
    })
    console.log("——————————————————————————————用户要查看",name,"的详细信息————————————————————————————");
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
    var that=this
    var app=getApp()
    //如果用户是第一次登录，就提示用户绑定手机号
    if (app.globalData.firstLogin) {
      wx.showModal({
        title: '绑定手机号',
        content: '现在也可以不绑定，后续前往 我的 -> 编辑资料 中绑定手机号',
        showCancel: true,
        cancelText: '暂不绑定',
        confirmText: '去绑定',
        confirmColor: '#43c74c',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/edit_information/edit_information' // 去绑定手机号的页面
            });
          }
        }
      });
    }
    //获取所有景点
   that.getAllLand().then(() => {
    // 获取到景点数据后，再获取分数
    that.getAllScore();
  }).catch((error) => {
    console.error("获取景点数据失败:", error);
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
          landscapeList:res.data.data
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

  //获取每个景点的得分
  getAllScore(){
    var that=this
    const app=getApp()
    console.log("————————————————————————获取每个景点的分数————————————————————");
    //继而获取每个景点的分数
    for (let i = 0; i < that.data.landscapeList.length; i++) {  
     // 为每个景点添加 score 属性并赋值
     console.log("第",i+1,"个景点的名字是：",that.data.landscapeList[i].name);
     app.getScore(that.data.landscapeList[i].landscape_id).then(score => {
      const landscapes = that.data.landscapeList; // 获取当前页面的数组数据
      landscapes[i].score = score; // 将评分赋值给第 i 个景点对象的 score 字段

      that.setData({
        landscapeList: landscapes, // 更新数组数据，页面会重新渲染
      });
    }).catch(error => {
      console.log('请求失败:', error);
    });
  }
  },
  
   /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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