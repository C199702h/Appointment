// pages/booking/time/time.js

//引用公共数据
var commonData = require('../../../utils/data.js')
var commonUtil = require('../../../utils/util.js')

var app = getApp()
Page({
    data: {
        DeptId: "",
        ServiceNo: "",
        OrderDate: "",
        time_list: []
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            DeptId: options.DeptId,
            ServiceNo: options.ServiceNo,
            OrderDate: options.OrderDate
        })
    },
    onReady: function () {
        // 页面渲染完成

        //发送交易查询网点服务时间信息
        var that = this

        commonUtil.wx_request_portal({
            url: "TimeSectionsQry.do",
            data: 'DeptId=' + this.data.DeptId + '&ServiceNo=' + this.data.ServiceNo + '&OrderDate=' + this.data.OrderDate,
            page: this,
            success: function (res) {
                if (!res.data.List || res.data.List.length == 0) {
                    commonUtil.wx_showModal_back('未查询到服务时间')
                } else {
                    that.setData({time_list: res.data.List})
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
    //点击每行时间的处理
    bindtap_time: function (e) {
        var timeInfo = e.currentTarget.dataset.timeinfo

        if (timeInfo.AvaiOrderNum == "0") {
            commonUtil.wx_showModal('该时段预约名额已满，请选择其它时段！')
        } else {
            //在全局变量中设置当前选中时间
            app.setCurrentTimeInfo(timeInfo.OrderTime)

            //返回前一页面
            wx.navigateBack({
                delta: 1
            })
        }
    }
})