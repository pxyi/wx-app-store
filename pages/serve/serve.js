const app = getApp();
const Http = require('../../utils/request.js');
const getUserInfo = require('./../../utils/getUserInfo.js');

Page({
  data: {
    currentTab: 0,
    arrays: [],
    refundList:[]
  },
  onLoad: function (options) {

  },
  onShow() {
    getUserInfo().then(userInfo => {
      this.setData({ userInfo });
      this.requestItem(this.data.currentTab);
      this.getserverList();

    })
  },
  /* --------------- 切换表单 --------------- */
  switchTab(e) {
    let index = e.target.dataset.current;
    if (index !== this.data.currentTab) {
      this.setData({
        currentTab: e.target.dataset.current
      });
    }
  },
  switchChange(e) {
    this.setData({ currentTab: e.detail.current });
    this.requestItem(e.detail.current);
  },
  requestItem(index) {
    wx.showLoading({ title: '加载中...' });

    let params = {
      onlyId: this.data.userInfo.openid,
      memberId: this.data.userInfo.memberId,
      pageNo: 1,
      pageSize: 99
    };
    Http.post(index == 0 ? '/reserve/reserveListForService' : '/reserve/reserveListComplete', { paramJson: JSON.stringify(params) }).then(res => {
      wx.hideLoading();
      this.setData({ serveItems: res.code == 1000 ? res.result.list : [] });
    })
  },
  /* ------------------- 点击取消按钮 ------------------- */
  cancel(e) {
    let reserveId = e.detail.target.dataset.id;
    let formId = e.detail.formId;
    let _this = this;
    wx.showModal({
      title: '尊敬的会员',
      content: '您确定要取消预约吗?',
      success(res) {
        if (res.confirm) {
          wx.showLoading({ title: '加载中...' });
          Http.post('/reserve/reserveCancel', {
            reserveId: reserveId,
            memberId: _this.data.userInfo.memberId,
            onlyId: _this.data.userInfo.openid,
            formId: formId
          }).then(res => {
            wx.hideLoading();
            if (res.code == 1000) {
              wx.showToast({
                title: res.info,
                duration: 1500
              })
              setTimeout(_ => {
                _this.requestItem(_this.data.currentTab);
              }, 1500)
            }
          });
        }
      }
    })
  },
  getserverList(){
    let that = this;
    wx.showLoading({ title: '加载中...' });
    Http.post('/order/getOrderCouponRefund', {
      paramJson: JSON.stringify({
        openId: that.data.userInfo.openid
      })
    }).then(res => {
      wx.hideLoading();
      if (res.code == 1000) {
        let result = [];
        res.result.map(item => {
          item.createTIme = item.createTIme.substring(0, 10);
          item.outDate = item.outDate.substring(0, 10);
          result.push(item);
        })
       this.setData({
         refundList:result
       })
      }
    });
 
  }
})