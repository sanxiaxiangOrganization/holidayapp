// 引入配置
const {
  downloadAndCacheImage
} = require('imageCache');

// 后端API基础URL - 请根据实际部署环境修改
const API_BASE_URL = 'http://localhost:8080';

// API接口配置
const API_CONFIG = {
  // 微信登录相关API
  WECHAT: {
    GET_WX_INFO: `${API_BASE_URL}/tourist/getWxInfo`,
    GET_BY_OPENID: `${API_BASE_URL}/tourist/getByOpenId`,
    LOGIN_OR_REGISTER: `${API_BASE_URL}/tourist/loginOrRegister`,
    DECRYPT_PHONE: `${API_BASE_URL}/wechat/decrypt-phone`,
  },

  // 用户管理API
  USER: {
    ADD: `${API_BASE_URL}/tourist/add`,
    UPDATE: `${API_BASE_URL}/tourist/update`,
    GET_BY_ID: `${API_BASE_URL}/tourist/getById`,
    GET_ALL: `${API_BASE_URL}/tourist/getAll`,
    DELETE: `${API_BASE_URL}/tourist/delete`,
    SCORE: `${API_BASE_URL}/tourist/score`,
    DELETE_SCORE: `${API_BASE_URL}/tourist/deleteScoring`,
  },

  // 图片资源API
  IMAGES: {
    ICONS: `${API_BASE_URL}/api/images/icons`,
    BANNERS: `${API_BASE_URL}/api/images/banners`,
    TABBAR: `${API_BASE_URL}/api/images/type/tabbar`,
    COVERS: `${API_BASE_URL}/api/images/type/cover`,
    LANDSCAPE_URLS: `${API_BASE_URL}/api/images/landscape/urls`,
    AVATAR_URL: `${API_BASE_URL}/api/images/avatar/url`,
    AVATAR_UPLOAD: `${API_BASE_URL}/api/images/avatar/upload`,
    RESOURCE: `${API_BASE_URL}/api/images/resource`,
  },

  // 景点API
  LANDSCAPE: {
    ALL: `${API_BASE_URL}/landscape/getAll`,
    DETAIL: `${API_BASE_URL}/landscape`,
    SCORE: `${API_BASE_URL}/landscape/getScoreOfLandscape`,
    GET_BY_ID: `${API_BASE_URL}/landscape/getById`,
    ADD: `${API_BASE_URL}/landscape/add`,
    UPDATE: `${API_BASE_URL}/landscape/update`,
    DELETE: `${API_BASE_URL}/landscape/delete`,
  },

  // 评论API
  COMMENT: {
    GET_BY_LANDSCAPE: `${API_BASE_URL}/comment/getCommentOfLandscape`,
    GET_BY_TOURIST: `${API_BASE_URL}/comment/getCommentOfTourist`,
    GET_ALL: `${API_BASE_URL}/comment/getAllComment`,
    ADD: `${API_BASE_URL}/comment/addComment`,
    UPDATE: `${API_BASE_URL}/comment/updateComment`,
    DELETE: `${API_BASE_URL}/comment/deleteComment`,
  },

  // 管理员API
  MANAGER: {
    GET_BY_ID: `${API_BASE_URL}/manager/getById`,
    GET_ALL: `${API_BASE_URL}/manager/getAll`,
    ADD: `${API_BASE_URL}/manager/add`,
    UPDATE: `${API_BASE_URL}/manager/update`,
    DELETE: `${API_BASE_URL}/manager/delete`,
    LOGIN: `${API_BASE_URL}/manager/login`,
  }
};

