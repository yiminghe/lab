/*
	@author:yiminghe.javaeye.com
	v1.0(20090826) 做个可以折叠，展开的panel吧，注意绝对定位与其他定位分别处理。
	v1.1(20090902) 增加alignCollapseBar配置，绝对定位时重新对齐collapsebar，状态查询isExpanded
	
*/
Ext.namespace('Ext.ux');
Ext.ux.CollapseLite = function(config) {

	config = config || {};
	Ext.apply(this, {initialConfig:config});
	Ext.apply(this,config);
	var collapseWrap=config.renderTo?Ext.get(config.renderTo):Ext.getBody();
	this.id=Ext.id();
	this.addEvents('collapse','expand');
	Ext.ux.CollapseLite.superclass.constructor.call(this);
	
	
	this.direction=this.direction||"l";
	
	var tpl = new Ext.Template(
    '<div  class="panel collapselite" style="{style}" id="{id}">',
    	'<div class="panelheader clearfix">',
        '<div class="ph_l">',
            '<div class="ph_r">',
                '<div class="ph_c clearfix">',
                    '<div class="phc_l">',
                        '<strong>{title}</strong>',
                    '</div>',
                    '<div class="phc_r"><a class=" x-tool layout-collapse-'+this.direction+'"></a></div>',
                 '</div>',
             '</div>',
          '</div>',
       '</div>',

    	 '<div class="panelBody">',
    	 	'{content}',
    	 '</div>',
     '</div>'           
	);
	
	tpl.append(collapseWrap, {id:this.id,title:this.title||'&nbsp;',content:this.content||'&nbsp;',style:this.style||''});
	
	this.el=Ext.get(this.id);
	
	Ext.DomHelper. insertBefore(this.el,'<div class="collapsed-control" style="display:none;">'
       		+'<a class="x-tool layout-collapse-'+this._toogle(this.direction)+'"></a>',
       		+'</div>'
  );
       
	this._title=this.el.child(".phc_l strong");
	this._body=this.el.child(".panelBody");
	this._collapseBtn=this.el.child(".phc_r a");
	this._collapserControl = this.el.prev(".collapsed-control");
	this._collapserControl.addClassOnOver("collapsed-control-over");
	
	if(this.el.getStyle("position")=="absolute") {
		this._collapserControl.setStyle({
			position:"absolute"
		});		
		this.alignCollapseBar();	
		this._collapserControl.hide();
		this._collapserControl.setDisplayed(true);		
	}else {
		this._collapserControl.setVisibilityMode(Ext.Element.DISPLAY);	
		this.el.setVisibilityMode(Ext.Element.DISPLAY);	
	}
		
	this._collapseBtn.on("click",this.collapse,this);
	this._collapserControl.on("click",this.expand,this);
};

Ext.extend(Ext.ux.CollapseLite, Ext.util.Observable, {
	
	alignCollapseBar:function(){		
		var xy=this.el.getXY();
		//靠右方
		if(this.direction == "r") {
			xy[0]+=(this.el.getWidth()-this._collapserControl.getComputedWidth());
		}
		this._collapserControl.setXY(xy);
	},
	
	isExpanded:function(){
		return this.el.isVisible();
	},
	
	setHeight:function(h){
		var dh=h-this.el.child(".panelheader").getHeight();
		if(dh>=0)
			this._body.setHeight(dh);
	},
	
	_toogle:function(d){
		if(d=='l') return 'r';
		return 'l';
	},
	
	//点击缩放条collapse
	expand:function(){		
		this._collapserControl.hide();
		this.el.slideIn(this.direction, {
        easing: 'easeOut',
        duration: .3,
        scope :this,
        callback:function(){
        	this.fireEvent("expand");
        }
    });		
	},
	
	//点击panel标题头右上expand
	collapse:function(){
		  var elHeight=this.el.getHeight();
			this.el.slideOut(this.direction, {
          easing: 'easeOut',
          duration: .3,
          scope :this,
          callback:function(){       
          	  this._collapserControl.setHeight(elHeight);                             
              this._collapserControl.show();
              this.fireEvent("collapse");
          }
      });      
	}
});