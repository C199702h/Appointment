//app.js
App({
    onLaunch: function () {
        //调用API从本地缓存中获取数据
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        //获取系统屏幕高度
        const system = wx.getSystemInfoSync()
        this.globalData.system_windowHeight = system.windowHeight
    },
    getUserInfo: function (cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function () {
                    wx.getUserInfo({
                        success: function (res) {
                            that.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })
                }
            })
        }
    },
    getCurrentDeptInfo: function () {
        return this.globalData.currentDeptInfo
    },
    setCurrentDeptInfo: function (e) {
        this.globalData.currentDeptInfo = e
    },
    getCurrentTimeInfo: function () {
        return this.globalData.currentTimeInfo
    },
    setCurrentTimeInfo: function (e) {
        this.globalData.currentTimeInfo = e
    },
    getSystem_windowHeight: function (e) {
        return this.globalData.system_windowHeight
    },
    globalData: {
        userInfo: null,

        ///////////////////////////////////////////////////
        //全部变量
        //进入网点的预约页面时，当前选中的网点信息
        currentDeptInfo: [],
        //网点的时间列表返回到预约页面时，当前选中的时间信息
        currentTimeInfo: "",
        //屏幕高度
        system_windowHeight: 0
        ///////////////////////////////////////////////////
    }
})