KISSY.add("1.2/mod",function(){
    alert("1.2/mod loaded");
},{
    csspath:"./mod.css", //相对于模块js 定位
    requires:["./dep"]
});