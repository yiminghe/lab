/*
	Author: http://yiminghe.javaeye.com/blog/379727
	v1.0(20090424) 按照ext DatePicker素材及思想简化重新实现日历选择器，尚未实现：键盘导航，小时分钟选择，
		1.Date api ，某日属于周几，某月有几天
		2.td text-align:center (ie 必须为td 指定宽度才居中)
		3.按照星期构建表格，注意前后月边界问题 
		4.table ie处理问题，需要强制指定用dom操作
		5.colSpan cellSpacing hideFocus (colspan cellspacing ie dom 设置 有问题 ,直接html 属性小写没问题)
	
	v1.5(20090518) 同年月选择处理，添加了时分秒选择,尚未实现：键盘导航
	v1.8(20090620) 整合日期和时间输入,布局调整,添加关联输入框功能
	v2.0(20090723) 国际化支持，支持code配置使用语言，界面优化调整，添加从指定时间开始周计数，否则就1,2,3排序
	v2.0.5(20090804) 添加功能:失去焦点，就隐藏
	v2.0.6(20090901) 31号出错修正
	v2.0.7(20090903) z-index change to 99999
*/
Ext.namespace('Ext.ux');
Ext.ux.CalendarLite = function(config) {

    config = config || {};
    if (!config.id)
    config.id = 'LiteExt_ID' + Ext.id() + '_';

    //周数从第几天开始算
    //config.weekStartDate = config.weekStartDate;
    config.code = config.code || 'cn';

    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    this.addEvents('select', 'week');
    Ext.ux.CalendarLite.superclass.constructor.call(this);


    this.calendarLiteContainer = Ext.DomHelper.append(document.body, {
        tag: 'div',
        cls: 'calendarLite',
        style: 'display:none;'
    });

    var navibar = Ext.DomHelper.append(this.calendarLiteContainer, {
        tag: 'div',
        cls: 'navibar clearfix'
    });

    var prevNavi = Ext.DomHelper.append(navibar, {
        tag: 'a',
        cls: 'leftBtn',
        hideFocus: 'on',
        href: '#'
    },
    true);

    //导航前一月，重新渲染日历
    prevNavi.on('click',
    function(evt) {
        this.naviDate = this.naviDate.add(Date.Lite_ext_MONTH, -1);
        this.loadData(this.naviDate);
        evt.stopEvent();
    },
    this);

    var monthYear = Ext.DomHelper.append(navibar, {
        tag: 'div',
        cls: 'monthYear'
    },
    true);
    if (Ext.isIE6) {
        monthYear.setStyle({
            'margin-left': '35px'
        });
    }

    this.monthYearBtn = Ext.DomHelper.append(monthYear, {
        tag: 'button',
        cls: 'btn-arrow'
    },
    true);



    this.monthYearBtn.on('click',
    function(evt) {
        this.showYearMonthSelector();
        evt.stopEvent();
    },
    this);



    //导航后一月，重新渲染日历
    var nextNavi = Ext.DomHelper.append(navibar, {
        tag: 'a',
        cls: 'rightBtn',
        hideFocus: 'on',
        href: '#'
    },
    true);

    nextNavi.on('click',
    function(evt) {
        this.naviDate = this.naviDate.add(Date.Lite_ext_MONTH, 1);
        this.loadData(this.naviDate);
        evt.stopEvent();
    },
    this);

    var headerDayWeek = [{
        tag: 'th',
        cls: 'weekCell',
        html: '<span>' + Ext.ux.CalendarLite.Language[this.code].week + '</span>'
    }];
    for (var i = 0; i < 7; i++) {
        headerDayWeek.push({
            tag: 'th',
            html: '<span>' + Ext.ux.CalendarLite.getShortDayName(i, this.code) + '</span>'
        });
    }


    var calendarData = Ext.DomHelper.append(this.calendarLiteContainer, {
        tag: 'table',
        cls: 'calendarData',
        cellSpacing: '0',
        cellPadding: '0',
        cn: [
        {
            tag: 'thead',
            cn: [{
                tag: 'tr',
                cn: headerDayWeek
            }
            ]

        }
        ]
    });


    this.body = Ext.DomHelper.append(calendarData, {
        tag: 'tbody'
    },
    true);


    /*
			ie6 鼠标移过高亮
		*/
    if (Ext.isIE6) {

        this.body.on('mouseover',
        function(evt, target) {
            this.body.select('tr').removeClass('trhover');
            Ext.get(target).addClass('trhover');
        },
        this, {
            delegate: 'tr',
            stopEvent: true
            //buffer:250
        });

    }


    //表格单击选中处理
    this.body.on('click', this.dateSelect, this, {
        stopEvent: true
    });

    var tfoot = Ext.DomHelper.append(calendarData, {
        tag: 'tfoot',
        cn: [{
            tag: 'tr',
            cn: [{
                tag: 'td',
                colSpan: '8'
            }]
        }]
    },
    true);


    var tfoottd = tfoot.child("td");

    /*
			是否允许时间选择
		*/
    if (this.enableTime) {
        this.timeBtn = Ext.DomHelper.append(tfoottd,
        {
            tag: 'div',
            cls: 'time-btn-wrap',
            cn: [
            {
                tag: 'button',
                cls: 'time-btn'
            }
            ]
        }
        ,
        true);

        this.timeBtn = this.timeBtn.first();
        this.timeBtn.on('click',
        function(evt) {
            this.showTimeSelector();
            evt.stopEvent();
        },
        this);
    }


    var todayBtn = Ext.DomHelper.append(tfoottd, {
        tag: 'button',
        html: Ext.ux.CalendarLite.Language[this.code].today,
        cls: 'date-btn'
    },
    true);

    var cancelBtn = Ext.DomHelper.append(tfoottd, {
        tag: 'button',
        html: Ext.ux.CalendarLite.Language[this.code].cancel,
        cls: 'date-btn'
    },
    true);


    //今天按钮,返回到当前月
    todayBtn.on('click',
    function(evt) {
        this.resetDate();
        this.loadData(this.today);
        evt.stopEvent();
    },
    this);

    cancelBtn.on('click',
    function(evt) {
        this.hide();
        evt.stopEvent();
    },
    this);


    this.resetDate();

    this.loadData(this.today);

    /***************
		
		选择 年月 时分秒 控件
		
		*****************/
    this.createYearMonthSelector();

    /*
			是否允许时间选择
		*/
    if (this.enableTime) {
        this.createTimeSelector();
    }


};