// 用户认证工具类
const AUTH_UTILS = {
  // 微信登录
  async wechatLogin() {
    try {
      // 1. 获取微信登录code
      const loginResult = await this._wxLogin();
      console.log('微信登录code:', loginResult.code);

      // 2. 获取微信用户信息
      const wxInfo = await this._getWxInfo(loginResult.code);
      console.log('微信用户信息:', wxInfo);

      // 3. 调用统一登录接口（使用默认头像昵称）
      const loginData = {
        wx_openid: wxInfo.openid,
        wx_unionid: wxInfo.unionid,
        nickname: '微信用户', // 使用默认昵称
        avatar_url: 'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/avatars/default-avatar.png', // 使用默认头像
        login_type: 'wechat'
      };

      const loginResponse = await this._loginOrRegister(loginData);
      console.log('登录响应:', loginResponse);

      // 4. 保存用户信息
      this._saveUserInfo(loginResponse);

      return {
        success: true,
        data: loginResponse,
        message: loginResponse.is_new_user ? '注册成功' : '登录成功'
      };

    } catch (error) {
      console.error('微信登录失败:', error);
      return {
        success: false,
        message: error.message || '登录失败'
      };
    }
  },

  // 获取微信登录code
  _wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res);
          } else {
            reject(new Error('获取微信登录code失败'));
          }
        },
        fail: (error) => {
          reject(new Error('微信登录失败: ' + error.errMsg));
        }
      });
    });
  },

  // 获取微信用户信息
  _getWxInfo(code) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.WECHAT.GET_WX_INFO,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          code
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 1) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.msg || '获取微信用户信息失败'));
          }
        },
        fail: (error) => {
          reject(new Error('网络请求失败: ' + error.errMsg));
        }
      });
    });
  },

  //获取用户头像
  getAvatarUrl(e) {
    const {
      avatarUrl
    } = e.detail;
    return avatarUrl;
  },

  // 更新用户头像昵称的方法
  async updateUserProfile(nickname, avatarUrl) {
    try {
      const touristId = wx.getStorageSync('tourist_id');
      if (!touristId) {
        throw new Error('用户未登录');
      }

      const updateData = {};
      if (nickname) updateData.tourist_name = nickname;
      if (avatarUrl) updateData.user_pic = avatarUrl;

      const result = await USER_UTILS.updateUserInfo(updateData);

      if (result.success) {
        // 更新本地存储
        if (nickname) wx.setStorageSync('nickName', nickname);
        if (avatarUrl) wx.setStorageSync('userPic', downloadAndCacheImage(avatarUrl));
      }

      return result;
    } catch (error) {
      console.error('更新用户资料失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // 调用统一登录接口
  _loginOrRegister(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.WECHAT.LOGIN_OR_REGISTER,
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data,
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 1) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.msg || '登录失败'));
          }
        },
        fail: (error) => {
          reject(new Error('网络请求失败: ' + error.errMsg));
        }
      });
    });
  },

  // 保存用户信息到本地
  _saveUserInfo(userInfo) {
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('tourist_id', userInfo.tourist_id);
    wx.setStorageSync('nickName', userInfo.tourist_name);
    wx.setStorageSync('wx_openid', userInfo.wx_openid);
    wx.setStorageSync('wx_unionid', userInfo.wx_unionid);
    wx.setStorageSync('isLoggedIn', true);
    this._saveUserPic(userInfo.user_pic);
  },

  async _saveUserPic(userPicUrl) {
    try {
      if (!userPicUrl) {
        console.warn('用户头像URL为空');
        wx.setStorageSync('userPic', ''); // 显式设置为空
        return;
      }

      const cachedPath = await downloadAndCacheImage(userPicUrl, null);
      wx.setStorageSync('userPic', cachedPath);
      console.log('用户头像已缓存:', cachedPath);
    } catch (error) {
      console.error('保存用户头像失败:', error);
      // 出错时使用原始URL作为备选
      wx.setStorageSync('userPic', userPicUrl);
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    return !!(userInfo && isLoggedIn);
  },

  // 获取当前用户信息
  getCurrentUser() {
    return wx.getStorageSync('userInfo');
  },

  // 微信手机号解密
  async decryptPhoneNumber(encryptedData, iv) {
    try {
      const touristId = wx.getStorageSync('tourist_id');
      if (!touristId) {
        throw new Error('用户未登录');
      }

      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: API_CONFIG.WECHAT.DECRYPT_PHONE,
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            encryptedData: encryptedData,
            iv: iv,
            touristId: touristId
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.code === 1) {
              resolve(res.data.data);
            } else {
              reject(new Error(res.data.msg || '解密手机号失败'));
            }
          },
          fail: (error) => {
            reject(new Error('网络请求失败: ' + error.errMsg));
          }
        });
      });

      return {
        success: true,
        phoneNumber: response.phoneNumber,
        purePhoneNumber: response.purePhoneNumber,
        countryCode: response.countryCode
      };
    } catch (error) {
      console.error('解密手机号失败:', error);
      return {
        success: false,
        message: error.message || '解密手机号失败'
      };
    }
  },

  // 退出登录
  logout() {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('tourist_id');
    wx.removeStorageSync('nickName');
    wx.removeStorageSync('userPic');
    wx.removeStorageSync('wx_openid');
    wx.removeStorageSync('wx_unionid');
    wx.removeStorageSync('isLoggedIn');
    wx.removeStorageSync('phoneNumber');
    wx.removeStorageSync('cartItems');
    wx.removeStorageSync('orders');
  }
};

