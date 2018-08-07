const Http = require('./../../../utils/request.js');
const getUserInfo = require('./../../../utils/getUserInfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    prizeItems: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({ title: '加载中...' });
    getUserInfo().then(userInfo => {
      this.setData({ userInfo });
      Http.post('/coupon/listPrize', { onlyId: userInfo.openid }).then(res => {
        wx.hideLoading();
        if (res.code == 1000) { this.setData({ prizeItems: res.result }); }
      })
    })
  },
  onShareAppMessage() {
    return {
      title: '首次游泳体验代金券快去领，请叫我雷锋~',
      path: `/pages/activity/activity?phone=${this.data.userInfo.userPhone}`,
      imageUrl: 'https://ylbb-wxapp.oss-cn-beijing.aliyuncs.com/store/wxfx45534.png'
    }
  }
})
