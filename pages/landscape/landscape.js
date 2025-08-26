// 全部的景点信息（可修改）
const landScapes=[{"images":["https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/yggyd/yggyd-01.jpg","https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/yggyd/yggyd-02.jpg","https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/yggyd/yggyd-03.jpg"],"latitude":13.000368419056192,"name":"粤赣古驿道","description":"粤赣古驿道是连接广东与江西的重要古代交通要道，承载着深厚的历史文化底蕴，见证了古代商贸往来的繁荣景象。","location":"广东省河源市连平县大湖寨","landscape_id":1,"pic_url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/yggyd/yggyd-01.jpg","longitude":114.83922784070933},{"images":["https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/dhz/dhz-01.jpg","https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/dhz/dhz-02.jpg","https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/dhz/dhz-03.jpg","https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/dhz/dhz-04.jpg"],"latitude":24.246512,"name":"大湖寨","description":"大湖寨是大湖镇的标志性古建筑群，保存完好的客家围屋建筑风格，展现了客家人的智慧和文化传统。","location":"广东省河源市连平县大湖寨","landscape_id":2,"pic_url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/dhz/dhz-01.jpg","longitude":114.8362281442},{"images":["https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/byl/byl-01.jpg","https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/byl/byl-02.jpg","https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/byl/byl-03.jpg"],"latitude":12.0,"name":"白云楼","description":"白云楼是当地著名的历史建筑，因其独特的建筑风格和优美的周边环境而闻名，是感受传统文化的绝佳场所。","location":"广东省河源市大湖镇","landscape_id":3,"pic_url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/byl/byl-01.jpg","longitude":12.0},{"images":["https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/xgwjz/xgwjz-01.JPG"],"latitude":13.0,"name":"县工委旧址","description":"县工委旧址是重要的红色革命遗址，见证了当地革命斗争的光辉历程，具有重要的历史纪念意义。","location":"广东省河源市大湖镇","landscape_id":4,"pic_url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/xgwjz/xgwjz-01.JPG","longitude":31.0},{"images":["https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/hxw/hxw-01.jpg"],"latitude":13.0,"name":"何兴屋","description":"何兴屋是典型的客家民居建筑，保持着原有的建筑特色和历史风貌，展现了客家人的居住文化和建筑智慧。","location":"广东省河源市大湖镇","landscape_id":5,"pic_url":"https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/hxw/hxw-01.jpg","longitude":41.0},{"images":[],"latitude":0.0,"name":"蝴蝶谷","description":"...","location":"五山","landscape_id":6,"pic_url":"","longitude":0.0},{"images":[],"latitude":0.0,"name":"党支部旧址","description":"...","location":"五山","landscape_id":7,"pic_url":"","longitude":0.0}]
// 引入配置
const {
  API_CONFIG,
  IMAGE_UTILS
} = require('../../utils/config');

