KISSY.Editor.add("justify",function(e){var c=KISSY.Editor,m=KISSY,d=c.TripleButton;c.Justify||function(){function k(a,b,g,h){this.editor=a;this.v=b;this.contentCls=h;this.title=g;this._init()}var n=/(-moz-|-webkit-|start|auto)/i;m.augment(k,{_init:function(){var a=this.editor;this.el=new d({contentCls:this.contentCls,title:this.title,container:a.toolBarDiv});a.on("selectionChange",this._selectionChange,this);this.el.on("offClick",this._effect,this);c.Utils.sourceDisable(a,this)},disable:function(){this.el.set("state",
d.DISABLED)},enable:function(){this.el.set("state",d.OFF)},_effect:function(){var a=this.editor,b=a.getSelection(),g=this.el.get("state");if(b){var h=b.createBookmarks(),l=b.getRanges(),i,f;a.fire("save");for(var j=l.length-1;j>=0;j--){i=l[j].createIterator();for(i.enlargeBr=true;f=i.getNextParagraph();){f.removeAttr("align");g==d.OFF?f.css("text-align",this.v):f.css("text-align","")}}a.notifySelectionChange();b.selectBookmarks(h);a.fire("save")}},_selectionChange:function(a){var b=this.el;a=a.path;
a=a.block||a.blockLimit;if(!a||a._4e_name()==="body")b.set("state",d.OFF);else{a=a.css("text-align").replace(n,"");a==this.v||!a&&this.v=="left"?b.set("state",d.ON):b.set("state",d.OFF)}}});c.Justify=k}();e.addPlugin(function(){new c.Justify(e,"left","左对齐 ","ke-toolbar-alignleft");new c.Justify(e,"center","居中对齐 ","ke-toolbar-aligncenter");new c.Justify(e,"right","右对齐 ","ke-toolbar-alignright")})});