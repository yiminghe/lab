KISSY.Editor.add("progressbar",function(){var b=KISSY,e=b.Editor;e.ProgressBar||function(){function c(){c.superclass.constructor.apply(this,arguments);this._init()}var d=b.Node;b.DOM.addStyleSheet(".ke-progressbar {border:1px solid #8F8F73;position:relative;margin-left:auto;margin-right:auto;}.ke-progressbar-inner {background-color:#4f8ed2;height:100%;}.ke-progressbar-title {width:30px;top:0;left:50%;position:absolute;}","ke_progressbar");c.ATTRS={container:{},width:{},height:{},progress:{value:0}};
b.extend(c,b.Base,{destroy:function(){this.detach();this.el._4e_remove()},_init:function(){var a=new d("<div class='ke-progressbar' style='width:"+this.get("width")+";height:"+this.get("height")+";'>"),f=this.get("container"),g=(new d("<div class='ke-progressbar-inner'>")).appendTo(a),h=(new d("<span class='ke-progressbar-title'>")).appendTo(a);f&&a.appendTo(f);this.el=a;this._title=h;this._p=g;this.on("afterProgressChange",this._progressChange,this);this._progressChange({newVal:this.get("progress")})},
_progressChange:function(a){a=a.newVal;this._p.css("width",a+"%");this._title.html(a+"%")}});e.ProgressBar=c}()});