KISSY.add("biz/m1",function(S,DOM,Event,m2){
	var btn=DOM.create("<button>模块1初始化了，可以按我</button>");
	DOM.prepend(btn,document.body);
	Event.on(btn,"click",function(){
			m2.log("模块1调用模块2！");
	});
},{
	requires:["dom","event",
	"./m1/m2?t=2011"
	//"biz/m1/m2"
	]
});