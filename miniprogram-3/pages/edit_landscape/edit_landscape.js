
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //哪个景点
    myLandscapeName:"",
    myLandscapeId:"",
    imageList: [] ,  // 用户上传的图片列表
    
    currentPage: 'introduction', //用于定位，默认页面为介绍
    land_detail:[],//景点的详细信息

    comments:[],//景区的所有评论

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

    let newArr = this.data.imageList; 
    newArr.push(options.picture); 

   //进入该页面时传过来的参数指明了用户想要看哪个景点
    that.setData({
      myLandscapeName:options.name,
      myLandscapeId:options.id,
      score:options.score,
      imageList:newArr,
    }, function() {
     //获取该景点的信息
     that.getInfo()
      console.log("获取到的景点的图片的地址：",that.data.imageList);
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

 
// 选择图片
chooseImage() {
  console.log("————————————————用户选择图片——————————————————————");
  const that = this;
  wx.chooseMedia({
    count: 9, // 最多可以选择9张图片（一次选择多个）
    mediaType: ['image'], // 只允许选择图片
    sourceType: ['album', 'camera'], // 从相册或相机选择
    success(res) {
      const selectedImages = res.tempFiles.map(file => file.tempFilePath);

      // 如果用户选择的图片数大于3张，提示并截取前3张图片
      if (selectedImages.length + that.data.imageList.length > 9) {
        wx.showToast({
          title: '总共最多可选择9张图片',
          icon: 'none'
        });
        // 只取前9张图片
        selectedImages.splice(9 - that.data.imageList.length);
      }

      // 更新图片列表（将选中的图片添加到已有图片列表中）
      that.setData({
        imageList: that.data.imageList.concat(selectedImages)
      });
    },
    fail(err) {
      console.error("图片选择失败：", err);
    }
  });
},


  // 预览图片
  previewImage: function(event) {
    const src = event.currentTarget.dataset.src;
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: that.data.imageList // 需要预览的图片http链接列表
    });
  },
    
  // 删除图片
  deleteImage: function (event) {
    var that=this
    const index = event.currentTarget.dataset.index; // 获取删除图片的索引
    let imageList = that.data.imageList;
    imageList.splice(index, 1); // 从数组中删除该图片
    that.setData({
      imageList: imageList // 更新图片列表
    });
  },

 //提交对景点作出的修改
 submitChange() {
  wx.showToast({
    title: '修改成功',
    icon: 'success',
    duration: 500, // 显示 0.5 秒
    success: () => {
      // 延迟 500ms（等 showToast 显示完毕）后执行跳转
      setTimeout(() => {
        wx.reLaunch({
          url: '../manager/manager',
        });
      }, 500);
    }
  });
}
,
  

});