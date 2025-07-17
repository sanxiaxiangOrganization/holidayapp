// pages/mine_order/mine_order.js
Page({
  data: {
    orders: []
  },
  onLoad() {
    // 从本地存储中获取订单数据
    const orders = wx.getStorageSync('orders') || [];
    this.setData({
      orders
    });
  }
});