KISSY.add(function(S,DOM){
	var info=DOM.create("<div style='font-size:30px;'>模块2初始化！</div>");
	DOM.prepend(info,document.body);
	return {
			log:function(s){
				DOM.html(info,s);
			}
	};
},{
	requires:["dom"]
});