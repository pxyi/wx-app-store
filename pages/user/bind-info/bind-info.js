const App = getApp();
const Http = require('./../../../utils/request.js');
const getUserInfo = require('./../../../utils/getUserInfo.js');
const format = require('./../../../utils/format.js');

Page({
  data: {
    userHeadImg: null,
    relationshipIndex: null,
    relationshipArray: ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'],
    birthday: '',
    babyname: '',
    nowDate: null
  },
  onLoad: function (options) {
    this.setData({ nowDate: format.formatTime(new Date()) });
    getUserInfo(false).then( userInfo => this.setData({ userInfo }));
  },
  /**********验证宝宝姓名生日关系----提交*************/
  submit() {
    if (!this.data.babyname) {
      wx.showToast({
        icon: "none",
        title: '请输入宝宝的名字',
        duration: 2000
      })
      return false;
    }

    if (!this.data.birthday) {
      wx.showToast({
        icon: "none",
        title: '请选择宝宝的生日',
        duration: 2000
      })
      return false;
    }

    if (!this.data.relationshipIndex && this.data.relationshipIndex != 0) {
      wx.showToast({
        icon: "none",
        title: '请选择您与宝宝的关系',
        duration: 2000
      })
      return false;
    }
    wx.showLoading({ title: '加载中...', mask: true }); 
    

    //erp接口 
    Http.post('/user/saveUserBaseInfo', {
      paramJson: JSON.stringify({
        onlyId: this.data.userInfo.openid,
        nickName: this.data.babyname,
        relationship: this.data.relationshipIndex,
        birthday: this.data.birthday
      })
    }).then(res => {
      wx.hideLoading();
      getUserInfo(false, true).then(userInfo => {
        wx.navigateBack();
        this.branchpost(userInfo); //往客多多推送信息
      })
    });
  
  },
  //非会员录入信息
  branchpost(userInfo) {
    //Http.post('https://sale.beibeiyue.com/kb/manager/register', {
    Http.post('http://101.200.177.83:7988/kb/manager/register', {
      typeStyle: 1,
      phone: userInfo.userPhone,
      spreadId: '10000002',
      birthday: this.data.birthday,
      babyName: this.data.babyname,
    })
  },
  relationshipChange(e) {
    this.setData({
      relationshipIndex: Number(e.detail.value)
    })
  },
  birthdayChange(e) {
    this.setData({
      birthday: e.detail.value
    })
  },
  babyname(e) {
    this.setData({
      babyname: e.detail.value
    })
  },
})