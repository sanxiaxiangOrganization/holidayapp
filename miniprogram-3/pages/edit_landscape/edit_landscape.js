// 引入配置
const {
  API_CONFIG,
  IMAGE_UTILS
} = require('../../utils/config');

Page({
  data: {
    myLandscapeName: "",
    myLandscapeId: "",
    myLandscapeDescription: "",
    myLandscapeTelephone: "",
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
    cameraIcon: '',
    isEditingLatitude: false,
    isEditingLongitude: false,
    markers: [] // 地图标记点
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
            // 设置景点信息
            that.setData({
              land_detail: res.data.data,
              myLandscapeDescription: res.data.data.description,
              myLandscapeTelephone: res.data.data.telephone,
              landscapeLocation: res.data.data.location,
              imageList: res.data.data.images,
              oldImageList: res.data.data.images,
              latitude: res.data.data.latitude || 13, // 默认值
              longitude: res.data.data.longitude || 114, // 默认值
            }, () => {
              // 设置地图标记
              that.setMapMarker();
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

  // 设置地图标记
  setMapMarker() {
    const {
      latitude,
      longitude
    } = this.data;
    this.setData({
      markers: [{
        id: 1,
        latitude: latitude,
        longitude: longitude,
        iconPath: 'http://usr/images/icons/map.png', // 自定义标记图标
        width: 30,
        height: 30,
        title: this.data.myLandscapeName || '景点位置'
      }]
    });
  },

  // 地图点击事件
  onMapTap(e) {
    const {
      latitude,
      longitude
    } = e.detail;
    this.setData({
      latitude: latitude,
      longitude: longitude
    }, () => {
      // 更新地图标记
      this.setMapMarker();
      // 显示位置更新提示
      wx.showToast({
        title: '位置已更新',
        icon: 'success',
        duration: 1000
      });
    });
  },

  // 切换纬度编辑状态
  toggleEditLatitude() {
    // 关闭经度编辑
    if (this.data.isEditingLongitude) {
      this.setData({
        isEditingLongitude: false
      });
    }

    // 切换纬度编辑状态
    this.setData({
      isEditingLatitude: !this.data.isEditingLatitude
    });
  },

  // 切换经度编辑状态
  toggleEditLongitude() {
    // 关闭纬度编辑
    if (this.data.isEditingLatitude) {
      this.setData({
        isEditingLatitude: false
      });
    }

    // 切换经度编辑状态
    this.setData({
      isEditingLongitude: !this.data.isEditingLongitude
    });
  },

  // 处理纬度输入
  onLatitudeInput: function (e) {
    this.setData({
      latitude: e.detail.value
    });
  },

  // 处理经度输入
  onLongitudeInput: function (e) {
    this.setData({
      longitude: e.detail.value
    });
  },

  // 纬度输入框失去焦点
  onLatitudeBlur() {
    this.setData({
      isEditingLatitude: false
    });
  },

  // 经度输入框失去焦点
  onLongitudeBlur() {
    this.setData({
      isEditingLongitude: false
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

  // 处理景点名称输入
  onNameInput(e) {
    this.setData({
      myLandscapeName: e.detail.value
    });
  },

  // 处理景点简介输入
  onLocationInput(e) {
    this.setData({
      landscapeLocation: e.detail.value
    });
  },

  // 处理景点描述输入
  onDescriptionInput(e) {
    this.setData({
      myLandscapeDescription: e.detail.value
    });
  },

  // 处理景点电话输入
  onTelephoneInput(e) {
    this.setData({
      myLandscapeTelephone: e.detail.value
    });
  },

  // 提交对景点作出的修改
  submitChange() {
    const {
      myLandscapeId,
      myLandscapeName,
      myLandscapeTelephone,
      myLandscapeDescription,
      oldImageList,
      newNameList,
      landscapeLocation,
      latitude,
      longitude
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
      telephone: myLandscapeTelephone || '',
      description: myLandscapeDescription || '',
      latitude: latitude,
      longitude: longitude
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
        console.log('更新景点信息成功:', res, updateData);

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