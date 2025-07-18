// 引入配置
const { API_CONFIG, USER_UTILS, IMAGE_UTILS, PHONE_UTILS , AUTH_UTILS } = require('../../utils/config');

// pages/edit_information/edit_information.js
Page({
  data: {
    userName: '',
    phoneNumber: '', // 脱敏显示的手机号
    rawPhoneNumber: '', // 原始手机号，用于编辑
    userPic: '',
    // 编辑状态
    editingName: false,
    editingPhone: false,
    tempUserName: '',
    tempPhoneNumber: '',
    // 图标资源
    pencilIcon: '',
    // 上传状态
    uploading: false
  },

  async onLoad() {
    // 检查登录状态
    const touristId = wx.getStorageSync('tourist_id');
    if (!touristId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 加载图标
    await this.loadIcons();

    // 加载用户信息
    this.loadUserInfo();
  },

  // 加载图标
  async loadIcons() {
    try {
      const icons = await IMAGE_UTILS.getIcons();
      this.setData({
        pencilIcon: icons.PENCIL || icons.EDIT
      });
    } catch (error) {
      console.error('加载图标失败:', error);
      this.setData({
        pencilIcon: 'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/pencil.png'
      });
      throw error;
    }
  },

  // 加载用户信息
  loadUserInfo() {
    const rawPhoneNumber = wx.getStorageSync('phoneNumber') || '';
    this.setData({
      userName: wx.getStorageSync('nickName') || '',
      phoneNumber: PHONE_UTILS.formatPhoneDisplay(rawPhoneNumber), // 脱敏显示
      rawPhoneNumber: rawPhoneNumber, // 原始手机号
      userPic: wx.getStorageSync('userPic') || '',
      tempUserName: wx.getStorageSync('nickName') || '',
      tempPhoneNumber: rawPhoneNumber // 编辑时使用原始手机号
    });
  },

  // 修改头像
  async headHandler() {
    const touristId = wx.getStorageSync('tourist_id');
    if (!touristId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    if (this.data.uploading) {
      wx.showToast({
        title: '正在上传中...',
        icon: 'none'
      });
      return;
    }

    try {
      const res = await new Promise((resolve, reject) => {
        wx.showActionSheet({
          itemList: ['从相册选择', '拍照'],
          success: resolve,
          fail: reject
        });
      });

      const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
      const imageResult = await this.chooseImage(sourceType);

      if (imageResult.tempFilePaths && imageResult.tempFilePaths.length > 0) {
        await this.uploadAvatar(imageResult.tempFilePaths[0], touristId);
      }
    } catch (error) {
      if (error.errMsg !== 'showActionSheet:fail cancel') {
        console.error('选择图片失败:', error);
      }
    }
  },

  // 选择图片
  chooseImage(sourceType) {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: sourceType,
        success: resolve,
        fail: reject
      });
    });
  },

  // 上传头像
  async uploadAvatar(filePath, touristId) {
    this.setData({ uploading: true });

    wx.showLoading({
      title: '正在上传头像...',
      mask: true
    });

    try {
      const uploadResult = await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: API_CONFIG.IMAGES.AVATAR_UPLOAD,
          filePath: filePath,
          name: 'file',
          formData: {
            'touristId': touristId.toString()
          },
          success: resolve,
          fail: reject
        });
      });

      const result = JSON.parse(uploadResult.data);

      if (result.code === 1) {
        const avatarUrl = result.data;

        // 更新用户头像
        const updateResult = await USER_UTILS.updateUserInfo({
          user_pic: avatarUrl
        });

        if (updateResult.success) {
          this.setData({
            userPic: avatarUrl
          });
          wx.showToast({
            title: '头像更新成功',
            icon: 'success'
          });
        } else {
          throw new Error(updateResult.message);
        }
      } else {
        throw new Error(result.msg || '上传失败');
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      });
    } finally {
      this.setData({ uploading: false });
      wx.hideLoading();
    }
  },

  // 预览头像
  previewAvatar() {
    if (this.data.userPic) {
      wx.previewImage({
        current: this.data.userPic,
        urls: [this.data.userPic]
      });
    }
  },

  // 开始编辑用户名
  startEditName() {
    this.setData({
      editingName: true,
      tempUserName: this.data.userName
    });
  },

  // 开始编辑手机号
  startEditPhone() {
    this.setData({
      editingPhone: true,
      tempPhoneNumber: this.data.rawPhoneNumber === '未设置' ? '' : this.data.rawPhoneNumber
    });
  },

  // 取消编辑
  cancelEdit() {
    this.setData({
      editingName: false,
      editingPhone: false,
      tempUserName: this.data.userName,
      tempPhoneNumber: this.data.phoneNumber
    });
  },

  // 输入处理
  onNameInput(e) {
    this.setData({
      tempUserName: e.detail.value
    });
  },

  onPhoneInput(e) {
    this.setData({
      tempPhoneNumber: e.detail.value
    });
  },

  // 确认修改
  async confirmEdit() {
    const { tempUserName, tempPhoneNumber, editingName, editingPhone } = this.data;

    // 验证输入
    if (editingName && !tempUserName.trim()) {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none'
      });
      return;
    }

    if (editingPhone && tempPhoneNumber && !PHONE_UTILS.validatePhone(tempPhoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号格式',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    try {
      const updateData = {};

      if (editingName && tempUserName.trim() !== this.data.userName) {
        updateData.tourist_name = tempUserName.trim();
      }

      if (editingPhone && tempPhoneNumber !== this.data.rawPhoneNumber) {
        updateData.phone_number = tempPhoneNumber;
      }

      if (Object.keys(updateData).length > 0) {
        const result = await USER_UTILS.updateUserInfo(updateData);

        if (result.success) {
          // 更新本地数据
          const newData = {
            editingName: false,
            editingPhone: false
          };

          if (updateData.tourist_name) {
            newData.userName = updateData.tourist_name;
            wx.setStorageSync('nickName', updateData.tourist_name);
          }

          if (updateData.phone_number) {
            newData.rawPhoneNumber = updateData.phone_number;
            newData.phoneNumber = PHONE_UTILS.formatPhoneDisplay(updateData.phone_number);
            wx.setStorageSync('phoneNumber', updateData.phone_number);
          }

          this.setData(newData);

          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        } else {
          throw new Error(result.message);
        }
      } else {
        // 没有修改，直接退出编辑状态
        this.setData({
          editingName: false,
          editingPhone: false
        });
      }
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 获取手机号授权
  // 获取手机号授权
async getPhoneNumber(e) {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    wx.showLoading({
      title: '获取中...',
      mask: true
    });

    try {
      // 获取微信返回的加密数据
      const { encryptedData, iv } = e.detail;

      // 调用后端解密接口
      const decryptResult = await AUTH_UTILS.decryptPhoneNumber(encryptedData, iv);

      if (decryptResult.success) {
        const phoneNumber = decryptResult.purePhoneNumber || decryptResult.phoneNumber;

        // 更新页面数据
        this.setData({
          rawPhoneNumber: phoneNumber,
          phoneNumber: PHONE_UTILS.formatPhoneDisplay(phoneNumber),
          tempPhoneNumber: phoneNumber
        });

        // 保存到本地存储
        wx.setStorageSync('phoneNumber', phoneNumber);

        // 同步到服务器
        const result = await USER_UTILS.updateUserInfo({
          phone_number: phoneNumber
        });

        if (result.success) {
          wx.showToast({
            title: '获取手机号成功',
            icon: 'success'
          });
        } else {
          console.error('同步手机号到服务器失败:', result.message);
          wx.showToast({
            title: '保存手机号失败',
            icon: 'none'
          });
        }
      } else {
        throw new Error(decryptResult.message || '解密手机号失败');
      }
    } catch (error) {
      console.error('获取手机号失败:', error);
      wx.showToast({
        title: `获取手机号失败: ${error.message || '请重试'}`,
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  } else {
    console.log('用户拒绝授权手机号');
    wx.showToast({
      title: '需要授权才能获取手机号',
      icon: 'none'
    });
  }
}
});