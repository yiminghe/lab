/**
 创建一个事件时间线
 @author yiminghe@gmail.com(承玉)
 @param cfg{Object} 配置函数
 {
 container:容器 div ,注意设置宽度高度
 filterEl:过滤事件的的输入框
 highlightEl:高亮事件的输入框
 jsonData:事件配置 json
 }
 */
function createTimeline(cfg) {
    if (!document.getElementById("timeline_style")) {
        //跨浏览器动态添加css    		
        var node = document.createElement("style");
        node.type = 'text/css';
        node.setAttribute("id", "timeline_style");
        var styleStr = ".tape-alarm-task,.small-alarm-task {" + "background:red;" + "	}\n" + ".tape-plan-task,.small-plan-task {" + "background:green;" + "	}\n" + ".timeline-event-bubble-time {" + "	display:none;" + "}\n";
        var head = document.getElementsByTagName("head")[0];
        if (node.styleSheet) {
            node.styleSheet.cssText = styleStr;
        } else {
            node.appendChild(document.createTextNode(styleStr));
        }
        head.appendChild(node);
    }
    var input = cfg.jsonData,
        container = document.getElementById(cfg.container),
        filterEl = document.getElementById(cfg.filterEl),
        highlightEl = document.getElementById(cfg.highlightEl),
        resizeTimerID = null,
        tl = null,
        jsonForTimeline = [],
        simpleAdd = document.addEventListener ?
    function (el, type, fn) {
        if (el.addEventListener) {
            el.addEventListener(type, fn, false);
        }
    } : function (el, type, fn) {
        if (el.attachEvent) {
            el.attachEvent('on' + type, fn);
        }
    }
    //已完成项目 进展中项目  将要开始项目
    ,
    OVER = "已完成",
    NOT_OVER = "未完成",
    ALARm = "报警中",
    PLAN_START_TIME = "计划开始时间",
    PLAN_FINISH_TIME = "计划结束时间",
    ACTUAL_START_TIME = "实际开始时间",
    ACTUAL_FINISH_TIME = "实际结束时间",
    TASK_AMOUNT = "任务数",
    PM = "PM",
    SPACE = "<span style='padding:10px;'></span>",
    BR = "<br/>",
    VIEW_PROJECT_STATUS = "[查看项目状态]",
    PROJECT_MEMBERS = "项目成员",
    dataRe = /(\d+)-(\d+)-(\d+)/,
    trimRe = /^\s+|\s+$/g;

    function onResize() {
        if (resizeTimerID == null) {
            resizeTimerID = window.setTimeout(function () {
                resizeTimerID = null;
                //tl.layout();
            },
            500);
        }
    }
    simpleAdd(window, "resize", onResize);
    function toDate(str) {
        var m = str.match(dataRe);
        if (m) {
        		//标准时间与本地时间差异
            return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]), -(new Date().getTimezoneOffset()/60), 0, 0, 0);
        }
        return null;
    }

    function trim(str) {
        return str.replace(trimRe, "");
    }

    function empty(str) {
        return str ? str : "";
    }

    function transform(input) {
        var jsonForTimeline = [];
        for (var i = input.length - 1; i >= 0; i--) {
            var _input = input[i];
            var descrip = "<div style='width:450px;'>";
            descrip += PLAN_START_TIME + " : " + empty(_input.plan_start_date) + SPACE + SPACE;
            descrip += PLAN_FINISH_TIME + " : " + empty(_input.plan_finish_date) + BR;
            descrip += ACTUAL_START_TIME + " : " + empty(_input.actual_start_date) + SPACE + SPACE;
            descrip += ACTUAL_FINISH_TIME + " : " + empty(_input.actual_finish_date) + BR;
            descrip += TASK_AMOUNT + " : " + empty(_input.completed_task_amount) + "/" + empty(_input.task_total) + SPACE + SPACE;
            descrip += PM + " : " + empty(_input.pm_displayname) + SPACE + SPACE;
            descrip += PROJECT_MEMBERS + " : " + empty(_input.master_ued) + BR + BR;
            descrip += "<a href='" + empty(_input.project_detail_url) + "' target='_blank'>" + VIEW_PROJECT_STATUS + " </a>";
            descrip += "</div>";
            var project_status_name = _input.project_status_name;
            var plan_finish_date = toDate(_input.plan_finish_date);
            var actual_start_date = toDate(_input.actual_start_date);
            var actual_finish_date = toDate(_input.actual_finish_date);
            var plan_start_date = toDate(_input.plan_start_date);
            var current_date = toDate(_input.current_date);
            var j = {
                description: descrip
            };
            j.title = _input.business_line + " - " + _input.project_name;
            if ("plan_work_hours" in _input && "intensity" in _input && _input.plan_work_hours / _input.intensity <= 2) {
                j.durationEvent = false;
                j.start = actual_start_date || plan_start_date;
                if (!j.start) continue;
            } else {
                j.durationEvent = true;
                //已完成
                if (project_status_name.indexOf(OVER) != -1) {
                    //未安排的计划不显示
                    j.latestStart = actual_finish_date;
                    j.start = actual_start_date;
                    j.end = j.latestStart;
                } else if (project_status_name.indexOf(NOT_OVER) != -1) {
                    //将要开始
                    if (plan_start_date.getTime() > current_date.getTime()) {
                        j.start = plan_start_date;
                        j.end = plan_finish_date;
                        j.classname = "plan-task";
                    }
                    //进展中
                    else {
                        j.start = actual_start_date;
                        j.end = plan_finish_date;
                    }
                }
                //例外情况不画图
                //1.没有安排计划
                if (!j.start || !j.end) continue;
                //2.数据错误
                if (j.start.getTime() > j.end.getTime()) continue;
            }
            if (project_status_name.indexOf(ALARm) != -1) {
                j.classname = "alarm-task";
            }
            jsonForTimeline.push(j);
        }
        return jsonForTimeline;
    }
    jsonForTimeline = transform(input);
    //console.dir(input);
    //console.dir(jsonForTimeline);
    var eventSource = new Timeline.DefaultEventSource(),
        theme = Timeline.ClassicTheme.create();
    theme.event.bubble.width = 450;
    var base=new Date(2010,1,1);
    var bandInfos = [
    Timeline.createBandInfo({
        eventSource: eventSource,
        date:base,
        width: "70%",
        theme: theme,
        intervalUnit: Timeline.DateTime.DAY,
        intervalPixels: 100
    }), Timeline.createBandInfo({
        overview: true,
        date:base,
        eventSource: eventSource,
        width: "20%",
        theme: theme,
        intervalUnit: Timeline.DateTime.MONTH,
        intervalPixels: 200
    }), Timeline.createBandInfo({
        overview: true,
        date:base,
        eventSource: eventSource,
        width: "10%",
        theme: theme,
        intervalUnit: Timeline.DateTime.YEAR,
        intervalPixels: 200
    })];
    bandInfos[1].syncWith = 0;
    bandInfos[1].highlight = true;
    bandInfos[2].syncWith = 0;
    bandInfos[2].highlight = true;
    tl = Timeline.create(container, bandInfos);
    eventSource.loadJSON({
        'events': jsonForTimeline
    },
    document.location.href);
    var handler = function (evt) {
        onKeyPress(tl, [0, 1, 2]);
    },
        timerID = null;

    function onKeyPress(timeline, bandIndices) {
        if (timerID != null) {
            window.clearTimeout(timerID);
        }
        timerID = window.setTimeout(function () {
            performFiltering(timeline, bandIndices);
        },
        300);
    }

    function performFiltering(timeline, bandIndices) {
        var text = trim(filterEl.value);
        var filterMatcher = null;
        if (text.length > 0) {
            var regex = new RegExp(text, "i");
            filterMatcher = function (evt) {
                return regex.test(evt.getText());
            };
        }
        var regexes = [];
        var hasHighlights = false;
        var text2 = trim(highlightEl.value);
        if (text2.length > 0) {
            hasHighlights = true;
            regexes.push(new RegExp(text2, "i"));
        } else {
            regexes.push(null);
        }
        var highlightMatcher = hasHighlights ?
        function (evt) {
            var text = evt.getText();
            for (var x = 0; x < regexes.length; x++) {
                var regex = regexes[x];
                if (regex != null && (regex.test(text))) {
                    return x;
                }
            }
            return -1;
        } : null;
        for (var i = 0; i < bandIndices.length; i++) {
            var bandIndex = bandIndices[i];
            timeline.getBand(bandIndex).getEventPainter().setFilterMatcher(filterMatcher);
            timeline.getBand(bandIndex).getEventPainter().setHighlightMatcher(highlightMatcher);
        }
        timeline.paint();
    }
    var highlightElTimer = null,
        filterElTimer = null,
        lastHighlight = '',
        lastFilter = '';
    highlightEl.value = '',
    filterEl.value = '';
    simpleAdd(highlightEl, "focus", function () {
        if (!highlightElTimer) {
            highlightElTimer = setInterval(function () {
                if (lastHighlight != highlightEl.value) {
                    handler();
                    lastHighlight = highlightEl.value;
                }
            },
            50);
        }
    });
    simpleAdd(filterEl, "focus", function () {
        if (!filterElTimer) {
            filterElTimer = setInterval(function () {
                if (lastFilter != filterEl.value) {
                    handler();
                    lastFilter = filterEl.value;
                }
            },
            50);
        }
    });
    simpleAdd(highlightEl, "blur", function () {
        if (highlightElTimer) {
            clearInterval(highlightElTimer);
            highlightElTimer = null;
        }
    });
    simpleAdd(filterEl, "blur", function () {
        if (filterElTimer) {
            clearInterval(filterElTimer);
            filterElTimer = null;
        }
    });
    //pay attension to chinese
    //simpleAdd(highlightEl, "keypress", handler);
    //simpleAdd(filterEl, "keypress", handler);
    return {
        /**
         事件线更新事件并重绘
         @param input{Object} 事件配置
         **/
        update: function (input) {
            var jsonForTimeline = transform(input);
            //清空原来的事件
            eventSource.clear();
            //载入新的事件
            eventSource.loadJSON({
                'events': jsonForTimeline
            },
            document.location.href);
            tl.paint();
        }
    };
}