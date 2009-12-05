/*
	alert 举例
	v1.1(20090610) 利用闭包实现alert单例模式
	v1.2(20090611) 设置buttonAlign居中对齐按钮
	v1.2.5(20090613) alertlite 增加icon以及callback设置
	v1.3(20090806) Ext.ux.MessageBoxLite.res 国际化支持
*/
Ext.namespace('Ext.ux');
Ext.ux.MessageBoxLite = function (config) {	
	Ext.ux.MessageBoxLite.superclass.constructor.call(this,config);	
	this.el.addClass('x-window-dlg x-window-plain');	
	this.iconEl = Ext.DomHelper.insertFirst(this.body,{
		tag:'div',
		cls:'ext-mb-icon'
	},true);
	this.iconEl.enableDisplayMode('');
	this.info=Ext.DomHelper.append(this.body,{
		tag:'span'
	},true);
	
}

Ext.extend(Ext.ux.MessageBoxLite,Ext.ux.WindowLite,  {
	/**
	alert 全局单例，每次更新title，info即可
	**/
	updateInfo:function(config){		
		this.title.update(config.title);
	  this.info.update(config.info);
	  if(config.icon) {
			this.iconEl.show();
			this.iconEl.dom.className='ext-mb-icon '+'ext-mb-'+config.icon;
		}else {
			this.iconEl.hide();
		}
		//一般设置宽度单行显示
  	var size=this.body.getTextWidth(config.info,0,600)+30+(config.icon?49:0);
		var titleSize=this.header.getTextWidth(config.title,0,600)+30;
		this.body.setWidth(Math.max(size,titleSize));	  
		//高度不限		
		this.updateWindowSize();		
	}
});
/*
	国际化支持，请覆盖
*/
Ext.ux.MessageBoxLite.res={
	buttonOk : '&nbsp;&nbsp;OK&nbsp;&nbsp;'
};
Ext.ux.MessageBoxLite.alert=function(){	
		
	var callback;	
	var alertInstance=new Ext.ux.MessageBoxLite({
		modal:true,
		drag:true,
		buttonAlign:'center',
		shadow:'frame',
		shadowOffset:6,
		defaultButton:Ext.ux.MessageBoxLite.res.buttonOk,
		buttons:[
			{
				text:Ext.ux.MessageBoxLite.res.buttonOk,
      	handler:function() {
      		this.hide();
      		if(callback) callback();
      	}
			}
		]
	});
	
	
	Ext.ux.MessageBoxLite.alert=function(config){	
		alertInstance.updateInfo(config);		
		alertInstance.show();
		callback=config.callback;
		return alertInstance;
	};
	
	return Ext.ux.MessageBoxLite.alert(arguments[0]);	
} 