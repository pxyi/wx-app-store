const app = getApp();
const getAddress = require('./../../utils/getAddress.js');
const Http = require('./../../utils/request.js');
const cityAddress = require('./../../data/cityAddress.js');

const getUserInfo = require('./../../utils/getUserInfo.js');

var addresslist = cityAddress.postList;
Page({
  data: {
    swiperArray: [
      'http://ylbb-business.oss-cn-beijing.aliyuncs.com/jdPlusBanner.png'
    ],
    pageNo    : 1,
    pageSize  : 10,
    storeItems: [],
    address   : ['', '定位中', ''],
    useraddress: '1',
    btnblon:'0'
  },
  onLoad: function (options) {
    this.getaddressIndex();
    if (options.shareUserPhone) {
      app.shareUserPhone = options.shareUserPhone;
    }
  },
  onReachBottom: function () {
    this.getStoreItems();
  },
  openSetting(e) {
    let that = this;
 
    //that.getaddressIndex('0');
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
    if (!e.detail.authSetting['scope.userLocation']) {
      wx.showModal({
        title: '警告',
        content: '若不打开授权，则无法获取门店信息！',
        showCancel: false
      })
    }else{
      that.setData({
        btnblon: '1' + ''
      })
    }
  },
  setshopList(){
  let that = this;
    that.setData({
      useraddress: '1'
    })
    this.getaddressIndex();

  },
  /* ------------------- 获取用户地理位置信息 ------------------- */
  getaddressIndex() {
 
   let that = this;

    getAddress(address => {
      console.log(address);
      if(address=='error'){
        that.setData({
          useraddress:'0'
        })
        
      }else{

     
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
      }
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
    Http.post('/shop/listShop', { paramJson }).then(res => {
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