// pages/booking/map_single/map_single.js

var app = getApp()
Page({
    data: {
        deptInfo: [],
        markers: [],
        screen_height: 0,
        screen_head: 0,
        cur_location: [],
    },
    regionchange(e) {
    },
    markertap(e) {
        //在进入当前页面前，其他页面已将当前点击的网点信息设置到全局变量中，因此本页面不需要设置

        //跳转到预约页面
        wx.redirectTo({
            url: '../prepare/prepare'
        })
    },
    controltap(e) {
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数

        const system = wx.getSystemInfoSync()

        this.setData({
            screen_height: system.windowHeight
        })

        //从全局变量获取当前点击的网点信息
        //网点列表需要为数组
        this.data.deptInfo.push(app.getCurrentDeptInfo())
    },
    onReady: function () {
        // 页面渲染完成
        this.data.deptInfo.map((e) => {
            e.iconPath = "/images/booking/point.png"
            e.width = 32
            e.height = 32
            //使用网点ID作为地图上点的的ID
            e.id = e.DeptId
            e.latitude = e.latitude
            e.longitude = e.longitude
        })
        //设置地图的点，以及当前位置
        this.setData({
            markers: this.data.deptInfo,
            cur_location: [this.data.deptInfo[0].longitude, this.data.deptInfo[0].latitude]
        })

        //设置导航栏文字
        wx.setNavigationBarTitle({
            title: this.data.deptInfo[0].DeptName
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
    }
})