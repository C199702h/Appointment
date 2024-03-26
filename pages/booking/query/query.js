// pages/booking/query/query.js

//引用公共数据
var commonData = require('../../../utils/data.js')

var app = getApp()
Page({
    data: {
        cityList: commonData.getConstantData("city_list"),
        city_index: 0,
        keyWord: ''
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
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
    bindPickerChange: function (e) {
        this.setData({
            city_index: e.detail.value
        })
    },
    bindInputKeyWord: function (e) {
        this.setData({
            keyWord: e.detail.value
        })
    },
    bindBtnTap: function (e) {
        //跳转到列表页面，并指定参数
        wx.redirectTo({
            url: '../list/list?city=' + this.data.cityList[this.data.city_index] + '&keyWord=' + this.data.keyWord
        })
    }
})