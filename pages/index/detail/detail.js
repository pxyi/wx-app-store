 const getAddress = require('../../../utils/getAddress.js');
const getUserInfo = require('../../../utils/getUserInfo.js');
const Http = require('../../../utils/request.js');
const app = getApp();
Page({
  data: {
    vouchertext: '',
    voucher :true,
    onsub:false,
    isActivity:false,
    isshare:false
  },
  onLoad: function (options) {

    getUserInfo().then(userInfo => {
        this.setData({
          userPhone: userInfo.userPhone
        });
    })
 /***********判断从红包分享页面进来还是正常进来***************/
    if (options.shareUserPhone){

      app.shareUserPhone = options.shareUserPhone;
      this.setData({
        shopId: options.shareStoreId,
        isshare:true
      });     
    }else{
      this.setData({
        shopId: options.shopId
      });
    }  


  if(options.activityType){
      this.setData({
        activityType: options.activityType 
      }) 
  }    
    getAddress(address => {
      this.setData({
        lat: address.location.lat,
        lon: address.location.lng,
      });
      this.getStoreItems(this.data.shopId, address.location.lat, address.location.lng);
    });
  },
  /* --------------- 领取体验卡券 --------------- */
  cardSubmit(e) {
    console.log(e);
    app.userarr.wxUserName = e.detail.userInfo.nickName;
    app.userarr.wxHeadImage = e.detail.userInfo.avatarUrl;
  
        wx.navigateTo({
          url: `/pages/index/detail/activity/activity?shopId=${this.data.shopId}&originalPrice=${this.data.originalPrice}&coupon=${this.data.coupon}`,
        });
  },


  /* --------------- 获取门店详细信息 --------------- */
  getStoreItems(shopId, lat, lon) {
    let that = this;
    wx.showLoading({ title: '加载中...' });
    Http.post('/shop/getShopDetail', {
      paramJson: JSON.stringify({
        id: shopId,
        lon: lon,
        lat: lat,
      })
    }).then(res => {
      wx.hideLoading();
      if (res.code == 1000) {
        let shopInfo = res.result;

        /* --------------- 处理距离门店距离 --------------- */
        shopInfo.distance = shopInfo.distance > 1000 ? 
          `${(shopInfo.distance / 1000).toFixed(1)}km` : 
          `${shopInfo.distance}m`;

        /* --------------- 判断门店有哪些设施 --------------- */
        let facilitie = shopInfo.facilitie || '';
        shopInfo.hasFacilitie = false;
        shopInfo.facilitie = [];
        for (let i = 0; i < 4; i++) {
          shopInfo.facilitie[i] = facilitie.indexOf(i + 1) > -1;
          if (shopInfo.facilitie[i]) { shopInfo.hasFacilitie = true; }
        }
        /* --------------- 判断门店是否有轮播图 --------------- */
        shopInfo.shopInfoImag = shopInfo.shopInfoImag ? shopInfo.shopInfoImag.split(',') : [];
        //判断是否最后有逗号脏数据
        if (shopInfo.shopInfoImag[shopInfo.shopInfoImag.length - 1] == "," || !shopInfo.shopInfoImag[shopInfo.shopInfoImag.length - 1]){
          shopInfo.shopInfoImag.pop();
        }

        this.setData({ shopInfo });
        if (shopInfo.activityMessage){
          that.setData({
            isActivity:true
          })
        shopInfo.activityMessage.map( item=> {
          if (item.activityId==39){
            that.setData({
              originalPrice: item.originalPrice,
              coupon: item.coupon
            })
          }
        })
        }

      }
    }, _ => {
      wx.hideLoading();
    });
  },
  /* ------------------ 导航功能 ------------------ */
  mapclick () {
    const _this = this.data.shopInfo;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude;
        wx.openLocation({
          latitude: Number(_this.lat),
          longitude: Number(_this.lng),
          name: _this.shopName,
          address: _this.address,
          scale: 28
        })
      }
    })
  },
  /* --------------- 点击预约 --------------- */
  makeAppointment() {
    let that = this;
    getUserInfo().then(userInfo => {

      that.statistics(userInfo.openid, 2);
      /* -------- 判断是从首页还是京东券页面进入---------  */
      if (that.data.activityType==1){
          if (userInfo.isMember == 0) { 
            that.setData({
              voucher:false
            })
          }else{
            that.statistics(userInfo.openid, 3);
            wx.showModal({
              title: '温馨提示',
              showCancel: false,
              content: '本次活动仅针对非会员首次游泳体验有效哟',
            })
          }
      }else{       
          if (userInfo.isMember == 0) { 
          /* --------- 非会员 获取到用户信息推送到客多多 --------- */
              this.pushKdd(userInfo, '18');
          } else if (userInfo.storeId == this.data.shopId) {
            /* ---------- 是会员 归属门店与当前门店一致 ---------- */
            wx.navigateTo({
              url: './appointment/appointment?shopId=' + this.data.shopId,
            });
          } else if (userInfo.tongMember == 0) {
            /* ---------- 不是通卡会员 ---------- */
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '您的卡不支持跨店预约'
            })
          } else if (this.data.shopInfo.countryCardStatus == 1) {
            /* ----------- 是通卡店 ----------- */
            wx.navigateTo({
              url: './appointment/appointment?shopId=' + this.data.shopId,
            });
          } else {
            /* ---------- 不是通卡店 ---------- */
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '当前门店不是通卡店'
            })
          }
      }
    })
  },
  //京东弹窗关闭
  voucherClose(){
    this.setData({
      voucher: true
    })
  },
  voucherInput(e){
    this.setData({
      vouchertext: e.detail.value
    })
  },
  submit(e) {
    let that = this;    
    var formId = e.detail.formId; //获取formid
    if (!that.data.vouchertext){
      wx.showModal({
        title: '温馨提示',
        showCancel: false,
        content: '兑换码不能为空',
      })
    }
    wx.showLoading({ title: '加载中...', mask: true });
    getUserInfo().then(userInfo => {
    Http.post('/jdCoupon/judgeJdCoupon', {
      phone: userInfo.userPhone,
      openId: userInfo.openid,
      formId: formId,
      jdCoupon: that.data.vouchertext,
      shopId: that.data.shopId
    }).then(res => {
      if(res.code==1000){
        that.JDkddPost();
        this.setData({
          voucher: true
        })
      }else{
        wx.showModal({
          title: '温馨提示',
          showCancel: false,
          content: res.info,
        })
        wx.hideLoading();
      }
     

    });
   
    });

  },


  /*27 ----------- 推送数据到客多多 ----------- */
  pushKdd(userInfo, spreadId) {
    if (spreadId == 18) {
      wx.showLoading({ title: '加载中...', mask: true });
    }
    
    Http.post('/user/getBabyInfoByPhone', {
      userPhone: userInfo.userPhone,
    }).then(res => {
      let birthday = res.result.birthday;
      let babyName = res.result.nickName;
        Http.post('https://sale.haochengzhang.com/kb/customerDetail/weChatWithNoVerifyNum', {
        //Http.post('http://101.200.177.83:7988/kb/customerDetail/weChatWithNoVerifyNum', {
        // Http.post('http://192.168.1.110:8090/customerDetail/weChatWithNoVerifyNum', {
        phone: userInfo.userPhone,
        birthday: birthday,
        shopId: this.data.shopId,
        babyName: babyName,
        spreadId: spreadId,
      }).then(res => {
        if (spreadId == 18) {
          wx.hideLoading();
          wx.showModal({
            title: '温馨提示',
            showCancel: false,
            content: res.code == 1000 ? '请保持手机通畅，稍后门店会联系您' : res.code == 1022 ? '每天只能预约一次哦~' : '系统错误，请刷新重试',
          })
        }
      });
    });
  },
  

  /* ------------- 拨打电话功能 ------------- */
  makePhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.num
    })
  },
  statistics(openid,accessType){
    let that = this;
    wx.showLoading({ title: '加载中...' });
    getUserInfo().then(userInfo => {
         Http.post('/shop/activitystatistics', {
          openId: userInfo.openid,
          accessType: accessType,
      }).then(res => {
        wx.hideLoading();
      }, _ => {
        wx.hideLoading();
      });
  })
  },
  backIndex(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

})