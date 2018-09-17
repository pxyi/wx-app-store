const getUserInfo = require('./../../../utils/getUserInfo.js');
const Http = require('./../../../utils/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponItems: [],
    showAlert: false,
    listUserCoupon:[],
    types : false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.type==1){
      this.setData({
        types : true
      })
    }
  },
  /**
 * 生命周期函数--监听页面卸载
 */
  onUnload: function () {
    if (this.data.types){
      wx.navigateBack({
        delta: 2
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    this.getList();
    getUserInfo().then(userInfo => {
      this.setData({ userInfo });
      wx.showLoading({ title: '加载中...' });
      Http.post('/coupon/listMyReceiveCoupon', { onlyId: userInfo.openid }).then(res => {
        wx.hideLoading();
        this.setData({ couponItems: res.code == 1000 ? res.result : [] });
      })
    })
  },
  getList(){
    getUserInfo().then(userInfo => {  
        Http.post('/show/listUserCoupon', { 
          paramJson: JSON.stringify({
            openId: userInfo.openid,
          })
        }).then(res => {
          wx.hideLoading();
          let result = [];
          res.result.map( item=>{
            item.createTime = item.createTime.substring(0,10);
            item.outDate = item.outDate.substring(0, 10);            
            result.push(item);
          })
          this.setData({ listUserCoupon: res.code == 1000 ? result : [] });
          
        })
    
    })   
  },
  

  useCoupon(e) {
    this.setData({ showAlert: true, useStatus: e.target.dataset.status });
  },
  closeAlert() { this.setData({ showAlert: false }); },
  onShareAppMessage: function () {
    return {
      title: '首次游泳体验代金券快去领，请叫我雷锋~',
      path: `/pages/activity/activity?phone=${this.data.userInfo.userPhone}`,
      imageUrl: 'https://ylbb-wxapp.oss-cn-beijing.aliyuncs.com/store/store-coupon-share.jpg'
    }
  },
  toDetail(e){
    wx.navigateTo({
      url: `../../serve/serve-details/serve-details?couponCode=${e.currentTarget.dataset.ids}`,
    })
  }
})