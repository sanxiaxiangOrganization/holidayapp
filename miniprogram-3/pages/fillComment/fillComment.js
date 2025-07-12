// 引入配置
const { API_CONFIG, IMAGE_UTILS } = require('../../utils/config');

// pages/fillComment/fillComment.js
Page({
  data: {
    myLandscapeName: "", // 用户在评价哪个景点
    myLandscapeId: "",
    stars: [0, 1, 2, 3, 4], // 星星的数量
    selectedStars: 0, // 选中的星星数量
    reviewText: '', // 用户输入的评价
    imageList: [], // 用户上传的图片列表
    commentTime: "", // 用户发布评论的时间
    // 图标资源
    cameraIcon: '',
    deleteIcon: ''
  },

  async onLoad(options) {
    console.log("fillComment页面接收到的参数:", options);
    var that = this;

    // 验证传入的参数
    if (!options.name || !options.id) {
      console.error("缺少必要参数:", options);
      wx.showToast({
        title: '参数错误，请重新进入',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      return;
    }

    // 加载图标
    await this.loadIcons();

    // 设置景点信息
    that.setData({
      myLandscapeName: options.name,
      myLandscapeId: options.id,
    });

    console.log("最终设置的景点信息:");
    console.log("景点名称:", that.data.myLandscapeName);
    console.log("景点ID:", that.data.myLandscapeId);
    console.log("用户ID:", wx.getStorageSync('tourist_id'));
  },

  // 加载图标
  async loadIcons() {
    try {
      const icons = await IMAGE_UTILS.getIcons();
      this.setData({
        cameraIcon: '/images/icons/camera.png',
        deleteIcon: '/images/icons/delete.png'
      });
      
    } catch (error) {
      console.error('加载图标失败:', error);
      this.setData({
        cameraIcon: icons.CAMERA,
        deleteIcon: icons.DELETE
      });
      throw error;
    }
  },

  // 设置星级评分
  setRating: function(event) {
    var that = this;
    const index = event.currentTarget.dataset.index;
    this.setData({
      selectedStars: index + 1
    }, function() {
      console.log("分数：", that.data.selectedStars);
    });
  },

  // 处理手写评价输入
  onInput: function(event) {
    this.setData({
      reviewText: event.detail.value
    });
  },

  // 选择图片
  chooseImage() {
    console.log("————————————————用户选择图片——————————————————————");
    const that = this;
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const selectedImages = res.tempFiles.map(file => file.tempFilePath);

        if (selectedImages.length + that.data.imageList.length > 3) {
          wx.showToast({
            title: '总共最多可选择3张图片',
            icon: 'none'
          });
          selectedImages.splice(3 - that.data.imageList.length);
        }

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
      current: src,
      urls: this.data.imageList
    });
  },

  // 删除图片
  deleteImage: function(event) {
    var that = this;
    const index = event.currentTarget.dataset.index;
    let imageList = that.data.imageList;
    imageList.splice(index, 1);
    that.setData({
      imageList: imageList
    });
  },

  // 提交评价
  submitReview: function() {
    const { selectedStars, reviewText, imageList } = this.data;
    var that = this;

    // 提交用户给出的分数（就算是0，也给提交上去）
    that.submitScore();

    // 如果用户输入了评价内容，就给他提交上去
    if (reviewText) {
      that.submitComment();
    }

    // 提交逻辑
    wx.showToast({
      title: '提交成功',
      icon: 'success'
    });
    console.log('评分:', selectedStars);
    console.log('评价内容:', reviewText);
    console.log('上传的图片:', imageList);

    // 返回上一页
    wx.navigateBack({
      delta: 1,
      success: function(res) {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];

        // 将新评论传递给上一页
        if (prevPage && prevPage.setData) {
          prevPage.setData({
            newComment: {
              stars: selectedStars,
              reviewText: reviewText,
              imageList: imageList,
              time: that.getCurrentTime()
            }
          });
        }
      }
    });
  },

  // 提交星星打分
submitScore() {
  var that = this;
  console.log("————————————————————————————————打分————————————————————————");
  console.log("分数：", that.data.selectedStars);

  // 获取请求参数
  const tourist_id = wx.getStorageSync('tourist_id');
  const landscape_id = that.data.myLandscapeId;
  const score = that.data.selectedStars;

  // 调试信息：输出所有参数
  console.log("请求参数详情:");
  console.log("tourist_id:", tourist_id, "类型:", typeof tourist_id);
  console.log("landscape_id:", landscape_id, "类型:", typeof landscape_id);
  console.log("score:", score, "类型:", typeof score);

  // 参数验证
  if (!tourist_id) {
    console.error("tourist_id为空");
    wx.showToast({
      title: '用户ID为空，请重新登录',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  if (!landscape_id) {
    console.error("landscape_id为空");
    wx.showToast({
      title: '景点ID为空',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  const requestData = {
    tourist_id: parseInt(tourist_id),
    landscape_id: parseInt(landscape_id),
    score: parseInt(score),
  };

  console.log("最终请求数据:", requestData);

  wx.request({
    url: API_CONFIG.USER.SCORE || 'http://localhost:8080/tourist/score',
    method: 'POST',
    data: requestData,
    header: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    success(res) {
      console.log('游客打分的接口请求成功:', res);
      console.log('返回数据详情:', res.data);

      if (res.statusCode === 200) {
        // 处理后端统一返回格式
        if (res.data && res.data.code === 1) {
          console.log('评分提交成功');
          wx.showToast({
            title: '评分提交成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          console.error('评分提交失败:', res.data);
          wx.showToast({
            title: res.data.msg || '评分提交失败',
            icon: 'none',
            duration: 2000
          });
        }
      } else if (res.statusCode === 400) {
        // 处理400错误，很可能是重复评分
        console.error('评分提交失败，可能是重复评分:', res.data);
        wx.showModal({
          title: '评分失败',
          content: '您已经对这个景点评分过了，每个景点只能评分一次。是否要删除之前的评分重新评分？',
          showCancel: true,
          confirmText: '删除重评',
          cancelText: '取消',
          success(modalRes) {
            if (modalRes.confirm) {
              // 用户选择删除重评
              that.deleteAndResubmitScore();
            }
          }
        });
      } else {
        console.error('评分提交失败，状态码:', res.statusCode);
        console.error('错误详情:', res.data);
        wx.showToast({
          title: `评分提交失败: ${res.data.msg || res.statusCode}`,
          icon: 'none',
          duration: 2000
        });
      }
    },
    fail(err) {
      console.error('游客打分请求失败:', err);
      wx.showToast({
        title: '网络错误',
        icon: 'none',
        duration: 2000
      });
    }
  });
},

// 提交用户评价内容
submitComment() {
  var that = this;
  console.log("————————————————————————————————评论————————————————————————");
  console.log("评价内容：", that.data.reviewText);

  // 参数验证
  if (!that.data.reviewText.trim()) {
    wx.showToast({
      title: '请输入评论内容',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  that.setData({
    commentTime: that.getCurrentTime()
  });

  // 获取请求参数
  const tourist_id = wx.getStorageSync('tourist_id');
  const landscape_id = that.data.myLandscapeId;
  const content = that.data.reviewText;
  const time = that.data.commentTime;

  // 调试信息：输出所有参数
  console.log("评论请求参数详情:");
  console.log("tourist_id:", tourist_id, "类型:", typeof tourist_id);
  console.log("landscape_id:", landscape_id, "类型:", typeof landscape_id);
  console.log("content:", content, "长度:", content.length);
  console.log("time:", time);

  const requestData = {
    landscape_id: parseInt(landscape_id),
    tourist_id: parseInt(tourist_id),
    content: content,
    time: time,
  };

  console.log("最终评论请求数据:", requestData);

  wx.request({
    url: API_CONFIG.COMMENT.ADD || 'http://localhost:8080/comment/addComment',
    method: 'POST',
    data: requestData,
    header: {
      'content-type': 'application/json',
    },
    success(res) {
      console.log('增加评论的接口请求成功:', res);
      console.log('返回数据详情:', res.data);

      if (res.statusCode === 200) {
        // 处理后端统一返回格式
        if (res.data && res.data.code === 1) {
          console.log('评论提交成功');
          wx.showToast({
            title: '评论提交成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          console.error('评论提交失败:', res.data);
          wx.showToast({
            title: res.data.msg || '评论提交失败',
            icon: 'none',
            duration: 2000
          });
        }
      } else {
        console.error('评论提交失败，状态码:', res.statusCode);
        console.error('错误详情:', res.data);
        wx.showToast({
          title: `评论提交失败: ${res.data.msg || res.statusCode}`,
          icon: 'none',
          duration: 2000
        });
      }
    },
    fail(err) {
      console.error('增加评论请求失败:', err);
      wx.showToast({
        title: '网络错误',
        icon: 'none',
        duration: 2000
      });
    }
  });
},


// 提交评价逻辑，添加异步处理
submitReview: function() {
  const { selectedStars, reviewText } = this.data;
  var that = this;

  // 验证用户是否已登录
  if (!wx.getStorageSync('tourist_id')) {
    wx.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  // 验证景点ID
  if (!that.data.myLandscapeId) {
    wx.showToast({
      title: '景点信息错误',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  console.log('开始提交评价...');
  console.log('评分:', selectedStars);
  console.log('评价内容:', reviewText);
  console.log('上传的图片:', that.data.imageList);

  // 先提交评分
  that.submitScore();

  // 如果有评论内容，延迟提交评论
  if (reviewText && reviewText.trim()) {
    setTimeout(() => {
      that.submitComment();
    }, 500);
  }

  // 延迟导航返回，等待请求完成
  setTimeout(() => {
    wx.navigateBack({
      delta: 1,
      success: function(res) {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];

        // 将新评论传递给上一页
        if (prevPage && prevPage.setData) {
          prevPage.setData({
            newComment: {
              stars: selectedStars,
              reviewText: reviewText,
              imageList: that.data.imageList,
              time: that.getCurrentTime()
            }
          });
        }
      }
    });
  }, 2000);
},
  // 删除评分并重新提交的函数
  deleteAndResubmitScore() {
    const that = this;
    const tourist_id = wx.getStorageSync('tourist_id');
    const landscape_id = that.data.myLandscapeId;

    console.log("准备删除评分并重新提交:", {
      tourist_id: tourist_id,
      landscape_id: landscape_id
    });

    // 先删除原有评分
    wx.request({
      url: API_CONFIG.USER.DELETE_SCORE || 'http://localhost:8080/tourist/deleteScoring',
      method: 'DELETE',
      data: {
        tourist_id: parseInt(tourist_id),
        landscape_id: parseInt(landscape_id)
      },
      header: {
        'content-type': 'application/json',
      },
      success(res) {
        console.log('删除评分请求响应:', res);
        if (res.statusCode === 200) {
          console.log('删除评分成功，准备重新提交');
          // 删除成功后重新提交评分
          setTimeout(() => {
            that.submitScore();
          }, 500);
        } else {
          console.error('删除评分失败:', res);
          wx.showToast({
            title: '删除评分失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail(err) {
        console.error('删除评分失败:', err);
        wx.showToast({
          title: '删除评分失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 获取当前时间
  getCurrentTime() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    console.log("当前时间：", formattedDate);
    return formattedDate;
  }
});