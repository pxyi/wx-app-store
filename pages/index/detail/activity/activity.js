const getUserInfo = require('../../../../utils/getUserInfo.js');
const Http = require('../../../../utils/request.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityDetails:{},
    Userstatus:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    function GetDateStr(AddDayCount) {
      var dd = new Date();
      dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
      var y = dd.getFullYear();
      var m = dd.getMonth() + 1;//获取当前月份的日期
      var d = dd.getDate();
      return y + "-" + m + "-" + d;
    }
  
    let discount;
    discount = ((options.coupon / options.originalPrice) * 10).toFixed(1);
    this.setData({
      shopId: options.shopId,
      originalPrice: options.originalPrice,
      coupon: options.coupon,
      discount,
      todayDate: GetDateStr(0),
      afterDate: GetDateStr(180)
    })
    this.getactivityData();
   
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
    this.getUserstatus();
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
   * 验证用户可不可以领券
   */
  getUserstatus(){
    let that = this;
    getUserInfo().then(userInfo => {
      Http.post('/check/checkCouponCode', {
        paramJson: JSON.stringify({
          openId: userInfo.openid,
          usePhone: userInfo.userPhone,
          activityId: '39',
        })
      }).then(res => {
        that.setData({
          Userstatus:res,
          userPhone:userInfo.userPhone,
          isMember: userInfo.isMember
        });
      })
    })  
  },


  getactivityData(){
    let that = this;
    getUserInfo().then(userInfo => {
    Http.post('/activity/activityDetails', {
        paramJson: JSON.stringify({
          storeId:Number(this.data.shopId),
          activityId: 39,
          wxUserName: app.userarr.wxUserName,
          wxHeadImage: app.userarr.wxHeadImage,
          userPhone: userInfo.userPhone 
        })
      }).then(res => {
        if (res.code == '1000') {
          that.setData({
            activityDetails: res.result
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.info,
          })
        }
      })
    }) 
  },

  rushBuy(){
    let that = this;
    if(that.data.isMember==1){
      wx.showModal({
        title: '温馨提示',
        content: '只有非会员才可以参与活动哦' ,
        confirmText: '分享',
        success: function (res) {
          let activityId = that.data.activityDetails.activityId;
          let storeId = that.data.activityDetails.storeId;
          let userPhone = that.data.userPhone;
          let shareMoney = that.data.activityDetails.coupon;
          if (!res.cancel) {
            let that = this;
            let path = `pages/index/index?activityId=${activityId}&storeId=${storeId}&userPhone=${userPhone}&shareMoney=${shareMoney}`;
  
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
          }
        }
      })
    }else{
    if (that.data.Userstatus.code =='10051'){
          wx.navigateTo({
            url: `./checkOrder/checkOrder?shopId=${that.data.shopId}`,
          })
        }else{
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: that.data.Userstatus.info,
          })
        }
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  makePhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.num
    })
  },
  /*****跳到分享小程序******/
  toshare() {
    let that = this;
    let activityId = that.data.activityDetails.activityId;
    let storeId = that.data.activityDetails.storeId;
    let userPhone = that.data.userPhone;
    let shareMoney = that.data.activityDetails.coupon;
      let path = `pages/index/index?activityId=${activityId}&storeId=${storeId}&userPhone=${userPhone}&shareMoney=${shareMoney}`;
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
  }  
})