App({
  onLaunch() {
    
  },

    domain: 'https://swx.haochengzhang.com/ylbb_weixin',
    //domain: 'http://192.168.1.33:8088',

  /* ------------- ------------- 全局数据存储 -------------------------- */
  globalData: {
    userOpenid: null,
    userLocation: null,
    userAddress: null
  },
  shareUserPhone:'',
  userInfo: {
    openid          : null,           // 用户唯一标识
    status          : null,           // 状态信息 1:绑定过,0:未绑定
    potentialMember : null,           // 是否为潜在会员 0:不是潜在会员,1:是潜在会员
    isMember        : null,           // 是否是会员 1:是会员,0:不是会员
    tongMember      : null,           // 是否是通卡会员 1:是通卡会员,0:不是通卡会员
    memberId        : null,           // 会员id
    baseInfo        : null,           // 是否录入过基本信息 1:录入过,0:没有录入过
    storeId         : null,           // 会员归属门店
    userPhone       : '',          // 绑定手机号
  },
  userarr: {
    wxUserName :'',
    wxHeadImage: ''
  }
})