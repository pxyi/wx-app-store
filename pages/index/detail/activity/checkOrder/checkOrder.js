const app = getApp();
const Http = require('../../../../../utils/request.js');
const cityAddress = require('../../../../../data/cityAddress.js');
const getUserInfo = require('../../../../../utils/getUserInfo.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userDetail: '',
    openid:'',
    orderNo:'',
    offNo:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      shopId:options.shopId
    })
    this.getShopDateil();
 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
   /**
   * 获取活动详情
   */
  getShopDateil(){
    let that = this;
    wx.showLoading();
    Http.post('/order/getConfirmOrder', {
      paramJson: JSON.stringify({
        storeId: that.data.shopId,
        activityId: '39'
      })
    }).then(res => {
      let shopDetail = res.result;
      that.setData({
        shopDetail
      });
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });
  },


  payments(e) {
    let formId = e.detail.formId;
    let that = this;

    if ( that.data.offNo ){
      return false;
    }
    getUserInfo().then(userInfo => {  
      wx.showLoading({
        title:'请稍候……',
        mask:true
      }); 
      Http.post('/user/getBabyInfoByPhone', {
        userPhone: userInfo.userPhone,
      }).then(res => {
        let birthday = res.result.birthday;
        let babyName = res.result.nickName;
    Http.post('/order/confirmPayOrder', {
      paramJson: JSON.stringify({
        userName: res.result.nickName,
        openId: userInfo.openid,
        shopId: that.data.shopId,
       // totalMoney: that.data.shopDetail.coupon+'',
        totalMoney:'0.01',
        activityName: that.data.shopDetail.activityName,
        activityId: that.data.shopDetail.activityId+'',
      })
    }).then(res => {
        if(res.code==1000){
          that.setData({
            orderNo: res.result.result.orderNo
          })
      wx.requestPayment({
        'timeStamp': res.result.result.timeStamp+'',
        'nonceStr': res.result.result.nonceStr,
        'package': res.result.result.packages,
        'signType': 'MD5',
        'paySign': res.result.result.paySign,
        'success': function (res) {
      
          that.setData({
            offNo: false
          })
          Http.post('https://sale.beibeiyue.com/kb/customerDetail/weChatWithNoVerifyNum', {
         // Http.post('http://101.200.177.83:7988/kb/customerDetail/weChatWithNoVerifyNum', {
            phone: userInfo.userPhone,
            birthday: birthday,
            shopId: that.data.shopId,
            babyName: babyName,
            activityId: '39',
            spreadId: '34',

          }).then(res => {
          });
         
           wx.navigateTo({
             url: '../../../../user/coupon/coupon?type=1',
           })
       
      
        },
        'fail': function (res) {
          wx.hideLoading(); 
          that.setData({
            offNo: false
          })
          Http.post('/order/getOrderCoupon', {
            paramJson: JSON.stringify({
               orderNo: that.data.orderNo,
            })  
          }).then(res => {

            if(res.code==1000){
                if(res.result.orderStatus==1){
                
                    wx.navigateTo({
                      url: '../../../../user/coupon/coupon?type=1',
                    })
                  
                   //Http.post('https://sale.beibeiyue.com/kb/customerDetail/weChatWithNoVerifyNum', {
                  Http.post('http://101.200.177.83:7988/kb/customerDetail/weChatWithNoVerifyNum', {
                    phone: userInfo.userPhone,
                    birthday: birthday,
                    shopId: that.data.shopId,
                    babyName: babyName,
                    activityId: '39',
                    spreadId: '34',

                  }).then(res => {
                    wx.hideLoading();
                  });

                }else{
                  let orderText = res.result.orderStatus == 0 ? '该订单未付款' : (res.result.orderStatus == 2 || res.result.orderStatus == 4 ? '该订单已经退款' : '该订单退款失败' );
                  wx.showToast({
                    title: orderText,
                    icon:'none'
                  })
                }
            }
          });
        }
      })
        }else{
          wx.hideLoading(); 
          wx.showModal({
            title: '温馨提示',
            content: res.info,
            showCancel:false,
            success: function (res) {
              wx.navigateBack({
                delta: 2
              })
            }
          })
        }
      });
    }, _ => {
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      that.setData({
        offNo: true
      })
      wx.hideLoading();
    });
    })
    that.setData({
      offNo: true
    })
  },

})