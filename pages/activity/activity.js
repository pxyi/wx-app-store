
const format = require('./../../utils/format.js');
const getAddress = require('./../../utils/getAddress.js');
const Http = require('./../../utils/request.js');
const getUserInfo = require('./../../utils/getUserInfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowDate: null,                     // 记录当前年月日
    birthday: null,                     // 宝宝生日
    showConfirm: false,
    getCodeTime: 60,
    hidePage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getUserInfo(true, true);
    this.setData({
      nowDate: format.formatTime(new Date()),
      sharePhone: options.phone || null,
      shopId: options.shopId || null
    });
    wx.setStorageSync('sharePhone', options.phone || null);

    getUserInfo(false).then(userInfo => {
      this.setData({ userInfo });
      if (userInfo.isMember == 1) {
        wx.redirectTo({
          url: `/pages/activity/detail/detail?text=温馨提示&shopId=${options.shopId}`,
        });
      } else if (userInfo.status == 1) {
        this.setData({ hidePage: true });
        Http.post('/coupon/countCoupon', { onlyId: userInfo.openid }).then(res => {
          if (res.code == 1000) {
            if (options.shopId) {
              wx.redirectTo({
                url: `/pages/index/detail/detail?shopId=${options.shopId}`,
              });
            } else {
              wx.showModal({
                title: '温馨提示',
                content: '选择离您最近的门店领劵吧',
                showCancel: false,
                confirmText: '去领取',
                success(res) {
                  if (res.confirm) {
                    wx.redirectTo({
                      url: '/pages/activity/index/index',
                    });
                  }
                }
              });
            }
          } else {
            wx.redirectTo({
              url: `/pages/activity/detail/detail?text=您的代金券已经领取过咯~&shopId=${options.shopId}`,
            });
          }
        })
      } else {
        wx.showLoading({ title: '加载中...' });
        getAddress(address => {
          if (options.shopId) {
            Http.post('/shop/getShopDetail', {
              paramJson: JSON.stringify({
                id: options.shopId,
                lon: address.location.lng,
                lat: address.location.lat
              })
            }).then(res => {
              let shopInfo = res.result;
              shopInfo.distance = shopInfo.distance > 1000 ?
                `${(shopInfo.distance / 1000).toFixed(1)}km` :
                `${shopInfo.distance}m`;
              this.setData({ optimumShop: shopInfo });
              wx.hideLoading();
            })
          } else {
            let paramJson = JSON.stringify({
              lon: address.location.lng,
              lat: address.location.lat,
              pageNo: 1,
              pageSize: 1
            });
            Http.post('/shop/listActivityShopNew', { paramJson }).then(res => {
              let optimumShop = res.result.shopList[0] || {};
              optimumShop.distance = optimumShop.distance > 1000 ? (optimumShop.distance / 1000).toFixed(1) + 'km' : optimumShop.distance + 'm';
              this.setData({ optimumShop });
              wx.hideLoading();
            })
          }
        })
      }
    })

  },
  /* ---------------- 宝宝生日改变事件 ---------------- */
  birthdayChange(e) {
    this.setData({
      birthday: e.detail.value
    })
  },
  formSubmit(e) {
    let [params, formId] = [e.detail.value, e.detail.formId];
    this.setData({ formId });
    let isMobile = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/;
    if (!params.nickName) {
      wx.showToast({ title: '请输入宝宝小名' });
      return;
    }
    if (!params.birthday) {
      wx.showToast({ title: '请选择宝宝生日' });
      return;
    }
    if (!isMobile.test(params.userPhone)) {
      wx.showToast({ title: '电话号码不正确' });
      return;
    }
    this.setData({ showConfirm: true, userx: params });
    this.getCode(params.userPhone);
  },
  /* --------------- 隐藏弹出层/存储验证码 --------------- */
  hideConfirm() { this.setData({ showConfirm: false }); },
  ewCode(e) { this.setData({ code: e.detail.value }); },
  /* -------------------- 获取验证码 -------------------- */
  getCode(phone) {
    if (this.data.getCodeTime != 60) { return; }
    if (phone.type) {
      phone = this.data.userx.userPhone
    }
    wx.showLoading({
      title: '正在获取验证码',
      mask: true
    });
    Http.post('/user/sendVerificationCode', {
      phoneNum: phone
    }).then(res => {
      wx.hideLoading();
      if (res.code == 1000) {
        this.setIntervalCode();
        this.setData({
          verificationCode: res.result.verificationCode,
          token: res.result.token,
          getCodePhone: phone
        });
      } else {
        wx.showToast({
          icon: "none",
          title: '获取验证码失败',
        })
      }
    })
  },
  validateCode() {
    if (!this.data.code) {
      wx.showToast({
        icon: "none",
        title: '请输入验证码',
      });
      return;
    }
    if (this.data.code != this.data.verificationCode) {
      wx.showToast({
        icon: "none",
        title: '验证码错误',
      });
      return;
    }
    wx.showLoading({
      title: '绑定中...',
      mask: true
    });
    let params = Object.assign({
      userId: this.data.userInfo.openid,
      token: this.data.token,
      code: this.data.code,
      storeId: this.data.optimumShop.id
    }, this.data.userx);
    Http.post('/coupon/saveInfo', {
      paramJson: JSON.stringify(params)
    }).then(res => {
      getUserInfo(false, true).then(userInfo => {
        wx.hideLoading();
        this.getCoupon(userInfo);
      });
    });
  },
  /* ---------------- 倒计时 ---------------- */
  setIntervalCode() {
    let interval = setInterval(_ => {
      let getCodeTime = this.data.getCodeTime - 1;
      this.setData({ getCodeTime });
      if (getCodeTime <= 0) { clearInterval(interval); this.setData({ getCodeTime: 60 }); }
    }, 1000)
  },
  /* ---------------- 领取代金券 ---------------- */
  getCoupon(userInfo) {
    let _this = this;
    this.setData({ showConfirm: false });
    wx.showModal({
      title: '您领取的是',
      cancelText: '更换门店',
      confirmText: '就去这家',
      content: `“${this.data.optimumShop.shopName}”的代金券，是否要更换预约门店`,
      success(res) {
        if (res.confirm) {
          let sharePhone = _this.data.sharePhone || '';
          let param = JSON.stringify({
            onlyId: userInfo.openid,
            storeId: _this.data.optimumShop.id,
            sendPhone: sharePhone,
            receivePhone: userInfo.userPhone,
            couponAmount: _this.data.optimumShop.couponPrice || _this.data.optimumShop.coupon,
            formId: _this.data.formId
          });
          wx.showLoading({ title: '领取中...', mask: true });
          Http.post('/coupon/saveCoupon', { paramJson: param }).then(res => {
            wx.redirectTo({
              url: `/pages/activity/detail/detail?text=${res.code == 1000 ? '领取代金券成功' : res.info}&shopId=${_this.data.optimumShop.id}`,
            });
          });

          /* ----------- 推送数据到客多多 ----------- */
          Http.post('https://sale.beibeiyue.com/kb/customerDetail/weChatWithNoVerifyNum', {
          //Http.post('http://101.200.177.83:7988/kb/customerDetail/weChatWithNoVerifyNum', {
            phone: _this.data.userx.userPhone,
            birthday: _this.data.userx.birthday,
            shopId: _this.data.optimumShop.id,
            babyName: _this.data.userx.nickName,
            activityId: '9',
            spreadId: '27',
          });
        } else if (res.cancel) {
          wx.redirectTo({
            url: '/pages/activity/index/index',
          });
        }
      }
    })
  }
})