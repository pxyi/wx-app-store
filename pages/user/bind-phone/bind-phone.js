const Http = require('./../../../utils/request.js');
const getUserInfo = require('./../../../utils/getUserInfo.js');
Page({
  data: {
    phone : '',
    code  : '',
    getCodeTime: 60,
    verificationCode: null
  },
  onLoad: function (options) {
    /* ---------------- 记录来源页 ---------------- */
    getUserInfo(false).then(userInfo => this.setData({ userInfo }));
  },
  onShow: function () {
    wx.showModal({
      showCancel: false,
      title: '温馨提示',
      content: '如果您是会员请绑定会员手机号'
    });
  },
  /* -------------------- 获取验证码 -------------------- */
  getCode() {
    if (this.data.getCodeTime != 60) { return; }
    let isMobile = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/;
    if (isMobile.test(this.data.phone)) {
      wx.showLoading({
        title: '正在获取验证码',
        mask: true
      });
      
      Http.post('/user/sendVerificationCode', {
        phoneNum: this.data.phone
      }).then(res => {
        wx.hideLoading();
        if (res.code == 1000) {
          this.setIntervalCode();
          this.setData({
            verificationCode: res.result.verificationCode,
            token: res.result.token,
            getCodePhone: this.data.phone
          });

        } else {
          wx.showToast({
            icon: "none",
            title: '获取验证码失败',
          })
        }
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请输入正确手机号',
      })
    }
  },

  /* ---------------- 倒计时 ---------------- */
  setIntervalCode() {
    let interval = setInterval(_ => {
      let getCodeTime = this.data.getCodeTime - 1;
      this.setData({ getCodeTime });
      if (getCodeTime <= 0) { clearInterval(interval); this.setData({ getCodeTime: 60 }); }
    }, 1000)
  },

  /* ---------------- 绑定电话号码 ---------------- */
  submit(e) {
    var formId = e.detail.formId; //获取formid 
    if (!this.data.code) {
      wx.showToast({
        icon: "none",
        title: '请输入验证码',
      });
      return;
    }
    if (this.data.code != this.data.verificationCode && this.data.phone != this.data.getCodePhone) {
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
    Http.post('/user/saveBindingUser', {
      paramJson: JSON.stringify({
        onlyId: this.data.userInfo.openid,
        userPhone: this.data.phone,
        formId: formId,
      })
    }).then(res => {
      wx.hideLoading();
      getUserInfo(false, true).then(userInfo => {
        if (userInfo.isMember == 0) { 
          wx.redirectTo({
            url: '/pages/user/bind-info/bind-info',
          });
        } else {
          wx.navigateBack();
        }
      });
    })
  },
  phoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  codeInput(e) {
    this.setData({
      code: e.detail.value
    });
  }



})