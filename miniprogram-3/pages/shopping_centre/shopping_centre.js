// pages/shopping_centre.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deleteIcon: '',
    hasInput: false, // 控制删除按钮是否显示
    searchValue: '', // 搜索框的内容
    isFocused: false, // 输入框是否获得焦点
    currentCategory: 'agricultural', // 默认选中“农产品”分类
    sortType: 'default', // 排序类型：price, sales, rating, default
    sortDirectionIsUp: true, // 价格排序方向：true（升序）, false（降序）
    products: [ // 农产品类
      {
        id: 1,
        title: "有机生态种植草莓 2斤装",
        price: 39.9,
        sales: 1256,
        imageUrl: "http://usr/images/default-avatar.png", // 替换为你的图片路径
        tag: "限时特惠",
        targetAppId: 'wx91d27dbf599dff74',
        targetPath: 'pages/detail/index?sku=100193820425'
      },
      {
        id: 2,
        title: "农家散养土鸡蛋 30枚",
        price: 58.0,
        sales: 2341,
        imageUrl: "http://usr/images/default-avatar.png",
        tag: "农家直供",
        targetAppId: 'wx91d27dbf599dff74',
        targetPath: 'pages/detail/index?sku=100193820425'
      },
      {
        id: 3,
        title: "现摘新鲜圣女果 5斤装",
        price: 25.8,
        sales: 892,
        imageUrl: "http://usr/images/default-avatar.png",
        tag: "新品",
        targetAppId: 'wx91d27dbf599dff74',
        targetPath: 'pages/detail/index?sku=100193820425'
      },

      // 住宿类
      {
        id: 4,
        title: "山间民宿 双人套房 含早餐",
        price: 368.0,
        sales: 456,
        imageUrl: "http://usr/images/default-avatar.png",
        tag: "热门",
        targetAppId: 'wx91d27dbf599dff74',
        targetPath: 'pages/detail/index?sku=100193820425'
      },
      {
        id: 5,
        title: "田园别墅 整栋出租 可住6人",
        price: 888.0,
        sales: 129,
        imageUrl: "http://usr/images/default-avatar.png",
        tag: "推荐",
        targetAppId: 'wx91d27dbf599dff74',
        targetPath: 'pages/detail/index?sku=100193820425'
      }
    ],
    hasMore: false, // 是否还有更多商品
    cartIsShow: false, // 是否显示商品列表
    cartItems: [], // 购物篮商品列表
    cartTotalCount: 0, // 购物篮商品总数
    cartTotalPrice: 0 // 购物篮商品总价
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    try {
      const cartItems = wx.getStorageSync('cartItems') || [];
      this.setData({
        cartItems
      });
      this.updateCart();

      const icons = wx.getStorageSync('cached_icons') || [];
      this.setData({
        deleteIcon: icons.DELETE
      });
    } catch (e) {
      console.error('读取购物车数据失败:', e);
      this.setData({
        cartItems: [],
        deleteIcon: 'https://dhz-tourism-1329017069.cos.ap-guangzhou.myqcloud.com/icons/delete.png'
      });
    }
  },

  // 输入框获得焦点时触发
  onInputFocus: function () {
    this.setData({
      isFocused: true
    });
  },

  // 输入框失去焦点时触发
  onInputBlur: function () {
    this.setData({
      isFocused: false
    });
  },

  // 监听输入事件
  onSearchInput: function (e) {
    const value = e.detail.value;
    this.setData({
      searchValue: value,
      hasInput: value.length > 0 // 有内容时显示删除按钮
    });
  },

  // 点击搜索按钮触发
  startSearch: function () {
    if (this.data.searchValue.trim()) {
      // 执行搜索逻辑
      console.log('搜索:', this.data.searchValue);
      // 可以添加搜索请求代码
    }
  },

  // 确认搜索（按回车键）
  onSearchConfirm: function () {
    this.startSearch();
  },

  // 清空搜索框
  deleteSearch: function () {
    this.setData({
      searchValue: '',
      hasInput: false
    });
  },

  // 切换分类
  changeCategory: function (e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });

    // 这里可以添加分类切换后的逻辑（如加载对应分类的商品）
    console.log('切换到分类：', category);
    // 示例：this.loadGoodsByCategory(category);
  },

  // 切换排序
  sortByFilter: function (e) {
    const filter = e.currentTarget.dataset.filter;
    const sortDirection = this.data.sortDirectionIsUp;
    // 如果点击的是当前已选中的筛选条件，则切换排序方向（仅针对价格）
    if (filter === this.data.sortType) {
      if (filter === 'price') {
        // 价格排序需要切换升序/降序
        this.setData({
          sortDirectionIsUp: !sortDirection
        });
      } else {
        // 其他筛选条件重置为默认
        this.setData({
          sortType: 'default'
        });
      }
    } else {
      // 切换到新的筛选条件
      this.setData({
        sortType: filter,
        // 重置排序方向
        sortDirectionIsUp: true
      });
    }

    // 触发商品列表重新加载
    this.loadProducts();
  },

  // 加载商品列表
  loadProducts: function () {
    // 构建筛选参数
    const params = {
      sortType: this.data.sortType,
      sortDirection: this.data.sortDirectionIsUp ? 'asc' : 'desc'
    };

    // 调用API加载商品数据
    // wx.request({...})
    console.log('加载商品，筛选参数:', params);
  },

  // 控制商品列表显示
  cartShow: function () {
    const cartIsShow = this.data.cartIsShow;
    this.setData({
      cartIsShow: !cartIsShow
    });
  },

  // 点击商品卡片时跳转到其他小程序或添加到购物篮
  navigateToProductDetail: function (e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.products.find(item => item.id === productId);
    
    if (!product) {
      console.error('未找到商品信息');
      wx.showToast({
        title: '商品信息错误',
        icon: 'none'
      });
      return;
    }
    
    // 检查商品是否配置了跳转到其他小程序的参数
    if (product.targetAppId && product.targetPath) {
      // 跳转到其他小程序
      wx.navigateToMiniProgram({
        appId: product.targetAppId,
        path: product.targetPath,
        extraData: {
          productId: productId,
          productTitle: product.title,
          productPrice: product.price,
        },
        success: function(res) {
          console.log('跳转其他小程序成功', res);
          wx.showToast({
            title: '跳转成功',
            icon: 'success',
            duration: 1500
          });
        },
        fail: function(err) {
          console.error('跳转其他小程序失败:', err);
          wx.showToast({
            title: '跳转失败，请稍后重试',
            icon: 'none'
          });
        }
      });
      return; // 跳转到小程序后直接返回
    }
    
    // 如果没有配置跳转，则执行原来的购物篮逻辑
    // 只有农产品分类才添加到购物篮
    if (this.data.currentCategory === 'agricultural') {
      this.addToCart(product);
    } else if (this.data.currentCategory === 'accommodation') {
      // 跳转到房间预约页面，传递商品信息（构造cartItems）
      const cartItems = [{
        ...product,
        count: 1 // 默认数量1，后续结合日期计算天数
      }];
      wx.navigateTo({
        url: `/pages/checkout/checkout?cartItems=${JSON.stringify(cartItems)}&category=${this.data.currentCategory}`
      });
    }
  },

  // 添加商品到购物篮
  addToCart: function (product) {
    let cartItems = [...this.data.cartItems];
    const existingIndex = cartItems.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      // 商品已在购物篮中，数量+1
      cartItems[existingIndex].count += 1;
    } else {
      // 新商品添加到购物篮，初始数量为1
      cartItems.push({
        ...product,
        count: 1
      });
    }

    this.updateCart(cartItems);
  },

  // 更新购物篮数据
  updateCart: function (cartItems) {
    cartItems = cartItems || [...this.data.cartItems];
    // 计算总数和总价
    let totalCount = 0;
    let totalPrice = 0;

    cartItems.forEach(item => {
      totalCount += item.count;
      totalPrice += item.price * item.count;
    });

    try {
      wx.setStorageSync('cartItems', cartItems);
    } catch (e) {
      console.error('保存购物车数据失败:', e);
    }

    this.setData({
      cartItems,
      cartTotalCount: totalCount,
      cartTotalPrice: totalPrice
    });
  },

  // 减少商品数量
  decreaseCount: function (e) {
    const productId = e.currentTarget.dataset.id;
    let cartItems = [...this.data.cartItems];
    const index = cartItems.findIndex(item => item.id === productId);

    if (index > -1) {
      if (cartItems[index].count > 1) {
        cartItems[index].count -= 1;
      } else {
        // 数量为1时再减少则从购物篮移除
        cartItems.splice(index, 1);
      }
      this.updateCart(cartItems);
    }
  },

  // 增加商品数量
  increaseCount: function (e) {
    const productId = e.currentTarget.dataset.id;
    let cartItems = [...this.data.cartItems];
    const index = cartItems.findIndex(item => item.id === productId);

    if (index > -1) {
      cartItems[index].count += 1;
      this.updateCart(cartItems);
    }
  },

  // 清空购物篮
  clearCart: function () {
    this.setData({
      cartItems: [],
      cartTotalCount: 0,
      cartTotalPrice: 0
    });
    this.updateCart();
  },

  // 前往结算
  goToCheckout: function () {
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空，请先添加商品',
        icon: 'none'
      });
      return;
    }

    // 跳转到结算页面，携带购物篮数据
    wx.navigateTo({
      url: `/pages/checkout/checkout?cartItems=${JSON.stringify(this.data.cartItems)}&category=${this.data.currentCategory}`
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const app = getApp();
    app.updateTabBarIcons();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})