// pages/checkout/checkout.js
Page({
  data: {
    cartItems: [], // 购物车商品列表
    totalPrice: 0, // 商品总价
    freight: 0, // 运费
    addressInfo: {}, // 收货地址信息
    showRegionPicker: false, // 地区选择弹窗
    regionValue: [0, 0, 0], // 地区选择器值
    provinces: [], // 省份列表
    cities: [], // 城市列表
    areas: [], // 区域列表
    allRegions: [], // 完整地区数据
    category: '', // 分类（agricultural/accommodation）
    contactInfo: {}, // 联系人信息
    checkInDate: "", // 入住日期
    checkOutDate: "", // 退房日期
    minDate: "", // 最小日期
    maxDate: "" // 最大日期
  },

  onLoad(options) {
    // 接收分类和商品数据
    this.setData({
      category: options.category || '',
      cartItems: options.cartItems ? JSON.parse(options.cartItems) : []
    });

    // 初始化日期
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    this.setData({
      minDate: `${year}-${month}-${day}`,
      maxDate: `${year + 1}-${month}-${day}`,
      checkInDate: `${year}-${month}-${day}`,
      checkOutDate: `${year}-${month}-${Math.min(parseInt(day) + 1, new Date(year, month, 0).getDate())}` // 避免超过当月天数
    });

    // 计算总价（无论分类）
    this.calculateTotal();

    // 根据分类预加载对应的联系信息
    if (options.category === 'accommodation') {
      this.loadSaveContact();
    } else {
      this.loadSavedAddress();
    }
    this.loadRegionData();
  },

  // 加载地区数据
  loadRegionData() {
    // 这里使用简化的地区数据，实际项目中可替换为完整数据
    const allRegions = [{
        id: 1,
        name: "北京市",
        cities: [{
          id: 11,
          name: "北京市",
          areas: [{
              id: 111,
              name: "东城区"
            },
            {
              id: 112,
              name: "西城区"
            },
            {
              id: 113,
              name: "朝阳区"
            }
          ]
        }]
      },
      {
        id: 2,
        name: "上海市",
        cities: [{
          id: 21,
          name: "上海市",
          areas: [{
              id: 211,
              name: "黄浦区"
            },
            {
              id: 212,
              name: "徐汇区"
            },
            {
              id: 213,
              name: "静安区"
            }
          ]
        }]
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
    const {
      allRegions
    } = this.data;

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
    const {
      regionValue,
      provinces,
      cities,
      areas
    } = this.data;
    const province = provinces[regionValue[0]];
    const city = cities[regionValue[1]];
    const area = areas[regionValue[2]];

    // 更新地址信息中的地区
    const addressInfo = {
      ...this.data.addressInfo,
      region: [province.name, city.name, area.name]
    };
    console.log(addressInfo);

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

  // 联系人信息输入事件
  onContactInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;

    // 更新联系人信息
    const contactInfo = {
      ...this.data.contactInfo,
      [field]: value
    };

    this.setData({
      contactInfo
    });
  },

  // 入住日期选择事件
  onCheckInDateChange(e) {
    this.setData({
      checkInDate: e.detail.value
    });
  },

  // 退房日期选择事件
  onCheckOutDateChange(e) {
    this.setData({
      checkOutDate: e.detail.value
    });
  },

  // 验证地址是否完整
  isAddressValid() {
    const {
      addressInfo
    } = this.data;
    // 检查必要字段是否填写
    return !!(
      addressInfo.name &&
      addressInfo.phone &&
      addressInfo.region &&
      addressInfo.region.length === 3 &&
      addressInfo.detail
    );
  },

  // 计算总价（适配住宿和农产品）
  calculateTotal() {
    const {
      cartItems,
      category
    } = this.data;
    let totalPrice = 0;
    cartItems.forEach(item => {
      totalPrice += item.price * item.count; // 住宿暂时按数量计算，后续可结合日期天数
    });
    // 运费规则：农产品满99免运费，住宿免运费
    const freight = category === 'agricultural' ? (totalPrice >= 99 ? 0 : 10) : 0;
    this.setData({
      totalPrice,
      freight
    });
  },

  // 加载已保存的地址
  loadSavedAddress() {
    const savedAddress = wx.getStorageSync('savedAddress');
    if (savedAddress) {
      // 找到已保存地址对应的地区选择器索引
      const {
        allRegions,
        provinces
      } = this.data;
      let regionValue = [0, 0, 0];

      if (savedAddress.region && savedAddress.region.length === 3) {
        const [provinceName, cityName, areaName] = savedAddress.region;

        // 查找省份索引
        const provinceIndex = provinces.findIndex(p => p.name === provinceName);
        if (provinceIndex !== -1) {
          regionValue[0] = provinceIndex;

          // 获取该省份的城市列表
          const cities = allRegions[provinceIndex].cities;

          // 查找城市索引
          const cityIndex = cities.findIndex(c => c.name === cityName);
          if (cityIndex !== -1) {
            regionValue[1] = cityIndex;

            // 获取该城市的区域列表
            const areas = cities[cityIndex].areas;

            // 查找区域索引
            const areaIndex = areas.findIndex(a => a.name === areaName);
            if (areaIndex !== -1) {
              regionValue[2] = areaIndex;
            }
          }
        }
      }

      this.setData({
        addressInfo: savedAddress,
        regionValue // 更新地区选择器的值
      });
    }
  },

  loadSaveContact() {
    const saveContact = wx.getStorageSync('saveContact');
    if (saveContact) {
      this.setData({
        contactInfo: saveContact
      })
    }
  },

  // 提交订单（按分类验证）
  submitOrder() {
    const {
      category,
      cartItems,
      contactInfo,
      checkInDate,
      checkOutDate,
      addressInfo
    } = this.data;

    // 验证订单商品
    if (cartItems.length === 0) {
      wx.showToast({
        title: '订单为空',
        icon: 'none'
      });
      return;
    }

    // 住宿分类验证
    if (category === 'accommodation') {
      if (!contactInfo.contactName || !contactInfo.contactPhone) {
        wx.showToast({
          title: '请完善联系人信息',
          icon: 'none'
        });
        return;
      }
      if (!checkInDate || !checkOutDate || new Date(checkInDate) >= new Date(checkOutDate)) {
        wx.showToast({
          title: '请选择有效的入住/退房日期',
          icon: 'none'
        });
        return;
      }
    }
    // 农产品分类验证
    else if (category === 'agricultural') {
      if (!this.isAddressValid()) {
        wx.showToast({
          title: '请完善收货信息',
          icon: 'none'
        });
        return;
      }
    }

    // 构建订单数据（按分类补充信息）
    const orderData = {
      orderNo: 'ORD' + Date.now(),
      createTime: new Date().toLocaleString(),
      items: cartItems,
      totalPrice: this.data.totalPrice,
      freight: this.data.freight,
      actualPayment: this.data.totalPrice + this.data.freight,
      category,
      ...(category === 'accommodation' ? {
        contactInfo,
        checkInDate,
        checkOutDate,
        days: Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)) // 计算天数
      } : {
        address: {
          name: addressInfo.name,
          phone: addressInfo.phone,
          region: addressInfo.region?.join(' ') || '',
          detail: addressInfo.detail || '',
          remark: addressInfo.remark || ''
        }
      })
    };

    // 模拟提交和支付
    wx.showLoading({
      title: '提交订单中...',
      mask: true
    });
    setTimeout(() => {
      wx.hideLoading();
      // 保存订单信息
      wx.setStorageSync('orders', [...(wx.getStorageSync('orders') || []), orderData]);

      if (category === 'agricultural') {
        // 农产品结算后清空购物车
        wx.setStorageSync('cartItems', []);
        // 保存最新的收货地址
        wx.setStorageSync('savedAddress', addressInfo);
      }else{
        wx.setStorageSync('saveContact', contactInfo)
      }

      // 模拟支付流程
      wx.showLoading({
        title: '正在支付...',
        mask: true
      });
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        });
        wx.reLaunch({
          url: '/pages/shopping_centre/shopping_centre'
        });
      }, 1500);
    }, 1500);
  },

  // 生命周期函数--监听页面显示
  onShow() {
    this.loadSavedAddress();
  }
});