Ext.ux.CalendarLite.getShortMonthName = function(month, code) {
    return Ext.ux.CalendarLite.Language[code].monthNames[month].substring(0, 3);
};

Ext.ux.CalendarLite.getShortDayName = function(day, code) {
    return Ext.ux.CalendarLite.Language[code].dayNames[day].substring(0, 3);
};

Ext.ux.CalendarLite.Language = {
    'cn': {
        ok: '确定',
        cancel: '取消',
        today: '今天',
        hour: '时',
        minute: '分',
        second: '秒',
        week: '周',
        am: '上午',
        pm: '下午',
        monthNames: [
        "NA",
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月"
        ],

        monthNumbers: {
            "一月": 1,
            "二月": 2,
            "三月": 3,
            "四月": 4,
            "五月": 5,
            "六月": 6,
            "七月": 7,
            "八月": 8,
            "九月": 9,
            "十月": 10,
            "十一月": 11,
            "十二月": 12
        },

        dayNames: [
        "日",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六"
        ]
    },
    'en': {
        ok: 'OK',
        cancel: 'Cancel',
        today: 'Today',
        hour: 'h',
        minute: 'm',
        second: 's',
        week: 'Wk',
        am: 'AM',
        pm: 'PM',
        monthNames: [
        "NA",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
        ],
        monthNumbers: {
            Jan: 1,
            Feb: 2,
            Mar: 3,
            Apr: 4,
            May: 5,
            Jun: 6,
            Jul: 7,
            Aug: 8,
            Sep: 9,
            Oct: 10,
            Nov: 11,
            Dec: 12
        },
        dayNames: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
        ]
    }
};



