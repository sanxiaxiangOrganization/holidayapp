// 引入配置
const {
  API_CONFIG,
  IMAGE_UTILS
} = require('../../utils/config');

Page({
  data: {
    myLandscapeName: "",
    myLandscapeId: "",
    imageList: [], //展示图片路径
    oldImageList: [], //原图片路径
    newNameList: [], //新图片文件名
    tmpImageList: [], //新图片的临时路径
    currentPage: 'introduction',
    land_detail: [],
    comments: [],
    landscapeLocation: '广东省河源市连平县大湖寨',
    latitude: null,
    longitude: null,
    deleteIcon: '',
    cameraIcon: ''
  },

  async onLoad(options) {
    console.log("options:", options);
    var that = this;
    var app = getApp();

    // 加载图标
    await this.loadIcons();

    that.setData({
      myLandscapeName: options.name,
      myLandscapeId: options.id,
      score: options.score,
    }, function () {
      that.getInfo();
    });
  },

  // 加载图标
  async loadIcons() {
    try {
      const icons = await IMAGE_UTILS.getIcons();
      this.setData({
        deleteIcon: icons.DELETE,
        cameraIcon: icons.CAMERA,
      });
    } catch (error) {
      console.error('加载图标失败:', error);
      this.setData({
        deleteIcon: 'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/delete.png',
        cameraIcon: 'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/camera.png'
      });
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
              land_detail: res.data.data,
              imageList: res.data.data.images,
              oldImageList: res.data.data.images
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
      fail: function (error) {
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
    wx.chooseMessageFile({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res);
        // 处理选择的图片：提取临时路径和原物理路径
        const selectedImages = res.tempFiles.map(file => {
          return {
            tempPath: file.path, // 临时路径（用于预览/上传）
            originalName: file.name // 原物理路径
          };
        });

        // 检查总数量是否超过9张
        if (selectedImages.length + that.data.imageList.length > 9) {
          wx.showToast({
            title: '最多选择9张图片',
            icon: 'none'
          });
          selectedImages.splice(9 - that.data.imageList.length);
        }

        // 更新 newNameList,tmpImageList,imageList
        const newTmpImageList = that.data.tmpImageList.concat(selectedImages.map(img => img.tempPath));
        const newNewNameList = that.data.newNameList.concat(selectedImages.map(img => img.originalName));
        that.setData({
          newNameList: newNewNameList,
          tmpImageList: newTmpImageList,
          imageList: [...that.data.oldImageList, ...newTmpImageList]
        });
      },
      fail(err) {
        console.error("图片选择失败：", err);
      }
    });
  },

  // 预览图片
  previewImage: function (event) {
    const index = event.currentTarget.dataset.index;
    const imageList = this.data.imageList;
    const src = imageList[index];
    wx.previewImage({
      current: src,
      urls: imageList
    });
  },

  // 删除图片
  deleteImage: function (event) {
    const index = event.currentTarget.dataset.index;
    let {
      imageList,
      oldImageList,
      newNameList,
      tmpImageList
    } = this.data;
    imageList.splice(index, 1);
    if (index < oldImageList.length) {
      oldImageList.splice(index, 1);
    } else {
      newNameList.splice(index - oldImageList.length, 1);
      tmpImageList.splice(index - oldImageList.length, 1);
    }
    this.setData({
      imageList,
      oldImageList,
      newNameList,
      tmpImageList
    });
  },

  // 提交对景点作出的修改
  submitChange() {
    const {
      myLandscapeId,
      myLandscapeName,
      oldImageList,
      newNameList,
      landscapeLocation,
      land_detail
    } = this.data;

    // 生成目标图片路径（使用原文件名）
    const oldImages = oldImageList.map(image => {
      // 1. 获取原文件名（如 "yggyd-03.jpg"）
      const fullFilename = image.split('/').pop();

      // 2. 提取 location（文件名中 '-' 前的部分，如 "yggyd"）
      const location = fullFilename.split('-')[0];

      // 3. 组合成目标路径
      return `attractions/${location}/${fullFilename}`;
    });
    const newImages = newNameList.map(imageName => {
      const location = imageName.split('-')[0];

      // 3. 组合成目标路径
      return `attractions/${location}/${imageName}`;
    });
    let images = [...oldImages, ...newImages];

    // 构建更新数据
    const updateData = {
      landscape_id: myLandscapeId,
      name: myLandscapeName,
      images: images, // 这里需要根据后端接口要求调整
      location: landscapeLocation,
      telephone: land_detail.telephone || '',
      description: land_detail.description || ''
    };

    // 调用更新景点接口
    wx.request({
      url: API_CONFIG.LANDSCAPE.UPDATE || 'http://localhost:8080/landscape/update',
      method: 'PUT',
      data: updateData,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
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
      fail: function (error) {
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