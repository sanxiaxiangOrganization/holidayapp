// pages/landscape_detail/landscape_detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //哪个景点
    myLandscapeName:"",
    myLandscapeId:"",
    score:4.5,//景点的评分
    picture:"",//景点的照片
    /*景点的照片*/
    dhzList: [
      '/images/dhz/1.jpg',
      '/images/dhz/2.jpg',
      '/images/dhz/3.jpg',
      '/images/dhz/4.jpg'
    ],
    currentPage: 'introduction', //用于定位，默认页面为介绍
    land_detail:[],//景点的详细信息


    landscapeLocation: '广东省河源市连平县大湖寨',  // 景区地址
    latitude: null,  // 纬度
    longitude: null,  // 经度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("options:",options);
    var that=this
    var app=getApp()
   //进入该页面时传过来的参数指明了用户想要看哪个景点
    that.setData({
      myLandscapeName:options.name,
      myLandscapeId:options.id,
      score:options.score,
      picture:options.picture,
    }, function() {
     //获取该景点的信息
     that.getInfo()
      console.log("获取到的景点的图片的地址：",options.picture);
    });

  },

  //跳转到去评论的页面
  navigateToComment(){
    wx.navigateTo({
      url: `../fillComment/fillComment?name=${this.data.myLandscapeName}&id=${this.data.myLandscapeId}`,// 去填写评价的页面
    });
  },

   //获取该景点的信息们
   getInfo(){
    var that=this
    wx.request({
      url: 'http://localhost:8080/landscape/getById',//后端获取单个景点的接口
      method: 'GET',
      data: {
        landscape_id:that.data.myLandscapeId,
      },
      header:{
        'content-type': 'application/x-www-form-urlencoded',
      },
      success(res) {
        console.log('获取该景点信息的接口请求成功:', res.data.data);
        that.setData({
          land_detail:res.data.data
        })
        //这里是想获得该景点的图片们？？？？？？？？？？？
    },
      fail: function(error) {
        // 处理登录失败的情况
        console.log('获取单个景点信息失败:', error);
        wx.showToast({
            title: '网络错误，请重启小程序',
            icon: 'none',
            duration: 2000
        });
      }
    })
  },
  
  getSwiperList(){

  },
  
   // 切换到介绍部分
   goToIntro() {
    this.setData({
      currentPage: 'introduction',
    });
  },

  // 切换到评价页面
  goToComments() {
    this.setData({
      currentPage: 'comments',
    });
  },

  // 获取景区的经纬度
  getLocationByName: function() {
    var that = this;
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/', // 腾讯位置服务API的URL
      data: {
        address: "广东省河源市连平县大湖镇"+that.data.myLandscapeName, // 景区全名
        key: '', // 这里要替换为腾讯地图API密钥？？？？？？？？？？？？？？？？？？？？？？？？
      },
      success: function(res) {
        if (res.data.status === 0) {
          // 获取经纬度
          var location = res.data.result.location;
          that.setData({
            latitude: location.lat,
            longitude: location.lng,
          });
          that.navigateToLocation(); // 获取到经纬度后导航
        } else {
          wx.showToast({
            title: '无法获取位置',
            icon: 'none',
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '网络错误',
          icon: 'none',
        });
      },
    });
  },

  // 导航到景区
  navigateToLocation: function() {
    var that = this;
    console.log("——————————————————————导航到景区————————————————————————");
    if (that.data.latitude && that.data.longitude) {
      wx.openLocation({
        latitude: that.data.latitude,   // 纬度
        longitude: that.data.longitude, // 经度
        scale: 18,                      // 地图缩放比例
        name: that.data.myLandscapeName, // 景区名称
        address: that.data.landscapeLocation // 景区地址
      });
    } else {
      wx.showToast({
        title: '位置未获取到',
        icon: 'none',
      });
    }
  },

  // 拨打电话
  makePhoneCall: function() {
    var that=this
    wx.makePhoneCall({
      phoneNumber: that.data.land_detail.telephone,  // 使用页面中定义的电话号码
      success: function() {
        console.log("电话拨打成功");
      },
      fail: function() {
        console.log("电话拨打失败");
      }
    });
  }
});