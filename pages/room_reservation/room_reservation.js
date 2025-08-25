// pages/room_reservation/room_reservation.js
Page({
  data: {
    roomImages: [], // 房间轮播图数组
    roomTitle: "", // 房间标题
    roomDescription: "", // 房间介绍
    checkInDate: "", // 入住日期
    checkOutDate: "", // 退房日期
    minDate: "", // 可选择的最小日期
    maxDate: "", // 可选择的最大日期
    comments: [], // 评价列表
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    roomPrice: 0 // 房间价格，可根据实际情况从接口获取
  },

  onLoad(options) {
    // 初始化日期
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    this.setData({
      minDate: `${year}-${month}-${day}`,
      maxDate: `${year + 1}-${month}-${day}`,
      checkInDate: `${year}-${month}-${day}`,
      checkOutDate: `${year}-${month}-${parseInt(day) + 1}`
    });

    // 从参数中获取房间信息
    this.setData({
      roomImages: options.images ? options.images.split(',') : ["http://usr/images/default-avatar.png"],
      roomTitle: options.title || "",
      roomDescription: options.description || "",
      roomPrice: options.price ? parseFloat(options.price) : 0 // 假设传递了房间价格
    });

    // 模拟加载评价数据
    this.loadComments();
  },

  onCheckInDateChange(e) {
    this.setData({
      checkInDate: e.detail.value
    });
  },

  onCheckOutDateChange(e) {
    this.setData({
      checkOutDate: e.detail.value
    });
  },

  submitReservation() {
    // 提交预约逻辑
    console.log('提交预约:', this.data.checkInDate, this.data.checkOutDate);
    wx.showToast({
      title: '预约提交成功',
      icon: 'success'
    });

    // 计算入住天数
    const checkIn = new Date(this.data.checkInDate);
    const checkOut = new Date(this.data.checkOutDate);
    const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
    const diffDays = Math.round(Math.abs((checkIn - checkOut) / oneDay));

    // 计算总价
    const totalPrice = this.data.roomPrice * diffDays;

    // 构建订单数据
    const orderData = {
      items: [
        {
          title: this.data.roomTitle,
          price: this.data.roomPrice,
          count: diffDays
        }
      ],
      totalPrice: totalPrice,
      freight: 0 // 住宿费一般不涉及运费
    };

    // 跳转到结算页面
    wx.navigateTo({
      url: `/pages/checkout/checkout?cartItems=${JSON.stringify(orderData.items)}`
    });
  },

  loadComments() {
    // 模拟评价数据
    const comments = [
      {
        userName: "用户1",
        commentTime: "2024-01-01 10:00",
        commentContent: "房间很干净，服务也很好。"
      },
      {
        userName: "用户2",
        commentTime: "2024-01-02 14:30",
        commentContent: "位置不错，性价比高。"
      }
    ];
    this.setData({
      comments
    });
  }
});