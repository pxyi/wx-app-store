const app = getApp();
const Http = require('../../utils/request.js');

const getUserInfo = require('./../../utils/getUserInfo.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    InputText: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    getUserInfo().then(userInfo => {
      this.setData({ userInfo });
    })

  },
  voucherInput(e) {
    this.setData({
      InputText: e.detail.value
    })
  },
  subForm() {
    let userInfo = this.data.userInfo;
    if (userInfo.isMember == 0) {
      let that = this;
      wx.showLoading({ title: '加载中...' });
      getUserInfo().then(userInfo => {
        Http.post('/verification/verificationCode', {
          phone: userInfo.userPhone,
          couponCode: that.data.InputText,
        }).then(res => {
          if (res.code == 1001) {
            if (res.result.shopId != "") {
                  wx.navigateTo({
                    url: `../index/detail/detail?shopId=${res.result.shopId}`,
                  })
            } else {
              wx.showModal({
                title: res.info,
                content: '来源：' + res.result.name,
                showCancel: false,
                success: function (ress) {
                  app.activityId = res.result.id;
                  wx.navigateTo({
                    url: './index/index',
                  })

                }
              })
            }
          } else {
            wx.showModal({
              title: '提示',
              content: res.info,
              showCancel: false
            })
          }
          wx.hideLoading();
        }, _ => {
          wx.hideLoading();
        });
      })
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '只有非会员才能参与活动哦~',
        showCancel: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})