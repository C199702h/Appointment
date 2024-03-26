// pages/booking/result/result.js

Page({
    data: {
        bookingToday: false,
        waitNum: 0
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            bookingToday: options.bookingToday == 'true' ? true : false,
            waitNum: options.waitNum
        })
    },
    onReady: function () {
        // 页面渲染完成
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
    //返回首页
    bindTap_back: function (e) {
        wx.redirectTo({
            url: '../map/map'
        })
    }
})