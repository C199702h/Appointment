//index.js
//获取应用实例
var app = getApp()
Page({
    data: {},
    //事件处理函数
    onLoad: function () {
    },
    onReady: function () {
        //跳转到显示网点地图的页面
        wx.redirectTo({
            url: '../booking/map/map'
        })
    }
})
