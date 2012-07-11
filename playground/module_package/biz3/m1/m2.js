KISSY.add("biz3/m1/m2", function(S, DOM) {
  var info = DOM.create("<div style='font-size:30px;'>\u6a21\u57572\u521d\u59cb\u5316\uff01</div>");
  DOM.prepend(info, document.body);
  return{log:function(s) {
    DOM.html(info, s)
  }}
}, {requires:["dom"]});

