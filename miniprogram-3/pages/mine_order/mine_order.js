// pages/mine_order/mine_order.js
Page({
  data: {
    activeTab: 'all', // 默认选中全部订单标签
    allOrders: [],
    agriculturalOrders: [],
    accommodationOrders: []
  },
  onLoad() {
    // 从本地存储中获取订单数据
    const orders = wx.getStorageSync('orders') || [];
    const agriculturalOrders = orders.filter(order => order.category === 'agricultural');
    const accommodationOrders = orders.filter(order => order.category === 'accommodation');
    this.setData({
      allOrders: orders,
      agriculturalOrders,
      accommodationOrders
    });
  },
  // 切换标签的事件处理函数
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  }
});