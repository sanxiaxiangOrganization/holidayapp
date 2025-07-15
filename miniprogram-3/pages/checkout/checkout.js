// pages/checkout/checkout.js
Page({
  data: {
    cartItems: [], // 购物车商品列表
    totalPrice: 0, // 商品总价
    freight: 0, // 运费
    addressInfo: {}, // 收货地址信息（手动填写）
    
    // 地区选择相关
    showRegionPicker: false, // 是否显示地区选择弹窗
    regionValue: [0, 0, 0], // 地区选择器值
    provinces: [], // 省份列表
    cities: [], // 城市列表
    areas: [], // 区域列表
    allRegions: [] // 完整地区数据
  },

  onLoad(options) {
    // 接收从购物车页面传递的商品数据
    if (options.cartItems) {
      const cartItems = JSON.parse(options.cartItems);
      this.setData({
        cartItems
      });
      // 计算商品总价
      this.calculateTotal();
    }
    
    // 加载已保存的地址信息
    this.loadSavedAddress();
    
    // 加载地区数据
    this.loadRegionData();
  },

  // 加载地区数据（简化版，实际项目可从接口获取）
  loadRegionData() {
    // 这里使用简化的地区数据，实际项目中可替换为完整数据
    const allRegions = [
      {
        id: 1,
        name: "北京市",
        cities: [
          {
            id: 11,
            name: "北京市",
            areas: [
              { id: 111, name: "东城区" },
              { id: 112, name: "西城区" },
              { id: 113, name: "朝阳区" }
            ]
          }
        ]
      },
      {
        id: 2,
        name: "上海市",
        cities: [
          {
            id: 21,
            name: "上海市",
            areas: [
              { id: 211, name: "黄浦区" },
              { id: 212, name: "徐汇区" },
              { id: 213, name: "静安区" }
            ]
          }
        ]
      }
    ];
    
    this.setData({
      allRegions,
      provinces: allRegions,
      cities: allRegions[0].cities,
      areas: allRegions[0].cities[0].areas
    });
  },

  // 显示地区选择器
  showRegionPicker() {
    this.setData({
      showRegionPicker: true
    });
  },

  // 隐藏地区选择器
  hideRegionPicker() {
    this.setData({
      showRegionPicker: false
    });
  },

  // 地区选择变化
  onRegionChange(e) {
    const value = e.detail.value;
    const { allRegions } = this.data;
    
    // 更新省份对应的城市
    const provinceIndex = value[0];
    const cityIndex = value[1];
    const selectedProvince = allRegions[provinceIndex];
    const selectedCity = selectedProvince.cities[cityIndex];
    
    this.setData({
      regionValue: value,
      cities: selectedProvince.cities,
      areas: selectedCity.areas
    });
  },

  // 确认选择地区
  confirmRegion() {
    const { regionValue, provinces, cities, areas } = this.data;
    const province = provinces[regionValue[0]];
    const city = cities[regionValue[1]];
    const area = areas[regionValue[2]];
    
    // 更新地址信息中的地区
    const addressInfo = {
      ...this.data.addressInfo,
      region: [province.name, city.name, area.name]
    };
    
    this.setData({
      addressInfo,
      showRegionPicker: false
    });
  },

  // 地址输入事件
  onAddressInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    // 更新地址信息
    const addressInfo = {
      ...this.data.addressInfo,
      [field]: value
    };
    
    this.setData({
      addressInfo
    });
  },

  // 验证地址是否完整
  isAddressValid() {
    const { addressInfo } = this.data;
    // 检查必要字段是否填写
    return !!(
      addressInfo.name && 
      addressInfo.phone && 
      addressInfo.region && 
      addressInfo.region.length === 3 && 
      addressInfo.detail
    );
  },

  // 计算商品总价
  calculateTotal() {
    const { cartItems } = this.data;
    let totalPrice = 0;
    
    cartItems.forEach(item => {
      totalPrice += item.price * item.count;
    });
    
    // 设置运费规则：满99元免运费
    const freight = totalPrice >= 99 ? 0 : 10;
    
    this.setData({
      totalPrice,
      freight
    });
  },

  // 加载已保存的地址
  loadSavedAddress() {
    const savedAddress = wx.getStorageSync('savedAddress');
    if (savedAddress) {
      this.setData({
        addressInfo: savedAddress
      });
    }
  },

  // 提交订单
  submitOrder() {
    // 验证地址信息
    if (!this.isAddressValid()) {
      wx.showToast({
        title: '请完善收货信息',
        icon: 'none'
      });
      return;
    }
    
    // 验证订单商品
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '订单为空',
        icon: 'none'
      });
      return;
    }
    
    // 保存地址信息
    wx.setStorageSync('savedAddress', this.data.addressInfo);
    
    // 构建订单数据
    const { cartItems, addressInfo, totalPrice, freight, coupon } = this.data;
    const orderData = {
      orderNo: 'ORD' + Date.now(), // 生成订单号
      createTime: new Date().toLocaleString(), // 订单创建时间
      items: cartItems,
      totalPrice,
      freight,
      coupon,
      actualPayment: totalPrice + freight - coupon, // 实付金额
      address: {
        name: addressInfo.name,
        phone: addressInfo.phone,
        region: addressInfo.region.join(' '),
        detail: addressInfo.detail,
        remark: addressInfo.remark
      },
      status: 'pending' // 订单状态：待付款
    };
    
    // 模拟订单提交过程
    wx.showLoading({
      title: '提交订单中...',
      mask: true
    });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 保存订单信息到本地
      const orders = wx.getStorageSync('orders') || [];
      orders.unshift(orderData);
      wx.setStorageSync('orders', orders);
      
      // 清空购物车
      wx.setStorageSync('cartItems', []);
      
      // 跳转到支付页面
      wx.navigateTo({
        url: `/pages/payment/payment?orderNo=${orderData.orderNo}`
      });
      
      wx.showToast({
        title: '订单提交成功',
        icon: 'success'
      });
    }, 1500);
  },

  // 生命周期函数--监听页面显示
  onShow() {
    this.loadSavedAddress();
  }
});