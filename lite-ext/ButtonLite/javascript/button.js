/*
	v1.0(20090805) 借用extjs Button 素材装饰一下，防止ie6 button 文字过长毛边
	v1.1(20090825) button 装饰后后去除 extStyle
	v1.2(20090827) 加入version配置，或许你喜欢extjs2的样式呢
*/
Ext.namespace('Ext.ux');
Ext.ux.ButtonLite = function (config) {
	if(!config.id){
		alert("no button id");
		return;
	}	
	Ext.apply(this, {initialConfig:config});
	Ext.apply(this,config);		
	Ext.ux.ButtonLite.superclass.constructor.call(this);
	this._button = Ext.get(this.id);
	this.version=this.version||"";
	if(this.version)
	    this["_decorateVersion"](this.version);
	else
	    this._decorate();
	
};

Ext.extend(Ext.ux.ButtonLite, Ext.util.Observable, { 
	
	_decorate : function (){
		
		this.el = Ext.DomHelper.insertAfter(this._button,{
		
			tag:'table',
			cellSpacing:'0',
			cls:'x-btn  x-btn-noicon',
			cn:[
				{
					tag:'tbody',
					cls:'x-btn-small x-btn-icon-small-left',
					cn:[
					
					
						{
							tag:'tr',
							cn:[
								{
									tag:'td',
									cls:'x-btn-tl',
									cn:[{
										tag:'i',
										html:'&nbsp;'
									}]
								},
								{
									tag:'td',
									cls:'x-btn-tc'
								},
								{
									tag:'td',
									cls:'x-btn-tr',
									cn:[{
										tag:'i',
										html:'&nbsp;'
									}]
								}
							
							]
						},
						
						
						{
							tag:'tr',
							cn:[
								{
									tag:'td',
									cls:'x-btn-ml',
									cn:[{
										tag:'i',
										html:'&nbsp;'
									}]
								},
								{
									tag:'td',
									cls:'x-btn-mc',
									cn:[
										{
											tag:'em',
											unSelectable:'on'
											
										}
									]
								},
								{
									tag:'td',
									cls:'x-btn-mr',
									cn:[{
										tag:'i',
										html:'&nbsp;'
									}]
								}
							
							]
						},
						
						
						
						{
							tag:'tr',
							cn:[
								{
									tag:'td',
									cls:'x-btn-bl',
									cn:[{
										tag:'i',
										html:'&nbsp;'
									}]
								},
								{
									tag:'td',
									cls:'x-btn-bc'
								},
								{
									tag:'td',
									cls:'x-btn-br',
									cn:[{
										tag:'i',
										html:'&nbsp;'
									}]
								}
							
							]
						}
					]
				}
			]
			
		},true);		
		this._replace();
	},
	
	
	_decorateVersion : function (version){		
		
		this.el = Ext.DomHelper.insertAfter(this._button,{
		
			tag:'table',
			cellSpacing:'0',
			cellPadding:'0',
			'border':'0',
			cls:'x-btn-wrap'+version+' x-btn'+version,
			cn:[
				{
					tag:'tbody',
					
					cn:[
					
						{
							tag:'tr',
							cn:[
								{
									tag:'td',
									cls:'x-btn-left',
									cn:[{
										tag:'i',
										html:'&nbsp;'
									}]
								},
								{
									tag:'td',
									cls:'x-btn-center',
									cn:[
										{
											tag:'em',
											unSelectable:'on'
											
										}
									]
								},
								{
									tag:'td',
									cls:'x-btn-right',
									cn:[{
										tag:'i',
										html:'&nbsp;'
									}]
								}
							
							]
						}
						
					]
				}
			]
			
		},true);		
		this._replace();
	},
	
	_replace:function(){
		var bwrap=this.el.child('tbody tr td em');		
		bwrap.appendChild(this._button);		
		this.el.addClassOnClick("x-btn-click"+this.version);
		this.el.addClassOnFocus("x-btn-focus"+this.version);
		this.el.addClassOnOver("x-btn-over"+this.version);		
		this._button.on('focus',this._onFocus,this);
		this._button.on('blur',this._onBlur,this);
		this._button.removeClass("extStyle");
	},
	
	destroy : function(){
		this._button.removeAllListeners();
		this.el.removeAllListeners();
		this.el.remove();		
	},
	
	_onFocus : function(){
		this.el.addClass("x-btn-focus"+this.version);
	},
	
	_onBlur : function(){
		this.el.removeClass("x-btn-focus"+this.version);
	}
	
	
});