// 用户信息管理工具类
const USER_UTILS = {
  // 更新用户信息
  async updateUserInfo(updateData) {
    try {
      const touristId = wx.getStorageSync('tourist_id');
      if (!touristId) {
        throw new Error('用户未登录');
      }

      const requestData = {
        tourist_id: touristId,
        ...updateData
      };

      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: API_CONFIG.USER.UPDATE,
          method: 'PUT',
          header: {
            'content-type': 'application/json'
          },
          data: requestData,
          success: (res) => {
            if (res.statusCode === 200 && res.data.code === 1) {
              resolve(res.data);
            } else {
              reject(new Error(res.data.msg || '更新失败'));
            }
          },
          fail: (error) => {
            reject(new Error('网络请求失败: ' + error.errMsg));
          }
        });
      });

      // 更新本地存储
      if (updateData.tourist_name) {
        wx.setStorageSync('nickName', updateData.tourist_name);
      }
      if (updateData.user_pic) {
        wx.setStorageSync('userPic', downloadAndCacheImage(updateData.user_pic));
      }

      return {
        success: true,
        message: '更新成功'
      };
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // 获取用户详细信息
  async getUserById(touristId) {
    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: API_CONFIG.USER.GET_BY_ID,
          method: 'GET',
          data: {
            tourist_id: touristId
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.code === 1) {
              resolve(res.data.data);
            } else {
              reject(new Error(res.data.msg || '获取用户信息失败'));
            }
          },
          fail: (error) => {
            reject(new Error('网络请求失败: ' + error.errMsg));
          }
        });
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // 用户评分
  async scoreToLandscape(landscapeId, score) {
    try {
      const touristId = wx.getStorageSync('tourist_id');
      if (!touristId) {
        throw new Error('用户未登录');
      }

      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: API_CONFIG.USER.SCORE,
          method: 'POST',
          data: {
            tourist_id: touristId,
            landscape_id: landscapeId,
            score: score
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.code === 1) {
              resolve(res.data);
            } else {
              reject(new Error(res.data.msg || '评分失败'));
            }
          },
          fail: (error) => {
            reject(new Error('网络请求失败: ' + error.errMsg));
          }
        });
      });

      return {
        success: true,
        message: '评分成功'
      };
    } catch (error) {
      console.error('评分失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

// 图片资源工具函数
const IMAGE_UTILS = {
  // 缓存对象
  _cache: {},

  // 通用资源获取函数
  async _getResource(resourceType, apiUrl, storageKey, defaultData = {}) {
    try {
      // 先检查内存缓存
      if (this._cache[resourceType]) {
        console.log(`使用内存缓存的${resourceType}数据`);
        return this._cache[resourceType];
      }

      // 检查本地存储缓存
      const cachedData = wx.getStorageSync(storageKey);

      // 如果缓存存在
      if (cachedData) {
        console.log(`使用本地存储缓存的${resourceType}数据`);
        this._cache[resourceType] = cachedData;
        return cachedData;
      }

      console.log(`从服务器获取${resourceType}数据`);
      const resourceArray = await this._request(apiUrl);

      // 将数组转换为对象格式，便于使用
      const resourceMap = {};
      if (Array.isArray(resourceArray)) {
        for (const item of resourceArray) {
          if (item.key && item.url) {
            const value = await downloadAndCacheImage(item.url, resourceType);
            if (resourceType === 'banners') {
              // 对 banners 类型，存储包含路径和排序信息的对象
              resourceMap[item.key.toUpperCase()] = {
                url: value, // 图片路径
                sortOrder: item.sort_order || 0 // 排序值
              };
            } else {
              // 其他类型，直接存储路径
              resourceMap[item.key.toUpperCase()] = value;
            }
          }
        }
      }

      // 缓存数据
      this._cache[resourceType] = resourceMap;
      wx.setStorageSync(storageKey, resourceMap);

      return resourceMap;
    } catch (error) {
      console.error(`获取${resourceType}失败:`, error);
      const cachedData = wx.getStorageSync(storageKey);
      if (cachedData) {
        this._cache[resourceType] = cachedData;
        return cachedData;
      }
      return defaultData;
    }
  },

  // 获取图标资源
  async getIcons() {
    return this._getResource(
      'icons',
      API_CONFIG.IMAGES.ICONS,
      'cached_icons'
    );
  },

  // 获取轮播图
  async getBanners() {
    return this._getResource(
      'banners',
      API_CONFIG.IMAGES.BANNERS,
      'cached_banners',
      [] // 轮播图默认返回空数组
    );
  },

  // 获取标签栏图标
  async getTabbarIcons() {
    return this._getResource(
      'tabbarIcons',
      API_CONFIG.IMAGES.TABBAR,
      'cached_tabbarIcons'
    );
  },

  // 获取封面图片
  async getCovers() {
    return this._getResource(
      'covers',
      API_CONFIG.IMAGES.COVERS,
      'cached_covers'
    );
  },

  // 通用请求方法
  _request(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method,
        data,
        header: {
          'Accept': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 1) {
            resolve(res.data.data);
            console.log(res.data.data);
          } else {
            reject(new Error(res.data.msg || '请求失败'));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
};

// 手机号脱敏工具函数
const PHONE_UTILS = {
  // 手机号脱敏处理
  maskPhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return '未设置';
    }

    // 去除所有非数字字符
    const cleanPhone = phone.replace(/\D/g, '');

    // 如果不是11位手机号，直接返回原始值
    if (cleanPhone.length !== 11) {
      return phone;
    }

    // 格式化为 138****1234
    return `${cleanPhone.substring(0, 3)}****${cleanPhone.substring(7)}`;
  },

  // 验证手机号格式
  validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    return /^1[3-9]\d{9}$/.test(cleanPhone);
  },

  // 格式化手机号显示
  formatPhoneDisplay(phone) {
    if (!phone || typeof phone !== 'string') {
      return '未设置';
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // 如果是11位手机号，返回脱敏格式
    if (cleanPhone.length === 11) {
      return this.maskPhone(cleanPhone);
    }

    // 其他情况返回原始值
    return phone;
  }
};

// 用户信息工具函数
const USER_INFO_UTILS = {
  // 获取格式化的用户信息
  getFormattedUserInfo() {
    const userInfo = AUTH_UTILS.getCurrentUser();
    const localUserName = wx.getStorageSync('nickName');
    const localPhoneNumber = wx.getStorageSync('phoneNumber');

    return {
      userName: localUserName || userInfo?.tourist_name || '未设置',
      phoneNumber: PHONE_UTILS.formatPhoneDisplay(localPhoneNumber),
      rawPhoneNumber: localPhoneNumber || '未设置', // 原始手机号，用于编辑
      userPic: wx.getStorageSync('userPic') || userInfo?.user_pic || ''
    };
  },

  // 更新用户信息显示
  async refreshUserInfo(page) {
    try {
      const userInfo = AUTH_UTILS.getCurrentUser();
      if (userInfo?.tourist_id) {
        const result = await USER_UTILS.getUserById(userInfo.tourist_id);
        if (result.success) {
          const freshUserInfo = result.data;

          // 更新页面数据
          page.setData({
            userName: freshUserInfo.tourist_name || '未设置',
            phoneNumber: PHONE_UTILS.formatPhoneDisplay(freshUserInfo.phone_number),
            rawPhoneNumber: freshUserInfo.phone_number || '未设置',
            userPic: freshUserInfo.user_pic || ''
          });

          // 更新本地存储
          wx.setStorageSync('nickName', freshUserInfo.tourist_name);
          if (freshUserInfo.phone_number) {
            wx.setStorageSync('phoneNumber', freshUserInfo.phone_number);
          }
          if (freshUserInfo.user_pic) {
            wx.setStorageSync('userPic', downloadAndCacheImage(freshUserInfo.user_pic));
          }
        }
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  }
};

module.exports = {
  API_CONFIG,
  AUTH_UTILS,
  USER_UTILS,
  IMAGE_UTILS,
  PHONE_UTILS,
  USER_INFO_UTILS,
};