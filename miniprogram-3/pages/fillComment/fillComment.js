// pages/fillComment/fillComment.js
Page({
  data: {
    myLandscapeName:"",//用户在评价哪个景点
    myLandscapeId:"",
    stars: [0, 1, 2, 3, 4], // 星星的数量
    selectedStars: 0,        // 选中的星星数量
    reviewText: '',          // 用户输入的评价
    imageList: []            // 用户上传的图片列表
  },

  onLoad(options) {
    console.log("options:",options);
    var that=this
   //进入该页面时传过来的参数指明了用户想要评价哪个景点
    that.setData({
      myLandscapeName:options.name,
      myLandscapeId:options.id,
    })
  },
  // 设置星级评分
  setRating: function(event) {
    var that=this
    const index = event.currentTarget.dataset.index;
    this.setData({
      selectedStars: index+1 // 我本来的想法是：最低分是4，点亮一颗星就+0.2分。但是后端score要求整型
    },function(){
      console.log("分数：",that.data.selectedStars);
    }
    )
  },

  // 处理手写评价输入
  onInput: function(event) {
    this.setData({
      reviewText: event.detail.value // 获取输入的评价内容
    });
  },
// 选择图片
chooseImage: function () {
  var that=this
  const maxImages = 5; // 总共最多上传5张图片
  const currentImageCount = that.data.imageList.length; // 获取当前已上传的图片数量

  // 如果已上传的图片数量已经达到5张，则提示用户
  if (currentImageCount >= maxImages) {
    wx.showToast({
      title: '最多只能上传5张图片',
      icon: 'none',
    });
    return; // 不再继续执行上传操作
  }

  // 选择图片时，最多选择5减去已上传的数量的图片
  wx.chooseImage({
    count: maxImages - currentImageCount, // 限制最多上传的数量
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 将选择的图片添加到已上传图片列表
      that.setData({
        imageList: that.data.imageList.concat(res.tempFilePaths) // 添加图片路径
      });
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

  // 提交评价
  submitReview: function() {
    const { selectedStars, reviewText, imageList } = this.data;
    var that=this
   //提交用户给出的分数（就算是0，也给提交上去）
   that.submitScore();
    //如果用户输入了评价内容，就给他提交上去
    if (reviewText) {
      that.submitComment();
    }
    //如果用户提交了图片，还需要把图片存到数据库里？？？？？？？？？？

    // 提交逻辑
    wx.showToast({
      title: '提交成功',
      icon: 'success'
    });
    console.log('评分:', selectedStars);
    console.log('评价内容:', reviewText);
    console.log('上传的图片:', imageList);
  },

  //提交星星打分
  submitScore(){
    var that=this
    console.log("————————————————————————————————打分————————————————————————");
      console.log("分数：",that.data.selectedStars);
    //然后将用户的评分传给后端
    wx.request({
      url: 'http://localhost:8080/tourist/score',//后端游客打分的接口
      method: 'POST',
      data: {
        tourist_id:wx.getStorageSync('tourist_id'),
        landscape_id:that.data.myLandscapeId,
        score:that.data.selectedStars,
      },
      header:{
        'content-type': 'application/x-www-form-urlencoded',
      },
      success(res) {
        console.log('游客打分的接口请求成功:', res.data);
       
      },
        fail(err) { 
          console.error('游客打分请求失败:', err);
        }
      })
  },
  //提交用户评价内容
  submitComment(){

  },
});
