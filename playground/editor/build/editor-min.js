/*
 Constructor for kissy editor,dependency moved to independent module
 thanks to CKSource's intelligent work on CKEditor
 @author: yiminghe@gmail.com, lifesinger@gmail.com
 @version: 2.1.5
 @buildtime: 2010-12-28 14:49:10
*/
KISSY.add("editor",function(b){function c(e,d){var a=this;if(!(a instanceof c))return new c(e,d);if(b.isString(e))e=b.one(e);e=n._4e_wrap(e);d=d||{};d.pluginConfig=d.pluginConfig||{};a.cfg=d;d.pluginConfig=d.pluginConfig;a.cfg=d;b.app(a,b.EventTarget);var j=["htmldataprocessor","enterkey","clipboard"],h=o;a.use=function(f,k){f=f.split(",");if(!h)for(var i=0;i<j.length;i++){var l=j[i];b.inArray(l,f)||f.unshift(l)}a.ready(function(){b.use.call(a,f.join(","),function(){for(var g=0;g<f.length;g++)a.usePlugin(f[g]);
k&&k.call(a);if(!h){a.setData(e.val());if(d.focus)a.focus();else(g=a.getSelection())&&g.removeAllRanges();h=p}},{global:c})});return a};a.use=a.use;a.Config.base=c.Config.base;a.Config.debug=c.Config.debug;a.Config.componentJsName=m;a.init(e);return a}function m(){return"plugin-min.js?t=2010-12-28 14:49:10"}var n=b.DOM,p=true,o=false;b.app(c,b.EventTarget);c.Config.base=b.Config.base+"editor/plugins/";c.Config.debug=b.Config.debug;c.Config.componentJsName=m;b.Editor=c;b.Editor=c});
