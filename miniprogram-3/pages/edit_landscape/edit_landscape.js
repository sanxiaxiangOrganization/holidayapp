// 引入配置
const { API_CONFIG, IMAGE_UTILS } = require('../../utils/config');

Page({
  data: {
    myLandscapeName: "",
    myLandscapeId: "",
    imageList: [],
    currentPage: 'introduction',
    land_detail: [],
    comments: [],
    landscapeLocation: '广东省河源市连平县大湖寨',
    latitude: null,
    longitude: null,
    deleteIcon: ''
  },

  async onLoad(options) {
    console.log("options:", options);
    var that = this;
    var app = getApp();

    // 加载图标
    await this.loadIcons();

    let newArr = this.data.imageList;
    if (options.picture) {
      newArr.push(options.picture);
    }

    that.setData({
      myLandscapeName: options.name,
      myLandscapeId: options.id,
      score: options.score,
      imageList: newArr,
    }, function() {
      that.getInfo();
      console.log("获取到的景点的图片的地址：", that.data.imageList);
    });
  },

  // 加载图标
  async loadIcons() {
    try {
      const icons = await IMAGE_UTILS.getIcons();
      this.setData({
        deleteIcon: icons.DELETE || icons.delete
      });
    } catch (error) {
      console.error('加载图标失败:', error);
      throw error;
    }
  },

  // 获取该景点的信息
  getInfo() {
    var that = this;
    wx.request({
      url: API_CONFIG.LANDSCAPE.GET_BY_ID,
      method: 'GET',
      data: {
        landscape_id: that.data.myLandscapeId,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success(res) {
        console.log('获取该景点信息的接口请求成功:', res);

        if (res.statusCode === 200) {
          // 处理后端统一返回格式
          if (res.data && res.data.code === 1) {
            that.setData({
              land_detail: res.data.data
            });
          } else {
            console.error('获取景点信息失败:', res.data);
            wx.showToast({
              title: res.data.msg || '获取景点信息失败',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          console.error('获取景点信息失败，状态码:', res.statusCode);
          wx.showToast({
            title: '获取景点信息失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function(error) {
        console.log('获取单个景点信息失败:', error);
        wx.showToast({
          title: '网络错误，请重启小程序',
          icon: 'none',
          duration: 2000
        });
      }
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

        if (selectedImages.length + that.data.imageList.length > 9) {
          wx.showToast({
            title: '总共最多可选择9张图片',
            icon: 'none'
          });
          selectedImages.splice(9 - that.data.imageList.length);
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

  // 提交对景点作出的修改
  submitChange() {
    var that = this;

    // 构建更新数据
    const updateData = {
      landscape_id: that.data.myLandscapeId,
      name: that.data.myLandscapeName,
      images: that.data.imageList, // 这里需要根据后端接口要求调整
      location: that.data.landscapeLocation,
      telephone: that.data.land_detail.telephone || '',
      description: that.data.land_detail.description || ''
    };

    // 调用更新景点接口
    wx.request({
      url: API_CONFIG.LANDSCAPE.UPDATE || 'http://localhost:8080/landscape/update',
      method: 'PUT',
      data: updateData,
      header: {
        'Content-Type': 'application/json'
      },
      success: function(res) {
        console.log('更新景点信息成功:', res);

        if (res.statusCode === 200) {
          // 处理后端统一返回格式
          if (res.data && res.data.code === 1) {
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              duration: 500,
              success: () => {
                setTimeout(() => {
                  wx.reLaunch({
                    url: '../manager/manager',
                  });
                }, 500);
              }
            });
          } else {
            console.error('更新景点信息失败:', res.data);
            wx.showToast({
              title: res.data.msg || '修改失败',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          console.error('更新景点信息失败，状态码:', res.statusCode);
          wx.showToast({
            title: '修改失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function(error) {
        console.error('更新景点信息失败:', error);
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});