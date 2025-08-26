// 全部的图标（可修改）
const icons=[{"description":"相机图标","id":11,"type":"icon","key":"camera","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/camera.png"},{"description":"帮助图标","id":12,"type":"icon","key":"help","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/help.png"},{"description":"订单图标","id":13,"type":"icon","key":"order","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/order.png"},{"description":"反馈图标","id":14,"type":"icon","key":"feedback","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/feedback.png"},{"description":"编辑图标","id":15,"type":"icon","key":"pencil","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/pencil.png"},{"description":"删除图标","id":16,"type":"icon","key":"delete","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/delete.png"},{"description":"星级普通图标","id":17,"type":"icon","key":"star-normal","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/star-normal.png"},{"description":"星级激活图标","id":18,"type":"icon","key":"star-active","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/star_active.png"},{"description":"通知图标","id":19,"type":"icon","key":"notice","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/notice.png"},{"description":"电话图标","id":20,"type":"icon","key":"call","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/call.png"},{"description":"编辑图标","id":21,"type":"icon","key":"edit","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/edit.png"},{"description":"地图图标","id":22,"type":"icon","key":"map","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/map.png"},{"description":"消息图标","id":23,"type":"icon","key":"message","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/message.png"},{"description":"评估图标","id":24,"type":"icon","key":"assessment","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/assessment.png"}];
// 全部的轮播图（可修改）
const banners=[{"description":"轮播图1","id":8,"type":"banner","sort_order":1,"key":"banner-01","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/banners/banner-01.jpg"},{"description":"轮播图2","id":9,"type":"banner","sort_order":2,"key":"banner-02","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/banners/banner-02.jpg"},{"description":"轮播图3","id":10,"type":"banner","sort_order":3,"key":"banner-03","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/banners/banner-03.jpg"}];
// 全部的标签栏图标（可修改）
const tabbarIcons=[{"description":"景点激活状态图标","id":2,"type":"tabbar","key":"landscape-active","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/tabbar/landscape-active.png"},{"description":"景点普通状态图标","id":3,"type":"tabbar","key":"landscape-normal","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/tabbar/landscape-normal.png"},{"description":"社区激活状态图标","id":4,"type":"tabbar","key":"community-active","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/tabbar/community-active.png"},{"description":"社区普通状态图标","id":5,"type":"tabbar","key":"community-normal","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/tabbar/community-normal.png"},{"description":"我的激活状态图标","id":6,"type":"tabbar","key":"mine-active","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/tabbar/mine-active.png"},{"description":"我的普通状态图标","id":7,"type":"tabbar","key":"mine-normal","url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/tabbar/mine-normal.png"}]
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
  async scoreToLandscape(score) {
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
  async _getResource(resourceType, resourceName, storageKey, defaultData = {}) {
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
      const resourceArray = resourceName;

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
      icons,
      'cached_icons'
    );
  },

  // 获取轮播图
  async getBanners() {
    return this._getResource(
      'banners',
      banners,
      'cached_banners',
      [] // 轮播图默认返回空数组
    );
  },

  // 获取标签栏图标
  async getTabbarIcons() {
    return this._getResource(
      'tabbarIcons',
      tabbarIcons,
      'cached_tabbarIcons'
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
            console.log(res.data.data);
            resolve(res.data.data);
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

module.exports = {
  API_CONFIG,
  USER_UTILS,
  IMAGE_UTILS,
  PHONE_UTILS,
};