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

      // 加载评分
      await this.getAllScore();

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

      // 检查 banners 是否为有效对象
      if (typeof banners === 'object' && banners !== null && Object.keys(banners).length > 0) {
        // 将键值对转换为数组 [{ key: 'BANNER-01', value: { url: '...', sort_order: 1 } }, ...]
        const bannerEntries = Object.entries(banners).map(([key, value]) => ({
          key,
          value
        }));

        // 按 sort_order 排序（数字越小越靠前）
        const sortedBanners = bannerEntries.sort((a, b) => {
          return (a.value.sort_order || 0) - (b.value.sort_order || 0);
        });

        console.log('排序后的轮播图:', sortedBanners);

        // 提取URL数组（按排序后的顺序）
        const bannerUrls = sortedBanners
          .map(item => item.value.url) // 从 value 中获取 url
          .filter(url => url); // 过滤无效URL

        console.log('提取的轮播图URLs:', bannerUrls);

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
      '/images/banners/banner-01.jpg',
      '/images/banners/banner-02.jpg',
      '/images/banners/banner-03.jpg',
    ];

    this.setData({
      background: defaultBanners
    });
    console.log('✅ 使用默认轮播图，共', defaultBanners.length, '张');
  },

  // 加载图标
  async loadIcons() {
    try {
      console.log('开始加载图标...');

      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: API_CONFIG.IMAGES.ICONS,
          method: 'GET',
          header: {
            'Accept': 'application/json'
          },
          success: resolve,
          fail: reject
        });
      });

      console.log('图标API响应:', response);

      if (response.statusCode === 200) {
        // 适配多种可能的响应格式
        let iconData = null;
        if (response.data && response.data.code === 200 && response.data.data) {
          iconData = response.data.data;
        } else if (response.data && response.data.code === 1 && response.data.data) {
          iconData = response.data.data;
        }

        if (iconData && Array.isArray(iconData) && iconData.length > 0) {
          console.log('图标数据:', iconData);

          // 查找通知图标
          const noticeIcon = iconData.find(icon =>
            icon.key && (
              icon.key.toLowerCase().includes('notice') ||
              icon.key.toLowerCase().includes('message') ||
              icon.key.toLowerCase().includes('bell') ||
              icon.key.toLowerCase().includes('notification')
            )
          );

          if (noticeIcon && noticeIcon.url) {
            this.setData({
              noticeIcon: noticeIcon.url
            });
            console.log('✅ 通知图标加载成功:', noticeIcon.url);
          } else {
            console.log('⚠️ 未找到通知图标，使用默认图标');
            this.setData({
              noticeIcon: '/images/notice.png'
            });
          }
        } else {
          console.log('⚠️ 图标数据为空，使用默认图标');
          this.setData({
            noticeIcon: '/images/notice.png'
          });
        }
      } else {
        console.error('❌ 图标API请求失败，状态码:', response.statusCode);
        this.setData({
          noticeIcon: '/images/notice.png'
        });
      }
    } catch (error) {
      console.error('❌ 图标加载失败:', error);
      this.setData({
        noticeIcon: '/images/notice.png'
      });
    }
  },

  // 加载景点数据
  async loadLandscapes() {
    try {
      console.log('开始加载景点数据...');
      const landscapes = await this.getAllLandFromAPI();

      // 处理景点数据
      landscapes.forEach(landscape => {
        console.log(landscape);
        if (landscape.images && Array.isArray(landscape.images) && landscape.images.length > 0) {
          landscape.pic_url = landscape.images[0];
          landscape.allImages = landscape.images;
        } else {
          landscape.pic_url = '/images/default-landscape.jpg';
          landscape.allImages = [];
        }
      });

      this.setData({
        landscapeList: landscapes
      });

      console.log('✅ 景点数据加载完成');
    } catch (error) {
      console.error('❌ 景点数据加载失败:', error);
      throw error;
    }
  },

  // 从API获取景点数据
  getAllLandFromAPI() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.LANDSCAPE.ALL,
        method: 'GET',
        header: {
          'Accept': 'application/json'
        },
        success: (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`服务器错误: HTTP ${res.statusCode}`));
            return;
          }

          let landscapes = [];
          if (res.data && res.data.code === 1 && res.data.data && Array.isArray(res.data.data)) {
            landscapes = res.data.data;
          } else {
            reject(new Error('服务器返回数据格式错误'));
            return;
          }

          if (landscapes.length === 0) {
            reject(new Error('没有找到景点数据'));
            return;
          }

          resolve(landscapes);
        },
        fail: (error) => {
          reject(new Error('网络请求失败，请检查网络连接'));
        }
      });
    });
  },

  // 获取每个景点的得分
  async getAllScore() {
    const app = getApp();

    if (!this.data.landscapeList || this.data.landscapeList.length === 0) {
      return;
    }

    try {
      const scorePromises = this.data.landscapeList.map(async (landscape, index) => {
        try {
          const score = await app.getScore(landscape.landscape_id);
          return {
            index,
            score
          };
        } catch (error) {
          return {
            index,
            score: 0
          };
        }
      });

      const scores = await Promise.all(scorePromises);
      const landscapes = [...this.data.landscapeList];

      scores.forEach(({
        index,
        score
      }) => {
        landscapes[index].score = score;
      });

      this.setData({
        landscapeList: landscapes
      });

      console.log('✅ 景点评分加载完成');
    } catch (error) {
      console.error('❌ 获取景点评分失败:', error);
    }
  },

  // 测试轮播图API（调试用）
  async testBannerAPI() {
    console.log('========== 测试轮播图API ==========');

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: API_CONFIG.IMAGES.BANNERS,
          method: 'GET',
          header: {
            'Accept': 'application/json'
          },
          success: resolve,
          fail: reject
        });
      });

      console.log('轮播图API测试响应:', response);
      console.log('状态码:', response.statusCode);
      console.log('响应数据:', response.data);

      if (response.data && response.data.data) {
        console.log('轮播图数据:', response.data.data);
        response.data.data.forEach((banner, index) => {
          console.log(`轮播图 ${index + 1}:`, {
            id: banner.id,
            key: banner.key,
            url: banner.url,
            description: banner.description,
            sort_order: banner.sort_order
          });
        });
      }
    } catch (error) {
      console.error('轮播图API测试失败:', error);
    }

    console.log('========== 轮播图API测试结束 ==========');
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
    const landscapeId = dataset.id;
    const landscapeName = dataset.name;
    const landscapeScore = dataset.score;
    const landscapePicture = dataset.picture;

    if (landscapeId && landscapeName) {
      wx.navigateTo({
        url: `/pages/landscape_detail/landscape_detail?id=${landscapeId}&name=${encodeURIComponent(landscapeName)}&score=${landscapeScore}&picture=${landscapePicture}`
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

  onShow() {},

  onShareAppMessage() {
    return {
      title: '发现美丽景点',
      path: '/pages/landscape/landscape',
      imageUrl: this.data.background.length > 0 ? this.data.background[0] : ''
    };
  }

});