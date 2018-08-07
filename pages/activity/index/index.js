const app = getApp();
const getAddress = require('./../../../utils/getAddress.js');
const Http = require('./../../../utils/request.js');
const cityAddress = require('./../../../data/cityAddress.js');

const getUserInfo = require('./../../../utils/getUserInfo.js');

var addresslist = cityAddress.postList;
Page({
  data: {
    storeItems: [],
    address   : ['', '定位中', ''],
    pageNo: 1,
    pageSize: 10,
  },
  onLoad: function (options) {
    this.getaddressIndex();
  },
  /* ------------------- 获取用户地理位置信息 ------------------- */
  getaddressIndex() {
    wx.showLoading({ title: '加载中...' });
    getAddress(address => {
      this.setData({
        location: address.location,
        address: [address.address_component.province, address.address_component.city],
        lat: address.location.lat,
        lon: address.location.lng,
        province: address.address_component.province,
        city: address.address_component.city,
        area: null,
        pageNo: 1,
        storeItems: [],
        district: null,
      });
      wx.hideLoading();
      this.getStoreItems();
    })
  },

  /* ------------------ 选择城市列表 ------------------ */
  bindRegionChange: function (e) {
    this.setData({
      address: e.detail.value
    });
    var province = this.data.address[0];
    var city = this.data.address[1];
    var district = this.data.address[2];
    var provincecode = '';
    var citycode = '';
    var districtcode = '';
    for (var i = 0; i < addresslist.length; i++) {
      if (addresslist[i].label == province) {
        provincecode = addresslist[i].value;
        for (var r = 0; r < addresslist[i].children.length; r++) {
          if (city == addresslist[i].children[r].label) {
            citycode = addresslist[i].children[r].value;
            for (var j = 0; j < addresslist[i].children[r].children.length; j++) {
              if (district == addresslist[i].children[r].children[j].label) {
                districtcode = addresslist[i].children[r].children[j].value;
              }
            }
          }
        }
      }
    }
    this.setData({
      province: provincecode,
      city: citycode,
      district: districtcode,
      pageNo: 1,
      storeItems: []
    });
    this.getStoreItems();
  },
  onReachBottom: function () {
    this.getStoreItems();
  },
  /* ------------ 获取列表数据 ------------ */
  getStoreItems(param) {
    var paramJson;
    if (this.data.district) {
      paramJson = JSON.stringify({
        province: this.data.province,
        city: this.data.city,
        area: this.data.district,
        lon: this.data.location.lng,
        lat: this.data.location.lat,
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize
      });
    } else {

      var province = this.data.province;
      var city = this.data.city;
      var district = this.data.district;
      var provincecode = '';
      var citycode = '';
      var districtcode = '';
      for (var i = 0; i < addresslist.length; i++) {
        if (addresslist[i].label == province) {
          provincecode = addresslist[i].value;
          for (var r = 0; r < addresslist[i].children.length; r++) {
            if (city == addresslist[i].children[r].label) {
              citycode = addresslist[i].children[r].value;
              for (var j = 0; j < addresslist[i].children[r].children.length; j++) {
                if (district == addresslist[i].children[r].children[j].label) {
                  districtcode = addresslist[i].children[r].children[j].value;
                }
              }
            }
          }
        }
      }
      paramJson = JSON.stringify({
        province: provincecode,
        city: citycode,
        lon: this.data.location.lng,
        lat: this.data.location.lat,
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize

      });
    }
    wx.showLoading({ title: '加载中...' });
    Http.post('/shop/listActivityShopNew', { paramJson }).then(res => {
      wx.hideLoading();
      if (res.code == 1000 && res.result.shopList) {
        let storeItem = res.result.shopList;
        for (let i = 0; i < storeItem.length; i++) {
          if (storeItem[i].distance > 1000) {
            storeItem[i].distance = (storeItem[i].distance / 1000).toFixed(1) + 'km';
          } else {
            storeItem[i].distance = storeItem[i].distance + 'm';
          }
        }
        if (storeItem) {
          this.setData({
            storeItems: this.data.storeItems.concat(storeItem),
            pageNo: this.data.pageNo + 1
          })

        }
      } else {
      }
    }, _ => {
      wx.hideLoading();
    });
  }
})