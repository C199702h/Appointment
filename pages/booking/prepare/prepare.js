// pages/booking/prepare/prepare.js

//引用公共数据
var commonData = require('../../../utils/data.js')
var commonUtil = require('../../../utils/util.js')

var app = getApp()
Page({
    data: {
        //当前网点信息
        deptInfo: [],
        //客户手机号码
        custPhone: "",
        //客户手机号码（前一次查询的）
        custPhone_old: "",
        //客户选择的业务类型
        custType: "P",
        //业务类型列表，用于显示
        busiTypeList_show: [],
        //业务类型列表，当天
        busiTypeList_store_today: [],
        //业务类型列表，非当天
        busiTypeList_store_after: [],
        //服务日期列表
        deptDateList: [],
        //当前日期
        deptCurrentDate: "",
        //选中日期的下标
        date_index: 0,
        //选中日期的下标
        busiType_index: 0,
        //业务类型picker禁用标志，初始化为禁用
        busiType_disable: true,
        //预约当天标志，初始化为true
        bookingToday: true,
        //客户等级
        custLevel: "",
        //当前选中的日期，非当天时使用
        currentTime: ""
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数

        //初始化时把全局变量中当前选中时间清空
        app.setCurrentTimeInfo("")
    },
    onReady: function () {
        // 页面渲染完成
        //从全局变量获取当前点击的网点信息
        this.setData({
            deptInfo: app.getCurrentDeptInfo()
        })

        //显示页面后，查询当前网点的服务时间与非当天服务列表
        //发送交易查询网点信息
        var that = this

        commonUtil.wx_request_portal({
            url: "ServiceAndDateQry.do",
            data: "DeptId=" + this.data.deptInfo.DeptId,
            page: this,
            success: function (res) {

                //获取返回的当前日期
                var currentDate = res.data.CurrentDate;
                if (!currentDate || !commonUtil.validator(currentDate, "date1")) {
                    commonUtil.wx_showModal_back('返回的当前日期格式错误')
                } else {
                    //处理返回数据

                    //将返回的当前日期加入日期列表中
                    that.data.deptDateList.push(currentDate)

                    //将返回的其他日期加入日期列表中
                    var list2 = res.data.List2
                    if (list2) {
                        var length = list2.length
                        for (var i = 0; i < length; i++) {
                            that.data.deptDateList.push(list2[i].OrderDate)
                        }
                    }

                    //保存日期列表与非当天业务列表
                    that.setData({
                        deptDateList: that.data.deptDateList,
                        busiTypeList_store_after: res.data.List
                    })
                }
            }
        }),
            this.refreshImgToken();
    },
    bindPickerChange_date: function (e) {
        this.setData({
            date_index: e.detail.value
        })
        if (this.data.date_index == 0) {
            //选择的预约日期为当天
            this.setData({bookingToday: true})
        } else {
            //选择的预约日期不是当天
            this.setData({bookingToday: false})
        }
    },
    bindchangeCustType: function (e) {
        //修改办理业务
        this.setData({custType: e.detail.value})
        //将业务类型清空
        this.setData({
            busiTypeList_show: [],
            busiType_index: 0
        })
    },
    bindInputCustPhone: function (e) {
        this.setData({custPhone: e.detail.value})
    },
    bindblur_CustPhone: function (e) {
        //输入手机号input丢失焦点后的处理
        if (commonUtil.validator(this.data.custPhone, "PhoneNumber")) {
            //当输入的手机号符合要求时，启用业务类型picker
            this.setData({busiType_disable: false})
        } else {
            //手机号码不符合要求时，禁用业务类型picker，清空业务类型数据
            this.setData({
                busiTypeList_show: [],
                busiType_index: 0,
                busiType_disable: true
            })
        }
    },
    bindtap_type: function (e) {
        if (this.data.busiType_disable) {
            //当picker禁用时进行提示
            commonUtil.check(this.data.custPhone, 'PhoneNumber')
        } else {
            //查询业务类型数据
            this.queryBusiTypes()
        }
    },
    bindPickerChange_type: function (e) {
        this.setData({
            busiType_index: e.detail.value
        })
    },
    bindTap_commit: function (e) {
        //提交按钮
        if (!commonUtil.check(this.data.custPhone, 'PhoneNumber')) {
            return;
        }
        if (!commonUtil.check(this.data._vTokenName, 'VToken')) {
            return;
        }

        if (this.data.busiTypeList_show.length == 0) {
            commonUtil.wx_showModal('请选择业务类型')
            return
        }

        if (this.data.bookingToday) {
            //预约当天号

            //提交交易
            var that = this

            commonUtil.wx_request_portal({
                url: "RemoteRegister.do",
                // data: "DeptId=" + this.data.deptInfo.DeptId + "&MobilePhoneNo=" + this.data.custPhone + "&ServiceNo=" + this.data.busiTypeList_show[this.data.busiType_index].ServiceNo,
                data: "DeptId=" + this.data.deptInfo.DeptId + "&MobilePhoneNo=" + this.data.custPhone + "&ServiceNo=" + this.data.busiTypeList_show[this.data.busiType_index].ServiceNo + "&_vTokenName=" + this.data._vTokenName + '&SimSessionId=' + that.data.simSessionId,
                page: this,
                success: function (res) {
                    if (res.data.WaitingNum) {
                        //跳转到结果页面
                        wx.redirectTo({
                            url: '../result/result?bookingToday=true&waitNum=' + res.data.WaitingNum
                        })
                    } else {
                        commonUtil.wx_showModal_back('预约失败');
                        that.refreshImgToken();
                    }
                },
                fail: function (res) {
                    that.refreshImgToken();
                },
            })
        } else {

            //预约非当天号
            //提交交易
            var that = this

            commonUtil.wx_request_portal({
                url: "BankOrder.do",
                // data: "DeptId=" + this.data.deptInfo.DeptId + "&MobilePhoneNo=" + this.data.custPhone + "&ServiceNo=" + this.data.busiTypeList_show[this.data.busiType_index].ServiceNo + "&OrderDate=" + this.data.deptDateList[this.data.date_index] + "&OrderTime=" + encodeURI(this.data.currentTime),
                data: "DeptId=" + this.data.deptInfo.DeptId + "&MobilePhoneNo=" + this.data.custPhone + "&ServiceNo=" + this.data.busiTypeList_show[this.data.busiType_index].ServiceNo + "&OrderDate=" + this.data.deptDateList[this.data.date_index] + "&OrderTime=" + encodeURI(this.data.currentTime) + "&_vTokenName=" + this.data._vTokenName + '&SimSessionId=' + that.data.simSessionId,
                page: this,
                success: function (res) {
                    //跳转到结果页面
                    wx.redirectTo({
                        url: '../result/result?bookingToday=false'
                    })
                },
                fail: function (res) {
                    that.refreshImgToken();
                }
            })
        }

    },
    onShow: function () {
        // 页面显示

        //判断全部变量中是否有当前选中时间，若有则显示
        this.setData({currentTime: app.getCurrentTimeInfo()})
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },
    //显示业务类型数据
    queryBusiTypes: function (e) {
        if (this.data.bookingToday) {
            //预约当天号
            this.queryBusiTypes_today()
        } else {
            //预约非当天号
            this.queryBusiTypes_after()
            //显示业务类弄前的统一处理
            this.queryBusiTypes_beforeshow()
        }
    },
    //显示业务类型数据，当天
    queryBusiTypes_today: function (e) {
        //判断手机号是否有变化
        if (!this.data.custPhone_old || this.data.custPhone_old != this.data.custPhone) {
            //手机号有变化，重新查询客户等级

            var that = this

            commonUtil.wx_request_portal({
                url: "CifLevelQry.do",
                data: "MobilePhoneNo=" + that.data.custPhone,
                page: that,
                success: function (res) {
                    that.setData({
                        custPhone_old: that.data.custPhone,
                        custLevel: res.data.ServiceNo
                    })

                    //若当前网点当天业务类型未查询，则查询并保存
                    if (!that.data.busiTypeList_store_today || that.data.busiTypeList_store_today.length == 0) {
                        commonUtil.wx_request_portal({
                            url: "DeptServiceInfoQry.do",
                            data: "DeptId=" + that.data.deptInfo.DeptId,
                            page: that,
                            success: function (res) {
                                that.setData({
                                    busiTypeList_store_today: res.data.List
                                })
                                //查询完毕后过滤业务类型
                                that.busiType_filter_today()
                                //显示业务类弄前的统一处理
                                that.queryBusiTypes_beforeshow()
                            }
                        })
                    } else {
                        //查询完毕后过滤业务类型
                        that.busiType_filter_today()
                        //显示业务类弄前的统一处理
                        that.queryBusiTypes_beforeshow()
                    }
                }
            })
        } else {
            //查询完毕后过滤业务类型
            this.busiType_filter_today()
            //显示业务类弄前的统一处理
            this.queryBusiTypes_beforeshow()
        }
    },
    //显示业务类型数据，非当天
    queryBusiTypes_after: function (e) {
        //先清空现有的显示列表
        this.data.busiTypeList_show = []

        var list = this.data.busiTypeList_store_after

        for (var i in list) {
            if (list[i].CifType == this.data.custType) {
                this.data.busiTypeList_show.push(list[i])
                break;
            }
        }
        this.setData({
            busiTypeList_show: this.data.busiTypeList_show,
            busiType_index: 0
        })
    },
    //业务类型过滤，当天
    busiType_filter_today: function (e) {
        //先清空现有的显示列表
        this.data.busiTypeList_show = []

        //遍历当天的业务类型列表
        var list = this.data.busiTypeList_store_today
        for (var i in list) {
            if (this.data.custLevel == "") {
                //当前客户等级为空，从列表取VipFlag为0的数据
                if (list[i].VipFlag == "0" && list[i].CifType == this.data.custType) {
                    this.data.busiTypeList_show.push(list[i])
                }
            } else {
                //当前客户等级非空，从列表取ServiceNo相同的数据
                if (list[i].ServiceNo == this.data.custLevel && list[i].CifType == this.data.custType) {
                    this.data.busiTypeList_show.push(list[i])
                }
            }
        }
        //根据状态修改显示的文字信息
        var list2 = this.data.busiTypeList_show
        for (var i in list2) {
            if (!list2[i].text_modified) {
                list2[i].ServiceName = list2[i].ServiceName + (list2[i].NumberStatus == "0" ? "(已满号)" : "(可取号)")
                //在ServiceName后面增加文字后，设置标记，防止重复增加
                list2[i].text_modified = true
            }
        }

        this.setData({
            busiTypeList_show: this.data.busiTypeList_show,
            busiType_index: 0
        })
    },
    //显示业务类型前的统一处理
    queryBusiTypes_beforeshow: function (e) {
        if (this.data.busiTypeList_show.length == 0) {
            commonUtil.wx_showModal('当前网点暂无可取号业务')
        }
    },
    //选择预约时间，非当天
    bindtap_time: function (e) {
        if (this.data.busiTypeList_show.length == 0) {
            commonUtil.wx_showModal('请选择业务类型')
            return
        }

        //打开选择时间的页面
        wx.navigateTo({
            url: '../time/time?DeptId=' + this.data.deptInfo.DeptId + '&ServiceNo=' + this.data.busiTypeList_show[this.data.busiType_index].ServiceNo + '&OrderDate=' + this.data.deptDateList[this.data.date_index]
        })
    },
    refreshImgToken: function (e) {
        var that = this;
        commonUtil.wx_request_portal({
            url: 'GenTokenImg.do',
            dataL: 'SimSessionId=' + that.data.simSessionId,
            page: this,
            success: function (res) {
                if (res.data.SimSessionId) {
                    that.setData({'simSessionId': res.data.SimSessionId})
                }
                var imgSrc = res.data.ImgTokenBase64;
                that.setData({'ImgSrc': imgSrc});
                if (!!res.header['Set-Cookie']) {
                    var sc = res.header['Set-Cookie'];
                    wx.setStorageSync('cookie', res.header['Set-Cookie'])
                }

            }
        });
    },
    inputVToken: function (e) {
        this.setData({'_vTokenName': e.detail.value});
    },
    bindblur_VToken: function (e) {
        if (!commonUtil.validator(this.data._vTokenName, 'VToken')) {
            commonUtil.wx_showModal('附加码格式不正确，请重新输入');
        }
    },

})