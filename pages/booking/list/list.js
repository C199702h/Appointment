// pages/booking/list/list.js

//引用公共数据
var commonData = require('../../../utils/data.js')
var commonUtil = require('../../../utils/util.js')
var mapUtil = require('../../../utils/map_util.js')

var app = getApp()
Page({
    data: {
        //每次翻页显示的元素数量
        page_element_num: commonData.getConstantData("page_element_num"),
        //所在城市
        city: "",
        //关键字
        keyWord: "",
        //全部网点信息的列表
        dept_list_all: [],
        //用于显示的网点信息的列表
        dept_list_show: [],
        //存储的用于显示的网点信息的列表
        dept_list_show_store: []
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            city: options.city,
            keyWord: options.keyWord
        })
    },
    onReady: function () {
        // 页面渲染完成
        //发送交易查询网点信息
        var formData = "Type=1&City=" + encodeURI(this.data.city)
        if (this.data.keyWord)
            formData = formData + "&Name=" + encodeURI(this.data.keyWord)

        var that = this

        commonUtil.wx_request_portal({
            url: "OrderBranchQry.do",
            data: formData,
            page: this,
            success: function (res) {
                //处理返回数据，将数据内容设置为与地图的markers格式一致
                //map为返回数据的每个元素内容

                if (!res.data.List || res.data.List.length == 0) {
                    commonUtil.wx_showModal_back('查无记录')
                } else {
                    res.data.List.map((e) => {
                        //使用网点ID作为地图上点的的ID
                        e.id = e.DeptId

                        //转换地图坐标
                        var location = mapUtil.bd09togcj02(e.Lng, e.Lat)
                        e.longitude = location[0]
                        e.latitude = location[1]
                    })

                    //重新查询后，显示数组需清空
                    that.setData({
                        dept_list_show: [],
                        dept_list_all: res.data.List
                    })

                    //将返回列表的前几个元素加入显示列表中，不显示全部元素
                    commonUtil.addElementIntoArray(that.data.dept_list_all, that.data.dept_list_show_store, that.data.page_element_num)

                    //设置显示列表
                    that.setData({
                        dept_list_show: that.data.dept_list_show_store
                    })
                }
            }
        })
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
    //查看地图
    viewMap: function (e) {
        //将当前点击的网点信息设置到全局变量中
        app.setCurrentDeptInfo(e.currentTarget.dataset.itemdata)

        //跳转到显示单个网点的页面
        wx.redirectTo({
            url: '../map_single/map_single'
        })
    },
    //拨打电话
    callPhone: function (e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.itemdata.Phone
        })
    },
    //马上预约取号
    doBooking: function (e) {

        //将当前点击的网点信息设置到全局变量中
        app.setCurrentDeptInfo(e.currentTarget.dataset.itemdata)

        //跳转到预约页面
        wx.navigateTo({
            url: '../prepare/prepare'
        })
    },
    //页面滑动到了底部的处理
    onReachBottom: function () {
        //将返回列表的前几个元素加入显示列表中
        commonUtil.addElementIntoArray(this.data.dept_list_all, this.data.dept_list_show_store, this.data.page_element_num)

        //设置显示列表
        this.setData({
            dept_list_show: this.data.dept_list_show_store
        })
    }
})