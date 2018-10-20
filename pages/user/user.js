const app = getApp();
const Http = require('../../utils/request.js');

const getUserInfo = require('./../../utils/getUserInfo.js');

Page({
  data: {
    userphone: '加载中...'
  },
  onLoad: function (options) {
  },
  onShow() {
    /* ----------------- 获取用户信息 ----------------- */
    getUserInfo().then(userInfo => {
      this.setData({ userInfo });

      /* --------- 如果会员ID存在 请求会员卡信息 --------- */
      if (userInfo.memberId) {
        this.getCardDetail(userInfo.memberId);
      }
      let userphone = userInfo.userPhone;
      let phoneSubstring = userphone.substring(3, 7);
      userphone = userphone.replace(phoneSubstring, '****');
      this.setData({ 
        userphone: userphone
        }) 
      /* --------- 根据openid 获取用户绑定手机号 --------- */
      // this.getUserphone(userInfo.openid);
    })
  },
  // getUserphone(openid) {
  //   var _this = this;
  //   wx.showLoading({
  //     title: '加载中...',
  //   })
  //   Http.post('/user/getUserInfo', { onlyId: openid }).then(res => {
  //     wx.hideLoading();
  //     if (res.code == 1000) {
  //       let userphone = res.result.userPhone;
  //       let phoneSubstring = userphone.substring(3, 7);
  //       userphone = userphone.replace(phoneSubstring, '****');
  //       _this.setData({ userphone });
  //     }
  //   }, err => {
  //     wx.hideLoading();
  //   });
  // },
  getCardDetail(memberId) {
    wx.showLoading({ title: '加载中...' });
    Http.post('/reserve/getCardDetail', { memberId }).then(res => {
      wx.hideLoading();
      if (res.code == 1000) {
        this.setData({
          totalTimes: res.result.totalTimes,
          remainTimes: res.result.remainTimes,
          remainTong: res.result.remainTong
        })
      }
    }, err => {
      wx.hideLoading();
    });
  },
  makePhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.num
    })
  },
  toshare() {
    let that = this;
    getUserInfo().then(userInfo => {
      let userPhone = userInfo.userPhone;
    let path = `pages/index/index?userPhone=${userPhone}`;
    console.log(path);
    wx.navigateToMiniProgram({
      appId: 'wxce6688718ef525db', // 要跳转的小程序的appid
      path: path, // 跳转的目标页面
      extarData: {
        open: 'auth'
      },
      success(res) {
        // 打开成功  
      }
    })
    })
  }    
})