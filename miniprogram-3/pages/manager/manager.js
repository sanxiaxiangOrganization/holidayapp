// pages/manager/manager.js
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


    landscapeList:[]
  },

  /*编辑景点信息*/
  editLand(e){
    var that=this
    console.log("e:",e.currentTarget);
    /*将对应景点的名字当参数传给页面*/
    const name=e.currentTarget.dataset.name
    const id=e.currentTarget.dataset.id
    const picture=e.currentTarget.dataset.picture
    //跳转到编辑景点的页面
    wx.navigateTo({
      url: `../edit_landscape/edit_landscape?name=${name}&id=${id}&picture=${picture}`,
    })
  },

  /*新增景点信息*/
    addLand(){
      //跳转到新增景点的页面
      wx.navigateTo({
        url: '../edit_landscape/edit_landscape',
      })
    },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that=this
    var app=getApp()
   
    //获取所有景点
   that.getAllLand()
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

  
  
})