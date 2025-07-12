// 引入配置
const { IMAGE_UTILS } = require('../../utils/config');

Page({
  data: {
    images: [], // 用于存储选中的图片路径
    feedbackText: "", // 用户反馈文本内容
    // 图标资源
    cameraIcon: '',
    deleteIcon: ''
  },

  async onLoad() {
    // 加载图标
    await this.loadIcons();
  },

  // 加载图标
  async loadIcons() {
    try {
      const icons = await IMAGE_UTILS.getIcons();
      this.setData({
        cameraIcon: icons.CAMERA,
        deleteIcon: icons.DELETE
      });
    } catch (error) {
      console.error('加载图标失败:', error);
      this.setData({
        cameraIcon: '/images/icons/camera.png',
        deleteIcon: '/images/icons/delete.png'
      });
      throw error;
    }
  },

  // 监听输入框的变化
  bindTextAreaInput(e) {
    this.setData({
      feedbackText: e.detail.value
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
        if (selectedImages.length + that.data.images.length > 3) {
          wx.showToast({
            title: '总共最多可选择3张图片',
            icon: 'none'
          });
          // 只取前3张图片
          selectedImages.splice(3 - that.data.images.length);
        }

        // 更新图片列表（将选中的图片添加到已有图片列表中）
        that.setData({
          images: that.data.images.concat(selectedImages)
        });
      },
      fail(err) {
        console.error("图片选择失败：", err);
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index; // 获取点击删除的图片索引
    const that = this;

    // 通过索引删除图片
    const updatedImages = that.data.images.filter((item, idx) => idx !== index);

    // 更新图片列表
    that.setData({
      images: updatedImages
    });
  },

  // 提交反馈
  submitFeedback() {
    if (!this.data.feedbackText || !this.data.feedbackText.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      });
      return;
    }

    // 提交数据处理
    wx.showToast({
      title: '反馈提交成功',
      icon: 'success'
    });

    // 清空反馈内容和图片
    this.setData({
      feedbackText: "",
      images: []
    });
  }
});