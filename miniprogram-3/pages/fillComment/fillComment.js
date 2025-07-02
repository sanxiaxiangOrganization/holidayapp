// pages/fillComment/fillComment.js
Page({
  data: {
    myLandscapeName:"",//用户在评价哪个景点
    myLandscapeId:"",
    stars: [0, 1, 2, 3, 4], // 星星的数量
    selectedStars: 0,        // 选中的星星数量
    reviewText: '',          // 用户输入的评价
    imageList: [] ,           // 用户上传的图片列表
    commentTime:"",//用户发布评论的时间
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
      if (selectedImages.length + that.data.imageList.length > 3) {
        wx.showToast({
          title: '总共最多可选择3张图片',
          icon: 'none'
        });
        // 只取前3张图片
        selectedImages.splice(3 - that.data.imageList.length);
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
    // 假设你在返回前页面时通过eventChannel传递评论数据：
    wx.navigateBack({
      delta: 1, // 返回上一页
      success: function (res) {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2]; // 获取上一页

        // 将新评论传递给上一页
        prevPage.setData({
          newComment: {
            stars: selectedStars,
            reviewText: reviewText,
            imageList: imageList,
            time: that.getCurrentTime()
          }
        });
      }
    });
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
    var that=this
    console.log("————————————————————————————————评论————————————————————————");
      console.log("评价内容：",that.data.reviewText);
      that.setData({
        commentTime:that.getCurrentTime()
      }),function(){
    //然后将用户的评论传给后端
    wx.request({
      url: 'http://localhost:8080/comment/addComment',//后端增加评论的接口
      method: 'POST',
      data: {
        landscape_id:that.data.myLandscapeId,
        tourist_id:wx.getStorageSync('tourist_id'),
        content:that.data.reviewText,
        time:that.data.commentTime,
      },
      header:{
        'content-type': 'application/json',
      },
      success(res) {
        console.log('增加评论的接口请求成功:', res.data);
       
      },
        fail(err) { 
          console.error('增加评论请求失败:', err);
        }
      })
    }
  },

  //获取当前时间
  getCurrentTime(){
     /*获取当前时间——后端参数需要*/
     const currentDate = new Date();
     // 获取年份
     const year = currentDate.getFullYear();
     // 获取月份（注意，月份是从 0 开始的，所以需要加 1），并格式化为两位数
     const month = String(currentDate.getMonth() + 1).padStart(2, '0');
     // 获取日期，并格式化为两位数
     const day = String(currentDate.getDate()).padStart(2, '0');
     // 获取小时，并格式化为两位数
     const hours = String(currentDate.getHours()).padStart(2, '0');
     // 获取分钟，并格式化为两位数
     const minutes = String(currentDate.getMinutes()).padStart(2, '0');
     // 获取秒数，并格式化为两位数
     const seconds = String(currentDate.getSeconds()).padStart(2, '0');
     // 拼接成所需的格式
     const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
     console.log("当前时间是：",formattedDate); 

     return formattedDate;
  }
});
