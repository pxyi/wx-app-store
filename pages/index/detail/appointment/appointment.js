const Http = require('../../../../utils/request.js');
const getUserInfo = require('./../../../../utils/getUserInfo.js');
Page({
  data: {
    selectTeachId: null,
    selectTime: null,
    weeks: 1,
    weekItem: [],
    weekItemm: [],
    weeknum: 0,
    rq: "--",
    timess: '',
    xhours: '--',
    xminutes: '--',
    leftbtn: 0,
    listtimes: 2,
    foottext: false,

    checkWeekIndex: 0,
    checkTime: {
      index: -1,
      hour: '',
      minute: ''
    },
    currentWeek: 0,
    checkTeachId: null
  },
  onLoad: function (options) {

    this.setData({ shopId: options.shopId });
    getUserInfo().then(userInfo => {
      this.setData({ userInfo });
      this.getCardDetail(userInfo.memberId);
      this.getWeeks(options.shopId);
    });

  },
  /* ------------------------- 选择时间段 ------------------------- */
  checkHourRadio(e) {
    let index = e.currentTarget.dataset.index;
    let checkRadio = this.data.appointItems[index];

    if (index == this.data.checkTime.index) { this.setData({ checkTime: { index: -1 } }); return; }
    if (checkRadio.flag == 'false') {
      wx.showToast({
        icon: "none",
        title: '该时段预约已满'
      })
    } else {
      checkRadio.index = index;
      this.setData({ checkTime: checkRadio });
      this.getTeachers();
    }
  },
  /* ----------------------- 获取门店可预约日期 ----------------------- */
  getWeeks(shopId) {
    wx.showLoading({ title: '加载中...', mask: true }); 
    Http.post('/reserve/getStoreHoursConfig', { storeId: shopId }).then(res => {
      wx.hideLoading();
      if (res.code == 1000) {
        res.result.map( item => item.dateSlice = item.date.slice(5));
        this.setData({ weekItems: res.result });
        this.getHours();
      }
    });
  },
  /* --------------------- 根据日期获取可预约时间 --------------------- */
  getHours(e) {
    let weekIndex = e ? e.currentTarget.dataset.index : 0;
    if (e && this.data.checkWeekIndex == weekIndex) { return; }
    wx.showLoading({ title: '加载中...', mask: true }); 
    let params = { 
      storeId  : this.data.shopId,
      memberId : this.data.userInfo.memberId,
      onlyId   : this.data.userInfo.openid,
      date     : this.data.weekItems[weekIndex].date
    }
    Http.post('/reserve/listHours', { paramJson: JSON.stringify(params) }).then(res => {
      wx.hideLoading();
      if (res.code == 1000) {
        var isAppoint = false;
        for (let i = 0; i < res.result.list.length; i++) {
          if (res.result.list[i].flag) {
            isAppoint = true;
            break;
          }
        }
        this.setData({ appointItems: res.result.list, isAppoint, checkWeekIndex: weekIndex, checkTime: { index: -1 } });
      }
    });
  },
  /* ------------------------ 获取可预约老师 ------------------------ */
  getTeachers() {
    wx.showLoading({ title: '加载中...', mask: true }); 
    Http.post('/reserve/listTeachers', {
      paramJson: JSON.stringify({
        storeId: this.data.shopId,
        hour: this.data.checkTime.hour,
        date: this.data.weekItems[this.data.checkWeekIndex].date,
        minute: this.data.checkTime.minute,
        babyType: "0"
      })
    }).then(res => {
      wx.hideLoading();
      if (res.code == 1000) {
        var teacherItems = res.result.list;
        this.setData({ teacherItems, checkTeachId: teacherItems[0].id });
      } else {
        wx.showModal({
          title: '提示',
          content: res.info,
          showCancel: false
        })
      }
    });
  },
  /* ------------------------ 选择可预约老师 ------------------------ */
  checkTeachRadio(e) {
    let teachId = e.currentTarget.dataset.teachid;
    this.setData({ checkTeachId: teachId });
  },
  /* --------------------- 预约 --------------------- */
  submit(e) {
    let formId = e.detail.formId;
    if (this.data.checkTime.index == -1) {
      wx.showToast({ icon: 'none', title: '请选择预约时间' });
      return;
    }
    wx.showLoading({ title: '加载中...', mask: true }); 
    let pageData = this.data;
    Http.post('/reserve/doReserve', {
      paramJson: JSON.stringify({
        date: pageData.weekItems[pageData.checkWeekIndex].date,
        hour: pageData.checkTime.hour,
        minute: pageData.checkTime.minute,
        onlyId: pageData.userInfo.openid,
        storeId: pageData.shopId,
        teacher: pageData.checkTeachId,
        formId: formId,
        memberId: pageData.userInfo.memberId,
      })
    }).then(res => {
      wx.hideLoading();
      if (res.code == 1000) {
        wx.showToast({
          title: `预约成功`,
          duration: 2000
        })
      } else {
        wx.showToast({
          title: res.info,
          duration: 2000
        })
      }
      setTimeout(function () {
        wx.switchTab({
          url: '/pages/serve/serve',
        })
      }, 2000)
    });
  },
  /* ----------------- 获取会员卡信息 ----------------- */
  getCardDetail(memberId) {
    wx.showLoading({ title: '加载中...', mask: true }); 
    Http.post('/reserve/getCardDetail', { memberId }).then(res => {
      wx.hideLoading();
      if (res.code == 1000) {
        this.setData({ memberCardInfo: res.result });
      }
    });
  },

  /* ---------------- 左右滚动预约日期 ---------------- */
  tabSwichWeek(e) {
    let index = e.currentTarget.dataset.index;
    if (this.data.currentWeek != index) {
      this.setData({ currentWeek: index });
    }
  }
})