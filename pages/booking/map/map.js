// pages/map/map.js

//引用公共数据
var commonData = require('../../../utils/data.js')
var commonUtil = require('../../../utils/util.js')
var mapUtil = require('../../../utils/map_util.js')

var app = getApp()
Page({
    data: {
        screen_height: 0,
        screen_head: 33,
        cur_location: [],
        markers: [],
        map_key: commonData.getConstantData('tx_map_key')
    },
    regionchange(e) {
    },
    markertap(e) {
        let mark = {}
        this.data.markers.map((ele) => {
            if (ele.id == e.markerId)
                mark = ele
        })

        //将当前点击的网点信息设置到全局变量中
        app.setCurrentDeptInfo(mark)

        //跳转到预约页面，需要保留当前页面
        wx.navigateTo({
            url: '../prepare/prepare'
        })
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数

        this.setData({
            screen_height: app.getSystem_windowHeight() - this.data.screen_head
        })
    },
    onReady: function () {
        // 页面渲染完成
        var that = this
        var allowGPS

        //显示默认地址
        that.setData({
            cur_location: commonData.getConstantData("default_location")
        })

        // //判断是否需要提示客户定位请求
        // try {
        //   allowGPS = wx.getStorageSync('booking.allowGPS')
        // } catch (e) {
        // }
        // if (allowGPS == "1") {
        //   //客户已允许过定位请求，不再提示
        //显示地图
        this.showMap()
        // } else {
        //   //客户未允许过定位请求，需要提示
        //   wx.showModal({
        //     title: "提示",
        //     content: '"深圳农村商业银行"需要获取您的地理位置,是否允许',
        //     showCancel: true,
        //     cancelText: "不允许",
        //     confirmText: "允许",
        //     success: function (res) {
        //       if (res.confirm) {
        //         //点击确定

        //         //记录允许定位标志
        //         wx.setStorage({
        //           key: "booking.allowGPS",
        //           data: "1"
        //         })

        //         //显示地图
        //         that.showMap()
        //       } else {
        //         //不允许定位
        //       }
        //     }
        //   })
        // }
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },
    tap_query: function (e) {
        //跳转到查询页面，需要保留当前页面
        wx.navigateTo({
            url: '../query/query'
        })
    },
    //显示地图
    showMap: function (e) {
        var that = this

        //获取当前位置
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                that.setData({
                    cur_location: [res.longitude, res.latitude]
                })
                //查询当前城市
                that.cityQry()
            },
            fail: function (err) {
                commonUtil.wx_showModal("获取当前位置失败 " + err.errMsg)
            }
        })
    },
    //查询所在城市信息
    cityQry: function (e) {
        var errMsg = "查询所在城市失败"

        var that = this

        commonUtil.wx_request_other({
            method: "GET",
            url: "https://apis.map.qq.com/ws/geocoder/v1/?key=" + this.data.map_key + "&get_poi=0&coord_type=5&location=" + this.data.cur_location[1] + "," + this.data.cur_location[0],
            errMsg: errMsg,
            success: function (res) {
                if (res.data.status != 0) {
                    commonUtil.wx_showModal(errMsg)
                } else {
                    var city
                    var ad_info = res.data.result.ad_info
                    if (!ad_info) {
                        commonUtil.wx_showModal(errMsg)
                    } else {
                        if (ad_info.district == "宜州市") {
                            city = ad_info.district
                        } else {
                            city = ad_info.city
                        }

                        //设置导航栏文字
                        wx.setNavigationBarTitle({
                            title: "预约排队: " + city
                        })

                        //发送交易查询网点信息
                        that.branchQry(city)
                    }
                }
            }
        })
    },
    //查询网点信息
    branchQry: function (city) {
        var that = this

        commonUtil.wx_request_portal({
            url: "OrderBranchQry.do",
            data: "Type=1&City=" + encodeURI(city),
            page: this,
            success: function (res) {
                if (!res.data.List || res.data.List.length == 0) {
                    commonUtil.wx_showModal('当前城市未查询到网点')
                } else {
                    //处理返回数据，将数据内容设置为与地图的markers格式一致
                    res.data.List.map((e) => {
                        e.iconPath = "/images/booking/point.png"
                        e.width = 32
                        e.height = 32
                        //使用网点ID作为地图上点的的ID
                        e.id = e.DeptId

                        //转换地图坐标
                        var location = mapUtil.bd09togcj02(e.Lng, e.Lat)
                        e.longitude = location[0]
                        e.latitude = location[1]
                    })

                    that.setData({
                        markers: res.data.List
                    })
                }
            }
        })
    },
    //对分享的处理
    onShareAppMessage: function () {
        return {
            title: '深圳农村商业银行',
            path: '/pages/booking/map/map'
        }
    }
})