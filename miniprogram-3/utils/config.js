// 对象存储基础URL - 请替换为您的实际OBS域名
const OSS_BASE_URL = 'https://your-bucket.obs.cn-south-1.myhuaweicloud.com/';

// 图片URL配置
const IMAGE_CONFIG = {

  // 功能图标
  ICONS: {
    NOTICE: `${OSS_BASE_URL}icons/notice.png`,
    EDIT: `${OSS_BASE_URL}icons/edit.png`,
    CAMERA: `${OSS_BASE_URL}icons/camera.png`,
    DELETE: `${OSS_BASE_URL}icons/delete.png`,
    MAP: `${OSS_BASE_URL}icons/map.png`,
    PHONE: `${OSS_BASE_URL}icons/call.png`,
    PENCIL: `${OSS_BASE_URL}icons/pencil.png`,
    HELP: `${OSS_BASE_URL}icons/help.png`,
    MESSAGE: `${OSS_BASE_URL}icons/message.png`,
    ASSESSMENT: `${OSS_BASE_URL}icons/assessment.png`,
    ORDER: `${OSS_BASE_URL}icons/order.png`,
    FEEDBACK: `${OSS_BASE_URL}icons/feedback.png`,
    STAR_NORMAL: `${OSS_BASE_URL}icons/star-normal.png`,
    STAR_ACTIVE: `${OSS_BASE_URL}icons/star-active.png`,
  },

  // 底部导航图标
  TABBAR: {
    LANDSCAPE_NORMAL: `${OSS_BASE_URL}tabbar/landscape-normal.png`,
    LANDSCAPE_ACTIVE: `${OSS_BASE_URL}tabbar/landscape-active.png`,
    COMMUNITY_NORMAL: `${OSS_BASE_URL}tabbar/community-normal.png`,
    COMMUNITY_ACTIVE: `${OSS_BASE_URL}tabbar/community-active.png`,
    MINE_NORMAL: `${OSS_BASE_URL}tabbar/mine-normal.png`,
    MINE_ACTIVE: `${OSS_BASE_URL}tabbar/mine-active.png`,
  },

  // 轮播图/横幅
  BANNERS: [
    `${OSS_BASE_URL}banners/banner-01.jpg`,
    `${OSS_BASE_URL}banners/banner-02.jpg`,
    `${OSS_BASE_URL}banners/banner-03.jpg`,
  ],

  // 封面图片
  COVERS: {
    LOGIN_BG: `${OSS_BASE_URL}covers/login-bg.jpg`,
  },

  // 景点图片 - 每个景点就是一个图片数组
  ATTRACTIONS: {
    // 大湖寨 (dhz) - dhz/4.jpg是主图，所以放在第一位
    DHZ: [
      `${OSS_BASE_URL}attractions/dhz/dhz-04.jpg`,
      `${OSS_BASE_URL}attractions/dhz/dhz-01.jpg`,
      `${OSS_BASE_URL}attractions/dhz/dhz-02.jpg`,
      `${OSS_BASE_URL}attractions/dhz/dhz-03.jpg`,
    ],

    // 何新屋 (hxw)
    HXW: [
      `${OSS_BASE_URL}attractions/hxw/hxw-01.jpg`,
    ],

    // 粤赣古驿道 (yggyd) - yggyd/2.jpg是主图，所以放在第一位
    YGGYD: [
      `${OSS_BASE_URL}attractions/yggyd/yggyd-02.jpg`,
      `${OSS_BASE_URL}attractions/yggyd/yggyd-01.jpg`,
      `${OSS_BASE_URL}attractions/yggyd/yggyd-03.jpg`,
    ],

    // 县工委旧址 (xgwjz) - A (1).jpg是主图
    XGWJZ: [
      `${OSS_BASE_URL}attractions/xgwjz/xgwjz-01.jpg`,
    ],
  },

  // 默认图片
  DEFAULT_ATTRACTION: `${OSS_BASE_URL}attractions/default/default-01.jpg`,
};

// 工具函数
const IMAGE_UTILS = {

  // 获取景点主图 (数组第一张)
  getAttractionMainImage(attractionKey) {
    const images = IMAGE_CONFIG.ATTRACTIONS[attractionKey];
    return images && images.length > 0 ? images[0] : IMAGE_CONFIG.DEFAULT_ATTRACTION;
  },

  // 获取景点所有图片 (用于轮播)
  getAttractionAllImages(attractionKey) {
    return IMAGE_CONFIG.ATTRACTIONS[attractionKey] || [IMAGE_CONFIG.DEFAULT_ATTRACTION];
  },

  // 根据景点名称获取图片 (兼容现有代码)
  getImagesByLandscapeName(name) {
    const nameMap = {
      '大湖寨': 'DHZ',
      '何新屋': 'HXW',
      '粤赣古驿道': 'YGGYD',
      '县工委旧址': 'XGWJZ'
    };

    const key = nameMap[name];
    return key ? IMAGE_CONFIG.ATTRACTIONS[key] : [IMAGE_CONFIG.DEFAULT_ATTRACTION];
  },

  // 获取景点主图 (通过景点名称)
  getMainImageByLandscapeName(name) {
    const images = this.getImagesByLandscapeName(name);
    return images[0];
  },

  // 获取星级评分图标
  getStarIcon(isActive) {
    return isActive ? IMAGE_CONFIG.ICONS.STAR_ACTIVE : IMAGE_CONFIG.ICONS.STAR_NORMAL;
  }
};

// 导出配置
module.exports = {
  OSS_BASE_URL,
  IMAGE_CONFIG,
  IMAGE_UTILS
};