// pages/landscape/landscape.js
Page({
  data: {
    background: [],
    indicatorDots: false,
    vertical: false,
    autoplay: true,
    interval: 2000,
    duration: 500,
    landscapeList: [],
    noticeIcon: '',
    isLoading: true,
    loadError: false,
    errorMessage: '',
    imageLoadStatus: {}
  },

  async onLoad(options) {
    console.log('========== 景点页面开始加载 ==========');

    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });

      // 先加载景点数据（最重要的）
      await this.loadLandscapes();

      // 等待轮播图和图标加载完成
      await Promise.allSettled([
        this.loadBanners(),
        this.loadIcons()
      ]);

      console.log('所有资源加载完成');

      this.setData({
        isLoading: false
      });

    } catch (error) {
      console.error('页面加载失败:', error);
      this.setData({
        isLoading: false,
        loadError: true,
        errorMessage: error.message || '加载失败'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 加载轮播图 - 根据后端方案修改
  async loadBanners() {
    try {
      console.log('开始加载轮播图...');
      const banners = await IMAGE_UTILS.getBanners();
      console.log(banners);

      // 检查 banners 是否为有效对象
      if (typeof banners === 'object' && banners !== null && Object.keys(banners).length > 0) {
        const bannerEntries = Object.entries(banners).map(([key, value]) => ({key,value}));

        // 按 sort_order 排序（数字越小越靠前）
        const sortedBanners = bannerEntries.sort((a, b) => {
          return (a.value.sort_order || 0) - (b.value.sort_order || 0);
        });

        console.log('排序后的轮播图:', sortedBanners);

        // 提取URL数组（按排序后的顺序）
        const bannerUrls = sortedBanners
          .map(item => item.value.url) // 从 value 中获取 url
          .filter(url => url); // 过滤无效URL

        if (bannerUrls.length > 0) {
          this.setData({
            background: bannerUrls
          }, () => {
            console.log('✅ 轮播图数据设置完成，background.length:', this.data.background.length);
          });
          console.log('✅ 轮播图加载成功，共', bannerUrls.length, '张');
          if (this.data.background.length > 1) this.setData({
            indicatorDots: true
          });
        } else {
          console.log('⚠️ 轮播图URL为空，使用默认图片');
          this.setDefaultBanners();
        }
      } else {
        console.log('⚠️ 轮播图数据为空，使用默认图片');
        this.setDefaultBanners();
      }
    } catch (error) {
      console.error('❌ 轮播图加载失败:', error);
      this.setDefaultBanners();
    }
  },

  // 设置默认轮播图
  setDefaultBanners() {
    const defaultBanners = [
      'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/banners/banner-01.jpg',
      'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/banners/banner-02.jpg',
      'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/banners/banner-03.jpg',
    ];

    this.setData({
      background: defaultBanners
    });
    console.log('✅ 使用默认轮播图，共', defaultBanners.length, '张');
  },

  // 加载图标
  async loadIcons() {
    const Icons = wx.getStorageSync('cached_icons')
    if(Icons.NOTICE){
      this.setData({
        noticeIcon:Icons.NOTICE
      })
    }else {
      // 可选：如果没有获取到，设置默认图标
      this.setData({
        noticeIcon: 'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/notice.png' // 使用默认路径作为 fallback
      })
    }
  },

  // 加载景点数据
  async loadLandscapes() {
    try {
      console.log('开始加载景点数据...');

      // 处理景点数据
      landScapes.forEach(landscape => {
        if (landscape.images && Array.isArray(landscape.images) && landscape.images.length > 0) {
          landscape.pic_url = landscape.images[0];
          landscape.allImages = landscape.images;
        } else {
          landscape.pic_url = 'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/attractions/default/default-01.jpg';
          landscape.allImages = [];
        }
      });

      this.setData({
        landscapeList: landScapes
      });

      console.log('✅ 景点数据加载完成');
    } catch (error) {
      console.error('❌ 景点数据加载失败:', error);
      throw error;
    }
  },

  // 图片加载事件
  onImageLoad(e) {
    const index = e.currentTarget.dataset.index;
    const landscapeName = e.currentTarget.dataset.name;
    console.log(`✅ 图片加载成功 - 景点: ${landscapeName}`);

    this.setData({
      [`imageLoadStatus[${index}]`]: 'loaded'
    });
  },

  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const landscapeName = e.currentTarget.dataset.name;
    console.error(`❌ 图片加载失败 - 景点: ${landscapeName}`);

    this.setData({
      [`imageLoadStatus[${index}]`]: 'error'
    });
  },

  // 导航到详情页
  navigateToDetail(e) {
    const dataset = e.currentTarget.dataset;
    const landscapeName = dataset.name;
    const landscapePicture = dataset.picture;
    const landscapeImages = dataset.images;
    const landscapeLatitude = dataset.latitude;
    const landscapeLongitude = dataset.longitude;
    const landscapeDescription = dataset.description;

    if (landscapeName) {
      wx.navigateTo({
        url: `/pages/landscape_detail/landscape_detail?&name=${encodeURIComponent(landscapeName)}&picture=${landscapePicture}&images=${landscapeImages}&latitude=${landscapeLatitude}&longitude=${landscapeLongitude}&description=${landscapeDescription}`
      });
    }
  },

  // 重新加载数据
  reloadData() {
    this.setData({
      isLoading: true,
      loadError: false,
      errorMessage: '',
      imageLoadStatus: {}
    });
    this.onLoad();
  },

  // 其他事件处理
  changeIndicatorDots() {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    });
  },

  changeAutoplay() {
    this.setData({
      autoplay: !this.data.autoplay
    });
  },

  intervalChange(e) {
    this.setData({
      interval: e.detail.value
    });
  },

  durationChange(e) {
    this.setData({
      duration: e.detail.value
    });
  },

  onReachBottom() {
    console.log('触底事件');
  },

  onPullDownRefresh() {
    this.reloadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  onShow() {
    const app = getApp();
    app.updateTabBarIcons();
  },

  onShareAppMessage() {
    return {
      title: '发现美丽景点',
      path: '/pages/landscape/landscape',
      imageUrl: this.data.background.length > 0 ? this.data.background[0] : ''
    };
  }

});