/**
 创建一个事件时间线
 @author yiminghe@gmail.com(承玉)
 @param container{String} 容器id
 @param gateway{String} 接口地址
 */

function createTimeline(container, gateway) {
  if (!document.getElementById('timeline_style')) {
    //跨浏览器动态添加css
    var node = document.createElement('style');
    node.type = 'text/css';
    node.setAttribute('id', 'timeline_style');
    var styleStr =
      '.tape-alarm-task,.small-alarm-task {' +
      'background:red;' +
      '	}\n' +
      '.tape-plan-task,.small-plan-task {' +
      'background:green;' +
      '	}\n' +
      '.timeline-event-bubble-time {' +
      '	display:none;' +
      '}\n';
    var head = document.getElementsByTagName('head')[0];
    if (node.styleSheet) {
      node.styleSheet.cssText = styleStr;
    } else {
      node.appendChild(document.createTextNode(styleStr));
    }
    head.appendChild(node);
  }
  var container = document.getElementById(container),
    resizeTimerID = null,
    tl = null,
    //已完成项目 进展中项目  将要开始项目
    simpleAdd = document.addEventListener
      ? function (el, type, fn) {
          if (el.addEventListener) {
            el.addEventListener(type, fn, false);
          }
        }
      : function (el, type, fn) {
          if (el.attachEvent) {
            el.attachEvent('on' + type, fn);
          }
        },
    OVER = '已完成',
    NOT_OVER = '未完成',
    ALARm = '报警中',
    PLAN_START_TIME = '计划开始时间',
    PLAN_FINISH_TIME = '计划结束时间',
    ACTUAL_START_TIME = '实际开始时间',
    ACTUAL_FINISH_TIME = '实际结束时间',
    TASK_AMOUNT = '任务数',
    PM = 'PM',
    SPACE = "<span style='padding:10px;'></span>",
    BR = '<br/>',
    VIEW_PROJECT_STATUS = '[查看项目状态]',
    PROJECT_MEMBERS = '项目成员',
    dataRe = /(\d+)-(\d+)-(\d+)/,
    trimRe = /^\s+|\s+$/g;
  function onResize() {
    if (resizeTimerID == null) {
      resizeTimerID = window.setTimeout(function () {
        resizeTimerID = null;
        tl.layout();
      }, 500);
    }
  }
  simpleAdd(window, 'resize', onResize);

  function toDate(str) {
    var m = str.match(dataRe);
    if (m) {
      return new Date(
        parseInt(m[1]),
        parseInt(m[2]) - 1,
        parseInt(m[3]),
        -(new Date().getTimezoneOffset() / 60),
        0,
        0,
        0,
      );
    }
    return null;
  }
  function trim(str) {
    return str.replace(trimRe, '');
  }
  function empty(str) {
    return str ? str : '';
  }
  function transform(input) {
    var jsonForTimeline = [];
    for (var i = input.length - 1; i >= 0; i--) {
      var _input = input[i];
      var descrip = "<div style='width:450px;'>";
      descrip +=
        PLAN_START_TIME + ' : ' + empty(_input.plan_start_date) + SPACE + SPACE;
      descrip += PLAN_FINISH_TIME + ' : ' + empty(_input.plan_finish_date) + BR;
      descrip +=
        ACTUAL_START_TIME +
        ' : ' +
        empty(_input.actual_start_date) +
        SPACE +
        SPACE;
      descrip +=
        ACTUAL_FINISH_TIME + ' : ' + empty(_input.actual_finish_date) + BR;
      descrip +=
        TASK_AMOUNT +
        ' : ' +
        empty(_input.completed_task_amount) +
        '/' +
        empty(_input.task_total) +
        SPACE +
        SPACE;
      descrip += PM + ' : ' + empty(_input.pm_displayname) + SPACE + SPACE;
      descrip += PROJECT_MEMBERS + ' : ' + empty(_input.master_ued) + BR + BR;
      descrip +=
        "<a href='" +
        empty(_input.project_detail_url) +
        "' target='_blank'>" +
        VIEW_PROJECT_STATUS +
        ' </a>';
      descrip += '</div>';
      var project_status_name = _input.project_status_name;
      var plan_finish_date = toDate(_input.plan_finish_date);
      var actual_start_date = toDate(_input.actual_start_date);
      var actual_finish_date = toDate(_input.actual_finish_date);
      var plan_start_date = toDate(_input.plan_start_date);
      var current_date = toDate(_input.current_date);
      var j = {
        description: descrip,
      };
      j.title = _input.business_line + ' - ' + _input.project_name;
      if (
        'plan_work_hours' in _input &&
        'intensity' in _input &&
        _input.plan_work_hours / _input.intensity <= 2
      ) {
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
          if (
            plan_start_date &&
            plan_start_date.getTime() > current_date.getTime()
          ) {
            j.start = plan_start_date;
            j.end = plan_finish_date;
            j.classname = 'plan-task';
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
        j.classname = 'alarm-task';
      }
      jsonForTimeline.push(j);
    }
    return jsonForTimeline;
  }
  var eventSource = new Timeline.DefaultEventSource(),
    theme = Timeline.ClassicTheme.create();
  theme.event.bubble.width = 450;
  var bandInfos = [
    Timeline.createBandInfo({
      eventSource: eventSource,
      width: '70%',
      theme: theme,
      intervalUnit: Timeline.DateTime.DAY,
      intervalPixels: 100,
    }),
    Timeline.createBandInfo({
      overview: true,
      eventSource: eventSource,
      width: '20%',
      theme: theme,
      intervalUnit: Timeline.DateTime.MONTH,
      intervalPixels: 200,
    }),
    Timeline.createBandInfo({
      overview: true,
      eventSource: eventSource,
      width: '10%',
      theme: theme,
      intervalUnit: Timeline.DateTime.YEAR,
      intervalPixels: 200,
    }),
  ];
  bandInfos[1].syncWith = 0;
  bandInfos[1].highlight = true;
  bandInfos[2].syncWith = 0;
  bandInfos[2].highlight = true;
  tl = Timeline.create(container, bandInfos);

  function urlEncode(o) {
    if (!o) {
      return '';
    }
    var buf = [];
    for (var key in o) {
      var ov = o[key],
        k = encodeURIComponent(key);
      var type = typeof ov;
      if (type == 'undefined') {
        buf.push(k, '=&');
      } else if (type != 'function' && type != 'object') {
        buf.push(k, '=', encodeURIComponent(ov), '&');
      }
    }
    buf.pop();
    return buf.join('');
  }

  function createXhrObject() {
    var msxml_progid = [
      'MSXML2.XMLHTTP.6.0',
      'MSXML3.XMLHTTP',
      'Microsoft.XMLHTTP', // Doesn't support readyState 3.
      'MSXML2.XMLHTTP.3.0', // Doesn't support readyState 3.
    ];
    var req;
    try {
      req = new XMLHttpRequest(); // Try the standard way first.
    } catch (e) {
      for (var i = 0, len = msxml_progid.length; i < len; ++i) {
        try {
          req = new ActiveXObject(msxml_progid[i]);
          break;
        } catch (e2) {}
      }
    } finally {
      return req;
    }
  }
  return {
    /**
         事件线更新事件并重绘
         @param input{Object} 事件配置
         **/
    update: function (cfg) {
      var params = urlEncode(cfg);
      var req = createXhrObject();
      tl.showLoadingMessage();
      req.onreadystatechange = function () {
        if (req.readyState == 4) {
          tl.hideLoadingMessage();
          if (!trim(req.responseText)) {
            return;
          }
          var input = eval('(' + req.responseText + ')');
          var jsonForTimeline = transform(input);
          //清空原来的事件
          eventSource.clear();
          //载入新的事件
          eventSource.loadJSON(
            {
              events: jsonForTimeline,
            },
            document.location.href,
          );
          tl.paint();
          try {
            //ie activex throw error
            req.onreadystatechange = null;
          } catch (e) {}
        }
      };
      req.open('post', gateway, true);
      //must for post
      req.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded; charset=UTF-8',
      );
      req.send(params);
    },
  };
}