Ext.extend(Ext.ux.CalendarLite, Ext.util.Observable, {

    //所有内部事件更新到当前最新时间
    resetDate: function() {
        //当前日期
        this.today = new Date();
        //导航月
        this.naviDate = this.today.clone();
    },

    //建立年月选择
    createYearMonthSelector: function() {
        this.yearMonthSelector = Ext.DomHelper.append(document.body, {
            tag: 'div',
            cls: 'yearMonthSelector',
            style: 'left:-9999px;top:-9999px;'
        });

        var yearMonthSelectorTable = Ext.DomHelper.append(this.yearMonthSelector, {
            tag: 'table',
            cellSpacing: "0",
            cellPadding: "0",
            border: "0",
            cls: 'yearMonthSelectorTable'
        });

        var trs = [];
        var tr = [];
        tr.push({
            tag: 'td',
            cls: 'date-mp-month',
            html: '<a href="#" hideFocus="on"> ' + Ext.ux.CalendarLite.getShortMonthName(1, this.code) + ' </a>'

        });

        tr.push({
            tag: 'td',
            cls: 'date-mp-month date-mp-sep',
            html: '<a href="#" hideFocus="on"> ' + Ext.ux.CalendarLite.getShortMonthName(2, this.code) + ' </a>'

        });

        tr.push({
            tag: 'td',
            cls: 'date-mp-ybtn',
            html: '<a class="date-mp-prev" id="' + this.id + '_mpPrev' + '" hideFocus="on"></a>'

        });

        tr.push({
            tag: 'td',
            cls: 'date-mp-ybtn',

            html: '<a class="date-mp-next" id="' + this.id + '_mpNext' + '" hideFocus="on"></a>'

        });



        var trs = [];
        trs.push({
            tag: 'tr',
            cn: tr
        });

        //保存当前的年月，用于年月选择导航
        //导航年月
        this.yearMonthNavi = this.naviDate.clone();
        var startMonth = 3;
        var startYear = this.yearMonthNavi.getFullYear() - 5;

        //已选择的年月保存
        this.selectedYear = this.yearMonthNavi.getFullYear();
        this.selectedMonth = this.yearMonthNavi.getMonth() + 1;

        for (var i = 0; i < 5; i++) {
            tr = [];
            tr.push({
                tag: 'td',
                cls: 'date-mp-month',
                html: '<a href="#" hideFocus="on"> ' + Ext.ux.CalendarLite.getShortMonthName(startMonth++, this.code) + '</a>'

            });

            tr.push({
                tag: 'td',
                cls: 'date-mp-month date-mp-sep',
                html: '<a href="#" hideFocus="on"> ' + Ext.ux.CalendarLite.getShortMonthName(startMonth++, this.code) + '</a>'

            });

            tr.push({
                tag: 'td',
                cls: 'date-mp-year',
                html: '<a href="#" hideFocus="on"> ' + (startYear++) + '</a>'

            });

            tr.push({
                tag: 'td',
                cls: 'date-mp-year',
                html: '<a href="#" hideFocus="on"> ' + (startYear++) + '</a>'

            });
            trs.push({
                tag: 'tr',
                cn: tr
            });

        }


        this.yearMonthSelectorBody = Ext.DomHelper.append(yearMonthSelectorTable, {
            tag: 'tbody',
            cn: trs
        },
        true);


        var yearMonthSelectortfoot = Ext.DomHelper.append(yearMonthSelectorTable, {
            tag: 'tfoot',
            cn: [{
                tag: 'tr',
                cn: [{
                    tag: 'td',
                    colSpan: '4'
                }]
            }]
        },
        true);


        var yearMonthSelectortfoottd = yearMonthSelectortfoot.child('td');

        var yearMonthSelectorOkBtn = Ext.DomHelper.append(yearMonthSelectortfoottd, {
            tag: 'button',
            html: Ext.ux.CalendarLite.Language[this.code].ok,
            cls: 'date-btn'
        },
        true);


        //年月确定选择
        yearMonthSelectorOkBtn.on('click',
        function(evt) {
            //更新导航年月，并重新渲染导航日历
            this.naviDate.setFullYear(this.selectedYear);
            this.naviDate.setMonth(this.selectedMonth - 1);
            this.loadData(this.naviDate);
            this.hideYearMonthSelector();
            evt.stopEvent();
        },
        this);

        var yearMonthSelectorCancelBtn = Ext.DomHelper.append(yearMonthSelectortfoottd, {
            tag: 'button',
            html: Ext.ux.CalendarLite.Language[this.code].cancel,
            cls: 'date-btn'
        },
        true);

        yearMonthSelectorCancelBtn.on('click',
        function(evt) {
            this.hideYearMonthSelector();
            evt.stopEvent();
        },
        this);


        this.loadYearMonthData(this.yearMonthNavi);

        //导航年月
        Ext.get(this.id + '_mpPrev').on('click',
        function(evt) {
            this.yearMonthNavi = this.yearMonthNavi.add(Date.Lite_ext_YEAR, -10);
            this.loadYearMonthData(this.yearMonthNavi);
            evt.stopEvent();

        },
        this);
        Ext.get(this.id + '_mpNext').on('click',
        function(evt) {
            this.yearMonthNavi = this.yearMonthNavi.add(Date.Lite_ext_YEAR, 10);
            this.loadYearMonthData(this.yearMonthNavi);
            evt.stopEvent();
        },
        this);

        //年月选择
        this.yearMonthSelectorBody.on('click', this.yearMonthSelect, this, {
            stopEvent: true
        });
    },

    //建立时间选择器
    createTimeSelector: function() {
        var timeTrs = [];
        timeTrs.push({
            tag: 'tr',
            cn: [
            {
                tag: 'td',
                cls: 'date-mp-ybtn',
                html: '<a class="date-mp-prev" id="' + this.id + 'time_mpPrev' + '" hideFocus="on"></a>'
            },
            {
                tag: 'td',
                cls: 'date-mp-ybtn',
                html: '<a class="date-mp-next" id="' + this.id + 'time_mpNext' + '" hideFocus="on"></a>'

            },
            {
                tag: 'td',
                cls: 'date-mp-ybtn',
                html: '<a class="date-mp-prev" id="' + this.id + 'time_mpPrev' + '" hideFocus="on"></a>'
            },
            {
                tag: 'td',
                cls: 'date-mp-ybtn',
                html: '<a class="date-mp-next" id="' + this.id + 'time_mpNext' + '" hideFocus="on"></a>'

            }
            ]
        });
        for (var i = 0; i < 12; i += 2) {
            var timeTr = [];
            timeTr.push({
                tag: 'td',
                cls: 'date-mp-minute',
                html: '<a href="#" hideFocus="on"> ' + (i) + Ext.ux.CalendarLite.Language[this.code].minute + ' </a>'

            });

            timeTr.push({
                tag: 'td',
                cls: 'date-mp-minute date-mp-sep',
                html: '<a href="#" hideFocus="on"> ' + (i + 1) + Ext.ux.CalendarLite.Language[this.code].minute + ' </a>'

            });

            timeTr.push({
                tag: 'td',
                cls: 'date-mp-second',
                html: '<a href="#" hideFocus="on"> ' + (i) + Ext.ux.CalendarLite.Language[this.code].second + ' </a>'

            });

            timeTr.push({
                tag: 'td',
                cls: 'date-mp-second',
                html: '<a href="#" hideFocus="on"> ' + (i + 1) + Ext.ux.CalendarLite.Language[this.code].second + ' </a>'

            });
            timeTrs.push({
                tag: 'tr',
                cn: timeTr
            });
        }

        timeTrs.push({
            tag: 'tfoot',
            cn: [{
                tag: 'tr',
                cn: [
                {
                    tag: 'td',

                    cn: [
                    {
                        tag: 'select'

                    }
                    ]
                },
                {
                    tag: 'td',

                    cn: [
                    {
                        tag: 'select'

                    }
                    ]
                },
                {
                    tag: 'td',

                    cn: [
                    {
                        tag: 'button',
                        html: Ext.ux.CalendarLite.Language[this.code].ok,
                        cls: 'date-btn'
                    }
                    ]
                },
                {
                    tag: 'td',

                    cn: [

                    {
                        tag: 'button',
                        html: Ext.ux.CalendarLite.Language[this.code].cancel,
                        cls: 'date-btn'
                    }
                    ]
                }
                ]

            }]

        });

        this.timeSelector = Ext.DomHelper.append(document.body, {
            tag: 'div',
            cls: 'yearMonthSelector',
            style: 'left:-9999px;top:-9999px;',
            cn: [
            {
                tag: 'table',
                cellSpacing: "0",
                border: "0",
                cls: 'yearMonthSelectorTable',
                cn: [
                {
                    tag: 'tbody',
                    cn: timeTrs
                }
                ]
            }
            ]
        },
        true);


        var minutePre = this.timeSelector.select('a').item(0);
        var minuteNext = this.timeSelector.select('a').item(1);
        var secondPre = this.timeSelector.select('a').item(2);
        var secondNext = this.timeSelector.select('a').item(3);
        var buttonOk = this.timeSelector.select('button').item(0);
        var buttonCancel = this.timeSelector.select('button').item(1);

        buttonOk.on('click',
        function() {
            //更新时间，并重新渲染导航日历
            this.naviDate.setHours(Number(this.hourMode.dom.value == 1 ?

            ((Number(this.hourSelector.dom.value) + 12) == 24 ? 0: (Number(this.hourSelector.dom.value) + 12))
            :
            this.hourSelector.dom.value

            ), Number(this.selectedMinute), Number(this.selectedSecond));
            this.timeBtn.update(this.naviDate.getHours() + ":" + this.naviDate.getMinutes() + ":" + this.naviDate.getSeconds());
            this.hideTimeSelector();
        },
        this, {
            stopEvent: true
        });

        buttonCancel.on('click',
        function() {
            this.hideTimeSelector();
        },
        this, {
            stopEvent: true
        });

        //处在第几个12间隔，从0开始
        this.currentMinute = 0;
        this.currentSecond = 0;

        minutePre.on('click',
        function(evt) {
            this.currentMinute = this.currentMinute > 0 ? this.currentMinute - 1: this.currentMinute;
            this.loadTimeData(this.currentMinute * 12, this.currentSecond * 12, true);
            evt.stopEvent();
        },
        this);
        minuteNext.on('click',
        function(evt) {
            this.currentMinute = this.currentMinute < 4 ? this.currentMinute + 1: this.currentMinute;
            this.loadTimeData(this.currentMinute * 12, this.currentSecond * 12, true);
            evt.stopEvent();
        },
        this);

        secondPre.on('click',
        function(evt) {
            this.currentSecond = this.currentSecond > 0 ? this.currentSecond - 1: this.currentSecond;
            this.loadTimeData(this.currentMinute * 12, this.currentSecond * 12, true);
            evt.stopEvent();
        },
        this);
        secondNext.on('click',
        function(evt) {
            this.currentSecond = this.currentSecond < 4 ? this.currentSecond + 1: this.currentSecond;
            this.loadTimeData(this.currentMinute * 12, this.currentSecond * 12, true);
            evt.stopEvent();
        },
        this);

        this.hourSelector = this.timeSelector.select('select').item(1);
        Ext.DomHelper.useDom = true;
        for (var i = 1; i <= 12; i++) {
            Ext.DomHelper.append(this.hourSelector, {
                tag: 'option',
                value: i,
                html: i + " " + Ext.ux.CalendarLite.Language[this.code].hour
            });
        }
        this.hourMode = this.timeSelector.select('select').item(0);
        Ext.DomHelper.append(this.hourMode, {
            tag: 'option',
            value: 0,
            html: Ext.ux.CalendarLite.Language[this.code].am
        });
        Ext.DomHelper.append(this.hourMode, {
            tag: 'option',
            value: 1,
            html: Ext.ux.CalendarLite.Language[this.code].pm
        });
        Ext.DomHelper.useDom = false;
        //年月选择
        this.timeSelector.on('click', this.timeSelect, this, {
            stopEvent: true
        });
    },


    //年月选择器
    yearMonthSelect: function(evt) {
        var target = evt.getTarget('td');
        if (target) {
            target = Ext.fly(target);
            if (target.hasClass('date-mp-year')) {
                this.yearMonthSelectorBody.select('.date-mp-year').removeClass('date-mp-sel');
                this.selectedYear = target.first().dom.innerHTML.trim();
                target.addClass('date-mp-sel');
            } else if (target.hasClass('date-mp-month')) {
                this.yearMonthSelectorBody.select('.date-mp-month').removeClass('date-mp-sel');
                this.selectedMonth = Ext.ux.CalendarLite.Language[this.code].monthNumbers[target.first().dom.innerHTML.trim()];

                target.addClass('date-mp-sel');
            }
        }
        evt.stopEvent();
    },

    //点分选择器
    timeSelect: function(evt) {
        var target = evt.getTarget('td');
        if (target) {
            target = Ext.fly(target);
            if (target.hasClass('date-mp-minute')) {
                this.timeSelector.select('.date-mp-minute').removeClass('date-mp-sel');
                this.selectedMinute = target.first().dom.innerHTML.trim().replace(Ext.ux.CalendarLite.Language[this.code].minute, '');
                target.addClass('date-mp-sel');
            } else if (target.hasClass('date-mp-second')) {
                this.timeSelector.select('.date-mp-second').removeClass('date-mp-sel');
                this.selectedSecond = target.first().dom.innerHTML.trim().replace(Ext.ux.CalendarLite.Language[this.code].second, '');
                target.addClass('date-mp-sel');
            }
        }
        evt.stopEvent();
    },


    //选择了日历的某个日期
    dateSelect: function(evt) {
        this.body.select('td').removeClass('date-selected');
        var td = Ext.fly(evt.getTarget('td', 2));
        //选择周
        if (td && td.hasClass('weekCell')) {
            this.fireEvent('week', td.first().dom.innerHTML, this._currentInput);
            return;
        }

        //选择日期
        if (td) {
            td.addClass('date-selected');
            var noThisMonth = false;
            if (td.hasClass('prevday')) {
                this.naviDate = this.naviDate.add(Date.Lite_ext_MONTH, -1);
                noThisMonth = true;
            }
            if (td.hasClass('nextday')) {
                this.naviDate = this.naviDate.add(Date.Lite_ext_MONTH, 1);
                noThisMonth = true;
            }
            this.naviDate.setDate(td.first().dom.innerHTML);
            //不是当前月就载入那个月数据
            if (noThisMonth) this.loadData(this.naviDate);
            this.fireEvent('select', this.naviDate.clone(), this._currentInput);
        }

    },


    //显示 导航年月选择器
    showYearMonthSelector: function() {
        //保存当前的年月，用于年月选择导航
        this.yearMonthNavi = this.naviDate.clone();
        var startMonth = 3;
        var startYear = this.yearMonthNavi.getFullYear() - 5;
        //已选择的年月保存
        this.selectedYear = this.yearMonthNavi.getFullYear();
        this.selectedMonth = this.yearMonthNavi.getMonth() + 1;
        this.loadYearMonthData(this.yearMonthNavi);
        Ext.get(this.yearMonthSelector).setXY(Ext.get(this.calendarLiteContainer).getXY());
        Ext.get(this.yearMonthSelector).slideIn('t', {
            duration: .2
        });
    },



    //显示 时间分钟选择器
    showTimeSelector: function() {
        //保存当前的时间分钟，用于时间分钟选择导航		
        //已选择的年月保存
        this.selectedHour = this.naviDate.getHours() || 24;
        this.selectedMinute = this.naviDate.getMinutes();
        this.selectedSecond = this.naviDate.getSeconds();

        this.currentMinute = Math.floor((this.selectedMinute) / 12);
        this.currentSecond = Math.floor((this.selectedSecond) / 12);
        this.loadTimeData(this.currentMinute * 12, this.currentSecond * 12);
        this.timeSelector.setXY(Ext.get(this.calendarLiteContainer).getXY());
        this.timeSelector.slideIn('t', {
            duration: .2
        });
    },

    loadTimeData: function(startMinute, startSecond, keepHour) {
        var startMinute = startMinute || 0;
        var startSecond = startSecond || 0;



        var naviMinute = (this.selectedMinute) + Ext.ux.CalendarLite.Language[this.code].minute;
        var naviSecond = (this.selectedSecond) + Ext.ux.CalendarLite.Language[this.code].second;
        //是否在分秒选择界面直接更新，不用更新小时下拉列表	
        if (!keepHour) {
            this.hourSelector.dom.value = this.selectedHour > 12 ? this.selectedHour - 12: this.selectedHour;
            this.hourMode.dom.value = this.selectedHour > 12 ? 1: 0;
        }
        var me = this;
        this.timeSelector.select('.date-mp-minute a').each(function(el) {
            el.setStyle({
                padding: "5px 0"
            });
            el.update((startMinute++) + Ext.ux.CalendarLite.Language[me.code].minute);
            if (el.dom.innerHTML.trim() == naviMinute) el.parent().addClass('date-mp-sel');
            else el.parent().removeClass('date-mp-sel');
        });

        this.timeSelector.select('.date-mp-second a').each(function(el) {
            el.setStyle({
                padding: "5px 0"
            });
            el.update((startSecond++) + Ext.ux.CalendarLite.Language[me.code].second);
            if (el.dom.innerHTML.trim() == naviSecond) el.parent().addClass('date-mp-sel');
            else el.parent().removeClass('date-mp-sel');
        });
    },



    hideYearMonthSelector: function() {
        if (this.yearMonthSelector)
        Ext.get(this.yearMonthSelector).slideOut('t', {
            duration: .2,
            callback: function() {
                Ext.get(this.yearMonthSelector).setLocation( - 9999, -9999);
            }
            ,
            scope: this
        });
    },


    hideTimeSelector: function() {
        if (this.timeSelector)
        this.timeSelector.slideOut('t', {
            duration: .2,
            callback: function() {
                Ext.get(this.timeSelector).setLocation( - 9999, -9999);
            }
            ,
            scope: this
        });
    },


    //载入 当前导航年 的 前后五年
    loadYearMonthData: function(navi) {
        var startYear = navi.getFullYear() - 5;
        var naviYear = this.selectedYear;
        var naviMonth = Ext.ux.CalendarLite.getShortMonthName(this.selectedMonth, this.code);

        this.yearMonthSelectorBody.select('.date-mp-year a').each(function(el) {
            el.update((startYear++));
            if (el.dom.innerHTML.trim() == naviYear) el.parent().addClass('date-mp-sel');
            else el.parent().removeClass('date-mp-sel');
        });
        this.yearMonthSelectorBody.select('.date-mp-month a').each(function(el) {
            if (el.dom.innerHTML.trim() == naviMonth) el.parent().addClass('date-mp-sel');
            else el.parent().removeClass('date-mp-sel');
        });
    },



    //选择当前月的某一天
    selectDate: function(date) {
        this.body.select('td').removeClass('date-selected');
        this.body.select('td').each(function(el) {
            //统一处理，按钮排除掉
            if (el.hasClass('prevday') || el.hasClass('nextday')) return;
            if (el.first().dom.innerHTML == date) {
                el.addClass('date-selected');
            }
        });
    },

    getElapsedWeek: function(start, end) {
        return Math.floor((end.getTime() - start.getTime()) / (7 * 1000 * 60 * 60 * 24));
    },

    //载入当前月日历，并选中指定日期，如果是今月，高亮今天
    loadData: function(currentMonthDate) {
        this.monthYearBtn.update(Ext.ux.CalendarLite.Language[this.code].monthNames[currentMonthDate.getMonth() + 1] + "  " + (currentMonthDate.getFullYear()));
        if (this.timeBtn) this.timeBtn.update(currentMonthDate.getHours() + ":" + currentMonthDate.getMinutes() + ":" + currentMonthDate.getSeconds());
        //当月几天？
        var days = currentMonthDate.getDaysInMonth();

        //当月第一天日期
        var firstOfMonth = currentMonthDate.getFirstDateOfMonth();
        //当月第一天是星期几 ，周日为0，周六为6
        var startingPos = firstOfMonth.getDay();
        //第一天就是周日，多显示上月一周
        if (startingPos == 0) startingPos = 7;
        //前一个月的相应日期
        var pm = currentMonthDate.add(Date.Lite_ext_MONTH, -1);
        //和当前月第一天同一星期的上个月日期,或多显示一周过度
        var prevStart = pm.getDaysInMonth() - startingPos;
        //日历当前表格的所有行数据
        var trs = [];
        //当前处理行
        var tr = {
            tag: 'tr',
            cn: []
        };
        //用于计算 是否一个星期结束了
        //结束则 i%7==0
        var i = 0;


        pm.setDate(prevStart + 1);

        var startWeek = 1;

        //开始周数,从指定日期开始
        if (this.weekStartDate)
        startWeek = this.getElapsedWeek(this.weekStartDate, pm);


        //每月显示的星期数
        var totalWeek = 1;

        //周数
        tr.cn.push({
            tag: 'td',
            cls: 'weekCell',
            cn: [
            {
                tag: 'a',
                href: '#',
                hideFocus: 'on',
                html: '' + startWeek++
            }
            ]
        });


        //和当前月第一天同一星期的上个月日期 放入当前行
        for (; i < startingPos; i++) {
            tr.cn.push({
                tag: 'td',
                cls: 'prevday',
                cn: [
                {
                    tag: 'a',
                    href: '#',
                    hideFocus: 'on',
                    html: ++prevStart
                }
                ]
            });
        }


        //当前月的日期
        var current = 1;
        var inThisMonth = (currentMonthDate.getFullYear() == this.today.getFullYear() && currentMonthDate.getMonth() == this.today.getMonth());
        //当前月的处理，每周新开一行					
        while (current <= days) {
            //新的一周开始了
            if (i % 7 == 0) {
                totalWeek++;
                trs.push(tr);
                tr = {
                    tag: 'tr',
                    cn: []
                };
                //周数
                tr.cn.push({
                    tag: 'td',
                    cls: 'weekCell',
                    cn: [
                    {
                        tag: 'a',
                        href: '#',
                        hideFocus: 'on',
                        html: '' + startWeek++
                    }
                    ]
                });
            }
            var todayCls = '';
            //是否今天
            if (inThisMonth && current == this.today.getDate())
            todayCls = 'date-today';
            //放入当前周
            tr.cn.push({
                tag: 'td',
                cls: todayCls,
                cn: [
                {
                    tag: 'a',
                    href: '#',
                    hideFocus: 'on',
                    html: current++
                }
                ]
            });
            ++i;
        }
        //恰好上月结束完整一周
        if (i % 7 == 0) {
            totalWeek++;
            trs.push(tr);
            tr = {
                tag: 'tr',
                cn: []
            };
            //周数
            tr.cn.push({
                tag: 'td',
                cls: 'weekCell',
                cn: [
                {
                    tag: 'a',
                    href: '#',
                    hideFocus: 'on',
                    html: '' + startWeek++
                }
                ]
            });
        }
        //下月多显示一下或者和本月最后一天同一周的下月日期显示
        var nextShow = 7 - i % 7;
        for (var i = 1; i <= nextShow; i++) {
            tr.cn.push({
                tag: 'td',
                cls: 'nextday',
                cn: [
                {
                    tag: 'a',
                    href: '#',
                    hideFocus: 'on',
                    html: i
                }
                ]
            });
        }
        trs.push(tr);

        //必须选定5周，防止翻月页面闪动
        if (totalWeek < 6) {

            tr = {
                tag: 'tr',
                cn: []
            };
            //周数
            tr.cn.push({
                tag: 'td',
                cls: 'weekCell',
                cn: [
                {
                    tag: 'a',
                    href: '#',
                    hideFocus: 'on',
                    html: '' + startWeek++
                }
                ]
            });
            for (var i = 0; i < 7; i++) {

                tr.cn.push({
                    tag: 'td',
                    cls: 'nextday',
                    cn: [
                    {
                        tag: 'a',
                        href: '#',
                        hideFocus: 'on',
                        html: ++nextShow
                    }
                    ]
                });

            }

            trs.push(tr);

        }


        /**
				所有周（行）数据渲染到表格
			**/
        if (Ext.isIE) {
            while (this.body.dom.firstChild) {
                Ext.fly(this.body.dom.firstChild).remove();
            }
            //ie 只能一个一个得加 3.0 !!!
            for (var i = 0; i < trs.length; i++)
            Ext.DomHelper.append(this.body, trs[i]);
        } else {
            Ext.DomHelper.overwrite(this.body, trs);
        }

        this.selectDate(currentMonthDate.getDate());
    },

    show: function(x, y) {
        //关联到input输入框
        if (arguments.length == 1) {
            this._currentInput = Ext.get(arguments[0]);
            if (!this._currentInput) return;
            var xy = this._currentInput.getXY();
            x = xy[0];
            y = xy[1] + this._currentInput.getHeight();
        }
        this.calendarLiteContainer.style.display = 'block';
        Ext.get(this.calendarLiteContainer).setLocation(x, y);


        /*
			失去焦点，就隐藏
		*/
        Ext.getDoc().on('mousedown', this._checkHide, this);

    },

    _checkHide: function(evt, t) {
        if (t.id == this.calendarLiteContainer.id || evt.within(this.calendarLiteContainer)
        || (this.yearMonthSelector && evt.within(this.yearMonthSelector))
        || (this.timeSelector && evt.within(this.timeSelector))
        ) {
            } else {
            this.hide();
        }
    },

    hide: function() {
        this.hideYearMonthSelector();
        this.hideTimeSelector();
        this.calendarLiteContainer.style.display = 'none';
        this._currentInput = null;
        Ext.getDoc().un('mousedown', this._checkHide, this);
    }
});

 (function() {

    Ext.apply(Date, {
        Lite_ext_y2kYear: 50,
        Lite_ext_MILLI: "ms",
        Lite_ext_SECOND: "s",
        Lite_ext_MINUTE: "mi",
        Lite_ext_HOUR: "h",
        Lite_ext_DAY: "d",
        Lite_ext_MONTH: "mo",
        Lite_ext_YEAR: "y"
    });
    Ext.applyIf(Date.prototype, {
        add: function(interval, value) {
            var d = this.clone();
            if (!interval || value === 0) return d;

            switch (interval.toLowerCase()) {
            case Date.Lite_ext_MILLI:
                d.setMilliseconds(this.getMilliseconds() + value);
                break;
            case Date.Lite_ext_SECOND:
                d.setSeconds(this.getSeconds() + value);
                break;
            case Date.Lite_ext_MINUTE:
                d.setMinutes(this.getMinutes() + value);
                break;
            case Date.Lite_ext_HOUR:
                d.setHours(this.getHours() + value);
                break;
            case Date.Lite_ext_DAY:
                d.setDate(this.getDate() + value);
                break;
            case Date.Lite_ext_MONTH:
                var day = this.getDate();
                if (day > 28) {
                    day = Math.min(day, this.getFirstDateOfMonth().add('mo', value).getLastDateOfMonth().getDate());
                }
                d.setDate(day);
                d.setMonth(this.getMonth() + value);
                break;
            case Date.Lite_ext_YEAR:
                d.setFullYear(this.getFullYear() + value);
                break;
            }
            return d;
        },
        clone: function() {
            return new Date(this.getTime());
        },
        isLeapYear: function() {
            var year = this.getFullYear();
            return !! ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
        },
        getFirstDateOfMonth: function() {
            return new Date(this.getFullYear(), this.getMonth(), 1);
        },
        getLastDateOfMonth: function() {
            return new Date(this.getFullYear(), this.getMonth(), this.getDaysInMonth());
        },
        getDaysInMonth: function() {
            var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            return function() {
                // return a closure for efficiency
                var m = this.getMonth();

                return m == 1 && this.isLeapYear() ? 29: daysInMonth[m];
            }
        } ()
    });
})();