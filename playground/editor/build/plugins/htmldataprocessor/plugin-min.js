KISSY.Editor.add("htmldataprocessor",function(F){function I(g){return g.replace(J,function(k,d,f,h,l){return h=="src"&&K.test(k)?k:"<"+d+f+" _ke_saved_"+f+l+">"})}var y=y,z=KISSY,n=z.Editor,L=z.Node,u=z.UA,C=n.NODE,v=n.HtmlParser,A=new v.Filter,D=new v.Filter,G=n.XHTML_DTD;if(!F.htmlDataProcessor){(function(){var g=n.HtmlParser.Fragment.prototype,k=n.HtmlParser.Element.prototype;g.onlyChild=k.onlyChild=function(){var d=this.children;return d.length==1&&d[0]||null};k.removeAnyChildWithName=function(d){for(var f=
this.children,h=[],l,i=0;i<f.length;i++){l=f[i];if(l.name){if(l.name==d){h.push(l);f.splice(i--,1)}h=h.concat(l.removeAnyChildWithName(d))}}return h};k.getAncestor=function(d){for(var f=this.parent;f&&!(f.name&&f.name.match(d));)f=f.parent;return f};g.firstChild=k.firstChild=function(d){for(var f,h=0;h<this.children.length;h++){f=this.children[h];if(d(f))return f;else if(f.name)if(f=f.firstChild(d))return f}return null};k.addStyle=function(d,f,h){var l="";if(typeof f=="string")l+=d+":"+f+";";else{if(typeof d==
"object")for(var i in d){if(d.hasOwnProperty(i))l+=i+":"+d[i]+";"}else l+=d;h=f}if(!this.attributes)this.attributes={};d=this.attributes.style||"";d=(h?[l,d]:[d,l]).join(";");this.attributes.style=d.replace(/^;|;(?=;)/,"")};G.parentOf=function(d){var f={},h;for(h in this)if(h.indexOf("$")==-1&&this[h][d])f[h]=1;return f}})();(function(){function g(a){if(/mso-list\s*:\s*Ignore/i.test(a.attributes&&a.attributes.style))return true;return y}function k(a,b){var c=new n.HtmlParser.Element("ke:listbullet"),
e;if(a)if(a[2]){a=isNaN(a[1])?/^[a-z]+$/.test(a[1])?"lower-alpha":/^[A-Z]+$/.test(a[1])?"upper-alpha":"decimal":"decimal";e="ol"}else{a=/[l\u00B7\u2002]/.test(a[1])?"disc":/[\u006F\u00D8]/.test(a[1])?"circle":/[\u006E\u25C6]/.test(a[1])?"square":"disc";e="ul"}else{a="decimal";e="ol"}c.attributes={"ke:listtype":e,style:"list-style-type:"+a+";"};c.add(new n.HtmlParser.Text(b));return c}function d(a){var b=a.attributes,c;if((c=a.removeAnyChildWithName("ke:listbullet"))&&c.length&&(c=c[0])){a.name="ke:li";
if(b.style)b.style=f([["text-indent"],["line-height"],[/^margin(:?-left)?$/,null,function(e){e=e.split(" ");e=e[3]||e[1]||e[0];e=parseInt(e,10);if(!i&&s&&e>s)i=e-s;b["ke:margin"]=s=e}]],y)(b.style,a)||"";c=c.attributes;a.addStyle(c.style);z.mix(b,c);return true}return false}function f(a,b){return function(c,e){var m=[];c.replace(/&quot;/g,'"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,function(p,o,r){o=o.toLowerCase();o=="font-family"&&(r=r.replace(/["']/g,""));for(var B,q,H,x=0;x<a.length;x++)if(a[x]){p=
a[x][0];B=a[x][1];q=a[x][2];H=a[x][3];if(o.match(p)&&(!B||r.match(B))){o=H||o;b&&(q=q||r);if(typeof q=="function")q=q(r,e,o);if(q&&q.push){o=q[0];q=q[1]}typeof q=="string"&&m.push([o,q]);return}}!b&&m.push([o,r])});for(var t=0;t<m.length;t++)m[t]=m[t].join(":");return m.length?m.join(";")+";":false}}function h(a){a=a.children;for(var b,c,e,m,t,p,o,r=0;r<a.length;r++){b=a[r];if("ke:li"==b.name){b.name="li";b=b;c=b.attributes;e=b.attributes["ke:listtype"];m=parseInt(c["ke:indent"],10)||i&&Math.ceil(c["ke:margin"]/
i)||1;c.style&&(c.style=f([["list-style-type",e=="ol"?"decimal":"disc"]],y)(c.style)||"");if(p){if(m>o){p=new n.HtmlParser.Element(e);p.add(b);t.add(p)}else{if(m<o){t=o-m;for(var B;t--&&(B=p.parent);)p=B.parent}p.add(b)}a.splice(r--,1)}else{p=new n.HtmlParser.Element(e);p.add(b);a[r]=p}t=b;o=m}else p=null}i=0}var l=f([[/mso/i],[/^-ms/i],[/^-moz/i],[/^-webkit/i],[/line-height/i],[/display/i,/none/i]],y),i,s=0,w=G.parentOf("ol"),E={elementNames:[[/^script$/i,""],[/^iframe$/i,""],[/^style$/i,""],[/^link$/i,
""],[/^meta$/i,""],[/^\?xml.*$/i,""],[/^.*namespace.*$/i,""]],root:function(a){a.filterChildren();h(a)},elements:{font:function(a){delete a.name},p:function(a){a.filterChildren();if(d(a))return y},$:function(a){var b=a.name||"";b.indexOf(":")!=-1&&b.indexOf("ke")==-1&&delete a.name;var c=a.attributes.style;if(b=="span"&&(!c||!l(c)))delete a.name;if(b in w){a.filterChildren();h(a)}},span:function(a){if(!u.gecko&&g(a.parent))return false;if(!u.gecko&&g(a)){a=(a=a.firstChild(function(c){return c.value||
c.name=="img"}))&&(a.value||"l.");var b=a.match(/^([^\s]+?)([.)]?)$/);return k(b,a)}}},comment:!u.ie?function(a,b){var c=a.match(/<img.*?>/),e=a.match(/^\[if !supportLists\]([\s\S]*?)\[endif\]$/);if(e){e=(c=e[1]||c&&"l.")&&c.match(/>([^\s]+?)([.)]?)</);return k(e,c)}if(u.gecko&&c){c=n.HtmlParser.Fragment.FromHtml(c[0]).children[0];(e=(e=(e=b.previous)&&e.value.match(/<v:imagedata[^>]*o:href=['"](.*?)['"]/))&&e[1])&&(c.attributes.src=e);return c}return false}:function(){return false},attributes:{"class":function(a){if(/(^|\s+)ke_/.test(a))return a;
return false},style:function(a){a=l(a);if(!a)return false;return a}},attributeNames:[[/^on/,"ke_on"],[/^lang$/,""]]},j={elementNames:[[/^ke:/,""],[/^\?xml:namespace$/,""]],elements:{$:function(a){var b=a.attributes;if(b)for(var c=["name","href","src"],e,m=0;m<c.length;m++){e="_ke_saved_"+c[m];e in b&&delete b[c[m]]}return a},embed:function(a){var b=a.parent;if(b&&b.name=="object"){var c=b.attributes.width;b=b.attributes.height;c&&(a.attributes.width=c);b&&(a.attributes.height=b)}},param:function(a){a.children=
[];a.isEmpty=true;return a},a:function(a){if(!(a.children.length||a.attributes.name||a.attributes._ke_saved_name))return false},td:function(a){for(var b=a.children,c=0;c<b.length;c++)if(b[c].name=="br"){b.splice(c,1);--c}if(!a.children.length){b=new n.HtmlParser.Text("&nbsp;");a.children.push(b)}},span:function(a){if(!a.children.length)return false}},attributes:{style:function(a){if(!z.trim(a))return false}},attributeNames:[[/^_ke_saved_/,""],[/^ke_on/,"on"],[/^_ke.*/,""],[/^ke:.*$/,""]]};if(u.ie)j.attributes.style=
function(a){return a.toLowerCase()};A.addRules(j);D.addRules(E)})();(function(){function g(j){for(var a=j.children.length,b=j.children[a-1];b&&b.type==C.NODE_TEXT&&!z.trim(b.value);)b=j.children[--a];return b}function k(j){var a=g(j);return!a||a.type==C.NODE_ELEMENT&&a.name=="br"||j.name=="form"&&a.name=="input"}function d(j,a){var b=j.children,c=g(j);if(c){if((a||!u.ie)&&c.type==C.NODE_ELEMENT&&c.name=="br")b.pop();c.type==C.NODE_TEXT&&l.test(c.value)&&b.pop()}}function f(j){d(j,true);if(k(j))u.ie?
j.add(new n.HtmlParser.Text("\u00a0")):j.add(new n.HtmlParser.Element("br",{}))}function h(j){d(j,false);k(j)&&j.add(new n.HtmlParser.Text("\u00a0"))}var l=/^[\t\r\n ]*(?:&nbsp;|\xa0)$/,i=n.XHTML_DTD,s=n.Utils.mix({},i.$block,i.$listItem,i.$tableContent),w;for(w in s)"br"in i[w]||delete s[w];delete s.pre;i={elements:{}};var E={elements:{}};for(w in s){i.elements[w]=f;E.elements[w]=h}D.addRules(i);A.addRules(E)})();(function(){A.addRules({text:function(g){return g.replace(/\xa0/g,"&nbsp;")}})})();var J=/<((?:a|area|img|input)[\s\S]*?\s)((href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+)))([^>]*)>/gi,
K=/\s_cke_saved_src\s*=/;F.htmlDataProcessor={htmlFilter:A,dataFilter:D,toHtml:function(g,k){var d=new v.HtmlWriter;v.Fragment.FromHtml(g,k).writeHtml(d,A);return d.getHtml(true)},toDataFormat:function(g,k){if(u.gecko)g=g.replace(/(<!--\[if[^<]*?\])--\>([\S\s]*?)<!--(\[endif\]--\>)/gi,"$1$2$3");g=I(g);var d=new L("<div>");d.html("a"+g);g=d.html().substr(1);d=new v.BasicWriter;var f=v.Fragment.FromHtml(g,k);d.reset();f.writeHtml(d,D);return d.getHtml(true)},toServer:function(g,k){var d=new v.BasicWriter;
v.Fragment.FromHtml(g,k).writeHtml(d,A);return d.getHtml(true)}}}},{attach:false});