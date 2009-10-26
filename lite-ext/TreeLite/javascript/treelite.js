/*
	@author:yiminghe.javaeye.com
	v1.0(20090825) 找了个 +,- 做个树 ,理清递归结构就好了
	
*/
Ext.namespace('Ext.ux');
Ext.ux.TreeLite = function(config) {

	config = config || {};
	if (!config.id) {
		alert("no parent to append");
		return;
	}
	
	var treeWrap=Ext.get(config.id);
	this.addEvents('click');
	Ext.ux.TreeLite.superclass.constructor.call(this);
	this.buildSubtrees(treeWrap,config.treeNodes);
	
	/*
		收缩扩展处理,集中处理吧,效率高点
	*/
	treeWrap.on("click",function(evt,target){
		
		if(evt.getTarget("a.tree-node-group",2)){
			var path=Ext.fly(target).parent("div",true);
			var ul=Ext.fly(path).next("ul",true);
			
			if(ul) {
				if(Ext.fly(target).hasClass("tree-node-expand")) {
					Ext.fly(target).removeClass("tree-node-expand");
					Ext.fly(target).addClass("tree-node-collapse");
					//不用 get ,少占用内存吧
					Ext.fly(ul,"_treeLite_submenu").slideOut("t",{
				    easing: 'easeOut',
				    duration: .3,
				    useDisplay:true
					});
				}else {
					Ext.fly(target).addClass("tree-node-expand");
					Ext.fly(target).removeClass("tree-node-collapse");
					Ext.fly(ul,"_treeLite_submenu").slideIn("t",{
				    easing: 'easeIn',
				    duration: .3,
				    useDisplay:true
					});
				}
			}
		} 
		/*
			底层节点点击处理
		*/
		else if(evt.getTarget("a.nodeItem",2)) {
			this.fireEvent("click",target.id);	
		}
		
		
		evt.stopEvent();
		
	},this);

};

Ext.extend(Ext.ux.TreeLite, Ext.util.Observable, {
	
	buildSubtrees : function(parentLi,treeNodes){
		if(!treeNodes)	return;
		var ul=Ext.DomHelper.append(parentLi,{
			tag:'ul'			
		});
		
		Ext.each(treeNodes,function(node){
			var li=Ext.DomHelper.append(ul,{
				tag:'li'			
			});
			this.buildSubtree(li,node);
			
		},this);				
	},
	
	buildSubtree : function(parentLi,treeNode){
		if(treeNode.cn) {
			parentLi.innerHTML='<div><a class="tree-node-group tree-node-expand" href="#" hideFocus="on">&nbsp;</a>'+treeNode.text+'</div>';
			this.buildSubtrees(parentLi,treeNode.cn);
		}
		else {
			parentLi.innerHTML='<span class="indent">&nbsp;</span><a href="#" class="nodeItem" id="'+treeNode.id+'">'+treeNode.text+'</a>';
		}
	}
	

});