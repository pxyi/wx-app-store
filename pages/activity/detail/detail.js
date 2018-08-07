const getUserInfo = require('./../../../utils/getUserInfo.js');
const getAddress = require('./../../../utils/getAddress.js');
const Http = require('./../../../utils/request.js');

Page({

  data: {
    text: null,
    receiveItems: [],
    robot:false
  },

  onLoad: function (options) {
    wx.showLoading({ title: '加载中...' });
    this.setData({ type: options.text || null, shopId: options.shopId || null });
    wx.removeStorageSync('userPhone');
    getUserInfo().then(userInfo => {
      this.setData({ userInfo });
      Http.post('/coupon/listMySendCoupon', { onlyId: userInfo.openid }).then( res => {
        if (res.code == 1000) {
          res.result.map(item => { item.receivePhone = item.receivePhone.replace(item.receivePhone.substring(3, 9), ' **** **'); })
          this.setData({ receiveItems: res.result });
        }
      });
      let that = this;
      setTimeout(function(){
          that.setData({
            robot: true
          })
      },2000);
      
    });
    getAddress( address => {
      if (options.shopId) {
        this.getShopDetail(options.shopId, address)
      } else {
        let paramJson = JSON.stringify({
          lon: address.location.lng,
          lat: address.location.lat
        });
        Http.post('/shop/listActivityShop', { paramJson }).then(res => {
          let optimumShop = res.result.shopList[0] || {};
          this.getShopDetail(optimumShop.id, address)
        })
      }
    });

  },
  getShopDetail(shopId, address) {
    Http.post('/shop/getShopDetail', {
      paramJson: JSON.stringify({
        id: shopId,
        lon: address.location.lng,
        lat: address.location.lat
      })
    }).then(res => {
      wx.hideLoading();
      this.setData({ shopInfo: res.code == 1000 ? res.result : {} });
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '首次游泳体验代金券快去领，请叫我雷锋~',
       path: `/pages/activity/activity?phone=${this.data.userInfo.userPhone}`,
      imageUrl: 'https://ylbb-wxapp.oss-cn-beijing.aliyuncs.com/store/wxfx45534.png'
    }
  }
})