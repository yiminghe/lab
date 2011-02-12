/**
 combined files : 

D:\code\kissy_git\demo\.\biz2\m1\m2.js
D:\code\kissy_git\demo\.\biz2\m1.js
**/

KISSY.add("biz2/m1/m2", function(S, DOM) {
  var info = DOM.create("<div style='font-size:30px;'>\u6a21\u57572\u521d\u59cb\u5316\uff01</div>");
  DOM.prepend(info, document.body);
  return{log:function(s) {
    DOM.html(info, s)
  }}
}, {requires:["dom"]});


KISSY.add("biz2/m1", function(S, DOM, Event, m2) {
  var btn = DOM.create("<button>\u6a21\u57571\u521d\u59cb\u5316\u4e86\uff0c\u53ef\u4ee5\u6309\u6211</button>");
  DOM.prepend(btn, document.body);
  Event.on(btn, "click", function() {
    m2.log("\u6a21\u57571\u8c03\u7528\u6a21\u57572\uff01")
  })
}, {requires:["dom", "event", "./m1/m2"]});



