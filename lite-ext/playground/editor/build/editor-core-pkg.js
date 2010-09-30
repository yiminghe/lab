/**
 * Constructor for kissy editor and module dependency definition
 * @author: yiminghe@gmail.com, lifesinger@gmail.com
 * @version: 2.0
 * @buildtime: 2010-09-30 17:13:11
 */
KISSY.add("editor", function(S, undefined) {
    var DOM = S.DOM;

    function Editor(textarea, cfg) {
        var self = this;

        if (!(self instanceof Editor)) {
            return new Editor(textarea, cfg);
        }

        if (S.isString(textarea)) {
            textarea = S.one(textarea);
        }
        textarea = DOM._4e_wrap(textarea);
        cfg = cfg || {};
        cfg.pluginConfig = cfg.pluginConfig || {};
        self.cfg = cfg;
        S.app(self, S.EventTarget);
        self.use = function(mods, callback) {
            if (S.isString(mods)) {
                mods = mods.split(",");
            }
            var left = mods,current = [],index;
            index = S.indexOf("separator", left);
            var sep = index != -1;
            current = left.splice(0, sep ? index + 1 : left.length);
            if (sep)current.pop();
            if (current.length != 0) {
                S.use.call(self, current.join(","), function() {
                    if (sep) {
                        self.addPlugin(function() {
                            Editor.Utils.addSeparator(self.toolBarDiv);
                        });
                    }
                    //继续加载剩余插件
                    self.use(left, callback);
                }, { order:  true, global:  Editor });
            } else {
                self.on("dataReady", function() {
                    callback && callback.call(self);
                    self.setData(textarea.val());
                    self.fire("save");
                });
            }
            return self;
        };
        self.init(textarea);
        return undefined;
    }

    S.app(Editor, S.EventTarget);
    Editor.Config.base = S.Config.base + "editor/";
    function debugUrl(url) {
        if (!debug) return  url.replace(/\.(js|css)/i, "-min.$1");
        if (debug === "dev") {
            return "../src/" + url;
        }
        return url;
    }

    var debug = S.Config.debug,
        mods = {
            "htmlparser": {
                attach: false,
                path: debugUrl("plugins/htmldataprocessor/htmlparser/htmlparser.js")
            }
        },
        core_mods = [
            "utils",
            "focusmanager",
            "definition",
            "dtd",
            "dom",
            "elementpath",
            "walker",
            "range",
            "domiterator",
            "selection",
            "styles"
        ],
        plugin_mods = [
            "flashbridge",
            "flashutils",
            "clipboard",
            {
                name: "colorsupport",
                requires:["overlay"]
            },
            {
                name: "forecolor",
                requires:["colorsupport"]
            },
            {
                name: "bgcolor",
                requires:["colorsupport"]
            },
            {
                name: "elementpaths"
            },
            "enterkey",
            {
                name:"pagebreak",
                requires:["fakeobjects"]
            },
            {
                name:"fakeobjects",
                requires:["htmldataprocessor"]
            },
            {
                name:"draft",
                requires:["localStorage"]
            },
            {
                name:"flash",
                requires:["flashsupport"]
            },
            {
                name: "flashsupport",
                requires: ["flashutils","contextmenu",
                    "fakeobjects","overlay","bubbleview"]
            },
            {
                name:"font",
                requires:["select"]
            },
            "format",
            {
                name: "htmldataprocessor",
                requires: ["htmlparser-text"]
            },
            {
                name: "image",
                requires: ["overlay","contextmenu","bubbleview"]
            },
            "indent",
            "justify",
            {
                name:"link",
                requires: ["bubbleview"]
            },
            "list",
            "maximize",
            {
                name:"music",
                requires:["flashsupport"]
            },
            "preview",
            "removeformat",
            {
                name: "smiley"//,
                //useCss: true
            },
            "sourcearea",
            {
                name: "table",
                //useCss: true,
                requires: ["overlay",
                    "contextmenu"]
            },
            {
                name: "templates",
                requires: ["overlay"]//,
                //useCss: true
            },
            "undo",
            {
                name:"resize",
                requires:["dd"]
            }
        ],
        htmlparser_mods = [
            {
                name: "htmlparser-basicwriter",
                requires: ["htmlparser"]
            },
            {
                name: "htmlparser-element",
                requires: ["htmlparser-fragment"]
            },
            {
                name: "htmlparser-filter",
                requires: ["htmlparser-element"]
            },
            {
                name: "htmlparser-fragment",
                requires: ["htmlparser-htmlwriter"]
            },
            {
                name: "htmlparser-htmlwriter",
                requires: ["htmlparser-basicwriter"]
            },
            {
                name: "htmlparser-text",
                requires: ["htmlparser-comment"]
            }
            ,
            {
                name: "htmlparser-comment",
                requires: ["htmlparser-filter"]
            }
        ],
        mis_mods = [
            {
                name:"localStorage",
                requires:["flashutils","flashbridge"]
            },
            {name:"button"},
            {name:"dd"},
            {name:"progressbar"},
            {
                name:"overlay",
                requires:["dd"]
            },
            {
                name: "contextmenu",
                requires: ["overlay"]   //,
                //useCss:true
            },
            {
                name: "bubbleview",
                requires: ["overlay"]   //,
                //useCss:true
            },
            {
                name: "select",
                requires: ["overlay"]   //,
                //useCss:true
            }
        ],
        i, len, mod, name, requires;
    for (i = 0,len = plugin_mods.length; i < len; i++) {
        mod = plugin_mods[i];
        if (S.isString(mod)) {
            mod = plugin_mods[i] = {
                name:mod
            };
        }
        mod.requires = mod.requires || [];
        mod.requires = mod.requires.concat(["button"]);
    }
    plugin_mods = mis_mods.concat(plugin_mods);
    // ui modules
    // plugins modules
    for (i = 0,len = plugin_mods.length; i < len; i++) {
        mod = plugin_mods[i];
        name = mod.name;
        mods[name] = {
            attach: false,
            requires: mod.requires,
            csspath: (mod.useCss ? debugUrl("plugins/" + name + "/plugin.css") : undefined),
            path: debugUrl("plugins/" + name + "/plugin.js")
        };
    }

    // htmlparser
    for (i = 0,len = htmlparser_mods.length; i < len; i++) {
        mod = htmlparser_mods[i];
        requires = undefined;

        if (!S.isString(mod)) {
            requires = mod.requires;
            mod = mod.name;
        }

        mods[mod] = {
            attach: false,
            requires: requires,
            path: debugUrl("plugins/htmldataprocessor/htmlparser/" + mod.substring(11) + ".js")
        };
    }
    for (i = 0,len = core_mods.length; i < len; i++) {
        mod = core_mods[i];
        mods[mod] = {
            host: "editor",
            requires: i > 0 ? core_mods[i - 1] : []
        };
    }
    Editor.add(mods);
    S.Editor = Editor;
});
/**
 * modified from ckeditor,common utils for kissy editor
 * @modifier: <yiminghe@gmail.com>
 */
KISSY.Editor.add("utils", function(KE) {

    var S = KISSY,Node = S.Node,DOM = S.DOM,debug = S.Config.debug,UA = S.UA;
    KE.Utils = {

        debugUrl:function (url) {
            if (!debug) return url.replace(/\.(js|css)/i, "-min.$1");
            if (debug === "dev") {
                return  "../src/" + url;
            }
            return  url;
        }
        ,
        /**
         * 懒惰一下
         * @param obj
         * @param before
         * @param after
         */
        lazyRun:function(obj, before, after) {
            var b = obj[before],a = obj[after];
            obj[before] = function() {
                b.apply(this, arguments);
                obj[before] = obj[after];
                return a.apply(this, arguments);
            };
        }
        ,

        getXY:function(x, y, srcDoc, destDoc) {
            var currentWindow = srcDoc.defaultView || srcDoc.parentWindow;

            //x,y相对于当前iframe文档,防止当前iframe有滚动条
            x -= DOM.scrollLeft(currentWindow);
            y -= DOM.scrollTop(currentWindow);
            if (destDoc) {
                var refWindow = destDoc.defaultView || destDoc.parentWindow;
                if (currentWindow != refWindow && currentWindow.frameElement) {
                    //note:when iframe is static ,still some mistake
                    var iframePosition = DOM._4e_getOffset(currentWindow.frameElement, destDoc);
                    x += iframePosition.left;
                    y += iframePosition.top;
                }
            }
            return {left:x,top:y};
        }
        ,

        tryThese : function() {

            var returnValue;
            for (var i = 0, length = arguments.length; i < length; i++) {
                var lambda = arguments[i];
                try {
                    returnValue = lambda();
                    break;
                }
                catch (e) {
                }
            }
            return returnValue;
        }
        ,
        arrayCompare: function(arrayA, arrayB) {
            if (!arrayA && !arrayB)
                return true;

            if (!arrayA || !arrayB || arrayA.length != arrayB.length)
                return false;

            for (var i = 0; i < arrayA.length; i++) {
                if (arrayA[ i ] !== arrayB[ i ])
                    return false;
            }

            return true;
        }
        ,
        getByAddress : function(doc, address, normalized) {
            var $ = doc.documentElement;

            for (var i = 0; $ && i < address.length; i++) {
                var target = address[ i ];

                if (!normalized) {
                    $ = $.childNodes[ target ];
                    continue;
                }

                var currentIndex = -1;

                for (var j = 0; j < $.childNodes.length; j++) {
                    var candidate = $.childNodes[ j ];

                    if (normalized === true &&
                        candidate.nodeType == 3 &&
                        candidate.previousSibling &&
                        candidate.previousSibling.nodeType == 3) {
                        continue;
                    }

                    currentIndex++;

                    if (currentIndex == target) {
                        $ = candidate;
                        break;
                    }
                }
            }

            return $ ? new Node($) : null;
        }
        ,

        clearAllMarkers:function(database) {
            for (var i in database)
                database[i]._4e_clearMarkers(database, true);
        }
        ,
        htmlEncodeAttr : function(text) {
            return text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/, '&gt;');
        }
        ,
        ltrim:function(str) {
            return str.replace(/^\s+/, "");
        }
        ,

        rtrim:function(str) {
            return str.replace(/\s+$/, "");
        }
        ,
        trim:function(str) {
            return this.ltrim(this.rtrim(str));
        }
        ,
        mix:function() {
            var r = {};
            for (var i = 0; i < arguments.length; i++) {
                var ob = arguments[i];
                r = S.mix(r, ob);
            }
            return r;
        }
        ,
        isCustomDomain : function() {
            if (!UA.ie)
                return false;

            var domain = document.domain,
                hostname = window.location.hostname;

            return domain != hostname &&
                domain != ( '[' + hostname + ']' );	// IPv6 IP support (#5434)
        },

        addSeparator:function(bar) {
            new S.Node('<span class="ke-toolbar-separator">&nbsp;</span>').appendTo(bar);
        },
        duplicateStr:function(str, loop) {
            return new Array(loop + 1).join(str);
        },
        /**
         * Throttles a call to a method based on the time between calls.
         * @method throttle
         * @for YUI
         * @param fn {function} The function call to throttle.
         * @param ms {int} The number of milliseconds to throttle the method call. Defaults to 150
         * @return {function} Returns a wrapped function that calls fn throttled.
         * @since 3.1.0
         */

        /*! Based on work by Simon Willison: http://gist.github.com/292562 */

        throttle : function(fn, scope, ms) {
            ms = ms || 150;

            if (ms === -1) {
                return (function() {
                    fn.apply(scope, arguments);
                });
            }

            var last = (new Date()).getTime();

            return (function() {
                var now = (new Date()).getTime();
                if (now - last > ms) {
                    last = now;
                    fn.apply(scope, arguments);
                }
            });
        },
        buffer : function(fn, scope, ms) {
            ms = ms || 0;
            var timer = null;
            return (function() {
                timer && clearTimeout(timer);
                var args = arguments;
                timer = setTimeout(function() {
                    return fn.apply(scope, args);
                }, ms);
            });
        },
        isNumber:function(n) {
            return /^\d+(.\d+)?$/.test(S.trim(n));
        },
        verifyInputs:function(inputs, warn) {
            for (var i = 0; i < inputs.length; i++) {
                var input = DOM._4e_wrap(inputs[i]),
                    v = S.trim(input.val()),
                    verify = input.attr("data-verify"),
                    warning = input.attr("data-warning");
                if (verify &&
                    !new RegExp(verify).test(v)) {
                    alert(warning);
                    return;
                }
            }
            return true;
        },
        sourceDisable:function(editor, plugin) {
            editor.on("sourcemode", plugin.disable, plugin);
            editor.on("wysiwygmode", plugin.enable, plugin);
        },
        resetInput:function(inp) {
            var placeholder = inp.attr("placeholder");
            if (placeholder && !UA.webkit) {
                inp.val(placeholder);
                inp.addClass(".ke-input-tip");
            }
        },
        placeholder:function(inp, tip) {
            inp.attr("placeholder", tip);
            if (UA.webkit) {
                return;
            }
            inp.on("blur", function() {
                if (!S.trim(inp.val())) {
                    inp.val(tip);
                    inp.addClass(".ke-input-tip");
                }
            });
            inp.on("focus", function() {
                if (S.trim(inp.val()) == tip) {
                    inp.val("");
                }
                inp.removeClass(".ke-input-tip");
            });
        }
    }
});
/**
 * 多实例的管理，主要是焦点控制，主要是为了
 * 1.firefox 焦点失去 bug，记录当前状态
 * 2.窗口隐藏后能够恢复焦点
 * @author: <yiminghe@gmail.com>
 */
KISSY.Editor.add("focusmanager", function(KE) {
    var S = KISSY,
        DOM = S.DOM,
        Event = S.Event,
        focusManager = {},
        INSTANCES = {},
        //当前焦点所在处
        currentInstance,
        focusManager = {
            refreshAll:function() {
                for (var i in INSTANCES) {
                    var e = INSTANCES[i];
                    e.document.designMode = "off";
                    e.document.designMode = "on";
                }
            },
            currentInstance :function() {
                return currentInstance;
            },
            getInstance : function(id) {
                return INSTANCES[id];
            },
            add : function(editor) {
                var win = DOM._4e_getWin(editor.document);
                Event.on(win, "focus", focus, editor);
                Event.on(win, "blur", blur, editor);
            },
            register : function(editor) {
                INSTANCES[editor._UUID] = editor;
            },
            remove : function(editor) {
                delete INSTANCES[editor._UUID];
                var win = DOM._4e_getWin(editor.document);
                Event.remove(win, "focus", focus, editor);
                Event.remove(win, "blur", blur, editor);
            }
        };

    function focus() {
        //console.log(" i got focus");
        var editor = this;
        editor.iframeFocus = true;
        currentInstance = editor;
        /*for (var i in INSTANCES) {
         if (i != editor._UUID)
         INSTANCES[i].blur();
         }*/
    }

    function blur() {
        //console.log(" i lost focus");
        var editor = this;
        editor.iframeFocus = false;
        currentInstance = null;
    }

    KE.focusManager = focusManager;
});
/**
 * definition of editor class for kissy editor
 * @author: <yiminghe@gmail.com>
 */
KISSY.Editor.add("definition", function(KE) {
    var S = KISSY,
        UA = S.UA,
        DOM = S.DOM,
        Node = S.Node,
        Event = S.Event,
        DISPLAY = "display",
        WIDTH = "width",
        HEIGHT = "height",
        NONE = "none",
        VISIBILITY = "visibility",
        HIDDEN = "hidden",
        focusManager = KE.focusManager,
        tryThese = KE.Utils.tryThese,
        HTML5_DTD = '<!doctype html>',
        DTD = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
        ke_textarea_wrap = ".ke-textarea-wrap",
        ke_editor_tools = ".ke-editor-tools",
        ke_editor_status = ".ke-editor-status",
        CSS_FILE = KE.Utils.debugUrl("theme/editor-iframe.css");

    function prepareIFrameHtml(id) {
        return HTML5_DTD
            + "<html>"
            + "<head>"
            + "<title>kissy-editor</title>"
            + "<link href='"
            + KE.Config.base + CSS_FILE
            + "' rel='stylesheet'/>"
            + "</head>"
            + "<body class='ke-editor'>"
            //firefox 必须里面有东西，否则编辑前不能删除!
            + "&nbsp;"
            //使用 setData 加强安全性
            // + (textarea.value || "")
            + "</body>"
            + "<html>" +
            (id ?
                // The script that launches the bootstrap logic on 'domReady', so the document
                // is fully editable even before the editing iframe is fully loaded (#4455).
                //确保iframe确实载入成功,过早的话 document.domain 会出现无法访问
                '<script id="ke_actscrpt" type="text/javascript">' +
                    ( KE.Utils.isCustomDomain() ? ( 'document.domain="' + document.domain + '";' ) : '' ) +
                    'window.parent.KISSY.Editor._initIFrame("' + id + '");' +
                    '</script>' : ''
                );
    }

    var INSTANCE_ID = 1,
        srcScript = 'document.open();' +
            // The document domain must be set any time we
            // call document.open().
            ( KE.Utils.isCustomDomain() ? ( 'document.domain="' + document.domain + '";' ) : '' ) +
            'document.close();',
        editorHtml = "<div " +
            " class='ke-editor-wrap' " +
            " > " +
            "<div class='" + ke_editor_tools.substring(1) + "'></div>" +
            "<div class='" + ke_textarea_wrap.substring(1) + "'><" + "iframe " +
            ' style="' + WIDTH + ':100%;' + HEIGHT + ':100%;border:none;" ' +
            ' ' + WIDTH + '="100%" ' +
            ' ' + HEIGHT + '="100%" ' +
            ' frameborder="0" ' +
            ' title="' + "kissy-editor" + '" ' +
            // With IE, the custom domain has to be taken care at first,
            // for other browsers, the 'src' attribute should be left empty to
            // trigger iframe's 'load' event.
            ' src="' + ( UA.ie ? 'javascript:void(function(){' + encodeURIComponent(srcScript) + '}())' : '' ) + '" ' +
            //' src=""'+
            ' tabIndex="' + ( UA.webkit ? -1 : "$(tabIndex)" ) + '" ' +
            ' allowTransparency="true" ' +
            '></iframe></div>' +
            "<div class='" + ke_editor_status.substring(1) + "'></div>" +
            "</div>";

    //所有link,flash,music的悬浮小提示
    //KE.Tips = {};

    KE.SOURCE_MODE = 0;
    KE.WYSIWYG_MODE = 1;

    S.augment(KE, {
        init:function(textarea) {
            if (UA.ie)DOM.addClass(document.body,"ie" + UA.ie)
            else if (UA.gecko) DOM.addClass(document.body,"gecko");
            else if (UA.webkit) DOM.addClass(document.body,"webkit");
            var self = this,
                editorWrap = new Node(editorHtml.replace(/\$\(tabIndex\)/, textarea.attr("tabIndex")));
            //!!编辑器内焦点不失去,firefox?
            editorWrap.on("mousedown", function(ev) {
                if (UA.webkit) {
                    //chrome select 弹不出来
                    var n = DOM._4e_name(ev.target);
                    if (n == "select" || n == "option")return true;
                }
                ev.halt();
            });

            self.editorWrap = editorWrap;
            self._UUID = INSTANCE_ID++;
            //实例集中管理
            focusManager.register(self);
            self.wrap = editorWrap.one(ke_textarea_wrap);
            self.iframe = self.wrap.one("iframe");
            self.toolBarDiv = editorWrap.one(ke_editor_tools);
            self.textarea = textarea;
            self.statusDiv = editorWrap.one(ke_editor_status);
            //ie 点击按钮不丢失焦点
            self.toolBarDiv._4e_unselectable();
            //可以直接调用插件功能
            self._commands = {};
            var tw = textarea._4e_style(WIDTH),th = textarea._4e_style(HEIGHT);
            if (tw) {
                editorWrap.css(WIDTH, tw);
                textarea.css(WIDTH, "100%");
            }
            self.textarea.css(DISPLAY, NONE);
            editorWrap.insertAfter(textarea);
            self.wrap[0].appendChild(textarea[0]);

            if (th) {
                self.wrap.css(HEIGHT, th);
                textarea.css(HEIGHT, "100%");
            }

            var iframe = self.iframe;

            self.on("dataReady", function() {
                self.ready = true;
                KE.fire("instanceCreated", {editor:self});
            });
            // With FF, it's better to load the data on iframe.load. (#3894,#4058)
            if (UA.gecko) {
                iframe.on('load', self._setUpIFrame, self);
            } else {
                //webkit(chrome) load等不来！
                self._setUpIFrame();
            }
        },
        addCommand:function(name, obj) {
            this._commands[name] = obj;
        },
        hasCommand:function(name) {
            return this._commands[name];
        },
        execCommand:function(name) {
            var self = this;
            //if (self._commands[name]) {
            self.fire("save");
            var re = self._commands[name].exec(self);
            self.fire("save");
            return re;
            //}
        },
        getMode:function() {
            return this.textarea.css("display") == "none" ?
                KE.WYSIWYG_MODE :
                KE.SOURCE_MODE;
        },
        getData:function() {
            var self = this,html;
            if (self.getMode() == KE.WYSIWYG_MODE) {
                html = self.document.body.innerHTML;
            } else {
                html = self.textarea.val();
            }
            if (self.htmlDataProcessor)
                return self.htmlDataProcessor.toHtml(html, "p");
            return html;
        } ,
        setData:function(data) {
            var self = this;
            if (self.htmlDataProcessor)
                data = self.htmlDataProcessor.toDataFormat(data, "p");
            self.document.body.innerHTML = data;
            if (self.getMode() == KE.WYSIWYG_MODE) {
                self.document.body.innerHTML = data;
            } else {
                self.textarea.val(data);
            }
        },
        sync:function() {
            this.textarea.val(this.getData());
        },
        //撤销重做时，不需要格式化代码，直接取自身
        _getRawData:function() {
            return this.document.body.innerHTML;
        },
        //撤销重做时，不需要格式化代码，直接取自身
        _setRawData:function(data) {
            this.document.body.innerHTML = data;
        },
        _hideSource:function() {
            var self = this;
            self.iframe.css(DISPLAY, "");
            self.textarea.css(DISPLAY, NONE);
            self.fire("wysiwygmode");
        },

        _showSource:    function() {
            var self = this;
            self.textarea.css(DISPLAY, "");
            self.iframe.css(DISPLAY, NONE);
            //ie textarea height:100%不起作用
            if (UA.ie < 8) {
                self.textarea.css(HEIGHT, self.wrap.css(HEIGHT));
            }
            self.fire("sourcemode");
        },
        _prepareIFrameHtml:prepareIFrameHtml,

        getSelection:function() {
            var sel = new KE.Selection(this.document);
            return ( !sel || sel.isInvalid ) ? null : sel;
        } ,
        focus:function() {
            //console.log("manually focus");
            var self = this,
                win = DOM._4e_getWin(self.document);
            UA.webkit && win && win.parent && win.parent.focus();
            //win && win.blur();
            //yiminghe note:firefox need this ,暂时使得iframe先失去焦点，触发 blinkCursor 补丁
            //if (UA.gecko)self.blur();
            //yiminghe note:webkit need win.focus

            win && win.focus();
            //ie and firefox need body focus
            self.document && self.document.body.focus();
            self.notifySelectionChange();
        } ,
        blur:function() {
            /*
             工具栏有焦点，iframe也有焦点？？
             this.toolBarDiv.children().each(function(el) {
             el[0].focus();
             });
             */
            var self = this,
                win = DOM._4e_getWin(self.document);
            win.blur();
            self.document && self.document.body.blur();
            //self.notifySelectionChange();

            //firefox 焦点相关，强制 mousedown 刷新光标
            //this.iframeFocus = false;
        },
        _setUpIFrame:function() {
            var self = this,
                iframe = self.iframe,
                KES = KE.SELECTION,
                textarea = self.textarea[0],
                data = prepareIFrameHtml(self._UUID),
                win = iframe[0].contentWindow,doc;

            try {
                // In IE, with custom document.domain, it may happen that
                // the iframe is not yet available, resulting in "Access
                // Denied" for the following property access.
                //ie 设置domain 有问题：yui也有
                //http://yuilibrary.com/projects/yui2/ticket/2052000
                //http://waelchatila.com/2007/10/31/1193851500000.html
                //http://nagoon97.wordpress.com/tag/designmode/
                doc = win.document;
            } catch(e) {
                // Trick to solve this issue, forcing the iframe to get ready
                // by simply setting its "src" property.
                //noinspection SillyAssignmentJS
                iframe[0].src = iframe[0].src;
                // In IE6 though, the above is not enough, so we must pause the
                // execution for a while, giving it time to think.
                if (UA.ie && UA.ie < 7) {
                    setTimeout(run, 10);
                    return;
                }
            }
            run();
            function run() {
                doc = win.document;
                self.document = doc;
                iframe.detach();
                // Don't leave any history log in IE. (#5657)
                doc.open("text/html", "replace");
                doc.write(data);
                doc.close();
            }
        },

        addPlugin:function(func) {
            var self = this;
            if (self.ready)func();
            else {
                self.on("dataReady", func);
            }
        },

        _monitor:function() {
            var self = this;
            if (self._monitorId) {
                clearTimeout(self._monitorId);
            }
            //console.log("selectionChange");
            self._monitorId = setTimeout(function() {
                var selection = self.getSelection();
                if (selection && !selection.isInvalid) {
                    var startElement = selection.getStartElement(),
                        currentPath = new KE.ElementPath(startElement);
                    if (!self.previousPath || !self.previousPath.compare(currentPath)) {
                        self.previousPath = currentPath;
                        //console.log("selectionChange");
                        self.fire("selectionChange", { selection : self, path : currentPath, element : startElement });
                    }
                }
            }, 100);
        }
        ,
        /**
         * 强制通知插件更新状态，防止插件修改编辑器内容，自己反而得不到通知
         */
        notifySelectionChange:function() {
            var self = this;
            self.previousPath = null;
            self._monitor();
        },

        insertElement:function(element, init) {
            var self = this;
            self.focus();

            var elementName = element._4e_name(),
                xhtml_dtd = KE.XHTML_DTD,
                KER = KE.RANGE,
                KEN = KE.NODE,
                isBlock = xhtml_dtd.$block[ elementName ],
                selection = self.getSelection(),
                ranges = selection.getRanges(),
                range,
                clone,
                lastElement,
                current, dtd;

            self.fire("save");
            for (var i = ranges.length - 1; i >= 0; i--) {
                range = ranges[ i ];
                // Remove the original contents.
                range.deleteContents();
                clone = !i && element || element._4e_clone(true);
                init && init(clone);
                // If we're inserting a block at dtd-violated position, split
                // the parent blocks until we reach blockLimit.
                if (isBlock) {
                    while (( current = range.getCommonAncestor(false, true) )
                        && ( dtd = xhtml_dtd[ current._4e_name() ] )
                        && !( dtd && dtd [ elementName ] )) {
                        // Split up inline elements.
                        if (current._4e_name() in xhtml_dtd.span)
                            range.splitElement(current);
                        // If we're in an empty block which indicate a new paragraph,
                        // simply replace it with the inserting block.(#3664)
                        else if (range.checkStartOfBlock()
                            && range.checkEndOfBlock()) {
                            range.setStartBefore(current);
                            range.collapse(true);
                            current._4e_remove();
                        }
                        else
                            range.splitBlock();
                    }
                }

                // Insert the new node.
                range.insertNode(clone);
                // Save the last element reference so we can make the
                // selection later.
                if (!lastElement)
                    lastElement = clone;
            }

            var next = lastElement._4e_nextSourceNode(true),p,
                doc = self.document;
            dtd = KE.XHTML_DTD;

            //行内元素不用加换行
            if (!dtd.$inline[clone._4e_name()]) {
                //末尾时 ie 不会自动产生br，手动产生
                if (!next) {
                    p = new Node("<p>&nbsp;</p>", null, doc);
                    p.insertAfter(lastElement);
                    next = p;
                }
                //firefox,replace br with p，和编辑器整体换行保持一致
                else if (next._4e_name() == "br"
                    &&
                    //必须符合嵌套规则
                    dtd[next.parent()._4e_name()]["p"]
                    ) {
                    p = new Node("<p>&nbsp;</p>", null, doc);
                    next[0].parentNode.replaceChild(p[0], next[0]);
                    next = p;
                }
            } else {
                //qc #3803 ，插入行内后给个位置放置光标
                next = new Node(doc.createTextNode(" "));
                next.insertAfter(lastElement);
            }
            range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
            if (next && next[0].nodeType == KEN.NODE_ELEMENT)
                range.moveToElementEditablePosition(next);

            selection.selectRanges([ range ]);
            self.focus();
            //http://code.google.com/p/kissy/issues/detail?can=1&start=100&id=121
            clone && clone._4e_scrollIntoView();
            setTimeout(function() {
                self.fire("save");
            }, 10);
            return clone;
        },

        insertHtml:function(data) {
            var self = this;
            if (self.htmlDataProcessor)
                data = self.htmlDataProcessor.toDataFormat(data);//, "p");
            /**
             * webkit insert html 有问题！会把标签去掉，算了直接用insertElement
             */
            if (UA.webkit) {
                var nodes = DOM.create(data, null, this.document);
                if (nodes.nodeType == 11) nodes = S.makeArray(nodes.childNodes);
                else nodes = [nodes];
                for (var i = 0; i < nodes.length; i++)
                    self.insertElement(new Node(nodes[i]));
                return;
            }

            self.focus();
            self.fire("save");
            var selection = self.getSelection();
            if (UA.ie) {
                var $sel = selection.getNative();
                if ($sel.type == 'Control')
                    $sel.clear();
                $sel.createRange().pasteHTML(data);
            } else {
                self.document.execCommand('inserthtml', false, data);
            }

            self.focus();
            setTimeout(function() {
                self.fire("save");
            }, 10);
        }
    });
    /**
     * 初始化iframe内容以及浏览器间兼容性处理，
     * 必须等待iframe内的脚本向父窗口通知
     */
    KE._initIFrame = function(id) {

        var self = focusManager.getInstance(id),
            iframe = self.iframe,
            textarea = self.textarea[0],
            win = iframe[0].contentWindow,
            doc = self.document,
            cfg = self.cfg,
            // Remove bootstrap script from the DOM.
            script = doc.getElementById("ke_actscrpt");
        script.parentNode.removeChild(script);

        var body = doc.body;

        if (UA.ie) {
            // Don't display the focus border.
            body.hideFocus = true;

            // Disable and re-enable the body to avoid IE from
            // taking the editing focus at startup. (#141 / #523)
            body.disabled = true;
            body.contentEditable = true;
            body.removeAttribute('disabled');
        } else {
            // Avoid opening design mode in a frame window thread,
            // which will cause host page scrolling.(#4397)
            setTimeout(function() {
                // Prefer 'contentEditable' instead of 'designMode'. (#3593)
                if (UA.gecko || UA.opera) {
                    body.contentEditable = true;
                }
                else if (UA.webkit)
                    body.parentNode.contentEditable = true;
                else
                    doc.designMode = 'on';
            }, 0);
        }

        // Gecko need a key event to 'wake up' the editing
        // ability when document is empty.(#3864)
        //activateEditing 删掉，初始引起屏幕滚动了


        // Webkit: avoid from editing form control elements content.
        if (UA.webkit) {
            Event.on(doc, "click", function(ev) {
                var control = new Node(ev.target);
                if (S.inArray(control._4e_name(), ['input', 'select'])) {
                    ev.preventDefault();
                }
            });
            // Prevent from editig textfield/textarea value.
            Event.on(doc, "mouseup", function(ev) {
                var control = new Node(ev.target);
                if (S.inArray(control._4e_name(), ['input', 'textarea'])) {
                    ev.preventDefault();
                }
            });
        }

        function blinkCursor(retry) {
            tryThese(
                function() {
                    doc.designMode = 'on';
                    //异步引起时序问题，尽可能小间隔
                    setTimeout(function () {
                        doc.designMode = 'off';
                        //console.log("path1");
                        body.focus();
                        // Try it again once..
                        if (!arguments.callee.retry) {
                            arguments.callee.retry = true;
                            //arguments.callee();
                        }
                    }, 10);
                },
                function() {
                    // The above call is known to fail when parent DOM
                    // tree layout changes may break design mode. (#5782)
                    // Refresh the 'contentEditable' is a cue to this.
                    doc.designMode = 'off';

                    DOM.attr(body, 'contentEditable', false);
                    DOM.attr(body, 'contentEditable', true);
                    // Try it again once..
                    !retry && blinkCursor(1);
                    //console.log("path2");
                });
        }

        // Create an invisible element to grab focus.
        if (UA.gecko || UA.ie || UA.opera) {
            var focusGrabber;
            focusGrabber = new Node(DOM.insertAfter(new Node(
                // Use 'span' instead of anything else to fly under the screen-reader radar. (#5049)
                '<span ' +
                    //'tabindex="-1" ' +
                    'style="position:absolute; left:-10000"' +
                    //' role="presentation"' +
                    '></span>')[0], textarea));
            focusGrabber.on('focus', function() {
                self.focus();
            });
            self.on('destroy', function() {
            });
        }

        // IE standard compliant in editing frame doesn't focus the editor when
        // clicking outside actual content, manually apply the focus. (#1659)
        if (UA.ie
            && doc.compatMode == 'CSS1Compat'
            || UA.gecko
            || UA.opera) {
            var htmlElement = new Node(doc.documentElement);
            htmlElement.on('mousedown', function(evt) {
                // Setting focus directly on editor doesn't work, we
                // have to use here a temporary element to 'redirect'
                // the focus.

                if (evt.target === htmlElement[0]) {
                    if (UA.gecko)
                        blinkCursor(false);
                    focusGrabber[0].focus();
                }
            });
        }


        Event.on(win, 'focus', function() {
            //console.log(" i am  focus inner");
            /**
             * yiminghe特别注意：firefox光标丢失bug
             * blink后光标出现在最后，这就需要实现保存range
             * focus后再恢复range
             */
            if (UA.gecko)
                blinkCursor(false);
            else if (UA.opera)
                body.focus();

            // focus 后强制刷新自己状态
            self.notifySelectionChange();
        });


        if (UA.gecko) {
            /**
             * firefox 焦点丢失后，再点编辑器区域焦点会移不过来，要点两下
             */
            Event.on(self.document, "mousedown", function() {
                if (!self.iframeFocus) {
                    //console.log("i am fixed");
                    blinkCursor(false);
                }
            });
        }

        if (UA.ie) {
            //DOM.addClass(doc.documentElement, doc.compatMode);
            // Override keystrokes which should have deletion behavior
            //  on control types in IE . (#4047)
            /**
             * 选择img，出现缩放框后不能直接删除
             */
            Event.on(doc, 'keydown', function(evt) {
                var keyCode = evt.keyCode;
                // Backspace OR Delete.
                if (keyCode in { 8 : 1, 46 : 1 }) {
                    //debugger
                    var sel = self.getSelection(),
                        control = sel.getSelectedElement();
                    if (control) {
                        // Make undo snapshot.
                        self.fire('save');
                        // Delete any element that 'hasLayout' (e.g. hr,table) in IE8 will
                        // break up the selection, safely manage it here. (#4795)
                        var bookmark = sel.getRanges()[ 0 ].createBookmark();
                        // Remove the control manually.
                        control._4e_remove();
                        sel.selectBookmarks([ bookmark ]);
                        self.fire('save');
                        evt.preventDefault();
                    }
                }
            });

            // PageUp/PageDown scrolling is broken in document
            // with standard doctype, manually fix it. (#4736)
            //ie8 主窗口滚动？？
            if (doc.compatMode == 'CSS1Compat') {
                var pageUpDownKeys = { 33 : 1, 34 : 1 };
                Event.on(doc, 'keydown', function(evt) {
                    if (evt.keyCode in pageUpDownKeys) {
                        setTimeout(function () {
                            self.getSelection().scrollIntoView();
                        }, 0);
                    }
                });
            }
        }

        // Adds the document body as a context menu target.

        setTimeout(function() {
            /*
             * IE BUG: IE might have rendered the iframe with invisible contents.
             * (#3623). Push some inconsequential CSS style changes to force IE to
             * refresh it.
             *
             * Also, for some unknown reasons, short timeouts (e.g. 100ms) do not
             * fix the problem. :(
             */
            if (UA.ie) {
                setTimeout(function() {
                    if (doc) {
                        body.runtimeStyle.marginBottom = '0px';
                        body.runtimeStyle.marginBottom = '';
                    }
                }, 1000);
            }
        }, 0);


        setTimeout(function() {
            self.fire("dataReady");
            /*
             some break for firefox ，不能立即设置
             */
            var disableObjectResizing = cfg.disableObjectResizing,
                disableInlineTableEditing = cfg.disableInlineTableEditing;
            if (disableObjectResizing || disableInlineTableEditing) {
                // IE, Opera and Safari may not support it and throw errors.
                try {
                    doc.execCommand('enableObjectResizing', false, !disableObjectResizing);
                    doc.execCommand('enableInlineTableEditing', false, !disableInlineTableEditing);
                }
                catch(e) {
                    //只能ie能用？，目前只有firefox,ie支持图片缩放
                    // For browsers which don't support the above methods,
                    // we can use the the resize event or resizestart for IE (#4208)
                    Event.on(body, UA.ie ? 'resizestart' : 'resize', function(evt) {
                        if (
                            disableObjectResizing ||
                                (
                                    DOM._4e_name(evt.target) === 'table'
                                        &&
                                        disableInlineTableEditing )
                            )
                            evt.preventDefault();
                    });
                }
            }
        }, 10);


        // Gecko/Webkit need some help when selecting control type elements. (#3448)
        //if (!( UA.ie || UA.opera)) {
        if (UA.webkit) {
            Event.on(doc, "mousedown", function(ev) {
                var control = new Node(ev.target);
                if (S.inArray(control._4e_name(), ['img', 'hr', 'input', 'textarea', 'select'])) {
                    self.getSelection().selectElement(control);
                }
            });
        }


        if (UA.gecko) {
            Event.on(doc, "dragstart", function(ev) {
                var control = new Node(ev.target);
                if (control._4e_name() === 'img' &&
                    /ke_/.test(control[0].className)
                    ) {
                    //firefox禁止拖放
                    ev.preventDefault();
                }
            });
        }

        //注意：必须放在这个位置，等iframe加载好再开始运行
        //加入焦点管理，和其他实例联系起来
        focusManager.add(self);
    };
    // Fixing Firefox 'Back-Forward Cache' break design mode. (#4514)
    //不知道为什么
    if (UA.gecko) {
        ( function () {
            var body = document.body;
            if (!body)
                window.addEventListener('load', arguments.callee, false);
            else {
                var currentHandler = body.getAttribute('onpageshow');
                body.setAttribute('onpageshow', ( currentHandler ? currentHandler + ';' : '') +
                    'event.persisted && KISSY.Editor.focusManager.refreshAll();');
            }
        } )();
    }
});/**
 * modified from ckeditor ,xhtml1.1 transitional dtd translation
 * @modifier: <yiminghe@gmail.com(chengyu)>
 */
KISSY.Editor.add("dtd", function(KE) {
    /**
     * Holds and object representation of the HTML DTD to be used by the editor in
     * its internal operations.
     *
     * Each element in the DTD is represented by a
     * property in this object. Each property contains the list of elements that
     * can be contained by the element. Text is represented by the "#" property.
     *
     * Several special grouping properties are also available. Their names start
     * with the "$" character.
     * @namespace
     * @example
     * // Check if "div" can be contained in a "p" element.
     * alert( !!CKEDITOR.dtd[ 'p' ][ 'div' ] );  "false"
     * @example
     * // Check if "p" can be contained in a "div" element.
     * alert( !!CKEDITOR.dtd[ 'div' ][ 'p' ] );  "true"
     * @example
     * // Check if "p" is a block element.
     * alert( !!CKEDITOR.dtd.$block[ 'p' ] );  "true"
     */
    KE.XHTML_DTD = (function() {
        var X = function(r) {
            var i = arguments.length - 1;
            while (i > 0) {
                KISSY.mix(r, arguments[i--]);
            }
            return r;
        },

            A = {isindex:1,fieldset:1},
            B = {input:1,button:1,select:1,textarea:1,label:1},
            C = X({a:1}, B),
            D = X({iframe:1}, C),
            E = {hr:1,ul:1,menu:1,div:1,blockquote:1,noscript:1,table:1,center:1,address:1,dir:1,pre:1,h5:1,dl:1,h4:1,noframes:1,h6:1,ol:1,h1:1,h3:1,h2:1},
            F = {ins:1,del:1,script:1,style:1},
            G = X({b:1,acronym:1,bdo:1,'var':1,'#':1,abbr:1,code:1,br:1,i:1,cite:1,kbd:1,u:1,strike:1,s:1,tt:1,strong:1,q:1,samp:1,em:1,dfn:1,span:1}, F),
            H = X({sub:1,img:1,object:1,sup:1,basefont:1,map:1,applet:1,font:1,big:1,small:1}, G),
            I = X({p:1}, H),
            J = X({iframe:1}, H, B),
            K = {img:1,noscript:1,br:1,kbd:1,center:1,button:1,basefont:1,h5:1,h4:1,samp:1,h6:1,ol:1,h1:1,h3:1,h2:1,form:1,font:1,'#':1,select:1,menu:1,ins:1,abbr:1,label:1,code:1,table:1,script:1,cite:1,input:1,iframe:1,strong:1,textarea:1,noframes:1,big:1,small:1,span:1,hr:1,sub:1,bdo:1,'var':1,div:1,object:1,sup:1,strike:1,dir:1,map:1,dl:1,applet:1,del:1,isindex:1,fieldset:1,ul:1,b:1,acronym:1,a:1,blockquote:1,i:1,u:1,s:1,tt:1,address:1,q:1,pre:1,p:1,em:1,dfn:1},

            L = X({a:1}, J),
            M = {tr:1},
            N = {'#':1},
            O = X({param:1}, K),
            P = X({form:1}, A, D, E, I),
            Q = {li:1},
            R = {style:1,script:1},
            S = {base:1,link:1,meta:1,title:1},
            T = X(S, R),
            U = {head:1,body:1},
            V = {html:1};

        var block = {address:1,blockquote:1,center:1,dir:1,div:1,dl:1,fieldset:1,form:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,hr:1,isindex:1,menu:1,noframes:1,ol:1,p:1,pre:1,table:1,ul:1};

        return  {

            // The "$" items have been added manually.

            // List of elements living outside body.
            $nonBodyContent: X(V, U, S),

            /**
             * List of block elements, like "p" or "div".
             * @type Object
             * @example
             */
            $block : block,

            /**
             * List of block limit elements.
             * @type Object
             * @example
             */
            $blockLimit : { body:1,div:1,td:1,th:1,caption:1,form:1 },

            $inline : L,    // Just like span.

            $body : X({script:1,style:1}, block),

            $cdata : {script:1,style:1},

            /**
             * List of empty (self-closing) elements, like "br" or "img".
             * @type Object
             * @example
             */
            $empty : {area:1,base:1,br:1,col:1,hr:1,img:1,input:1,link:1,meta:1,param:1},

            /**
             * List of list item elements, like "li" or "dd".
             * @type Object
             * @example
             */
            $listItem : {dd:1,dt:1,li:1},

            /**
             * List of list root elements.
             * @type Object
             * @example
             */
            $list: { ul:1,ol:1,dl:1},

            /**
             * Elements that accept text nodes, but are not possible to edit into
             * the browser.
             * @type Object
             * @example
             */
            $nonEditable : {applet:1,button:1,embed:1,iframe:1,map:1,object:1,option:1,script:1,textarea:1,param:1},

            /**
             * List of elements that can be ignored if empty, like "b" or "span".
             * @type Object
             * @example
             */
            $removeEmpty : {abbr:1,acronym:1,address:1,b:1,bdo:1,big:1,cite:1,code:1,del:1,dfn:1,em:1,font:1,i:1,ins:1,label:1,kbd:1,q:1,s:1,samp:1,small:1,span:1,strike:1,strong:1,sub:1,sup:1,tt:1,u:1,'var':1},

            /**
             * List of elements that have tabindex set to zero by default.
             * @type Object
             * @example
             */
            $tabIndex : {a:1,area:1,button:1,input:1,object:1,select:1,textarea:1},

            /**
             * List of elements used inside the "table" element, like "tbody" or "td".
             * @type Object
             * @example
             */
            $tableContent : {caption:1,col:1,colgroup:1,tbody:1,td:1,tfoot:1,th:1,thead:1,tr:1},

            html: U,
            head: T,
            style: N,
            //script: N,
            body: P,
            base: {},
            link: {},
            meta: {},
            title: N,
            col : {},
            tr : {td:1,th:1},
            img : {},
            colgroup : {col:1},
            noscript : P,
            td : P,
            br : {},
            th : P,
            center : P,
            kbd : L,
            button : X(I, E),
            basefont : {},
            h5 : L,
            h4 : L,
            samp : L,
            h6 : L,
            ol : Q,
            h1 : L,
            h3 : L,
            option : N,
            h2 : L,
            form : X(A, D, E, I),
            select : {optgroup:1,option:1},
            font : L,
            ins : L,
            menu : Q,
            abbr : L,
            label : L,
            table : {thead:1,col:1,tbody:1,tr:1,colgroup:1,caption:1,tfoot:1},
            code : L,
            script : N,
            tfoot : M,
            cite : L,
            li : P,
            input : {},
            iframe : P,
            strong : L,
            textarea : N,
            noframes : P,
            big : L,
            small : L,
            span : L,
            hr : {},
            dt : L,
            sub : L,
            optgroup : {option:1},
            param : {},
            bdo : L,
            'var' : L,
            div : P,
            object : O,
            sup : L,
            dd : P,
            strike : L,
            area : {},
            dir : Q,
            map : X({area:1,form:1,p:1}, A, F, E),
            applet : O,
            dl : {dt:1,dd:1},
            del : L,
            isindex : {},
            fieldset : X({legend:1}, K),
            thead : M,
            ul : Q,
            acronym : L,
            b : L,
            a : J,
            blockquote : P,
            caption : L,
            i : L,
            u : L,
            tbody : M,
            s : L,
            address : X(D, I),
            tt : L,
            legend : L,
            q : L,
            pre : X(G, C),
            p : L,
            em : L,
            dfn : L
        };
    })();

});
/**
 * modified from ckeditor,dom utils for kissy editor
 * @modifier: <yiminghe@gmail.com(chengyu)>
 */
KISSY.Editor.add("dom", function(KE) {

    var S = KISSY,
        DOM = S.DOM,
        UA = S.UA,
        doc = document,
        Node = S.Node,
        Utils = KE.Utils,
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
        REMOVE_EMPTY = {abbr:1,acronym:1,address:1,b:1,bdo:1,big:1,cite:1,code:1,del:1,dfn:1,em:1,font:1,i:1,ins:1,label:1,kbd:1,q:1,s:1,samp:1,small:1,span:1,strike:1,strong:1,sub:1,sup:1,tt:1,u:1,'var':1};
    KE.NODE = {
        NODE_ELEMENT:1,
        NODE_TEXT:3,
        NODE_COMMENT : 8,
        NODE_DOCUMENT_FRAGMENT:11
    };
    KE.POSITION = {};
    var KEN = KE.NODE,KEP = KE.POSITION;

    KEP.POSITION_IDENTICAL = 0;
    KEP.POSITION_DISCONNECTED = 1;
    KEP.POSITION_FOLLOWING = 2;
    KEP.POSITION_PRECEDING = 4;
    KEP.POSITION_IS_CONTAINED = 8;
    KEP.POSITION_CONTAINS = 16;

    /*
     * Anything whose display computed style is block, list-item, table,
     * table-row-group, table-header-group, table-footer-group, table-row,
     * table-column-group, table-column, table-cell, table-caption, or whose node
     * name is hr, br (when enterMode is br only) is a block boundary.
     */
    var customData = {},blockBoundaryDisplayMatch = {
        block : 1,
        'list-item' : 1,
        table : 1,
        'table-row-group' : 1,
        'table-header-group' : 1,
        'table-footer-group' : 1,
        'table-row' : 1,
        'table-column-group' : 1,
        'table-column' : 1,
        'table-cell' : 1,
        'table-caption' : 1
    },
        blockBoundaryNodeNameMatch = { hr : 1 },
        normalElDom = function(el) {
            return   el[0] || el;
        },
        normalEl = function(el) {
            if (el && !el[0]) return new Node(el);
            return el;
        },
        editorDom = {
            _4e_wrap:normalEl,
            _4e_equals:function(e1, e2) {
                //全部为空
                if (!e1 && !e2)return true;
                //一个为空，一个不为空
                if (!e1 || !e2)return false;
                e1 = normalElDom(e1);
                e2 = normalElDom(e2);
                return e1 === e2;
            },

            _4e_isBlockBoundary:function(el, customNodeNames) {
                el = normalEl(el);
                var nodeNameMatches = S.mix(S.mix({}, blockBoundaryNodeNameMatch), customNodeNames || {});

                return blockBoundaryDisplayMatch[ el.css('display') ] ||
                    nodeNameMatches[ el._4e_name() ];
            },
            _4e_getWin:function(elem) {
                return (elem && ('scrollTo' in elem) && elem["document"]) ?
                    elem :
                    elem && elem.nodeType === 9 ?
                        elem.defaultView || elem.parentWindow :
                        false;
            },
            _4e_index:function(el) {
                el = normalElDom(el);
                var siblings = el.parentNode.childNodes;
                for (var i = 0; i < siblings.length; i++) {
                    if (siblings[i] === el) return i;
                }
                return -1;
            },
            _4e_first:function(el, evaluator) {
                el = normalElDom(el);
                var first = el.firstChild,
                    retval = first && new Node(first);
                if (retval && evaluator && !evaluator(retval))
                    retval = retval._4e_next(evaluator);

                return retval;
            },

            _4e_move : function(thisElement, target, toStart) {
                thisElement._4e_remove();
                thisElement = normalElDom(thisElement);
                target = normalElDom(target);
                if (toStart) {
                    target.insertBefore(thisElement, target.firstChild);
                }
                else {
                    target.appendChild(thisElement);
                }
            },

            _4e_name:function(thisElement) {
                thisElement = normalElDom(thisElement);
                var nodeName = thisElement.nodeName.toLowerCase();
                //note by yiminghe:http://msdn.microsoft.com/en-us/library/ms534388(VS.85).aspx
                if (UA.ie) {
                    var scopeName = thisElement.scopeName;
                    if (scopeName && scopeName != 'HTML')
                        nodeName = scopeName.toLowerCase() + ':' + nodeName;
                }
                return nodeName;
            },
            _4e_isIdentical : function(thisElement, otherElement) {
                if (thisElement._4e_name() != otherElement._4e_name())
                    return false;

                var thisAttribs = thisElement[0].attributes,
                    otherAttribs = otherElement[0].attributes,thisLength = thisAttribs.length,
                    otherLength = otherAttribs.length;

                if (!UA.ie && thisLength != otherLength)
                    return false;

                for (var i = 0; i < thisLength; i++) {
                    var attribute = thisAttribs[ i ];

                    if (( !UA.ie || ( attribute.specified && attribute.nodeName != '_ke_expando' ) ) && attribute.nodeValue != otherElement.attr(attribute.nodeName))
                        return false;
                }

                // For IE, we have to for both elements, because it's difficult to
                // know how the atttibutes collection is organized in its DOM.
                if (UA.ie) {
                    for (i = 0; i < otherLength; i++) {
                        attribute = otherAttribs[ i ];
                        if (attribute.specified && attribute.nodeName != '_ke_expando'
                            && attribute.nodeValue != thisElement.attr(attribute.nodeName))
                            return false;
                    }
                }

                return true;
            },
            _4e_isEmptyInlineRemoveable : function(thisElement) {
                var children = normalElDom(thisElement).childNodes;
                for (var i = 0, count = children.length; i < count; i++) {
                    var child = children[i],
                        nodeType = child.nodeType;

                    if (nodeType == KEN.NODE_ELEMENT && child.getAttribute('_ke_bookmark'))
                        continue;

                    if (nodeType == KEN.NODE_ELEMENT && !editorDom._4e_isEmptyInlineRemoveable(child)
                        || nodeType == KEN.NODE_TEXT && S.trim(child.nodeValue)) {
                        return false;
                    }
                }
                return true;
            },
            _4e_moveChildren : function(thisElement, target, toStart) {
                var $ = normalElDom(thisElement);
                target = target[0] || target;
                if ($ == target)
                    return;

                var child;

                if (toStart) {
                    while (( child = $.lastChild ))
                        target.insertBefore($.removeChild(child), target.firstChild);
                }
                else {
                    while (( child = $.firstChild ))
                        target.appendChild($.removeChild(child));
                }
            },
            _4e_mergeSiblings : ( function() {
                function mergeElements(element, sibling, isNext) {
                    if (sibling[0] && sibling[0].nodeType == KEN.NODE_ELEMENT) {
                        // Jumping over bookmark nodes and empty inline elements, e.g. <b><i></i></b>,
                        // queuing them to be moved later. (#5567)
                        var pendingNodes = [];

                        while (sibling.attr('_ke_bookmark')
                            || sibling._4e_isEmptyInlineRemoveable()) {
                            pendingNodes.push(sibling);
                            sibling = isNext ? new Node(sibling[0].nextSibling) : new Node(sibling[0].previousSibling);
                            if (!sibling[0] || sibling[0].nodeType != KEN.NODE_ELEMENT)
                                return;
                        }

                        if (element._4e_isIdentical(sibling)) {
                            // Save the last child to be checked too, to merge things like
                            // <b><i></i></b><b><i></i></b> => <b><i></i></b>
                            var innerSibling = isNext ? element[0].lastChild : element[0].firstChild;

                            // Move pending nodes first into the target element.
                            while (pendingNodes.length)
                                pendingNodes.shift()._4e_move(element, !isNext);

                            sibling._4e_moveChildren(element, !isNext);
                            sibling._4e_remove();

                            // Now check the last inner child (see two comments above).
                            if (innerSibling[0] && innerSibling[0].nodeType == KEN.NODE_ELEMENT)
                                innerSibling._4e_mergeSiblings();
                        }
                    }
                }

                return function(thisElement) {
                    if (!thisElement[0]) return;
                    //note by yiminghe,why not just merge whatever
                    // Merge empty links and anchors also. (#5567)
                    if (!( REMOVE_EMPTY[ thisElement._4e_name() ] || thisElement._4e_name() == "a" ))
                        return;

                    mergeElements(thisElement, new Node(thisElement[0].nextSibling), true);
                    mergeElements(thisElement, new Node(thisElement[0].previousSibling));
                };
            } )(),
            _4e_unselectable :
                UA.gecko ?
                    function(el) {
                        el = normalElDom(el);
                        el.style.MozUserSelect = 'none';
                    }
                    : UA.webkit ?
                    function(el) {
                        el = normalElDom(el);
                        el.style.KhtmlUserSelect = 'none';
                    }
                    :
                    function(el) {
                        el = normalElDom(el);
                        if (UA.ie || UA.opera) {
                            var
                                e,
                                i = 0;

                            el.unselectable = 'on';

                            while (( e = el.all[ i++ ] )) {
                                switch (e.tagName.toLowerCase()) {
                                    case 'iframe' :
                                    case 'textarea' :
                                    case 'input' :
                                    case 'select' :
                                        /* Ignore the above tags */
                                        break;
                                    default :
                                        e.unselectable = 'on';
                                }
                            }
                        }
                    },

            _4e_getOffset:function(elem, refDocument) {
                elem = normalElDom(elem);
                var box,
                    x = 0,
                    y = 0,
                    currentWindow = elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow,
                    currentDoc = elem.ownerDocument,
                    currentDocElem = currentDoc.documentElement;
                refDocument = refDocument || currentDoc;
                //same with DOM.offset
                if (elem[GET_BOUNDING_CLIENT_RECT]) {
                    if (elem !== currentDoc.body && currentDocElem !== elem) {
                        box = elem[GET_BOUNDING_CLIENT_RECT]();
                        //相对于refDocument，里层iframe的滚动不计
                        x = box.left + (refDocument === currentDoc ? DOM["scrollLeft"](currentWindow) : 0);
                        y = box.top + (refDocument === currentDoc ? DOM["scrollTop"](currentWindow) : 0);
                    }
                    if (refDocument) {
                        var refWindow = refDocument.defaultView || refDocument.parentWindow;
                        if (currentWindow != refWindow && currentWindow['frameElement']) {
                            //note:when iframe is static ,still some mistake
                            var iframePosition = editorDom._4e_getOffset(currentWindow.frameElement, refDocument);
                            x += iframePosition.left;
                            y += iframePosition.top;
                        }
                    }
                }
                return { left: x, top: y };
            },

            _4e_getFrameDocument : function(el) {
                var $ = normalElDom(el),t;

                try {
                    // In IE, with custom document.domain, it may happen that
                    // the iframe is not yet available, resulting in "Access
                    // Denied" for the following property access.
                    t = $.contentWindow.document;
                }
                catch (e) {
                    // Trick to solve this issue, forcing the iframe to get ready
                    // by simply setting its "src" property.
                    t = $.src;
                    $.src = t;

                    // In IE6 though, the above is not enough, so we must pause the
                    // execution for a while, giving it time to think.
                    if (UA.ie && UA.ie < 7) {
                        window.showModalDialog(
                            'javascript:document.write("' +
                                '<script>' +
                                'window.setTimeout(' +
                                'function(){window.close();}' +
                                ',50);' +
                                '</scrip' +
                                't' +
                                '>' +
                                '")');
                    }
                }
                return $ && $.contentWindow.document;
            },

            _4e_splitText : function(el, offset) {
                el = normalElDom(el);
                var doc = el.ownerDocument;
                if (!el || el.nodeType != KEN.NODE_TEXT) return;
                // If the offset is after the last char, IE creates the text node
                // on split, but don't include it into the DOM. So, we have to do
                // that manually here.
                if (UA.ie && offset == el.nodeValue.length) {
                    var next = doc.createTextNode("");
                    DOM.insertAfter(next, el);
                    return next;
                }


                var retval = new Node(el.splitText(offset));

                // IE BUG: IE8 does not update the childNodes array in DOM after splitText(),
                // we need to make some DOM changes to make it update. (#3436)
                if (UA.ie == 8) {
                    var workaround = doc.createTextNode("");
                    DOM.insertAfter(workaround, retval[0]);
                    workaround.parentNode.removeChild(workaround);
                }

                return retval;
            },

            _4e_parents : function(node, closerFirst) {
                node = normalEl(node);
                var parents = [];
                do {
                    parents[  closerFirst ? 'push' : 'unshift' ](node);
                } while (( node = node.parent() ));

                return parents;
            },

            _4e_clone : function(el, includeChildren, cloneId) {
                el = normalElDom(el);
                var $clone = el.cloneNode(includeChildren);

                if (!cloneId) {
                    var removeIds = function(node) {
                        if (node.nodeType != KEN.NODE_ELEMENT)
                            return;

                        node.removeAttribute('id', false);
                        //复制时不要复制expando
                        node.removeAttribute('_ke_expando', false);

                        var childs = node.childNodes;
                        for (var i = 0; i < childs.length; i++)
                            removeIds(childs[ i ]);
                    };

                    // The "id" attribute should never be cloned to avoid duplication.
                    removeIds($clone);
                }
                return new Node($clone);
            },
            /**
             * 深度优先遍历获取下一结点
             * @param el
             * @param startFromSibling
             * @param nodeType
             * @param guard
             */
            _4e_nextSourceNode : function(el, startFromSibling, nodeType, guard) {
                el = normalElDom(el);
                // If "guard" is a node, transform it in a function.
                if (guard && !guard.call) {
                    var guardNode = guard[0] || guard;
                    guard = function(node) {
                        node = node[0] || node;
                        return node !== guardNode;
                    };
                }

                var node = !startFromSibling && el.firstChild ,
                    parent = new Node(el);

                // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
                // send the 'moving out' signal even we don't actually dive into.
                if (!node) {
                    if (el.nodeType == KEN.NODE_ELEMENT && guard && guard(el, true) === false)
                        return null;
                    node = el.nextSibling;
                }

                while (!node && ( parent = parent.parent())) {
                    // The guard check sends the "true" paramenter to indicate that
                    // we are moving "out" of the element.
                    if (guard && guard(parent, true) === false)
                        return null;

                    node = parent[0].nextSibling;
                }

                if (!node)
                    return null;
                node = DOM._4e_wrap(node);
                if (guard && guard(node) === false)
                    return null;

                if (nodeType && nodeType != node[0].nodeType)
                    return node._4e_nextSourceNode(false, nodeType, guard);

                return node;
            },
            _4e_previousSourceNode : function(el, startFromSibling, nodeType, guard) {
                el = normalElDom(el);
                if (guard && !guard.call) {
                    var guardNode = guard[0] || guard;
                    guard = function(node) {
                        node = node[0] || node;
                        return node !== guardNode;
                    };
                }

                var node = ( !startFromSibling && el.lastChild),
                    parent = new Node(el);

                // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
                // send the 'moving out' signal even we don't actually dive into.
                if (!node) {
                    if (el.nodeType == KEN.NODE_ELEMENT && guard && guard(el, true) === false)
                        return null;
                    node = el.previousSibling;
                }

                while (!node && ( parent = parent.parent() )) {
                    // The guard check sends the "true" paramenter to indicate that
                    // we are moving "out" of the element.
                    if (guard && guard(parent, true) === false)
                        return null;
                    node = parent[0].previousSibling;
                }

                if (!node)
                    return null;
                node = DOM._4e_wrap(node);
                if (guard && guard(node) === false)
                    return null;

                if (nodeType && node[0].nodeType != nodeType)
                    return node._4e_previousSourceNode(false, nodeType, guard);

                return node;
            },
            _4e_contains :
                UA.ie || UA.webkit ?
                    function(el, node) {
                        el = normalElDom(el);
                        node = normalElDom(node);
                        return node.nodeType != KEN.NODE_ELEMENT ?
                            el.contains(node.parentNode) :
                            el != node && el.contains(node);
                    }
                    :
                    function(el, node) {
                        el = normalElDom(el);
                        node = normalElDom(node);
                        return !!( el.compareDocumentPosition(node) & 16 );
                    },
            _4e_commonAncestor:function(el, node) {
                if (el._4e_equals(node))
                    return el;

                if (node[0].nodeType != KEN.NODE_TEXT && node._4e_contains(el))
                    return node;

                var start = el[0].nodeType == KEN.NODE_TEXT ? el.parent() : el;

                do   {
                    if (start[0].nodeType != KEN.NODE_TEXT && start._4e_contains(node))
                        return start;
                } while (( start = start.parent() ));

                return null;
            },
            _4e_ascendant : function(el, name, includeSelf) {
                var $ = normalElDom(el);

                if (!includeSelf)
                    $ = $.parentNode;
                if (name && !S.isFunction(name)) {
                    var n = name;
                    name = function(node) {
                        return node._4e_name() == n;
                    };
                }
                //到document就完了
                while ($ && $.nodeType != 9) {
                    if (!name || name(new Node($)) === true)
                        return new Node($);

                    $ = $.parentNode;
                }
                return null;
            },
            _4e_hasAttribute : function(el, name) {
                el = normalElDom(el);
                var $attr = el.attributes.getNamedItem(name);
                return !!( $attr && $attr.specified );
            },
            _4e_hasAttributes: UA.ie ?
                function(el) {
                    el = normalElDom(el);
                    var attributes = el.attributes;

                    for (var i = 0; i < attributes.length; i++) {
                        var attribute = attributes[i];

                        switch (attribute.nodeName) {
                            case 'class' :
                                // IE has a strange bug. If calling removeAttribute('className'),
                                // the attributes collection will still contain the "class"
                                // attribute, which will be marked as "specified", even if the
                                // outerHTML of the element is not displaying the class attribute.
                                // Note : I was not able to reproduce it outside the editor,
                                // but I've faced it while working on the TC of #1391.
                                if (el.getAttribute('class'))
                                    return true;
                                break;
                            // Attributes to be ignored.
                            case '_ke_expando' :
                                continue;

                            /*jsl:fallthru*/

                            default :
                                if (attribute.specified)
                                    return true;
                        }
                    }

                    return false;
                }
                :
                function(el) {
                    el = normalElDom(el);
                    //删除firefox自己添加的标志
                    UA.gecko && el.removeAttribute("_moz_dirty");
                    var attributes = el.attributes;
                    return ( attributes.length > 1 || ( attributes.length == 1 && attributes[0].nodeName != '_ke_expando' ) );
                },

            _4e_position : function(el, otherNode) {
                var $ = normalElDom(el),$other = normalElDom(otherNode);


                if ($.compareDocumentPosition)
                    return $.compareDocumentPosition($other);

                // IE and Safari have no support for compareDocumentPosition.

                if ($ == $other)
                    return KEP.POSITION_IDENTICAL;

                // Only element nodes support contains and sourceIndex.
                if ($.nodeType == KEN.NODE_ELEMENT && $other.nodeType == KEN.NODE_ELEMENT) {
                    if ($.contains) {
                        if ($.contains($other))
                            return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;

                        if ($other.contains($))
                            return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
                    }

                    if ('sourceIndex' in $) {
                        return ( $.sourceIndex < 0 || $other.sourceIndex < 0 ) ? KEP.POSITION_DISCONNECTED :
                            ( $.sourceIndex < $other.sourceIndex ) ? KEP.POSITION_PRECEDING :
                                KEP.POSITION_FOLLOWING;
                    }
                }

                // For nodes that don't support compareDocumentPosition, contains
                // or sourceIndex, their "address" is compared.

                var addressOfThis = el._4e_address(),
                    addressOfOther = otherNode._4e_address(),
                    minLevel = Math.min(addressOfThis.length, addressOfOther.length);

                // Determinate preceed/follow relationship.
                for (var i = 0; i <= minLevel - 1; i++) {
                    if (addressOfThis[ i ] != addressOfOther[ i ]) {
                        if (i < minLevel) {
                            return addressOfThis[ i ] < addressOfOther[ i ] ?
                                KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
                        }
                        break;
                    }
                }

                // Determinate contains/contained relationship.
                return ( addressOfThis.length < addressOfOther.length ) ?
                    KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING :
                    KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
            },

            _4e_address:function(el, normalized) {
                el = normalElDom(el);
                var address = [],

                    $documentElement = el.ownerDocument.documentElement,
                    node = el;

                while (node && node != $documentElement) {
                    var parentNode = node.parentNode,
                        currentIndex = -1;

                    if (parentNode) {
                        for (var i = 0; i < parentNode.childNodes.length; i++) {
                            var candidate = parentNode.childNodes[i];

                            if (normalized &&
                                candidate.nodeType == 3 &&
                                candidate.previousSibling &&
                                candidate.previousSibling.nodeType == 3) {
                                continue;
                            }

                            currentIndex++;

                            if (candidate == node)
                                break;
                        }

                        address.unshift(currentIndex);
                    }

                    node = parentNode;
                }

                return address;
            },
            _4e_breakParent : function(el, parent) {
                var KERange = KE.Range,range = new KERange(el[0].ownerDocument);

                // We'll be extracting part of this element, so let's use our
                // range to get the correct piece.
                range.setStartAfter(el);
                range.setEndAfter(parent);

                // Extract it.
                var docFrag = range.extractContents();

                // Move the element outside the broken element.
                range.insertNode(el._4e_remove());

                // Re-insert the extracted piece after the element.
                el[0].parentNode.insertBefore(docFrag, el[0].nextSibling);
            },
            _4e_style:function(el, styleName, val) {
                if (val !== undefined) {
                    return el.css(styleName, val);
                }
                el = el[0] || el;
                return el.style[normalizeStyle(styleName)];
            },
            _4e_remove : function(el, preserveChildren) {
                var $ = normalElDom(el), parent = $.parentNode;
                if (parent) {
                    if (preserveChildren) {
                        // Move all children before the node.
                        for (var child; ( child = $.firstChild );) {
                            parent.insertBefore($.removeChild(child), $);
                        }
                    }
                    parent.removeChild($);
                }
                return el;
            },
            _4e_trim : function(el) {
                DOM._4e_ltrim(el);
                DOM._4e_rtrim(el);
            },

            _4e_ltrim : function(el) {
                el = normalElDom(el);
                var child;
                while (( child = el.firstChild )) {
                    if (child.nodeType == KEN.NODE_TEXT) {
                        var trimmed = Utils.ltrim(child.nodeValue),
                            originalLength = child.nodeValue.length;

                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        }
                        else if (trimmed.length < originalLength) {
                            new Node(child)._4e_splitText(originalLength - trimmed.length);
                            // IE BUG: child.remove() may raise JavaScript errors here. (#81)
                            el.removeChild(el.firstChild);
                        }
                    }
                    break;
                }
            },

            _4e_rtrim : function(el) {
                el = normalElDom(el);
                var child;
                while (( child = el.lastChild )) {
                    if (child.type == KEN.NODE_TEXT) {
                        var trimmed = Utils.rtrim(child.nodeValue),
                            originalLength = child.nodeValue.length;

                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        } else if (trimmed.length < originalLength) {
                            new Node(child)._4e_splitText(trimmed.length);
                            // IE BUG: child.getNext().remove() may raise JavaScript errors here.
                            // (#81)
                            el.removeChild(el.lastChild);
                        }
                    }
                    break;
                }

                if (!UA.ie && !UA.opera) {
                    child = el.lastChild;
                    if (child && child.nodeType == 1 && child.nodeName.toLowerCase() == 'br') {
                        // Use "eChildNode.parentNode" instead of "node" to avoid IE bug (#324).
                        child.parentNode.removeChild(child);
                    }
                }
            },

            _4e_appendBogus : function(el) {
                el = normalElDom(el);
                var lastChild = el.lastChild;

                // Ignore empty/spaces text.
                while (lastChild && lastChild.nodeType == KEN.NODE_TEXT && !S.trim(lastChild.nodeValue))
                    lastChild = lastChild.previousSibling;
                if (!lastChild ||
                    lastChild.nodeType == KEN.NODE_TEXT || 
                    DOM._4e_name(lastChild) !== 'br') {
                    var bogus = UA.opera ?
                        el.ownerDocument.createTextNode('') :
                        el.ownerDocument.createElement('br');

                    UA.gecko && bogus.setAttribute('type', '_moz');
                    el.appendChild(bogus);
                }
            },
            _4e_previous : function(el, evaluator) {
                var previous = normalElDom(el), retval;
                do {
                    previous = previous.previousSibling;
                    retval = previous && new Node(previous);
                } while (retval && evaluator && !evaluator(retval));
                return retval;
            },

            /**
             * @param {Function} evaluator Filtering the result node.
             */
            _4e_last : function(el, evaluator) {
                el = DOM._4e_wrap(el);
                var last = el[0].lastChild,
                    retval = last && new Node(last);
                if (retval && evaluator && !evaluator(retval))
                    retval = retval._4e_previous(evaluator);

                return retval;
            },

            _4e_next : function(el, evaluator) {
                var next = normalElDom(el), retval;
                do {
                    next = next.nextSibling;
                    retval = next && new Node(next);
                } while (retval && evaluator && !evaluator(retval));
                return retval;
            },
            _4e_outerHtml : function(el) {
                el = normalElDom(el);
                if (el.outerHTML) {
                    // IE includes the <?xml:namespace> tag in the outerHTML of
                    // namespaced element. So, we must strip it here. (#3341)
                    return el.outerHTML.replace(/<\?[^>]*>/, '');
                }

                var tmpDiv = el.ownerDocument.createElement('div');
                tmpDiv.appendChild(el.cloneNode(true));
                return tmpDiv.innerHTML;
            },

            _4e_setMarker : function(element, database, name, value) {
                element = DOM._4e_wrap(element);
                var id = element._4e_getData('list_marker_id') ||
                    ( element._4e_setData('list_marker_id', S.guid())._4e_getData('list_marker_id')),
                    markerNames = element._4e_getData('list_marker_names') ||
                        ( element._4e_setData('list_marker_names', {})._4e_getData('list_marker_names'));
                database[id] = element;
                markerNames[name] = 1;

                return element._4e_setData(name, value);
            },
            _4e_clearMarkers : function(element, database, removeFromDatabase) {

                element = normalEl(element);
                var names = element._4e_getData('list_marker_names'),
                    id = element._4e_getData('list_marker_id');
                for (var i in names)
                    element._4e_removeData(i);
                element._4e_removeData('list_marker_names');
                if (removeFromDatabase) {
                    element._4e_removeData('list_marker_id');
                    delete database[id];
                }
            },

            _4e_setData : function(el, key, value) {
                var expandoNumber = DOM._4e_getUniqueId(el),
                    dataSlot = customData[ expandoNumber ] || ( customData[ expandoNumber ] = {} );
                dataSlot[ key ] = value;
                return el;
            },


            _4e_getData :function(el, key) {
                el = normalElDom(el);
                var expandoNumber = el.getAttribute('_ke_expando'),
                    dataSlot = expandoNumber && customData[ expandoNumber ];
                return dataSlot && dataSlot[ key ];
            },


            _4e_removeData : function(el, key) {
                el = normalElDom(el);
                var expandoNumber = el.getAttribute('_ke_expando'),
                    dataSlot = expandoNumber && customData[ expandoNumber ],
                    retval = dataSlot && dataSlot[ key ];

                if (typeof retval != 'undefined' && dataSlot)
                    delete dataSlot[ key ];
                if (S.isEmptyObject(dataSlot))
                    DOM._4e_clearData(el);

                return retval || null;
            },

            _4e_clearData : function(el) {
                el = normalElDom(el);
                var expandoNumber = el.getAttribute('_ke_expando');
                expandoNumber && delete customData[ expandoNumber ];
                //ie inner html 会把属性带上，删掉！
                expandoNumber && el.removeAttribute("_ke_expando");
            },
            _4e_getUniqueId : function(el) {
                el = normalElDom(el);
                var id = el.getAttribute('_ke_expando');
                if (id) return id;
                id = S.guid();
                el.setAttribute('_ke_expando', id);
                return id;
            },

            _4e_copyAttributes : function(el, dest, skipAttributes) {
                el = normalElDom(el);
                var attributes = el.attributes;
                skipAttributes = skipAttributes || {};

                for (var n = 0; n < attributes.length; n++) {
                    // Lowercase attribute name hard rule is broken for
                    // some attribute on IE, e.g. CHECKED.
                    var attribute = attributes[n],
                        attrName = attribute.nodeName.toLowerCase(),
                        attrValue;

                    // We can set the type only once, so do it with the proper value, not copying it.
                    if (attrName in skipAttributes)
                        continue;

                    if (attrName == 'checked' && ( attrValue = DOM.attr(el, attrName) ))
                        dest.attr(attrName, attrValue);
                    // IE BUG: value attribute is never specified even if it exists.
                    else if (attribute.specified ||
                        ( UA.ie && attribute.nodeValue && attrName == 'value' )) {
                        attrValue = DOM.attr(el, attrName);
                        if (attrValue === null)
                            attrValue = attribute.nodeValue;
                        dest.attr(attrName, attrValue);
                    }
                }

                // The style:
                if (el.style.cssText !== '')
                    dest[0].style.cssText = el.style.cssText;
            },

            _4e_isEditable : function(el) {

                // Get the element DTD (defaults to span for unknown elements).
                var name = DOM._4e_name(el),
                    xhtml_dtd = KE.XHTML_DTD,
                    dtd = !xhtml_dtd.$nonEditable[ name ]
                        && ( xhtml_dtd[ name ] || xhtml_dtd.span );

                // In the DTD # == text node.
                return ( dtd && dtd['#'] );
            },
            /**
             * 修正scrollIntoView在可视区域内不需要滚动
             * @param elem
             */
            _4e_scrollIntoView:function(elem) {
                elem = normalEl(elem);
                var doc = elem[0].ownerDocument;
                var l = DOM.scrollLeft(doc),t = DOM.scrollTop(doc),eoffset = elem.offset(),el = eoffset.left, et = eoffset.top;
                if (DOM.viewportHeight(doc) + t < et ||
                    et < t ||
                    DOM.viewportWidth(doc) + l < el
                    ||
                    el < l
                    ) {
                    elem.scrollIntoView(doc);
                }
            },
            _4e_getElementsByTagName:function(elem, tag, namespace) {
                elem = normalElDom(elem);
                if (!UA.ie && namespace) {
                    tag = namespace + ":" + tag
                }
                var re = [],els = elem.getElementsByTagName(tag);
                for (var i = 0; i < els.length; i++)
                    re.push(new Node(els[i]));
                return re;
            }
        };


    function normalizeStyle(styleName) {
        return styleName.replace(/-(\w)/g, function(m, g1) {
            return g1.toUpperCase();
        })
    }

    S.DOM._4e_inject = function(editorDom) {
        S.mix(DOM, editorDom);
        for (var dm in editorDom) {
            if (editorDom.hasOwnProperty(dm))
                (function(dm) {
                    Node.prototype[dm] = function() {
                        var args = [].slice.call(arguments, 0);
                        args.unshift(this);
                        return editorDom[dm].apply(null, args);
                    };
                })(dm);
        }
    };
    S.DOM._4e_inject(editorDom);
});
/**
 * modified from ckeditor ,elementpath represents element's tree path from body
 * @modifier: <yiminghe@gmail.com(chengyu)>
 */
KISSY.Editor.add("elementpath", function(KE) {
    var S = KISSY,
        DOM = S.DOM,
        dtd = KE.XHTML_DTD,
        KEN = KE.NODE,
        UA = S.UA;
    // Elements that may be considered the "Block boundary" in an element path.
    var pathBlockElements = { address:1,blockquote:1,dl:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,p:1,pre:1,li:1,dt:1,dd:1 };

    // Elements that may be considered the "Block limit" in an element path.
    var pathBlockLimitElements = { body:1,div:1,table:1,tbody:1,tr:1,td:1,th:1,caption:1,form:1 };

    // Check if an element contains any block element.
    var checkHasBlock = function(element) {
        element = element[0] || element;
        var childNodes = element.childNodes;

        for (var i = 0, count = childNodes.length; i < count; i++) {
            var child = childNodes[i];

            if (child.nodeType == KEN.NODE_ELEMENT && dtd.$block[ child.nodeName.toLowerCase() ])
                return true;
        }

        return false;
    };

    function ElementPath(lastNode) {
        var block = null;
        var blockLimit = null;
        var elements = [];
        var e = lastNode;

        while (e && e[0]) {
            if (e[0].nodeType == KEN.NODE_ELEMENT) {
                if (!this.lastElement)
                    this.lastElement = e;

                var elementName = e._4e_name();
                if (UA.ie && e[0].scopeName != 'HTML')
                    elementName = e[0].scopeName.toLowerCase() + ':' + elementName;

                if (!blockLimit) {
                    if (!block && pathBlockElements[ elementName ])
                        block = e;

                    if (pathBlockLimitElements[ elementName ]) {
                        // DIV is considered the Block, if no block is available (#525)
                        // and if it doesn't contain other blocks.
                        if (!block && elementName == 'div' && !checkHasBlock(e))
                            block = e;
                        else
                            blockLimit = e;
                    }
                }

                elements.push(e);
                if (elementName == 'body')
                    break;
            }
            e = e.parent();
        }

        this.block = block;
        this.blockLimit = blockLimit;
        this.elements = elements;
    }

    ElementPath.prototype = {
        /**
         * Compares this element path with another one.
         * @param otherPath The elementPath object to be
         * compared with this one.
         * @returns {Boolean} "true" if the paths are equal, containing the same
         * number of elements and the same elements in the same order.
         */
        compare : function(otherPath) {
            var thisElements = this.elements;
            var otherElements = otherPath && otherPath.elements;

            if (!otherElements || thisElements.length != otherElements.length)
                return false;

            for (var i = 0; i < thisElements.length; i++) {
                if (!DOM._4e_equals(thisElements[ i ], otherElements[ i ]))
                    return false;
            }

            return true;
        },

        contains : function(tagNames) {
            var elements = this.elements;
            for (var i = 0; i < elements.length; i++) {
                if (elements[ i ]._4e_name() in tagNames)
                    return elements[ i ];
            }
            return null;
        }
    };

    KE.ElementPath = ElementPath;

});
/**
 * modified from ckeditor for kissy editor ,walker implementation
 * @refer: http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal#TreeWalker
 * @modifier: yiminghe@gmail.com(chengyu)
 */
KISSY.Editor.add("walker", function(KE) {

    var S = KISSY,
        KEN = KE.NODE,
        DOM = S.DOM,
        Node = S.Node;
    // This function is to be called under a "walker" instance scope.
    function iterate(rtl, breakOnFalse) {
        var self = this;
        // Return null if we have reached the end.
        if (this._.end)
            return null;

        var node,
            range = self.range,
            guard,
            userGuard = self.guard,
            type = self.type,
            getSourceNodeFn = ( rtl ? '_4e_previousSourceNode' : '_4e_nextSourceNode' );

        // This is the first call. Initialize it.
        if (!self._.start) {
            self._.start = 1;

            // Trim text nodes and optmize the range boundaries. DOM changes
            // may happen at this point.
            range.trim();

            // A collapsed range must return null at first call.
            if (range.collapsed) {
                self.end();
                return null;
            }
        }

        // Create the LTR guard function, if necessary.
        if (!rtl && !self._.guardLTR) {
            // Gets the node that stops the walker when going LTR.
            var limitLTR = range.endContainer,
                blockerLTR = new Node(limitLTR[0].childNodes[range.endOffset]);
            //从左到右保证在 range 区间内获取 nextSourceNode
            this._.guardLTR = function(node, movingOut) {
                node = DOM._4e_wrap(node);
                //从endContainer移出去，失败返回false
                return (
                    node
                        && node[0]
                        &&
                        (!movingOut
                            ||
                            ! DOM._4e_equals(limitLTR, node)
                            )
                        //到达深度遍历的最后一个节点，结束
                        &&

                        (!blockerLTR[0] || !node._4e_equals(blockerLTR))

                        //从body移出也结束
                        && ( node[0].nodeType != KEN.NODE_ELEMENT
                        || !movingOut
                        || node._4e_name() != 'body' )
                    );
            };
        }

        // Create the RTL guard function, if necessary.
        if (rtl && !self._.guardRTL) {
            // Gets the node that stops the walker when going LTR.
            var limitRTL = range.startContainer,
                blockerRTL = ( range.startOffset > 0 ) && new Node(limitRTL[0].childNodes[range.startOffset - 1]);

            self._.guardRTL = function(node, movingOut) {
                node = DOM._4e_wrap(node);
                return (
                    node
                        && node[0]
                        && ( !movingOut || !node._4e_equals(limitRTL)  )
                        && ( !blockerRTL[0] || !node._4e_equals(blockerRTL) )
                        && ( node[0].nodeType != KEN.NODE_ELEMENT || !movingOut || node._4e_name() != 'body' )
                    );
            };
        }

        // Define which guard function to use.
        var stopGuard = rtl ? self._.guardRTL : self._.guardLTR;

        // Make the user defined guard function participate in the process,
        // otherwise simply use the boundary guard.
        if (userGuard) {
            guard = function(node, movingOut) {
                if (stopGuard(node, movingOut) === false)
                    return false;

                return userGuard(node, movingOut);
            };
        }
        else
            guard = stopGuard;

        if (self.current)
            node = this.current[ getSourceNodeFn ](false, type, guard);
        else {
            // Get the first node to be returned.

            if (rtl) {
                node = range.endContainer;

                if (range.endOffset > 0) {
                    node = new Node(node[0].childNodes[range.endOffset - 1]);
                    if (guard(node) === false)
                        node = null;
                }
                else
                    node = ( guard(node, true) === false ) ?
                        null : node._4e_previousSourceNode(true, type, guard);
            }
            else {
                node = range.startContainer;
                node = new Node(node[0].childNodes[range.startOffset]);

                if (node && node[0]) {
                    if (guard(node) === false)
                        node = null;
                }
                else
                    node = ( guard(range.startContainer, true) === false ) ?
                        null : range.startContainer._4e_nextSourceNode(true, type, guard);
            }
        }

        while (node && node[0] && !self._.end) {
            self.current = node;

            if (!this.evaluator || self.evaluator(node) !== false) {
                if (!breakOnFalse)
                    return node;
            }
            else if (breakOnFalse && self.evaluator)
                return false;

            node = node[ getSourceNodeFn ](false, type, guard);
        }

        self.end();
        return self.current = null;
    }

    function iterateToLast(rtl) {
        var node, last = null;

        while (( node = iterate.call(this, rtl) ))
            last = node;

        return last;
    }

    function Walker(range) {
        this.range = range;

        /**
         * A function executed for every matched node, to check whether
         * it's to be considered into the walk or not. If not provided, all
         * matched nodes are considered good.
         * If the function returns "false" the node is ignored.
         * @name CKEDITOR.dom.walker.prototype.evaluator
         * @property
         * @type Function
         */
        // this.evaluator = null;

        /**
         * A function executed for every node the walk pass by to check
         * whether the walk is to be finished. It's called when both
         * entering and exiting nodes, as well as for the matched nodes.
         * If this function returns "false", the walking ends and no more
         * nodes are evaluated.
         * @name CKEDITOR.dom.walker.prototype.guard
         * @property
         * @type Function
         */
        // this.guard = null;

        /** @private */
        this._ = {};
    }


    S.augment(Walker, {
        /**
         * Stop walking. No more nodes are retrieved if this function gets
         * called.
         */
        end : function() {
            this._.end = 1;
        },

        /**
         * Retrieves the next node (at right).
         * @returns {Node} The next node or null if no more
         *        nodes are available.
         */
        next : function() {
            return iterate.call(this);
        },

        /**
         * Retrieves the previous node (at left).
         * @returns {Node} The previous node or null if no more
         *        nodes are available.
         */
        previous : function() {
            return iterate.call(this, true);
        },

        /**
         * Check all nodes at right, executing the evaluation fuction.
         * @returns {Boolean} "false" if the evaluator function returned
         *        "false" for any of the matched nodes. Otherwise "true".
         */
        checkForward : function() {
            return iterate.call(this, false, true) !== false;
        },

        /**
         * Check all nodes at left, executing the evaluation fuction.
         * 是不是 (不能后退了)
         * @returns {Boolean} "false" if the evaluator function returned
         *        "false" for any of the matched nodes. Otherwise "true".
         */
        checkBackward : function() {
            return iterate.call(this, true, true) !== false;
        },

        /**
         * Executes a full walk forward (to the right), until no more nodes
         * are available, returning the last valid node.
         * @returns {Node} The last node at the right or null
         *        if no valid nodes are available.
         */
        lastForward : function() {
            return iterateToLast.call(this);
        },

        /**
         * Executes a full walk backwards (to the left), until no more nodes
         * are available, returning the last valid node.
         * @returns {Node} The last node at the left or null
         *        if no valid nodes are available.
         */
        lastBackward : function() {
            return iterateToLast.call(this, true);
        },

        reset : function() {
            delete this.current;
            this._ = {};
        }

    });


    Walker.blockBoundary = function(customNodeNames) {
        return function(node) {
            node = DOM._4e_wrap(node);
            return ! ( node && node[0].nodeType == KEN.NODE_ELEMENT
                && node._4e_isBlockBoundary(customNodeNames) );
        };
    };

    Walker.listItemBoundary = function() {
        return this.blockBoundary({ br : 1 });
    };
    /**
     * Whether the node is a bookmark node's inner text node.
     */
    //Walker.bookmarkContents = function(node) {
    // },

    /**
     * Whether the to-be-evaluated node is a bookmark node OR bookmark node
     * inner contents.
     * @param {Boolean} contentOnly Whether only test againt the text content of
     * bookmark node instead of the element itself(default).
     * @param {Boolean} isReject Whether should return 'false' for the bookmark
     * node instead of 'true'(default).
     */
    Walker.bookmark = function(contentOnly, isReject) {
        function isBookmarkNode(node) {
            return ( node && node[0]
                && node._4e_name() == 'span'
                && node.attr('_ke_bookmark') );
        }

        return function(node) {
            var isBookmark, parent;
            // Is bookmark inner text node?
            isBookmark = ( node &&
                node[0] &&
                node[0].nodeType == KEN.NODE_TEXT &&
                ( parent = node.parent() )
                && isBookmarkNode(parent) );
            // Is bookmark node?
            isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
            return isReject ^ isBookmark;
        };
    };

    /**
     * Whether the node is a text node containing only whitespaces characters.
     * @param isReject
     */
    Walker.whitespaces = function(isReject) {
        return function(node) {
            node = node[0] || node;
            var isWhitespace = node && ( node.nodeType == KEN.NODE_TEXT )
                && !S.trim(node.nodeValue);
            return isReject ^ isWhitespace;
        };
    };

    /**
     * Whether the node is invisible in wysiwyg mode.
     * @param isReject
     */
    Walker.invisible = function(isReject) {
        var whitespace = Walker.whitespaces();
        return function(node) {
            // Nodes that take no spaces in wysiwyg:
            // 1. White-spaces but not including NBSP;
            // 2. Empty inline elements, e.g. <b></b> we're checking here
            // 'offsetHeight' instead of 'offsetWidth' for properly excluding
            // all sorts of empty paragraph, e.g. <br />.
            var isInvisible = whitespace(node) || node[0].nodeType == KEN.NODE_ELEMENT && !node[0].offsetHeight;
            return isReject ^ isInvisible;
        };
    };


    KE.Walker = Walker;
});
/**
 * modified from ckeditor,range implementation across browsers for kissy editor
 * @modifier: <yiminghe@gmail.com(chengyu)>
 */
KISSY.Editor.add("range", function(KE) {
    KE.RANGE = {
        POSITION_AFTER_START:1,// <element>^contents</element>		"^text"
        POSITION_BEFORE_END:2,// <element>contents^</element>		"text^"
        POSITION_BEFORE_START:3,// ^<element>contents</element>		^"text"
        POSITION_AFTER_END:4,// <element>contents</element>^		"text"
        ENLARGE_ELEMENT:1,
        ENLARGE_BLOCK_CONTENTS:2,
        ENLARGE_LIST_ITEM_CONTENTS:3,
        START:1,
        END:2,
        STARTEND:3,
        SHRINK_ELEMENT:1,
        SHRINK_TEXT:2
    };

    var S = KISSY,KEN = KE.NODE,
        KER = KE.RANGE,
        KEP = KE.POSITION,
        Walker = KE.Walker,
        DOM = S.DOM,
        getByAddress = KE.Utils.getByAddress,
        UA = S.UA,
        dtd = KE.XHTML_DTD,
        ElementPath = KE.ElementPath,
        Node = S.Node,
        EMPTY = {area:1,base:1,br:1,col:1,hr:1,img:1,input:1,link:1,meta:1,param:1};

    function KERange(document) {
        var self = this;
        self.startContainer = null;
        self.startOffset = null;
        self.endContainer = null;
        self.endOffset = null;
        self.collapsed = true;
        self.document = document;
    }

    KERange.prototype.toString = function() {
        var s = [],self = this;
        s.push((self.startContainer[0].id || self.startContainer[0].nodeName) + ":" + self.startOffset);
        s.push((self.endContainer[0].id || self.endContainer[0].nodeName) + ":" + self.endOffset);
        return s.join("<br/>");
    };
    S.augment(KERange, {

        updateCollapsed:function() {
            var self = this;
            self.collapsed = (
                self.startContainer &&
                    self.endContainer &&
                    DOM._4e_equals(self.startContainer, self.endContainer) &&
                    self.startOffset == self.endOffset );
        },
        /**
         * Transforms the startContainer and endContainer properties from text
         * nodes to element nodes, whenever possible. This is actually possible
         * if either of the boundary containers point to a text node, and its
         * offset is set to zero, or after the last char in the node.
         */
        optimize : function() {
            var self = this,container = self.startContainer,offset = self.startOffset;

            if (container[0].nodeType != KEN.NODE_ELEMENT) {
                if (!offset)
                    self.setStartBefore(container);
                else if (offset >= container[0].nodeValue.length)
                    self.setStartAfter(container);
            }

            container = self.endContainer;
            offset = self.endOffset;

            if (container[0].nodeType != KEN.NODE_ELEMENT) {
                if (!offset)
                    self.setEndBefore(container);
                else if (offset >= container[0].nodeValue.length)
                    self.setEndAfter(container);
            }
        },
        setStartAfter : function(node) {
            this.setStart(node.parent(), node._4e_index() + 1);
        },

        setStartBefore : function(node) {
            this.setStart(node.parent(), node._4e_index());
        },

        setEndAfter : function(node) {
            this.setEnd(node.parent(), node._4e_index() + 1);
        },

        setEndBefore : function(node) {
            this.setEnd(node.parent(), node._4e_index());
        },
        optimizeBookmark: function() {
            var self = this,startNode = self.startContainer,
                endNode = self.endContainer;

            if (startNode && startNode._4e_name() == 'span'
                && startNode.attr('_ke_bookmark'))
                self.setStartAt(startNode, KER.POSITION_BEFORE_START);
            if (endNode && endNode._4e_name() == 'span'
                && endNode.attr('_ke_bookmark'))
                self.setEndAt(endNode, KER.POSITION_AFTER_END);
        },
        /**
         * Sets the start position of a Range.
         * @param {Node} startNode The node to start the range.
         * @param {Number} startOffset An integer greater than or equal to zero
         *        representing the offset for the start of the range from the start
         *        of startNode.
         */
        setStart : function(startNode, startOffset) {
            // W3C requires a check for the new position. If it is after the end
            // boundary, the range should be collapsed to the new start. It seams
            // we will not need this check for our use of this class so we can
            // ignore it for now.

            // Fixing invalid range start inside dtd empty elements.
            var self = this;
            if (startNode[0].nodeType == KEN.NODE_ELEMENT
                && EMPTY[ startNode._4e_name() ])
                startNode = startNode.parent(),startOffset = startNode._4e_index();

            self.startContainer = startNode;
            self.startOffset = startOffset;

            if (!self.endContainer) {
                self.endContainer = startNode;
                self.endOffset = startOffset;
            }

            self.updateCollapsed();
        },

        /**
         * Sets the end position of a Range.
         * @param {Node} endNode The node to end the range.
         * @param {Number} endOffset An integer greater than or equal to zero
         *        representing the offset for the end of the range from the start
         *        of endNode.
         */
        setEnd : function(endNode, endOffset) {
            // W3C requires a check for the new position. If it is before the start
            // boundary, the range should be collapsed to the new end. It seams we
            // will not need this check for our use of this class so we can ignore
            // it for now.

            // Fixing invalid range end inside dtd empty elements.
            var self = this;
            if (endNode[0].nodeType == KEN.NODE_ELEMENT
                && EMPTY[ endNode._4e_name() ])
                endNode = endNode.parent(),endOffset = endNode._4e_index() + 1;

            self.endContainer = endNode;
            self.endOffset = endOffset;

            if (!self.startContainer) {
                self.startContainer = endNode;
                self.startOffset = endOffset;
            }

            self.updateCollapsed();
        },
        setStartAt : function(node, position) {
            var self = this;
            switch (position) {
                case KER.POSITION_AFTER_START :
                    self.setStart(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType == KEN.NODE_TEXT)
                        self.setStart(node, node[0].nodeValue.length);
                    else
                        self.setStart(node, node[0].childNodes.length);
                    break;

                case KER.POSITION_BEFORE_START :
                    self.setStartBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    self.setStartAfter(node);
            }

            self.updateCollapsed();
        },

        setEndAt : function(node, position) {
            var self = this;
            switch (position) {
                case KER.POSITION_AFTER_START :
                    self.setEnd(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType == KEN.NODE_TEXT)
                        self.setEnd(node, node[0].nodeValue.length);
                    else
                        self.setEnd(node, node[0].childNodes.length);
                    break;

                case KER.POSITION_BEFORE_START :
                    self.setEndBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    self.setEndAfter(node);
            }

            self.updateCollapsed();
        },
        execContentsAction:    function(action, docFrag) {
            var self = this,
                startNode = self.startContainer, endNode = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                removeStartNode,
                t,
                removeEndNode;
            self.optimizeBookmark();
            // For text containers, we must simply split the node and point to the
            // second part. The removal will be handled by the rest of the code .
            if (endNode[0].nodeType == KEN.NODE_TEXT)
                endNode = endNode._4e_splitText(endOffset);
            else {
                // If the end container has children and the offset is pointing
                // to a child, then we should start from it.
                if (endNode[0].childNodes.length > 0) {
                    // If the offset points after the last node.
                    if (endOffset >= endNode[0].childNodes.length) {
                        // Let's create a temporary node and mark it for removal.
                        endNode = new Node(endNode[0].appendChild(self.document.createTextNode("")));
                        removeEndNode = true;
                    }
                    else
                        endNode = new Node(endNode[0].childNodes[endOffset]);
                }
            }

            // For text containers, we must simply split the node. The removal will
            // be handled by the rest of the code .
            if (startNode[0].nodeType == KEN.NODE_TEXT) {
                startNode._4e_splitText(startOffset);
                // In cases the end node is the same as the start node, the above
                // splitting will also split the end, so me must move the end to
                // the second part of the split.
                if (DOM._4e_equals(startNode, endNode))
                    endNode = new Node(startNode[0].nextSibling);
            }
            else {
                // If the start container has children and the offset is pointing
                // to a child, then we should start from its previous sibling.

                // If the offset points to the first node, we don't have a
                // sibling, so let's use the first one, but mark it for removal.
                if (!startOffset) {
                    // Let's create a temporary node and mark it for removal.
                    t = new Node(self.document.createTextNode(""));
                    DOM.insertBefore(t[0], startNode[0].firstChild);
                    startNode = t;
                    removeStartNode = true;
                }
                else if (startOffset >= startNode[0].childNodes.length) {
                    // Let's create a temporary node and mark it for removal.
                    //startNode = startNode[0].appendChild(self.document.createTextNode(''));
                    t = new Node(self.document.createTextNode(""));
                    startNode[0].appendChild(t[0]);
                    startNode = t;
                    removeStartNode = true;
                } else
                    startNode = new Node(startNode[0].childNodes[startOffset].previousSibling);
            }

            // Get the parent nodes tree for the start and end boundaries.
            var startParents = startNode._4e_parents();
            var endParents = endNode._4e_parents();

            // Compare them, to find the top most siblings.
            var i, topStart, topEnd;

            for (i = 0; i < startParents.length; i++) {
                topStart = startParents[ i ];
                topEnd = endParents[ i ];

                // The compared nodes will match until we find the top most
                // siblings (different nodes that have the same parent).
                // "i" will hold the index in the parents array for the top
                // most element.
                if (topStart[0] !== topEnd[0])
                    break;
            }

            var clone = docFrag, levelStartNode, levelClone, currentNode, currentSibling;

            // Remove all successive sibling nodes for every node in the
            // startParents tree.
            for (var j = i; j < startParents.length; j++) {
                levelStartNode = startParents[j];

                // For Extract and Clone, we must clone this level.
                if (clone && levelStartNode[0] !== startNode[0])        // action = 0 = Delete
                    levelClone = clone.appendChild(levelStartNode._4e_clone()[0]);

                currentNode = levelStartNode[0].nextSibling;

                while (currentNode) {
                    // Stop processing when the current node matches a node in the
                    // endParents tree or if it is the endNode.
                    if ((endParents[ j ] && currentNode == endParents[ j ][0]) || currentNode == endNode[0])
                        break;

                    // Cache the next sibling.
                    currentSibling = currentNode.nextSibling;

                    // If cloning, just clone it.
                    if (action == 2)    // 2 = Clone
                        clone.appendChild(currentNode.cloneNode(true));
                    else {
                        // Both Delete and Extract will remove the node.
                        currentNode.parentNode.removeChild(currentNode);

                        // When Extracting, move the removed node to the docFrag.
                        if (action == 1)    // 1 = Extract
                            clone.appendChild(currentNode);
                    }

                    currentNode = currentSibling;
                }
                //ckeditor这里错了，当前节点的路径所在父节点不能clone(true)，要在后面深入子节点处理
                if (levelClone)
                    clone = levelClone;
            }

            clone = docFrag;

            // Remove all previous sibling nodes for every node in the
            // endParents tree.
            for (var k = i; k < endParents.length; k++) {
                levelStartNode = endParents[ k ];

                // For Extract and Clone, we must clone this level.
                if (action > 0 && levelStartNode[0] !== endNode[0])        // action = 0 = Delete
                    levelClone = clone.appendChild(levelStartNode._4e_clone()[0]);

                // The processing of siblings may have already been done by the parent.
                if (!startParents[ k ] || levelStartNode[0].parentNode !== startParents[ k ][0].parentNode) {
                    currentNode = levelStartNode[0].previousSibling;
                    while (currentNode) {
                        // Stop processing when the current node matches a node in the
                        // startParents tree or if it is the startNode.
                        if ((startParents[ k ] && currentNode == startParents[ k ][0]) || currentNode === startNode[0])
                            break;

                        // Cache the next sibling.
                        currentSibling = currentNode.previousSibling;

                        // If cloning, just clone it.
                        if (action == 2) {    // 2 = Clone
                            clone.insertBefore(currentNode.cloneNode(true), clone.firstChild);
                        }

                        else {
                            // Both Delete and Extract will remove the node.
                            currentNode.parentNode.removeChild(currentNode);

                            // When Extracting, mode the removed node to the docFrag.
                            if (action == 1)    // 1 = Extract
                                clone.insertBefore(currentNode, clone.firstChild);
                        }

                        currentNode = currentSibling;
                    }
                }

                if (levelClone)
                    clone = levelClone;
            }

            if (action == 2) {   // 2 = Clone.

                // No changes in the DOM should be done, so fix the split text (if any).

                var startTextNode = self.startContainer[0];
                if (startTextNode.nodeType == KEN.NODE_TEXT
                    && startTextNode.nextSibling
                    //yiminghe note:careful,nextsilbling should be text node
                    && startTextNode.nextSibling.nodeType == KEN.NODE_TEXT) {
                    startTextNode.data += startTextNode.nextSibling.data;
                    startTextNode.parentNode.removeChild(startTextNode.nextSibling);
                }

                var endTextNode = self.endContainer[0];
                if (endTextNode.nodeType == KEN.NODE_TEXT &&
                    endTextNode.nextSibling &&
                    endTextNode.nextSibling.nodeType == KEN.NODE_TEXT) {
                    endTextNode.data += endTextNode.nextSibling.data;
                    endTextNode.parentNode.removeChild(endTextNode.nextSibling);
                }
            }
            else {
                // Collapse the range.

                // If a node has been partially selected, collapse the range between
                // topStart and topEnd. Otherwise, simply collapse it to the start. (W3C specs).
                if (topStart && topEnd && ( startNode[0].parentNode != topStart[0].parentNode || endNode[0].parentNode != topEnd[0].parentNode )) {
                    var endIndex = topEnd._4e_index();

                    // If the start node is to be removed, we must correct the
                    // index to reflect the removal.
                    if (removeStartNode && topEnd[0].parentNode == startNode[0].parentNode)
                        endIndex--;

                    self.setStart(topEnd.parent(), endIndex);
                }

                // Collapse it to the start.
                self.collapse(true);
            }

            // Cleanup any marked node.
            if (removeStartNode)
                startNode._4e_remove();

            if (removeEndNode && endNode[0].parentNode)
            //不能使用remove()
                endNode._4e_remove();
        },

        collapse : function(toStart) {
            var self = this;
            if (toStart) {
                self.endContainer = self.startContainer;
                self.endOffset = self.startOffset;
            } else {
                self.startContainer = self.endContainer;
                self.startOffset = self.endOffset;
            }
            self.collapsed = true;
        },

        clone : function() {
            var self = this,
                clone = new KERange(self.document);

            clone.startContainer = self.startContainer;
            clone.startOffset = self.startOffset;
            clone.endContainer = self.endContainer;
            clone.endOffset = self.endOffset;
            clone.collapsed = self.collapsed;

            return clone;
        },
        getEnclosedNode : function() {
            var walkerRange = this.clone();
            // Optimize and analyze the range to avoid DOM destructive nature of walker.
            walkerRange.optimize();
            if (walkerRange.startContainer[0].nodeType != KEN.NODE_ELEMENT
                || walkerRange.endContainer[0].nodeType != KEN.NODE_ELEMENT)
                return null;
            //var current = walkerRange.startContainer[0].childNodes[walkerRange.startOffset];
            var walker = new KE.Walker(walkerRange),
                isNotBookmarks = bookmark(true, undefined),
                isNotWhitespaces = whitespaces(true),node,pre;
            walkerRange.evaluator = function(node) {
                return isNotWhitespaces(node) && isNotBookmarks(node);
            };

            //深度优先遍历的第一个元素
            //        x
            //     y     z
            // x->y ,return y
            node = walker.next();
            walker.reset();
            pre = walker.previous();
            //前后相等，则脱一层皮 :)
            return node && node._4e_equals(pre) ? node : null;
        },
        shrink : function(mode, selectContents) {
            // Unable to shrink a collapsed range.
            var self = this;
            if (!self.collapsed) {
                mode = mode || KER.SHRINK_TEXT;

                var walkerRange = self.clone(),
                    startContainer = self.startContainer,
                    endContainer = self.endContainer,
                    startOffset = self.startOffset,
                    endOffset = self.endOffset;
                //collapsed = self.collapsed;

                // Whether the start/end boundary is moveable.
                var moveStart = 1,
                    moveEnd = 1;

                if (startContainer && startContainer[0].nodeType == KEN.NODE_TEXT) {
                    if (!startOffset)
                        walkerRange.setStartBefore(startContainer);
                    else if (startOffset >= startContainer[0].nodeValue.length)
                        walkerRange.setStartAfter(startContainer);
                    else {
                        // Enlarge the range properly to avoid walker making
                        // DOM changes caused by triming the text nodes later.
                        walkerRange.setStartBefore(startContainer);
                        moveStart = 0;
                    }
                }

                if (endContainer && endContainer[0].nodeType == KEN.NODE_TEXT) {
                    if (!endOffset)
                        walkerRange.setEndBefore(endContainer);
                    else if (endOffset >= endContainer[0].nodeValue.length)
                        walkerRange.setEndAfter(endContainer);
                    else {
                        walkerRange.setEndAfter(endContainer);
                        moveEnd = 0;
                    }
                }

                var walker = new Walker(walkerRange);

                walker.evaluator = function(node) {
                    node = node[0] || node;
                    return node.nodeType == ( mode == KER.SHRINK_ELEMENT ?
                        KEN.NODE_ELEMENT : KEN.NODE_TEXT );
                };

                var currentElement;
                walker.guard = function(node, movingOut) {

                    node = node[0] || node;
                    // Stop when we're shrink in element mode while encountering a text node.
                    if (mode == KER.SHRINK_ELEMENT && node.nodeType == KEN.NODE_TEXT)
                        return false;

                    // Stop when we've already walked "through" an element.
                    if (movingOut && node == currentElement)
                        return false;

                    if (!movingOut && node.nodeType == KEN.NODE_ELEMENT)
                        currentElement = node;

                    return true;
                };

                if (moveStart) {
                    var textStart = walker[ mode == KER.SHRINK_ELEMENT ? 'lastForward' : 'next']();
                    textStart && self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
                }

                if (moveEnd) {
                    walker.reset();
                    var textEnd = walker[ mode == KER.SHRINK_ELEMENT ? 'lastBackward' : 'previous']();
                    textEnd && self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
                }

                return !!( moveStart || moveEnd );
            }
        },
        getTouchedStartNode : function() {
            var self = this,container = self.startContainer;

            if (self.collapsed || container[0].nodeType != KEN.NODE_ELEMENT)
                return container;

            return container.childNodes[self.startOffset] || container;
        },
        createBookmark2 : function(normalized) {
            //debugger;
            var self = this,startContainer = self.startContainer,
                endContainer = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                child, previous;

            // If there is no range then get out of here.
            // It happens on initial load in Safari #962 and if the editor it's
            // hidden also in Firefox
            if (!startContainer || !endContainer)
                return { start : 0, end : 0 };

            if (normalized) {
                // Find out if the start is pointing to a text node that will
                // be normalized.
                if (startContainer[0].nodeType == KEN.NODE_ELEMENT) {
                    child = new Node(startContainer[0].childNodes[startOffset]);

                    // In this case, move the start information to that text
                    // node.
                    if (child && child[0] && child[0].nodeType == KEN.NODE_TEXT
                        && startOffset > 0 && child[0].previousSibling.nodeType == KEN.NODE_TEXT) {
                        startContainer = child;
                        startOffset = 0;
                    }
                }

                // Normalize the start.
                while (startContainer[0].nodeType == KEN.NODE_TEXT
                    && ( previous = startContainer._4e_previous() )
                    && previous[0].nodeType == KEN.NODE_TEXT) {
                    startContainer = previous;
                    startOffset += previous[0].nodeValue.length;
                }

                // Process the end only if not normalized.
                if (!self.collapsed) {
                    // Find out if the start is pointing to a text node that
                    // will be normalized.
                    if (endContainer[0].nodeType == KEN.NODE_ELEMENT) {
                        child = new Node(endContainer[0].childNodes[endOffset]);

                        // In this case, move the start information to that
                        // text node.
                        if (child && child[0] && child[0].nodeType == KEN.NODE_TEXT
                            && endOffset > 0 && child[0].previousSibling.nodeType == KEN.NODE_TEXT) {
                            endContainer = child;
                            endOffset = 0;
                        }
                    }

                    // Normalize the end.
                    while (endContainer[0].nodeType == KEN.NODE_TEXT
                        && ( previous = endContainer._4e_previous() )
                        && previous[0].nodeType == KEN.NODE_TEXT) {
                        endContainer = previous;
                        endOffset += previous[0].nodeValue.length;
                    }
                }
            }

            return {
                start        : startContainer._4e_address(normalized),
                end            : self.collapsed ? null : endContainer._4e_address(normalized),
                startOffset    : startOffset,
                endOffset    : endOffset,
                normalized    : normalized,
                is2            : true        // It's a createBookmark2 bookmark.
            };
        },
        createBookmark : function(serializable) {
            var startNode,
                endNode,
                baseId,
                clone,
                self = this;
            startNode = new Node("<span>", null, self.document);
            startNode.attr('_ke_bookmark', 1);
            startNode.css('display', 'none');

            // For IE, it must have something inside, otherwise it may be
            // removed during DOM operations.
            startNode.html('&nbsp;');

            if (serializable) {
                baseId = S.guid('ke_bm_');
                startNode.attr('id', baseId + 'S');
            }

            // If collapsed, the endNode will not be created.
            if (!self.collapsed) {
                endNode = startNode._4e_clone();
                endNode.html('&nbsp;');

                if (serializable)
                    endNode.attr('id', baseId + 'E');

                clone = self.clone();
                clone.collapse();
                clone.insertNode(endNode);
            }

            clone = self.clone();
            clone.collapse(true);
            clone.insertNode(startNode);

            // Update the range position.
            if (endNode) {
                self.setStartAfter(startNode);
                self.setEndBefore(endNode);
            }
            else
                self.moveToPosition(startNode, KER.POSITION_AFTER_END);

            return {
                startNode : serializable ? baseId + 'S' : startNode,
                endNode : serializable ? baseId + 'E' : endNode,
                serializable : serializable
            };
        },
        moveToPosition : function(node, position) {
            var self = this;
            self.setStartAt(node, position);
            self.collapse(true);
        },
        trim : function(ignoreStart, ignoreEnd) {
            var self = this,startContainer = self.startContainer,
                startOffset = self.startOffset,
                collapsed = self.collapsed;
            if (( !ignoreStart || collapsed )
                && startContainer[0] && startContainer[0].nodeType == KEN.NODE_TEXT) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!startOffset) {
                    startOffset = startContainer._4e_index();
                    startContainer = startContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (startOffset >= startContainer[0].nodeValue.length) {
                    startOffset = startContainer._4e_index() + 1;
                    startContainer = startContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    var nextText = startContainer._4e_splitText(startOffset);

                    startOffset = startContainer._4e_index() + 1;
                    startContainer = startContainer.parent();

                    // Check all necessity of updating the end boundary.
                    if (DOM._4e_equals(self.startContainer, self.endContainer))
                        self.setEnd(nextText, self.endOffset - self.startOffset);
                    else if (DOM._4e_equals(startContainer, self.endContainer))
                        self.endOffset += 1;
                }

                self.setStart(startContainer, startOffset);

                if (collapsed) {
                    self.collapse(true);
                    return;
                }
            }

            var endContainer = self.endContainer,endOffset = self.endOffset;

            if (!( ignoreEnd || collapsed )
                && endContainer[0] && endContainer[0].nodeType == KEN.NODE_TEXT) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!endOffset) {
                    endOffset = endContainer._4e_index();
                    endContainer = endContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (endOffset >= endContainer.nodeValue.length) {
                    endOffset = endContainer._4e_index() + 1;
                    endContainer = endContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    endContainer._4e_splitText(endOffset);

                    endOffset = endContainer._4e_index() + 1;
                    endContainer = endContainer.parent();
                }

                self.setEnd(endContainer, endOffset);
            }
        },

        insertNode : function(node) {
            var self = this;
            self.optimizeBookmark();
            self.trim(false, true);
            var startContainer = self.startContainer,
                startOffset = self.startOffset,
                nextNode = startContainer[0].childNodes[startOffset];
            self.optimizeBookmark();
            self.trim(false, true);


            if (nextNode) {
                DOM.insertBefore(node[0] || node, nextNode);
            } else
                startContainer[0].appendChild(node[0] || node);

            // Check if we need to update the end boundary.
            if (DOM._4e_equals(node.parent(), self.endContainer))
                self.endOffset++;

            // Expand the range to embrace the new node.
            self.setStartBefore(node);
        },

        moveToBookmark : function(bookmark) {
            // Created with createBookmark2().
            var self = this;
            if (bookmark.is2) {
                // Get the start information.
                var startContainer = getByAddress(self.document, bookmark.start, bookmark.normalized),
                    startOffset = bookmark.startOffset,
                    endContainer = bookmark.end && getByAddress(self.document, bookmark.end, bookmark.normalized),
                    endOffset = bookmark.endOffset;

                // Set the start boundary.
                self.setStart(startContainer, startOffset);

                // Set the end boundary. If not available, collapse it.
                if (endContainer)
                    self.setEnd(endContainer, endOffset);
                else
                    self.collapse(true);
            } else {
                // Created with createBookmark().
                var serializable = bookmark.serializable,
                    startNode = serializable ? S.one("#" + bookmark.startNode, self.document) : bookmark.startNode,
                    endNode = serializable ? S.one("#" + bookmark.endNode, self.document) : bookmark.endNode;

                // Set the range start at the bookmark start node position.
                self.setStartBefore(startNode);

                // Remove it, because it may interfere in the setEndBefore call.
                startNode._4e_remove();

                // Set the range end at the bookmark end node position, or simply
                // collapse it if it is not available.
                if (endNode && endNode[0]) {
                    self.setEndBefore(endNode);
                    endNode._4e_remove();
                }
                else
                    self.collapse(true);
            }
        },
        getCommonAncestor : function(includeSelf, ignoreTextNode) {
            var self = this,start = self.startContainer,
                end = self.endContainer,
                ancestor;

            if (DOM._4e_equals(start, end)) {
                if (includeSelf
                    && start[0].nodeType == KEN.NODE_ELEMENT
                    && self.startOffset == self.endOffset - 1)
                    ancestor = new Node(start[0].childNodes[self.startOffset]);
                else
                    ancestor = start;
            }
            else
                ancestor = start._4e_commonAncestor(end);

            return ignoreTextNode && ancestor[0].nodeType == KEN.NODE_TEXT
                ? ancestor.parent() : ancestor;
        },
        enlarge : function(unit) {
            var self = this;
            switch (unit) {
                case KER.ENLARGE_ELEMENT :

                    if (self.collapsed)
                        return;

                    // Get the common ancestor.
                    var commonAncestor = self.getCommonAncestor(), body = new Node(self.document.body),
                        // For each boundary
                        //		a. Depending on its position, find out the first node to be checked (a sibling) or, if not available, to be enlarge.
                        //		b. Go ahead checking siblings and enlarging the boundary as much as possible until the common ancestor is not reached. After reaching the common ancestor, just save the enlargeable node to be used later.

                        startTop, endTop,
                        enlargeable, sibling, commonReached,

                        // Indicates that the node can be added only if whitespace
                        // is available before it.
                        needsWhiteSpace = false, isWhiteSpace, siblingText,

                        // Process the start boundary.

                        container = self.startContainer,
                        offset = self.startOffset;

                    if (container[0].nodeType == KEN.NODE_TEXT) {
                        if (offset) {
                            // Check if there is any non-space text before the
                            // offset. Otherwise, container is null.
                            container = !S.trim(container[0].nodeValue.substring(0, offset)).length && container;

                            // If we found only whitespace in the node, it
                            // means that we'll need more whitespace to be able
                            // to expand. For example, <i> can be expanded in
                            // "A <i> [B]</i>", but not in "A<i> [B]</i>".
                            needsWhiteSpace = !!container;
                        }

                        if (container) {
                            if (!( sibling = container[0].previousSibling ))
                                enlargeable = container.parent();
                        }
                    }
                    else {
                        // If we have offset, get the node preceeding it as the
                        // first sibling to be checked.
                        if (offset)
                            sibling = container[0].childNodes[offset - 1] || container[0].lastChild;

                        // If there is no sibling, mark the container to be
                        // enlarged.
                        if (!sibling)
                            enlargeable = container;
                    }

                    while (enlargeable || sibling) {
                        if (enlargeable && !sibling) {
                            // If we reached the common ancestor, mark the flag
                            // for it.
                            if (!commonReached && DOM._4e_equals(enlargeable, commonAncestor))
                                commonReached = true;

                            if (!body._4e_contains(enlargeable))
                                break;

                            // If we don't need space or this element breaks
                            // the line, then enlarge it.
                            if (!needsWhiteSpace || enlargeable.css('display') != 'inline') {
                                needsWhiteSpace = false;

                                // If the common ancestor has been reached,
                                // we'll not enlarge it immediately, but just
                                // mark it to be enlarged later if the end
                                // boundary also enlarges it.
                                if (commonReached)
                                    startTop = enlargeable;
                                else
                                    self.setStartBefore(enlargeable);
                            }

                            sibling = enlargeable[0].previousSibling;
                        }

                        // Check all sibling nodes preceeding the enlargeable
                        // node. The node wil lbe enlarged only if none of them
                        // blocks it.
                        while (sibling) {
                            // This flag indicates that this node has
                            // whitespaces at the end.
                            isWhiteSpace = false;

                            if (sibling.nodeType == KEN.NODE_TEXT) {
                                siblingText = sibling.nodeValue;

                                if (/[^\s\ufeff]/.test(siblingText))
                                    sibling = null;

                                isWhiteSpace = /[\s\ufeff]$/.test(siblingText);
                            }
                            else {
                                // If this is a visible element.
                                // We need to check for the bookmark attribute because IE insists on
                                // rendering the display:none nodes we use for bookmarks. (#3363)
                                if (sibling.offsetWidth > 0 && !sibling.getAttribute('_ke_bookmark')) {
                                    // We'll accept it only if we need
                                    // whitespace, and this is an inline
                                    // element with whitespace only.
                                    if (needsWhiteSpace && dtd.$removeEmpty[ sibling.nodeName.toLowerCase() ]) {
                                        // It must contains spaces and inline elements only.

                                        siblingText = DOM.text(sibling);

                                        if ((/[^\s\ufeff]/).test(siblingText))    // Spaces + Zero Width No-Break Space (U+FEFF)
                                            sibling = null;
                                        else {
                                            var allChildren = sibling.all || sibling.getElementsByTagName('*');
                                            for (var i = 0, child; child = allChildren[ i++ ];) {
                                                if (!dtd.$removeEmpty[ child.nodeName.toLowerCase() ]) {
                                                    sibling = null;
                                                    break;
                                                }
                                            }
                                        }

                                        if (sibling)
                                            isWhiteSpace = !!siblingText.length;
                                    }
                                    else
                                        sibling = null;
                                }
                            }

                            // A node with whitespaces has been found.
                            if (isWhiteSpace) {
                                // Enlarge the last enlargeable node, if we
                                // were waiting for spaces.
                                if (needsWhiteSpace) {
                                    if (commonReached)
                                        startTop = enlargeable;
                                    else if (enlargeable)
                                        self.setStartBefore(enlargeable);
                                }
                                else
                                    needsWhiteSpace = true;
                            }

                            if (sibling) {
                                var next = sibling.previousSibling;

                                if (!enlargeable && !next) {
                                    // Set the sibling as enlargeable, so it's
                                    // parent will be get later outside this while.
                                    enlargeable = new Node(sibling);
                                    sibling = null;
                                    break;
                                }

                                sibling = next;
                            }
                            else {
                                // If sibling has been set to null, then we
                                // need to stop enlarging.
                                enlargeable = null;
                            }
                        }

                        if (enlargeable)
                            enlargeable = enlargeable.parent();
                    }

                    // Process the end boundary. This is basically the same
                    // code used for the start boundary, with small changes to
                    // make it work in the opposite side (to the right). This
                    // makes it difficult to reuse the code here. So, fixes to
                    // the above code are likely to be replicated here.

                    container = self.endContainer;
                    offset = self.endOffset;

                    // Reset the common variables.
                    enlargeable = sibling = null;
                    commonReached = needsWhiteSpace = false;

                    if (container[0].nodeType == KEN.NODE_TEXT) {
                        // Check if there is any non-space text after the
                        // offset. Otherwise, container is null.
                        container = !S.trim(container[0].nodeValue.substring(offset)).length && container;

                        // If we found only whitespace in the node, it
                        // means that we'll need more whitespace to be able
                        // to expand. For example, <i> can be expanded in
                        // "A <i> [B]</i>", but not in "A<i> [B]</i>".
                        needsWhiteSpace = !( container && container[0].nodeValue.length );

                        if (container) {
                            if (!( sibling = container[0].nextSibling ))
                                enlargeable = container.parent();
                        }
                    }
                    else {
                        // Get the node right after the boudary to be checked
                        // first.
                        sibling = container[0].childNodes[offset];

                        if (!sibling)
                            enlargeable = container;
                    }

                    while (enlargeable || sibling) {
                        if (enlargeable && !sibling) {
                            if (!commonReached && DOM._4e_equals(enlargeable, commonAncestor))
                                commonReached = true;

                            if (!body._4e_contains(enlargeable))
                                break;

                            if (!needsWhiteSpace || enlargeable.css('display') != 'inline') {
                                needsWhiteSpace = false;

                                if (commonReached)
                                    endTop = enlargeable;
                                else if (enlargeable)
                                    self.setEndAfter(enlargeable);
                            }

                            sibling = enlargeable[0].nextSibling;
                        }

                        while (sibling) {
                            isWhiteSpace = false;

                            if (sibling.nodeType == KEN.NODE_TEXT) {
                                siblingText = sibling.nodeValue;

                                if (/[^\s\ufeff]/.test(siblingText))
                                    sibling = null;

                                isWhiteSpace = /^[\s\ufeff]/.test(siblingText);
                            }
                            else {
                                // If this is a visible element.
                                // We need to check for the bookmark attribute because IE insists on
                                // rendering the display:none nodes we use for bookmarks. (#3363)
                                if (sibling.offsetWidth > 0 && !sibling.getAttribute('_ke_bookmark')) {
                                    // We'll accept it only if we need
                                    // whitespace, and this is an inline
                                    // element with whitespace only.
                                    if (needsWhiteSpace && dtd.$removeEmpty[ sibling.nodeName.toLowerCase() ]) {
                                        // It must contains spaces and inline elements only.

                                        siblingText = DOM.text(sibling);

                                        if ((/[^\s\ufeff]/).test(siblingText))
                                            sibling = null;
                                        else {
                                            allChildren = sibling.all || sibling.getElementsByTagName('*');
                                            for (i = 0; child = allChildren[ i++ ];) {
                                                if (!dtd.$removeEmpty[ child.nodeName.toLowerCase() ]) {
                                                    sibling = null;
                                                    break;
                                                }
                                            }
                                        }

                                        if (sibling)
                                            isWhiteSpace = !!siblingText.length;
                                    }
                                    else
                                        sibling = null;
                                }
                            }

                            if (isWhiteSpace) {
                                if (needsWhiteSpace) {
                                    if (commonReached)
                                        endTop = enlargeable;
                                    else
                                        self.setEndAfter(enlargeable);
                                }
                            }

                            if (sibling) {
                                next = sibling.nextSibling;

                                if (!enlargeable && !next) {
                                    enlargeable = new Node(sibling);
                                    sibling = null;
                                    break;
                                }

                                sibling = next;
                            }
                            else {
                                // If sibling has been set to null, then we
                                // need to stop enlarging.
                                enlargeable = null;
                            }
                        }

                        if (enlargeable)
                            enlargeable = enlargeable.parent();
                    }

                    // If the common ancestor can be enlarged by both boundaries, then include it also.
                    if (startTop && endTop) {
                        commonAncestor = startTop._4e_contains(endTop) ? endTop : startTop;
                        self.setStartBefore(commonAncestor);
                        self.setEndAfter(commonAncestor);
                    }
                    break;

                case KER.ENLARGE_BLOCK_CONTENTS:
                case KER.ENLARGE_LIST_ITEM_CONTENTS:

                    // Enlarging the start boundary.
                    var walkerRange = new KERange(self.document);
                    body = new Node(self.document.body);

                    walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
                    walkerRange.setEnd(self.startContainer, self.startOffset);

                    var walker = new Walker(walkerRange),
                        blockBoundary,  // The node on which the enlarging should stop.
                        tailBr, //
                        defaultGuard = Walker.blockBoundary(
                            ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                            { br : 1 } : null),
                        // Record the encountered 'blockBoundary' for later use.
                        boundaryGuard = function(node) {
                            var retval = defaultGuard(node);
                            if (!retval)
                                blockBoundary = node;
                            return retval;
                        },
                        // Record the encounted 'tailBr' for later use.
                        tailBrGuard = function(node) {
                            var retval = boundaryGuard(node);
                            if (!retval && node[0] && node._4e_name() == 'br')
                                tailBr = node;
                            return retval;
                        };

                    walker.guard = boundaryGuard;

                    enlargeable = walker.lastBackward();

                    // It's the body which stop the enlarging if no block boundary found.
                    blockBoundary = blockBoundary || body;

                    // Start the range at different position by comparing
                    // the document position of it with 'enlargeable' node.
                    self.setStartAt(
                        blockBoundary,
                        blockBoundary._4e_name() != 'br' &&
                            ( !enlargeable && self.checkStartOfBlock()
                                || enlargeable && blockBoundary._4e_contains(enlargeable) ) ?
                            KER.POSITION_AFTER_START :
                            KER.POSITION_AFTER_END);

                    // Enlarging the end boundary.
                    walkerRange = self.clone();
                    walkerRange.collapse();
                    walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
                    walker = new Walker(walkerRange);

                    // tailBrGuard only used for on range end.
                    walker.guard = ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                        tailBrGuard : boundaryGuard;
                    blockBoundary = null;
                    // End the range right before the block boundary node.

                    enlargeable = walker.lastForward();

                    // It's the body which stop the enlarging if no block boundary found.
                    blockBoundary = blockBoundary || body;

                    // Start the range at different position by comparing
                    // the document position of it with 'enlargeable' node.
                    self.setEndAt(
                        blockBoundary,
                        ( !enlargeable && self.checkEndOfBlock()
                            || enlargeable && blockBoundary._4e_contains(enlargeable) ) ?
                            KER.POSITION_BEFORE_END :
                            KER.POSITION_BEFORE_START);
                    // We must include the <br> at the end of range if there's
                    // one and we're expanding list item contents
                    if (tailBr)
                        self.setEndAfter(tailBr);
            }
        },
        checkStartOfBlock : function() {
            var self = this,startContainer = self.startContainer,
                startOffset = self.startOffset;

            // If the starting node is a text node, and non-empty before the offset,
            // then we're surely not at the start of block.
            if (startOffset && startContainer[0].nodeType == KEN.NODE_TEXT) {
                var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
                if (textBefore.length)
                    return false;
            }

            // Antecipate the trim() call here, so the walker will not make
            // changes to the DOM, which would not get reflected into this
            // range otherwise.
            self.trim();

            // We need to grab the block element holding the start boundary, so
            // let's use an element path for it.
            var path = new ElementPath(self.startContainer);

            // Creates a range starting at the block start until the range start.
            var walkerRange = self.clone();
            walkerRange.collapse(true);
            walkerRange.setStartAt(path.block || path.blockLimit, KER.POSITION_AFTER_START);

            var walker = new Walker(walkerRange);
            walker.evaluator = getCheckStartEndBlockEvalFunction(true);

            return walker.checkBackward();
        },

        checkEndOfBlock : function() {
            var self = this,endContainer = self.endContainer,
                endOffset = self.endOffset;

            // If the ending node is a text node, and non-empty after the offset,
            // then we're surely not at the end of block.
            if (endContainer[0].nodeType == KEN.NODE_TEXT) {
                var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
                if (textAfter.length)
                    return false;
            }

            // Antecipate the trim() call here, so the walker will not make
            // changes to the DOM, which would not get reflected into this
            // range otherwise.
            self.trim();

            // We need to grab the block element holding the start boundary, so
            // let's use an element path for it.
            var path = new ElementPath(self.endContainer);

            // Creates a range starting at the block start until the range start.
            var walkerRange = self.clone();
            walkerRange.collapse(false);
            walkerRange.setEndAt(path.block || path.blockLimit, KER.POSITION_BEFORE_END);

            var walker = new Walker(walkerRange);
            walker.evaluator = getCheckStartEndBlockEvalFunction(false);

            return walker.checkForward();
        },
        deleteContents:function() {
            var self = this;
            if (self.collapsed)
                return;
            self.execContentsAction(0);
        },
        extractContents : function() {
            var self = this, docFrag = self.document.createDocumentFragment();
            if (!self.collapsed)
                self.execContentsAction(1, docFrag);
            return docFrag;
        },
        /**
         * Check whether current range is on the inner edge of the specified element.
         * @param {Number} checkType ( CKEDITOR.START | CKEDITOR.END ) The checking side.
         * @param {Node} element The target element to check.
         */
        checkBoundaryOfElement : function(element, checkType) {
            var walkerRange = this.clone();
            // Expand the range to element boundary.
            walkerRange[ checkType == KER.START ?
                'setStartAt' : 'setEndAt' ]
                (element, checkType == KER.START ?
                    KER.POSITION_AFTER_START
                    : KER.POSITION_BEFORE_END);

            var walker = new Walker(walkerRange);

            walker.evaluator = elementBoundaryEval;
            return walker[ checkType == KER.START ?
                'checkBackward' : 'checkForward' ]();
        },

        getBoundaryNodes : function() {
            var self = this,startNode = self.startContainer,
                endNode = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                childCount;

            if (startNode[0].nodeType == KEN.NODE_ELEMENT) {
                childCount = startNode[0].childNodes.length;
                if (childCount > startOffset)
                    startNode = new Node(startNode[0].childNodes[startOffset]);
                else if (childCount < 1)
                    startNode = startNode._4e_previousSourceNode();
                else        // startOffset > childCount but childCount is not 0
                {
                    // Try to take the node just after the current position.
                    startNode = startNode[0];
                    while (startNode.lastChild)
                        startNode = startNode.lastChild;
                    startNode = new Node(startNode);

                    // Normally we should take the next node in DFS order. But it
                    // is also possible that we've already reached the end of
                    // document.
                    startNode = startNode._4e_nextSourceNode() || startNode;
                }
            }

            if (endNode[0].nodeType == KEN.NODE_ELEMENT) {
                childCount = endNode[0].childNodes.length;
                if (childCount > endOffset)
                    endNode = new Node(endNode[0].childNodes[endOffset])._4e_previousSourceNode(true);
                else if (childCount < 1)
                    endNode = endNode._4e_previousSourceNode();
                else        // endOffset > childCount but childCount is not 0
                {
                    // Try to take the node just before the current position.
                    endNode = endNode[0];
                    while (endNode.lastChild)
                        endNode = endNode.lastChild;
                    endNode = new Node(endNode);
                }
            }

            // Sometimes the endNode will come right before startNode for collapsed
            // ranges. Fix it. (#3780)
            if (startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING)
                startNode = endNode;

            return { startNode : startNode, endNode : endNode };
        },
        fixBlock : function(isStart, blockTag) {
            var self = this,bookmark = self.createBookmark(),
                fixedBlock = new Node(self.document.createElement(blockTag));

            self.collapse(isStart);

            self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
            fixedBlock[0].appendChild(self.extractContents());
            fixedBlock._4e_trim();

            if (!UA.ie)
                fixedBlock._4e_appendBogus();

            self.insertNode(fixedBlock);

            self.moveToBookmark(bookmark);

            return fixedBlock;
        },
        splitBlock : function(blockTag) {
            var self = this,startPath = new ElementPath(self.startContainer),
                endPath = new ElementPath(self.endContainer),
                startBlockLimit = startPath.blockLimit,
                endBlockLimit = endPath.blockLimit,
                startBlock = startPath.block,
                endBlock = endPath.block,
                elementPath = null;
            // Do nothing if the boundaries are in different block limits.
            if (!startBlockLimit._4e_equals(endBlockLimit))
                return null;

            // Get or fix current blocks.
            if (blockTag != 'br') {
                if (!startBlock) {
                    startBlock = self.fixBlock(true, blockTag);
                    endBlock = new ElementPath(self.endContainer).block;
                }

                if (!endBlock)
                    endBlock = self.fixBlock(false, blockTag);
            }

            // Get the range position.
            var isStartOfBlock = startBlock && self.checkStartOfBlock(),
                isEndOfBlock = endBlock && self.checkEndOfBlock();

            // Delete the current contents.
            // TODO: Why is 2.x doing CheckIsEmpty()?
            self.deleteContents();

            if (startBlock && DOM._4e_equals(startBlock, endBlock)) {
                if (isEndOfBlock) {
                    elementPath = new ElementPath(self.startContainer);
                    self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
                    endBlock = null;
                }
                else if (isStartOfBlock) {
                    elementPath = new ElementPath(self.startContainer);
                    self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
                    startBlock = null;
                }
                else {
                    endBlock = self.splitElement(startBlock);

                    // In Gecko, the last child node must be a bogus <br>.
                    // Note: bogus <br> added under <ul> or <ol> would cause
                    // lists to be incorrectly rendered.
                    if (!UA.ie && !S.inArray(startBlock._4e_name(), ['ul', 'ol']))
                        startBlock._4e_appendBogus();
                }
            }

            return {
                previousBlock : startBlock,
                nextBlock : endBlock,
                wasStartOfBlock : isStartOfBlock,
                wasEndOfBlock : isEndOfBlock,
                elementPath : elementPath
            };
        },
        splitElement : function(toSplit) {
            var self = this;
            if (!self.collapsed)
                return null;

            // Extract the contents of the block from the selection point to the end
            // of its contents.
            self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
            var documentFragment = self.extractContents(),

                // Duplicate the element after it.
                clone = toSplit._4e_clone(false);

            // Place the extracted contents into the duplicated element.
            clone[0].appendChild(documentFragment);
            clone.insertAfter(toSplit);
            self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
            return clone;
        },
        moveToElementEditablePosition : function(el, isMoveToEnd) {
            var self = this,isEditable,xhtml_dtd = KE.XHTML_DTD;

            // Empty elements are rejected.
            if (xhtml_dtd.$empty[ el._4e_name() ])
                return false;

            while (el && el[0].nodeType == KEN.NODE_ELEMENT) {
                isEditable = el._4e_isEditable();

                // If an editable element is found, move inside it.
                if (isEditable)
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_BEFORE_END :
                        KER.POSITION_AFTER_START);
                // Stop immediately if we've found a non editable inline element (e.g <img>).
                else if (xhtml_dtd.$inline[ el._4e_name() ]) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_AFTER_END :
                        KER.POSITION_BEFORE_START);
                    return true;
                }

                // Non-editable non-inline elements are to be bypassed, getting the next one.
                if (xhtml_dtd.$empty[ el._4e_name() ])
                    el = el[ isMoveToEnd ? '_4e_previous' : '_4e_next' ](nonWhitespaceOrBookmarkEval);
                else
                    el = el[ isMoveToEnd ? '_4e_last' : '_4e_first' ](nonWhitespaceOrBookmarkEval);

                // Stop immediately if we've found a text node.
                if (el && el[0].nodeType == KEN.NODE_TEXT) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_AFTER_END :
                        KER.POSITION_BEFORE_START);
                    return true;
                }
            }

            return isEditable;
        },

        selectNodeContents : function(node) {
            this.setStart(node, 0);
            this.setEnd(node, node[0].nodeType == KEN.NODE_TEXT ?
                node[0].nodeValue.length :
                node[0].childNodes.length);
        }
    });
    var inlineChildReqElements = { abbr:1,acronym:1,b:1,bdo:1,big:1,cite:1,code:1,del:1,dfn:1,em:1,font:1,i:1,ins:1,label:1,kbd:1,q:1,samp:1,small:1,span:1,strike:1,strong:1,sub:1,sup:1,tt:1,u:1,'var':1 };

    // Evaluator for CKEDITOR.dom.element::checkBoundaryOfElement, reject any
    // text node and non-empty elements unless it's being bookmark text.
    function elementBoundaryEval(node) {
        // Reject any text node unless it's being bookmark
        // OR it's spaces. (#3883)
        //如果不是文本节点并且是空的，可以继续取下一个判断边界
        var c1 = node[0].nodeType != KEN.NODE_TEXT
            && node._4e_name() in dtd.$removeEmpty,
            //文本为空，可以继续取下一个判断边界
            c2 = !S.trim(node[0].nodeValue),
            //恩，进去了书签，可以继续取下一个判断边界
            c3 = !!node.parent().attr('_ke_bookmark');
        return c1 || c2 || c3;
    }

    var whitespaceEval = new Walker.whitespaces(),
        bookmarkEval = new Walker.bookmark();

    function nonWhitespaceOrBookmarkEval(node) {
        // Whitespaces and bookmark nodes are to be ignored.
        return !whitespaceEval(node) && !bookmarkEval(node);
    }

    function getCheckStartEndBlockEvalFunction(isStart) {
        var hadBr = false, bookmarkEvaluator = Walker.bookmark(true);
        return function(node) {
            // First ignore bookmark nodes.
            if (bookmarkEvaluator(node))
                return true;

            if (node[0].nodeType == KEN.NODE_TEXT) {
                // If there's any visible text, then we're not at the start.
                if (S.trim(node[0].nodeValue).length)
                    return false;
            }
            else if (node[0].nodeType == KEN.NODE_ELEMENT) {
                // If there are non-empty inline elements (e.g. <img />), then we're not
                // at the start.
                if (!inlineChildReqElements[ node._4e_name() ]) {
                    // If we're working at the end-of-block, forgive the first <br /> in non-IE
                    // browsers.
                    if (!isStart && !UA.ie && node._4e_name() == 'br' && !hadBr)
                        hadBr = true;
                    else
                        return false;
                }
            }
            return true;
        };
    }

    function bookmark(contentOnly, isReject) {
        function isBookmarkNode(node) {
            return ( node && node.nodeName == 'span'
                && node.getAttribute('_ke_bookmark') );
        }

        return function(node) {
            var isBookmark, parent;
            // Is bookmark inner text node?
            isBookmark = ( node && !node.nodeName && ( parent = node.parentNode )
                && isBookmarkNode(parent) );
            // Is bookmark node?
            isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
            return isReject ^ isBookmark;
        };
    }

    function whitespaces(isReject) {
        return function(node) {
            node = node[0] || node;
            var isWhitespace = node && ( node.nodeType == KEN.NODE_TEXT )
                && !S.trim(node.nodeValue);
            return isReject ^ isWhitespace;
        };
    }


    KE.Range = KERange;
});
/**
 * modified from ckeditor ,dom iterator implementation using walker and nextSourceNode
 * @modifier: <yiminghe@gmail.com(chengyu)>
 */
KISSY.Editor.add("domiterator", function(KE) {
    var S = KISSY,
        UA = S.UA,
        Walker = KE.Walker,
        KERange = KE.Range,KER = KE.RANGE,
        KEN = KE.NODE,
        ElementPath = KE.ElementPath,
        Node = S.Node,
        DOM = S.DOM;

    function Iterator(range) {
        if (arguments.length < 1)
            return;
        var self = this;
        self.range = range;
        self.forceBrBreak = false;

        // Whether include <br>s into the enlarged range.(#3730).
        self.enlargeBr = true;
        self.enforceRealBlocks = false;

        self._ || ( self._ = {} );
    }

    var beginWhitespaceRegex = /^[\r\n\t ]*$/,///^[\r\n\t ]+$/,//+:*??不匹配空串
        isBookmark = Walker.bookmark();

    S.augment(Iterator, {
        //奇怪点：
        //<ul>
        // <li>
        // x
        // </li>
        // <li>
        // y
        // </li>
        // </ul>
        //会返回两次 li,li,而不是一次 ul ，
        // 可能只是返回包含文字的段落概念？

        getNextParagraph : function(blockTag) {
            // The block element to be returned.
            var block,self = this;

            // The range object used to identify the paragraph contents.
            var range;

            // Indicats that the current element in the loop is the last one.
            var isLast;

            // Instructs to cleanup remaining BRs.
            var removePreviousBr, removeLastBr;

            // self is the first iteration. Let's initialize it.
            if (!self._.lastNode) {
                range = self.range.clone();

                //2010-09-30 shrink
                //3.4.2 新增，
                // Shrink the range to exclude harmful "noises" (#4087, #4450, #5435).
                range.shrink(KER.SHRINK_ELEMENT, true);

                range.enlarge(self.forceBrBreak || !self.enlargeBr ?
                    KER.ENLARGE_LIST_ITEM_CONTENTS : KER.ENLARGE_BLOCK_CONTENTS);

                var walker = new Walker(range),
                    ignoreBookmarkTextEvaluator = Walker.bookmark(true, true);
                // Avoid anchor inside bookmark inner text.
                walker.evaluator = ignoreBookmarkTextEvaluator;
                self._.nextNode = walker.next();
                // TODO: It's better to have walker.reset() used here.
                walker = new Walker(range);
                walker.evaluator = ignoreBookmarkTextEvaluator;
                var lastNode = walker.previous();
                self._.lastNode = lastNode._4e_nextSourceNode(true);

                // We may have an empty text node at the end of block due to [3770].
                // If that node is the lastNode, it would cause our logic to leak to the
                // next block.(#3887)
                if (self._.lastNode &&
                    self._.lastNode[0].nodeType == KEN.NODE_TEXT &&
                    !S.trim(self._.lastNode[0].nodeValue) &&
                    self._.lastNode.parent()._4e_isBlockBoundary()) {
                    var testRange = new KERange(range.document);
                    testRange.moveToPosition(self._.lastNode, KER.POSITION_AFTER_END);
                    if (testRange.checkEndOfBlock()) {
                        var path = new ElementPath(testRange.endContainer);
                        var lastBlock = path.block || path.blockLimit;
                        self._.lastNode = lastBlock._4e_nextSourceNode(true);
                    }
                }

                // Probably the document end is reached, we need a marker node.
                if (!self._.lastNode) {
                    self._.lastNode = self._.docEndMarker = new Node(range.document.createTextNode(''));
                    DOM.insertAfter(self._.lastNode[0], lastNode[0]);
                }

                // Let's reuse self variable.
                range = null;
            }

            var currentNode = self._.nextNode;
            lastNode = self._.lastNode;

            self._.nextNode = null;
            while (currentNode) {
                // closeRange indicates that a paragraph boundary has been found,
                // so the range can be closed.
                var closeRange = false;

                // includeNode indicates that the current node is good to be part
                // of the range. By default, any non-element node is ok for it.
                var includeNode = ( currentNode[0].nodeType != KEN.NODE_ELEMENT ),
                    continueFromSibling = false;

                // If it is an element node, let's check if it can be part of the
                // range.
                if (!includeNode) {
                    var nodeName = currentNode._4e_name();

                    if (currentNode._4e_isBlockBoundary(self.forceBrBreak && { br : 1 })) {
                        // <br> boundaries must be part of the range. It will
                        // happen only if ForceBrBreak.
                        if (nodeName == 'br')
                            includeNode = true;
                        else if (!range && !currentNode[0].childNodes.length && nodeName != 'hr') {
                            // If we have found an empty block, and haven't started
                            // the range yet, it means we must return self block.
                            block = currentNode;
                            isLast = currentNode._4e_equals(lastNode);
                            break;
                        }

                        // The range must finish right before the boundary,
                        // including possibly skipped empty spaces. (#1603)
                        if (range) {
                            range.setEndAt(currentNode, KER.POSITION_BEFORE_START);

                            // The found boundary must be set as the next one at self
                            // point. (#1717)
                            if (nodeName != 'br')
                                self._.nextNode = currentNode;
                        }

                        closeRange = true;
                    } else {
                        // If we have child nodes, let's check them.
                        if (currentNode[0].firstChild) {
                            // If we don't have a range yet, let's start it.
                            if (!range) {
                                range = new KERange(self.range.document);
                                range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
                            }

                            currentNode = new Node(currentNode[0].firstChild);
                            continue;
                        }
                        includeNode = true;
                    }
                }
                else if (currentNode[0].nodeType == KEN.NODE_TEXT) {
                    // Ignore normal whitespaces (i.e. not including &nbsp; or
                    // other unicode whitespaces) before/after a block node.
                    if (beginWhitespaceRegex.test(currentNode[0].nodeValue))
                        includeNode = false;
                }

                // The current node is good to be part of the range and we are
                // starting a new range, initialize it first.
                if (includeNode && !range) {
                    range = new KERange(self.range.document);
                    range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
                }

                // The last node has been found.
                isLast = ( !closeRange || includeNode ) && currentNode._4e_equals(lastNode);

                // If we are in an element boundary, let's check if it is time
                // to close the range, otherwise we include the parent within it.
                if (range && !closeRange) {
                    while (!currentNode[0].nextSibling && !isLast) {
                        var parentNode = currentNode.parent();

                        if (parentNode._4e_isBlockBoundary(self.forceBrBreak && { br : 1 })) {
                            closeRange = true;
                            isLast = isLast || parentNode._4e_equals(lastNode);
                            break;
                        }

                        currentNode = parentNode;
                        includeNode = true;
                        isLast = currentNode._4e_equals(lastNode);
                        continueFromSibling = true;
                    }
                }

                // Now finally include the node.
                if (includeNode)
                    range.setEndAt(currentNode, KER.POSITION_AFTER_END);

                currentNode = currentNode._4e_nextSourceNode(continueFromSibling, null, lastNode);
                isLast = !currentNode;

                // We have found a block boundary. Let's close the range and move out of the
                // loop.
                if (isLast || ( closeRange && range ))
                    break;

                //3.4.2 中被去掉了！不要了，改作一开始就shrink，参见开头 2010-09-30 shrink 注释 
                ////qc #3879 ，选择td内所有问题，这里被出发了
                //禁止，只有td内全部为空时才会略过
                if (false) {
                    if (( closeRange || isLast ) && range) {
                        var boundaryNodes = range.getBoundaryNodes(),
                            startPath = new ElementPath(range.startContainer);

                        // Drop the range if it only contains bookmark nodes, and is
                        // not because of the original collapsed range. (#4087,#4450)
                        if (boundaryNodes.startNode.parent()._4e_equals(startPath.blockLimit)
                            && isBookmark(boundaryNodes.startNode)
                            && isBookmark(boundaryNodes.endNode)
                            ) {
                            range = null;
                            self._.nextNode = null;
                        }
                        else
                            break;
                    }
                    if (isLast)
                        break;
                }


            }

            // Now, based on the processed range, look for (or create) the block to be returned.
            if (!block) {
                // If no range has been found, self is the end.
                if (!range) {
                    self._.docEndMarker && self._.docEndMarker._4e_remove();
                    self._.nextNode = null;
                    return null;
                }

                startPath = new ElementPath(range.startContainer);
                var startBlockLimit = startPath.blockLimit,
                    checkLimits = { div : 1, th : 1, td : 1 };
                block = startPath.block;

                if ((!block || !block[0])
                    && !self.enforceRealBlocks
                    && checkLimits[ startBlockLimit._4e_name() ]
                    && range.checkStartOfBlock()
                    && range.checkEndOfBlock())
                    block = startBlockLimit;
                else if (!block || ( self.enforceRealBlocks && block._4e_name() == 'li' )) {
                    // Create the fixed block.
                    block = new Node(self.range.document.createElement(blockTag || 'p'));
                    // Move the contents of the temporary range to the fixed block.
                    block[0].appendChild(range.extractContents());
                    block._4e_trim();
                    // Insert the fixed block into the DOM.
                    range.insertNode(block);
                    removePreviousBr = removeLastBr = true;
                }
                else if (block._4e_name() != 'li') {
                    // If the range doesn't includes the entire contents of the
                    // block, we must split it, isolating the range in a dedicated
                    // block.
                    if (!range.checkStartOfBlock() || !range.checkEndOfBlock()) {
                        // The resulting block will be a clone of the current one.
                        block = block._4e_clone(false);

                        // Extract the range contents, moving it to the new block.
                        block[0].appendChild(range.extractContents());
                        block._4e_trim();

                        // Split the block. At self point, the range will be in the
                        // right position for our intents.
                        var splitInfo = range.splitBlock();

                        removePreviousBr = !splitInfo.wasStartOfBlock;
                        removeLastBr = !splitInfo.wasEndOfBlock;

                        // Insert the new block into the DOM.
                        range.insertNode(block);
                    }
                }
                else if (!isLast) {
                    // LIs are returned as is, with all their children (due to the
                    // nested lists). But, the next node is the node right after
                    // the current range, which could be an <li> child (nested
                    // lists) or the next sibling <li>.

                    self._.nextNode = ( block._4e_equals(lastNode) ? null :
                        range.getBoundaryNodes().endNode._4e_nextSourceNode(true, null, lastNode) );
                }
            }

            if (removePreviousBr) {
                var previousSibling = new Node(block[0].previousSibling);
                if (previousSibling[0] && previousSibling[0].nodeType == KEN.NODE_ELEMENT) {
                    if (previousSibling._4e_name() == 'br')
                        previousSibling._4e_remove();
                    else if (previousSibling[0].lastChild && DOM._4e_name(previousSibling[0].lastChild) == 'br')
                        DOM._4e_remove(previousSibling[0].lastChild);
                }
            }

            if (removeLastBr) {
                // Ignore bookmark nodes.(#3783)
                var bookmarkGuard = Walker.bookmark(false, true);

                var lastChild = new Node(block[0].lastChild);
                if (lastChild[0] && lastChild[0].nodeType == KEN.NODE_ELEMENT && lastChild._4e_name() == 'br') {
                    // Take care not to remove the block expanding <br> in non-IE browsers.
                    if (UA.ie
                        || lastChild._4e_previous(bookmarkGuard)
                        || lastChild._4e_next(bookmarkGuard))
                        lastChild._4e_remove();
                }
            }

            // Get a reference for the next element. self is important because the
            // above block can be removed or changed, so we can rely on it for the
            // next interation.
            if (!self._.nextNode) {
                self._.nextNode = ( isLast || block._4e_equals(lastNode) ) ? null :
                    block._4e_nextSourceNode(true, null, lastNode);
            }

            return block;
        }
    });

    KERange.prototype.createIterator = function() {
        return new Iterator(this);
    };
});
/**
 * modified from ckeditor core plugin : selection
 * @modifier: <yiminghe@gmail.com(chengyu)>
 */
KISSY.Editor.add("selection", function(KE) {
    KE.SELECTION = {};
    var S = KISSY,
        UA = S.UA,
        DOM = S.DOM,
        Event = S.Event,
        tryThese = KE.Utils.tryThese,
        Node = S.Node,
        KES = KE.SELECTION,
        KER = KE.RANGE,
        KEN = KE.NODE,
        //EventTarget = S.EventTarget,
        Walker = KE.Walker,
        //ElementPath = KE.ElementPath,
        KERange = KE.Range;
    /**
     * No selection.
     * @constant
     * @example
     * if ( editor.getSelection().getType() == CKEDITOR.SELECTION_NONE )
     *     alert( 'Nothing is selected' );
     */
    KES.SELECTION_NONE = 1;

    /**
     * Text or collapsed selection.
     * @constant
     * @example
     * if ( editor.getSelection().getType() == CKEDITOR.SELECTION_TEXT )
     *     alert( 'Text is selected' );
     */
    KES.SELECTION_TEXT = 2;

    /**
     * Element selection.
     * @constant
     * @example
     * if ( editor.getSelection().getType() == CKEDITOR.SELECTION_ELEMENT )
     *     alert( 'An element is selected' );
     */
    KES.SELECTION_ELEMENT = 3;
    function KESelection(document) {
        var self = this;
        self.document = document;
        self._ = {
            cache : {}
        };

        /**
         * IE BUG: The selection's document may be a different document than the
         * editor document. Return null if that's the case.
         */
        if (UA.ie) {
            var range = self.getNative().createRange();
            if (!range
                || ( range.item && range.item(0).ownerDocument != document )
                || ( range.parentElement && range.parentElement().ownerDocument != document )) {
                self.isInvalid = true;
            }
        }
    }

    var styleObjectElements = {
        img:1,hr:1,li:1,table:1,tr:1,td:1,th:1,embed:1,object:1,ol:1,ul:1,
        a:1, input:1, form:1, select:1, textarea:1, button:1, fieldset:1, thead:1, tfoot:1
    };

    S.augment(KESelection, {


        /**
         * Gets the native selection object from the browser.
         * @function
         * @returns {Object} The native selection object.
         * @example
         * var selection = editor.getSelection().<b>getNative()</b>;
         */
        getNative :
            UA.ie ?
                function() {
                    return this._.cache.nativeSel || ( this._.cache.nativeSel = this.document.selection );
                }
                :
                function() {
                    return this._.cache.nativeSel || ( this._.cache.nativeSel = DOM._4e_getWin(this.document).getSelection() );
                },

        /**
         * Gets the type of the current selection. The following values are
         * available:
         * <ul>
         *        <li> SELECTION_NONE (1): No selection.</li>
         *        <li> SELECTION_TEXT (2): Text is selected or
         *            collapsed selection.</li>
         *        <li> SELECTION_ELEMENT (3): A element
         *            selection.</li>
         * </ul>
         * @function
         * @returns {Number} One of the following constant values:
         *         SELECTION_NONE,  SELECTION_TEXT or
         *         SELECTION_ELEMENT.
         * @example
         * if ( editor.getSelection().<b>getType()</b> == SELECTION_TEXT )
         *     alert( 'Text is selected' );
         */
        getType :
            UA.ie ?
                function() {
                    var cache = this._.cache;
                    if (cache.type)
                        return cache.type;

                    var type = KES.SELECTION_NONE;

                    try {
                        var sel = this.getNative(),
                            ieType = sel.type;

                        if (ieType == 'Text')
                            type = KES.SELECTION_TEXT;

                        if (ieType == 'Control')
                            type = KES.SELECTION_ELEMENT;

                        // It is possible that we can still get a text range
                        // object even when type == 'None' is returned by IE.
                        // So we'd better check the object returned by
                        // createRange() rather than by looking at the type.
                        //当前一个操作选中文本，后一个操作右键点了字串中间就会出现了
                        if (sel.createRange().parentElement)
                            type = KES.SELECTION_TEXT;
                    }
                    catch(e) {
                    }

                    return ( cache.type = type );
                }
                :
                function() {
                    var cache = this._.cache;
                    if (cache.type)
                        return cache.type;

                    var type = KES.SELECTION_TEXT,
                        sel = this.getNative();

                    if (!sel)
                        type = KES.SELECTION_NONE;
                    else if (sel.rangeCount == 1) {
                        // Check if the actual selection is a control (IMG,
                        // TABLE, HR, etc...).

                        var range = sel.getRangeAt(0),
                            startContainer = range.startContainer;

                        if (startContainer == range.endContainer
                            && startContainer.nodeType == KEN.NODE_ELEMENT
                            && ( range.endOffset - range.startOffset ) === 1
                            && styleObjectElements[ startContainer.childNodes[ range.startOffset ].nodeName.toLowerCase() ]) {
                            type = KES.SELECTION_ELEMENT;
                        }
                    }

                    return ( cache.type = type );
                },

        getRanges :
            UA.ie ?
                ( function() {
                    // Finds the container and offset for a specific boundary
                    // of an IE range.
                    var getBoundaryInformation = function(range, start) {
                        // Creates a collapsed range at the requested boundary.
                        range = range.duplicate();
                        range.collapse(start);

                        // Gets the element that encloses the range entirely.
                        var parent = range.parentElement(), siblings = parent.childNodes,
                            testRange;

                        for (var i = 0; i < siblings.length; i++) {
                            var child = siblings[ i ];
                            //console.log("child:" + child.nodeType == KEN.NODE_ELEMENT ?
                            //    ("el: " + child.innerHTML) : ("text:" + child.nodeValue));
                            if (child.nodeType == KEN.NODE_ELEMENT) {
                                testRange = range.duplicate();

                                testRange.moveToElementText(child);

                                var comparisonStart = testRange.compareEndPoints('StartToStart', range),
                                    comparisonEnd = testRange.compareEndPoints('EndToStart', range);

                                testRange.collapse();
                                //中间有其他标签
                                if (comparisonStart > 0)
                                    break;
                                // When selection stay at the side of certain self-closing elements, e.g. BR,
                                // our comparison will never shows an equality. (#4824)
                                else if (!comparisonStart
                                    || comparisonEnd == 1 && comparisonStart == -1)
                                    return { container : parent, offset : i };
                                else if (!comparisonEnd)
                                    return { container : parent, offset : i + 1 };

                                testRange = null;
                            }
                        }

                        if (!testRange) {
                            testRange = range.duplicate();
                            testRange.moveToElementText(parent);
                            testRange.collapse(false);
                        }

                        testRange.setEndPoint('StartToStart', range);
                        // IE report line break as CRLF with range.text but
                        // only LF with textnode.nodeValue, normalize them to avoid
                        // breaking character counting logic below. (#3949)
                        var distance = testRange.text.replace(/(\r\n|\r)/g, '\n').length;

                        try {
                            while (distance > 0)
                                //bug? 可能不是文本节点 nodeValue undefined
                                //永远不会出现 textnode<img/>textnode
                                //停止时，前面一定为textnode
                                distance -= siblings[ --i ].nodeValue.length;
                        }
                            // Measurement in IE could be somtimes wrong because of <select> element. (#4611)
                        catch(e) {
                            distance = 0;
                        }


                        if (distance === 0) {
                            return {
                                container : parent,
                                offset : i
                            };
                        }
                        else {
                            return {
                                container : siblings[ i ],
                                offset : -distance
                            };
                        }
                    };

                    return function() {
                        var cache = this._.cache;
                        if (cache.ranges)
                            return cache.ranges;

                        // IE doesn't have range support (in the W3C way), so we
                        // need to do some magic to transform selections into
                        // CKEDITOR.dom.range instances.

                        var sel = this.getNative(),
                            nativeRange = sel && sel.createRange(),
                            type = this.getType(),
                            range;

                        if (!sel)
                            return [];

                        if (type == KES.SELECTION_TEXT) {
                            range = new KERange(this.document);
                            var boundaryInfo = getBoundaryInformation(nativeRange, true);
                            range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
                            boundaryInfo = getBoundaryInformation(nativeRange);
                            range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
                            return ( cache.ranges = [ range ] );
                        } else if (type == KES.SELECTION_ELEMENT) {
                            var retval = this._.cache.ranges = [];

                            for (var i = 0; i < nativeRange.length; i++) {
                                var element = nativeRange.item(i),
                                    parentElement = element.parentNode,
                                    j = 0;

                                range = new KERange(this.document);

                                for (; j < parentElement.childNodes.length && parentElement.childNodes[j] != element; j++) { /*jsl:pass*/
                                }

                                range.setStart(new Node(parentElement), j);
                                range.setEnd(new Node(parentElement), j + 1);
                                retval.push(range);
                            }

                            return retval;
                        }

                        return ( cache.ranges = [] );
                    };
                })()
                :
                function() {
                    var cache = this._.cache;
                    if (cache.ranges)
                        return cache.ranges;

                    // On browsers implementing the W3C range, we simply
                    // tranform the native ranges in CKEDITOR.dom.range
                    // instances.

                    var ranges = [], sel = this.getNative();

                    if (!sel)
                        return [];

                    for (var i = 0; i < sel.rangeCount; i++) {
                        var nativeRange = sel.getRangeAt(i), range = new KERange(this.document);

                        range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
                        range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
                        ranges.push(range);
                    }

                    return ( cache.ranges = ranges );
                },

        /**
         * Gets the DOM element in which the selection starts.
         * @returns {Node} The element at the beginning of the
         *        selection.
         * @example
         * var element = editor.getSelection().<b>getStartElement()</b>;
         * alert( element.getName() );
         */
        getStartElement : function() {
            var cache = this._.cache;
            if (cache.startElement !== undefined)
                return cache.startElement;

            var node,
                sel = this.getNative();

            switch (this.getType()) {
                case KES.SELECTION_ELEMENT :
                    return this.getSelectedElement();

                case KES.SELECTION_TEXT :

                    var range = this.getRanges()[0];

                    if (range) {
                        if (!range.collapsed) {
                            range.optimize();

                            // Decrease the range content to exclude particial
                            // selected node on the start which doesn't have
                            // visual impact. ( #3231 )
                            while (true) {
                                var startContainer = range.startContainer,
                                    startOffset = range.startOffset;
                                // Limit the fix only to non-block elements.(#3950)
                                if (startOffset == ( startContainer[0].nodeType === KEN.NODE_ELEMENT ?
                                    startContainer[0].childNodes.length : startContainer[0].nodeValue.length )
                                    && !startContainer._4e_isBlockBoundary())
                                    range.setStartAfter(startContainer);
                                else break;
                            }

                            node = range.startContainer;

                            if (node[0].nodeType != KEN.NODE_ELEMENT)
                                return node.parent();

                            node = new Node(node[0].childNodes[range.startOffset]);

                            if (!node[0] || node[0].nodeType != KEN.NODE_ELEMENT)
                                return range.startContainer;

                            var child = node[0].firstChild;
                            while (child && child.nodeType == KEN.NODE_ELEMENT) {
                                node = new Node(child);
                                child = child.firstChild;
                            }
                            return node;
                        }
                    }

                    if (UA.ie) {
                        range = sel.createRange();
                        range.collapse(true);
                        node = range.parentElement();
                    }
                    else {
                        node = sel.anchorNode;
                        if (node && node.nodeType != KEN.NODE_ELEMENT)
                            node = node.parentNode;
                    }
            }

            return cache.startElement = ( node ? DOM._4e_wrap(node) : null );
        },

        /**
         * Gets the current selected element.
         * @returns {Node} The selected element. Null if no
         *        selection is available or the selection type is not
         *       SELECTION_ELEMENT.
         * @example
         * var element = editor.getSelection().<b>getSelectedElement()</b>;
         * alert( element.getName() );
         */
        getSelectedElement : function() {
            var cache = this._.cache;
            if (cache.selectedElement !== undefined)
                return cache.selectedElement;

            var self = this, node;
            // Is it native IE control type selection?

            if (UA.ie) {
                var range = self.getNative().createRange();
                node = range.item && range.item(0);

            }// Figure it out by checking if there's a single enclosed
            // node of the range.
            if (!node) {
                node = (function() {
                    var range = self.getRanges()[ 0 ],
                        enclosed,
                        selected;

                    // Check first any enclosed element, e.g. <ul>[<li><a href="#">item</a></li>]</ul>
                    //脱两层？？2是啥意思？
                    for (var i = 2;
                         i && !
                             (
                                 ( enclosed = range.getEnclosedNode() )
                                     && ( enclosed[0].nodeType == KEN.NODE_ELEMENT )
                                     //某些值得这么多的元素？？
                                     && styleObjectElements[ enclosed._4e_name() ]
                                     && ( selected = enclosed )
                                 ); i--) {
                        // Then check any deep wrapped element, e.g. [<b><i><img /></i></b>]
                        //一下子退到底  ^<a><span><span><img/></span></span></a>^
                        // ->
                        //<a><span><span>^<img/>^</span></span></a>
                        range.shrink(KER.SHRINK_ELEMENT);
                    }

                    return  selected && selected[0];
                })();
            }

            return cache.selectedElement = DOM._4e_wrap(node);
        },



        reset : function() {
            this._.cache = {};
        },

        selectElement : function(element) {
            var range,self = this;
            if (UA.ie) {
                //do not use empty()，滚动条重置了
                //选择的 img 内容前后莫名被清除
                //self.getNative().clear();
                try {
                    // Try to select the node as a control.
                    range = self.document.body.createControlRange();
                    range.addElement(element[0]);
                    range.select();
                }
                catch(e) {
                    // If failed, select it as a text range.
                    range = self.document.body.createTextRange();
                    range.moveToElementText(element[0]);
                    range.select();
                }
                finally {
                    //this.document.fire('selectionchange');
                }
                self.reset();
            }
            else {
                // Create the range for the element.
                range = self.document.createRange();
                range.selectNode(element[0]);
                // Select the range.
                var sel = self.getNative();
                sel.removeAllRanges();
                sel.addRange(range);
                self.reset();
            }
        },

        selectRanges : function(ranges) {

            if (UA.ie) {
                // IE doesn't accept multiple ranges selection, so we just
                // select the first one.
                if (ranges[ 0 ])
                    ranges[ 0 ].select();

                this.reset();
            }
            else {
                var sel = this.getNative();
                if (!sel) return;
                sel.removeAllRanges();
                for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[ i ], nativeRange = this.document.createRange(),startContainer = range.startContainer;

                    // In FF2, if we have a collapsed range, inside an empty
                    // element, we must add something to it otherwise the caret
                    // will not be visible.
                    if (range.collapsed &&
                        ( UA.gecko && UA.gecko < 1.0900 ) &&
                        startContainer[0].nodeType == KEN.NODE_ELEMENT &&
                        !startContainer[0].childNodes.length) {
                        startContainer[0].appendChild(this.document.createTextNode(""));
                    }
                    nativeRange.setStart(startContainer[0], range.startOffset);
                    nativeRange.setEnd(range.endContainer[0], range.endOffset);
                    // Select the range.
                    sel.addRange(nativeRange);
                }
                this.reset();
            }
        },
        createBookmarks2 : function(normalized) {
            var bookmarks = [],
                ranges = this.getRanges();

            for (var i = 0; i < ranges.length; i++)
                bookmarks.push(ranges[i].createBookmark2(normalized));

            return bookmarks;
        },
        createBookmarks : function(serializable) {
            var self = this,
                retval = [],
                ranges = self.getRanges(),
                length = ranges.length,
                doc = self.document,
                bookmark;
            for (var i = 0; i < length; i++) {
                retval.push(bookmark = ranges[ i ].createBookmark(serializable, true));
                serializable = bookmark.serializable;

                var bookmarkStart = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode,
                    bookmarkEnd = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;

                // Updating the offset values for rest of ranges which have been mangled(#3256).
                for (var j = i + 1; j < length; j++) {
                    var dirtyRange = ranges[ j ],
                        rangeStart = dirtyRange.startContainer,
                        rangeEnd = dirtyRange.endContainer;

                    DOM._4e_equals(rangeStart, bookmarkStart.parent()) && dirtyRange.startOffset++;
                    DOM._4e_equals(rangeStart, bookmarkEnd.parent()) && dirtyRange.startOffset++;
                    DOM._4e_equals(rangeEnd, bookmarkStart.parent()) && dirtyRange.endOffset++;
                    DOM._4e_equals(rangeEnd, bookmarkEnd.parent()) && dirtyRange.endOffset++;
                }
            }

            return retval;
        },

        selectBookmarks : function(bookmarks) {
            var ranges = [];
            for (var i = 0; i < bookmarks.length; i++) {
                var range = new KERange(this.document);
                range.moveToBookmark(bookmarks[i]);
                ranges.push(range);
            }
            this.selectRanges(ranges);
            return this;
        },

        getCommonAncestor : function() {
            var ranges = this.getRanges(),
                startNode = ranges[ 0 ].startContainer,
                endNode = ranges[ ranges.length - 1 ].endContainer;
            return startNode._4e_commonAncestor(endNode);
        },

        // Moving scroll bar to the current selection's start position.
        scrollIntoView : function() {
            // If we have split the block, adds a temporary span at the
            // range position and scroll relatively to it.
            var start = this.getStartElement();
            start._4e_scrollIntoView();
        }
    });


    KE.Selection = KESelection;
    var nonCells = { table:1,tbody:1,tr:1 }, notWhitespaces = Walker.whitespaces(true), fillerTextRegex = /\ufeff|\u00a0/;
    KERange.prototype.select = UA.ie ?
        // V2
        function(forceExpand) {

            var self = this,
                collapsed = self.collapsed,isStartMarkerAlone,dummySpan;
            //选的是元素，直接使用selectElement
            //还是有差异的，特别是img选择框问题
            if (self.startContainer[0] === self.endContainer[0] && self.endOffset - self.startOffset == 1) {
                var selEl = self.startContainer[0].childNodes[self.startOffset];
                if (selEl.nodeType == KEN.NODE_ELEMENT) {
                    new KESelection(self.document).selectElement(new Node(selEl));
                    return;
                }
            }
            // IE doesn't support selecting the entire table row/cell, move the selection into cells, e.g.
            // <table><tbody><tr>[<td>cell</b></td>... => <table><tbody><tr><td>[cell</td>...
            if (self.startContainer[0].nodeType == KEN.NODE_ELEMENT &&
                self.startContainer._4e_name() in nonCells
                || self.endContainer[0].nodeType == KEN.NODE_ELEMENT &&
                self.endContainer._4e_name() in nonCells) {
                self.shrink(KER.SHRINK_ELEMENT, true);
            }

            var bookmark = self.createBookmark(),
                // Create marker tags for the start and end boundaries.
                startNode = bookmark.startNode,
                endNode;

            if (!collapsed)
                endNode = bookmark.endNode;

            // Create the main range which will be used for the selection.
            var ieRange = this.document.body.createTextRange();

            // Position the range at the start boundary.
            ieRange.moveToElementText(startNode[0]);

            ieRange.moveStart('character', 1);

            if (endNode) {
                // Create a tool range for the end.
                var ieRangeEnd = self.document.body.createTextRange();
                // Position the tool range at the end.
                ieRangeEnd.moveToElementText(endNode[0]);
                // Move the end boundary of the main range to match the tool range.
                ieRange.setEndPoint('EndToEnd', ieRangeEnd);
                ieRange.moveEnd('character', -1);
            }
            else {
                // The isStartMarkerAlone logic comes from V2. It guarantees that the lines
                // will expand and that the cursor will be blinking on the right place.
                // Actually, we are using this flag just to avoid using this hack in all
                // situations, but just on those needed.
                var next = startNode[0].nextSibling;
                while (next && !notWhitespaces(next)) {
                    next = next.nextSibling;
                }
                isStartMarkerAlone =
                    (
                        !( next && next.nodeValue && next.nodeValue.match(fillerTextRegex) )     // already a filler there?
                            && ( forceExpand
                            ||
                            !startNode[0].previousSibling
                            ||
                            (
                                startNode[0].previousSibling &&
                                    DOM._4e_name(startNode[0].previousSibling) == 'br'
                                )
                            )
                        );

                // Append a temporary <span>&#65279;</span> before the selection.
                // This is needed to avoid IE destroying selections inside empty
                // inline elements, like <b></b> (#253).
                // It is also needed when placing the selection right after an inline
                // element to avoid the selection moving inside of it.
                dummySpan = self.document.createElement('span');
                dummySpan.innerHTML = '&#65279;';	// Zero Width No-Break Space (U+FEFF). See #1359.
                dummySpan = new Node(dummySpan);
                DOM.insertBefore(dummySpan[0], startNode[0]);
                if (isStartMarkerAlone) {
                    // To expand empty blocks or line spaces after <br>, we need
                    // instead to have any char, which will be later deleted using the
                    // selection.
                    // \ufeff = Zero Width No-Break Space (U+FEFF). (#1359)
                    DOM.insertBefore(self.document.createTextNode('\ufeff'), startNode[0]);
                }
            }

            // Remove the markers (reset the position, because of the changes in the DOM tree).
            self.setStartBefore(startNode);
            startNode._4e_remove();

            if (collapsed) {
                if (isStartMarkerAlone) {
                    // Move the selection start to include the temporary \ufeff.
                    ieRange.moveStart('character', -1);
                    ieRange.select();
                    // Remove our temporary stuff.
                    self.document.selection.clear();
                } else
                    ieRange.select();
                if (dummySpan) {
                    this.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
                    dummySpan._4e_remove();
                }
            }
            else {
                self.setEndBefore(endNode);
                endNode._4e_remove();
                ieRange.select();
            }
            // this.document.fire('selectionchange');
        } : function() {
        var self = this,startContainer = self.startContainer;

        // If we have a collapsed range, inside an empty element, we must add
        // something to it, otherwise the caret will not be visible.
        if (self.collapsed && startContainer[0].nodeType == KEN.NODE_ELEMENT && !startContainer[0].childNodes.length)
            startContainer[0].appendChild(self.document.createTextNode(""));

        var nativeRange = self.document.createRange();
        nativeRange.setStart(startContainer[0], self.startOffset);

        try {
            nativeRange.setEnd(self.endContainer[0], self.endOffset);
        } catch (e) {
            // There is a bug in Firefox implementation (it would be too easy
            // otherwise). The new start can't be after the end (W3C says it can).
            // So, let's create a new range and collapse it to the desired point.
            if (e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0) {
                self.collapse(true);
                nativeRange.setEnd(self.endContainer[0], self.endOffset);
            }
            else
                throw( e );
        }

        var selection = getSelection(self.document).getNative();
        selection.removeAllRanges();
        selection.addRange(nativeRange);
    };


    function getSelection(doc) {
        var sel = new KESelection(doc);
        return ( !sel || sel.isInvalid ) ? null : sel;
    }

    /**
     * 监控选择区域变化
     * @param editor
     */
    function monitorAndFix(editor) {
        var doc = editor.document,
            body = new Node(doc.body),
            html = new Node(doc.documentElement);

        if (UA.ie) {
            //wokao,ie 焦点管理不行啊
            // In IE6/7 the blinking cursor appears, but contents are
            // not editable. (#5634)
            //终于和ck同步了，我也发现了这个bug，哈哈,ck3.3.2解决
            if (UA.ie < 8 ||
                //ie8 的 7 兼容模式
                document.documentMode == 7) {
                // The 'click' event is not fired when clicking the
                // scrollbars, so we can use it to check whether
                // the empty space following <body> has been clicked.
                html.on('click', function(evt) {
                    if (DOM._4e_name(evt.target) === "html")
                        editor.getSelection().getRanges()[ 0 ].select();
                });
            }


            // Other browsers don't loose the selection if the
            // editor document loose the focus. In IE, we don't
            // have support for it, so we reproduce it here, other
            // than firing the selection change event.

            var savedRange,
                saveEnabled;

            // "onfocusin" is fired before "onfocus". It makes it
            // possible to restore the selection before click
            // events get executed.
            body.on('focusin', function(evt) {
                // If there are elements with layout they fire this event but
                // it must be ignored to allow edit its contents #4682
                if (evt.target.nodeName.toUpperCase() != 'BODY')
                    return;

                // If we have saved a range, restore it at this
                // point.
                if (savedRange) {
                    // Well not break because of this.
                    try {
                        savedRange.select();
                    }
                    catch (e) {
                    }

                    savedRange = null;
                }
            });

            body.on('focus', function() {
                // Enable selections to be saved.
                saveEnabled = true;
                saveSelection();
            });

            body.on('beforedeactivate', function(evt) {
                // Ignore this event if it's caused by focus switch between
                // internal editable control type elements, e.g. layouted paragraph. (#4682)
                if (evt.relatedTarget)
                    return;

                // Disable selections from being saved.
                saveEnabled = false;
            });

            // IE before version 8 will leave cursor blinking inside the document after
            // editor blurred unless we clean up the selection. (#4716)
            if (UA.ie < 8) {
                Event.on(DOM._4e_getWin(doc), 'blur', function() {
                    doc.selection.empty();
                });
            }

            // IE fires the "selectionchange" event when clicking
            // inside a selection. We don't want to capture that.
            body.on('mousedown', disableSave);
            body.on('mouseup', function() {
                saveEnabled = true;
                setTimeout(function() {
                    saveSelection(true);
                }, 0);
            });

            body.on('keydown', disableSave);
            body.on('keyup', function() {
                saveEnabled = true;
                saveSelection();
            });

            // IE is the only to provide the "selectionchange"
            // event.
            // 注意：ie右键短暂点击并不能改变选择范围
            Event.on(doc, 'selectionchange', saveSelection);

            function disableSave() {
                saveEnabled = false;
                //console.log("disableSave");
            }

            function saveSelection(testIt) {
                //console.log("saveSelection");
                if (saveEnabled) {
                    var doc = editor.document,
                        sel = editor.getSelection(),
                        type = sel&&sel.getType(),
                        nativeSel = sel && sel.getNative();

                    // There is a very specific case, when clicking
                    // inside a text selection. In that case, the
                    // selection collapses at the clicking point,
                    // but the selection object remains in an
                    // unknown state, making createRange return a
                    // range at the very start of the document. In
                    // such situation we have to test the range, to
                    // be sure it's valid.
                    //右键时，若前一个操作选中，则该次一直为None
                    if (testIt && nativeSel && type == KES.SELECTION_NONE) {
                        // The "InsertImage" command can be used to
                        // test whether the selection is good or not.
                        // If not, it's enough to give some time to
                        // IE to put things in order for us.
                        if (!doc.queryCommandEnabled('InsertImage')) {
                            setTimeout(function() {
                                //console.log("retry");
                                saveSelection(true);
                            }, 50);
                            return;
                        }
                    }

                    // Avoid saving selection from within text input. (#5747)
                    var parentTag;
                    if (nativeSel && type == KES.SELECTION_TEXT
                        && ( parentTag = DOM._4e_name(nativeSel.createRange().parentElement()))
                        && parentTag in { input: 1, textarea : 1 }) {
                        return;
                    }
                    savedRange = nativeSel && sel.getRanges()[ 0 ];
                    //console.log("save range : " + savedRange.collapsed);
                    editor._monitor();
                }
            }


        } else {
            // In other browsers, we make the selection change
            // check based on other events, like clicks or keys
            // press.
            Event.on(doc, 'mouseup', editor._monitor, editor);
            Event.on(doc, 'keyup', editor._monitor, editor);
        }
    }

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        monitorAndFix(editor);
    });
});
/**
 * modified from ckeditor for kissy editor,use style to gen element and wrap range's elements
 * @modifier: <yiminghe@gmail.com(chengyu)>
 */
KISSY.Editor.add("styles", function(KE) {

    var S = KISSY,
        DOM = S.DOM,
        KEST = KE.STYLE = {},
        KER = KE.RANGE,
        KESelection = KE.Selection,
        KEN = KE.NODE,
        KEP = KE.POSITION,
        KERange = KE.Range,
        //Walker = KE.Walker,
        Node = S.Node,
        UA = S.UA,
        ElementPath = KE.ElementPath,
        blockElements = { address:1,div:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,p:1,pre:1 },
        objectElements = {
            //why? a should be same to inline? 但是不能互相嵌套
            //a:1,
            embed:1,hr:1,img:1,li:1,object:1,ol:1,table:1,td:1,tr:1,th:1,ul:1,dl:1,dt:1,dd:1,form:1},
        semicolonFixRegex = /\s*(?:;\s*|$)/,
        varRegex = /#\((.+?)\)/g;

    KEST.STYLE_BLOCK = 1;
    KEST.STYLE_INLINE = 2;
    KEST.STYLE_OBJECT = 3;


    function replaceVariables(list, variablesValues) {
        for (var item in list) {
            list[ item ] = list[ item ].replace(varRegex, function(match, varName) {
                return variablesValues[ varName ];
            });
        }
    }

    function KEStyle(styleDefinition, variablesValues) {
        if (variablesValues) {
            styleDefinition = S.clone(styleDefinition);
            replaceVariables(styleDefinition.attributes, variablesValues);
            replaceVariables(styleDefinition.styles, variablesValues);
        }

        var element = this.element = ( styleDefinition.element || '*' ).toLowerCase();

        this.type = ( element == '#' || blockElements[ element ] ) ?
            KEST.STYLE_BLOCK
            : objectElements[ element ] ?
            KEST.STYLE_OBJECT : KEST.STYLE_INLINE;

        this._ = {
            definition : styleDefinition
        };
    }

    function applyStyle(document, remove) {
        // Get all ranges from the selection.

        var func = remove ? this.removeFromRange : this.applyToRange,self = this;
        // Apply the style to the ranges.
        //ie select 选中期间document得不到range
        document.body.focus();
        var selection = new KESelection(document),ranges = selection.getRanges();
        for (var i = 0; i < ranges.length; i++)
            //格式化后，range进入格式标签内
            func.call(self, ranges[ i ]);
        // Select the ranges again.
        selection.selectRanges(ranges);

    }

    KEStyle.prototype = {
        apply : function(document) {
            applyStyle.call(this, document, false);
        },

        remove : function(document) {
            applyStyle.call(this, document, true);
        },

        applyToRange : function(range) {
            var self = this;
            return ( self.applyToRange =
                this.type == KEST.STYLE_INLINE ?
                    applyInlineStyle
                    : self.type == KEST.STYLE_BLOCK ?
                    applyBlockStyle
                    : self.type == KEST.STYLE_OBJECT ?
                    null
                    //yiminghe note:no need!
                    //applyObjectStyle
                    : null ).call(self, range);
        },

        removeFromRange : function(range) {
            var self = this;
            return ( self.removeFromRange =
                self.type == KEST.STYLE_INLINE ?
                    removeInlineStyle
                    : null ).call(self, range);
        },

        applyToObject : function(element) {
            setupElement(element, this);
        },
        // Checks if an element, or any of its attributes, is removable by the
        // current style definition.
        checkElementRemovable : function(element, fullMatch) {
            if (!element)
                return false;

            var def = this._.definition,
                attribs;

            // If the element name is the same as the style name.
            if (element._4e_name() == this.element) {
                // If no attributes are defined in the element.
                if (!fullMatch && !element._4e_hasAttributes())
                    return true;

                attribs = getAttributesForComparison(def);

                if (attribs._length) {
                    for (var attName in attribs) {
                        if (attName == '_length')
                            continue;

                        var elementAttr = element.attr(attName) || '';
                        if (attName == 'style' ?
                            compareCssText(attribs[ attName ], normalizeCssText(elementAttr, false))
                            : attribs[ attName ] == elementAttr) {
                            if (!fullMatch)
                                return true;
                        }
                        else if (fullMatch)
                            return false;
                    }
                    if (fullMatch)
                        return true;
                }
                else
                    return true;
            }

            // Check if the element can be somehow overriden.
            var override = getOverrides(this)[ element._4e_name() ];
            if (override) {
                // If no attributes have been defined, remove the element.
                if (!( attribs = override.attributes ))
                    return true;

                for (var i = 0; i < attribs.length; i++) {
                    attName = attribs[i][0];
                    var actualAttrValue = element.attr(attName);
                    if (actualAttrValue) {
                        var attValue = attribs[i][1];
                        // Remove the attribute if:
                        //    - The override definition value is null;
                        //    - The override definition value is a string that
                        //      matches the attribute value exactly.
                        //    - The override definition value is a regex that
                        //      has matches in the attribute value.
                        if (attValue === null ||
                            ( typeof attValue == 'string' && actualAttrValue == attValue ) ||
                            attValue.test && attValue.test(actualAttrValue))
                            return true;
                    }
                }
            }
            return false;
        },

        /**
         * Get the style state inside an element path. Returns "true" if the
         * element is active in the path.
         */
        checkActive : function(elementPath) {
            switch (this.type) {
                case KEST.STYLE_BLOCK :
                    return this.checkElementRemovable(elementPath.block || elementPath.blockLimit, true);

                case KEST.STYLE_OBJECT :
                case KEST.STYLE_INLINE :

                    var elements = elementPath.elements;

                    for (var i = 0, element; i < elements.length; i++) {
                        element = elements[ i ];

                        if (this.type == KEST.STYLE_INLINE
                            && ( DOM._4e_equals(element, elementPath.block)
                            || DOM._4e_equals(element, elementPath.blockLimit) ))
                            continue;

                        if (this.type == KEST.STYLE_OBJECT
                            && !( element._4e_name() in objectElements ))
                            continue;

                        if (this.checkElementRemovable(element, true))
                            return true;
                    }
            }
            return false;
        }

    };

    KEStyle.getStyleText = function(styleDefinition) {
        // If we have already computed it, just return it.
        var stylesDef = styleDefinition._ST;
        if (stylesDef)
            return stylesDef;

        stylesDef = styleDefinition.styles;

        // Builds the StyleText.
        var stylesText = ( styleDefinition.attributes && styleDefinition.attributes[ 'style' ] ) || '',
            specialStylesText = '';

        if (stylesText.length)
            stylesText = stylesText.replace(semicolonFixRegex, ';');

        for (var style in stylesDef) {
            var styleVal = stylesDef[ style ],
                text = ( style + ':' + styleVal ).replace(semicolonFixRegex, ';');

            // Some browsers don't support 'inherit' property value, leave them intact. (#5242)
            if (styleVal == 'inherit')
                specialStylesText += text;
            else
                stylesText += text;
        }

        // Browsers make some changes to the style when applying them. So, here
        // we normalize it to the browser format.
        if (stylesText.length)
            stylesText = normalizeCssText(stylesText);

        stylesText += specialStylesText;

        // Return it, saving it to the next request.
        return ( styleDefinition._ST = stylesText );
    };

    function getElement(style, targetDocument) {
        var el,
            //def = style._.definition,
            elementName = style.element;

        // The "*" element name will always be a span for this function.
        if (elementName == '*')
            elementName = 'span';

        // Create the element.
        el = new Node(targetDocument.createElement(elementName));

        return setupElement(el, style);
    }

    function setupElement(el, style) {
        var def = style._.definition,attributes = def.attributes,styles = KEStyle.getStyleText(def);

        // Assign all defined attributes.
        if (attributes) {
            for (var att in attributes) {
                el.attr(att, attributes[ att ]);
            }
        }

        // Assign all defined styles.

        if (styles)
            el[0].style.cssText = styles;

        return el;
    }

    function applyBlockStyle(range) {
        // Serializible bookmarks is needed here since
        // elements may be merged.
        var bookmark = range.createBookmark(true),iterator = range.createIterator();
        iterator.enforceRealBlocks = true;

        // make recognize <br /> tag as a separator in ENTER_BR mode (#5121)
        //if (this._.enterMode)
        iterator.enlargeBr = true;//( this._.enterMode != CKEDITOR.ENTER_BR );

        var block, doc = range.document;
        // Only one =
        while (( block = iterator.getNextParagraph() )) {
            var newBlock = getElement(this, doc);
            replaceBlock(block, newBlock);
        }
        range.moveToBookmark(bookmark);
    }

    // Wrapper function of String::replace without considering of head/tail bookmarks nodes.
    function replace(str, regexp, replacement) {
        var headBookmark = '',
            tailBookmark = '';

        str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi,
            function(str, m1, m2) {
                m1 && ( headBookmark = m1 );
                m2 && ( tailBookmark = m2 );
                return '';
            });
        return headBookmark + str.replace(regexp, replacement) + tailBookmark;
    }

    /**
     * Converting from a non-PRE block to a PRE block in formatting operations.
     */
    function toPre(block, newBlock) {
        // First trim the block content.
        var preHtml = block.html();

        // 1. Trim head/tail spaces, they're not visible.
        preHtml = replace(preHtml, /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
        // 2. Delete ANSI whitespaces immediately before and after <BR> because
        //    they are not visible.
        preHtml = preHtml.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi, '$1');
        // 3. Compress other ANSI whitespaces since they're only visible as one
        //    single space previously.
        // 4. Convert &nbsp; to spaces since &nbsp; is no longer needed in <PRE>.
        preHtml = preHtml.replace(/([ \t\n\r]+|&nbsp;)/g, ' ');
        // 5. Convert any <BR /> to \n. This must not be done earlier because
        //    the \n would then get compressed.
        preHtml = preHtml.replace(/<br\b[^>]*>/gi, '\n');

        // Krugle: IE normalizes innerHTML to <pre>, breaking whitespaces.
        if (UA.ie) {
            var temp = block[0].ownerDocument.createElement('div');
            temp.appendChild(newBlock[0]);
            newBlock[0].outerHTML = '<pre>' + preHtml + '</pre>';
            newBlock = new Node(temp.firstChild);
            newBlock._4e_remove();
        }
        else
            newBlock.html(preHtml);

        return newBlock;
    }

    /**
     * Split into multiple <pre> blocks separated by double line-break.
     * @param preBlock
     */
    function splitIntoPres(preBlock) {
        // Exclude the ones at header OR at tail,
        // and ignore bookmark content between them.
        var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi,
            //blockName = preBlock._4e_name(),
            splittedHtml = replace(preBlock._4e_outerHtml(),
                duoBrRegex,
                function(match, charBefore, bookmark) {
                    return charBefore + '</pre>' + bookmark + '<pre>';
                });

        var pres = [];
        splittedHtml.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi, function(match, preContent) {
            pres.push(preContent);
        });
        return pres;
    }

    // Replace the original block with new one, with special treatment
    // for <pre> blocks to make sure content format is well preserved, and merging/splitting adjacent
    // when necessary.(#3188)
    function replaceBlock(block, newBlock) {
        var newBlockIsPre = newBlock._4e_name == ('pre'),blockIsPre = block._4e_name == ('pre'),
            isToPre = newBlockIsPre && !blockIsPre, isFromPre = !newBlockIsPre && blockIsPre;

        if (isToPre)
            newBlock = toPre(block, newBlock);
        else if (isFromPre)
        // Split big <pre> into pieces before start to convert.
            newBlock = fromPres(splitIntoPres(block), newBlock);
        else
            block._4e_moveChildren(newBlock);

        block[0].parentNode.replaceChild(newBlock[0], block[0]);
        if (newBlockIsPre) {
            // Merge previous <pre> blocks.
            mergePre(newBlock);
        }
    }

    /**
     * Merge a <pre> block with a previous sibling if available.
     */
    function mergePre(preBlock) {
        var previousBlock;
        if (!( ( previousBlock = preBlock._4e_previousSourceNode(true, KEN.NODE_ELEMENT) )
            && previousBlock._4e_name() == ('pre') ))
            return;

        // Merge the previous <pre> block contents into the current <pre>
        // block.
        //
        // Another thing to be careful here is that currentBlock might contain
        // a '\n' at the beginning, and previousBlock might contain a '\n'
        // towards the end. These new lines are not normally displayed but they
        // become visible after merging.
        var mergedHtml = replace(previousBlock.html(), /\n$/, '') + '\n\n' +
            replace(preBlock.html(), /^\n/, '');

        // Krugle: IE normalizes innerHTML from <pre>, breaking whitespaces.
        if (UA.ie)
            preBlock[0].outerHTML = '<pre>' + mergedHtml + '</pre>';
        else
            preBlock.html(mergedHtml);

        previousBlock._4e_remove();
    }

    /**
     * Converting a list of <pre> into blocks with format well preserved.
     */
    function fromPres(preHtmls, newBlock) {
        var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
        for (var i = 0; i < preHtmls.length; i++) {
            var blockHtml = preHtmls[ i ];

            // 1. Trim the first and last line-breaks immediately after and before <pre>,
            // they're not visible.
            blockHtml = blockHtml.replace(/(\r\n|\r)/g, '\n');
            blockHtml = replace(blockHtml, /^[ \t]*\n/, '');
            blockHtml = replace(blockHtml, /\n$/, '');
            // 2. Convert spaces or tabs at the beginning or at the end to &nbsp;
            blockHtml = replace(blockHtml, /^[ \t]+|[ \t]+$/g, function(match, offset) {
                if (match.length == 1)    // one space, preserve it
                    return '&nbsp;';
                else if (!offset)        // beginning of block
                    return new Array(match.length).join('&nbsp;') + ' ';
                else                // end of block
                    return ' ' + new Array(match.length).join('&nbsp;');
            });

            // 3. Convert \n to <BR>.
            // 4. Convert contiguous (i.e. non-singular) spaces or tabs to &nbsp;
            blockHtml = blockHtml.replace(/\n/g, '<br>');
            blockHtml = blockHtml.replace(/[ \t]{2,}/g,
                function (match) {
                    return new Array(match.length).join('&nbsp;') + ' ';
                });

            var newBlockClone = newBlock._4e_clone();
            newBlockClone.html(blockHtml);
            docFrag.appendChild(newBlockClone[0]);
        }
        return docFrag;
    }

    function applyInlineStyle(range) {
        var document = range.document;

        if (range.collapsed) {
            // Create the element to be inserted in the DOM.
            var collapsedElement = getElement(this, document);
            // Insert the empty element into the DOM at the range position.
            range.insertNode(collapsedElement);
            // Place the selection right inside the empty element.
            range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
            return;
        }

        var elementName = this.element, def = this._.definition,
            isUnknownElement,

            // Get the DTD definition for the element. Defaults to "span".
            dtd = KE.XHTML_DTD[ elementName ] || ( isUnknownElement = true,KE.XHTML_DTD.span ),

            // Bookmark the range so we can re-select it after processing.
            bookmark = range.createBookmark();

        // Expand the range.

        range.enlarge(KER.ENLARGE_ELEMENT);
        range.trim();
        // Get the first node to be processed and the last, which concludes the
        // processing.
        var boundaryNodes = range.createBookmark(),
            firstNode = boundaryNodes.startNode,
            lastNode = boundaryNodes.endNode,currentNode = firstNode,
            styleRange;

        while (currentNode && currentNode[0]) {
            var applyStyle = false;

            if (DOM._4e_equals(currentNode, lastNode)) {
                currentNode = null;
                applyStyle = true;
            }
            else {
                var nodeType = currentNode[0].nodeType,
                    nodeName = nodeType == KEN.NODE_ELEMENT ? currentNode._4e_name() : null;

                if (nodeName && currentNode.attr('_ke_bookmark')) {
                    currentNode = currentNode._4e_nextSourceNode(true);
                    continue;
                }

                // Check if the current node can be a child of the style element.
                if (!nodeName || ( dtd[ nodeName ]
                    && ( currentNode._4e_position(lastNode) |
                    ( KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) )
                    == ( KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED )
                    && ( !def.childRule || def.childRule(currentNode) ) )) {
                    var currentParent = currentNode.parent();

                    // Check if the style element can be a child of the current
                    // node parent or if the element is not defined in the DTD.
                    if (currentParent && currentParent[0]
                        && ( ( KE.XHTML_DTD[currentParent._4e_name()] || KE.XHTML_DTD.span )[ elementName ] || isUnknownElement )
                        && ( !def.parentRule || def.parentRule(currentParent) )) {
                        // This node will be part of our range, so if it has not
                        // been started, place its start right before the node.
                        // In the case of an element node, it will be included
                        // only if it is entirely inside the range.
                        if (!styleRange &&
                            ( !nodeName
                                || !KE.XHTML_DTD.$removeEmpty[ nodeName ]
                                || ( currentNode._4e_position(lastNode) |
                                ( KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED ))
                                ==
                                ( KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED )
                                )) {
                            styleRange = new KERange(document);
                            styleRange.setStartBefore(currentNode);
                        }

                        // Non element nodes, or empty elements can be added
                        // completely to the range.
                        if (nodeType == KEN.NODE_TEXT || ( nodeType == KEN.NODE_ELEMENT && !currentNode[0].childNodes.length )) {
                            var includedNode = currentNode,
                                parentNode;

                            // This node is about to be included completelly, but,
                            // if this is the last node in its parent, we must also
                            // check if the parent itself can be added completelly
                            // to the range.
                            while (!includedNode[0].nextSibling
                                && ( parentNode = includedNode.parent(),dtd[ parentNode._4e_name() ] )
                                && ( parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == ( KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED )
                                && ( !def.childRule || def.childRule(parentNode) )) {
                                includedNode = parentNode;
                            }

                            styleRange.setEndAfter(includedNode);

                            // If the included node still is the last node in its
                            // parent, it means that the parent can't be included
                            // in this style DTD, so apply the style immediately.
                            if (!includedNode[0].nextSibling)
                                applyStyle = true;

                        }
                    }
                    else
                        applyStyle = true;
                }
                else
                    applyStyle = true;

                // Get the next node to be processed.
                currentNode = currentNode._4e_nextSourceNode();
            }

            // Apply the style if we have something to which apply it.
            if (applyStyle && styleRange && !styleRange.collapsed) {
                // Build the style element, based on the style object definition.
                var styleNode = getElement(this, document),

                    // Get the element that holds the entire range.
                    parent = styleRange.getCommonAncestor();

                // Loop through the parents, removing the redundant attributes
                // from the element to be applied.
                while (styleNode && parent && styleNode[0] && parent[0]) {
                    if (parent._4e_name() == elementName) {
                        for (var attName in def.attributes) {
                            if (styleNode.attr(attName) == parent.attr(attName))
                                styleNode[0].removeAttribute(attName);
                        }
                        //bug notice add by yiminghe@gmail.com
                        //<span style="font-size:70px"><span style="font-size:30px">xcxx</span></span>
                        //下一次格式xxx为70px
                        //var exit = false;
                        for (var styleName in def.styles) {
                            if (styleNode._4e_style(styleName) == parent._4e_style(styleName)) {
                                styleNode._4e_style(styleName, "");
                            }
                        }

                        if (!styleNode._4e_hasAttributes()) {
                            styleNode = null;
                            break;
                        }
                    }

                    parent = parent.parent();
                }

                if (styleNode) {
                    // Move the contents of the range to the style element.
                    styleNode[0].appendChild(styleRange.extractContents());

                    // Here we do some cleanup, removing all duplicated
                    // elements from the style element.
                    removeFromInsideElement(this, styleNode);

                    // Insert it into the range position (it is collapsed after
                    // extractContents.
                    styleRange.insertNode(styleNode);

                    // Let's merge our new style with its neighbors, if possible.
                    styleNode._4e_mergeSiblings();

                    // As the style system breaks text nodes constantly, let's normalize
                    // things for performance.
                    // With IE, some paragraphs get broken when calling normalize()
                    // repeatedly. Also, for IE, we must normalize body, not documentElement.
                    // IE is also known for having a "crash effect" with normalize().
                    // We should try to normalize with IE too in some way, somewhere.
                    if (!UA.ie)
                        styleNode[0].normalize();
                }

                // Style applied, let's release the range, so it gets
                // re-initialization in the next loop.
                styleRange = null;
            }
        }

        firstNode._4e_remove();
        lastNode._4e_remove();
        range.moveToBookmark(bookmark);
        // Minimize the result range to exclude empty text nodes. (#5374)
        range.shrink(KER.SHRINK_TEXT);
    }

    function removeInlineStyle(range) {
        /*
         * Make sure our range has included all "collpased" parent inline nodes so
         * that our operation logic can be simpler.
         */
        range.enlarge(KER.ENLARGE_ELEMENT);

        var bookmark = range.createBookmark(),
            startNode = bookmark.startNode;

        if (range.collapsed) {

            var startPath = new ElementPath(startNode.parent()),
                // The topmost element in elementspatch which we should jump out of.
                boundaryElement;


            for (var i = 0, element; i < startPath.elements.length
                && ( element = startPath.elements[i] ); i++) {
                /*
                 * 1. If it's collaped inside text nodes, try to remove the style from the whole element.
                 *
                 * 2. Otherwise if it's collapsed on element boundaries, moving the selection
                 *  outside the styles instead of removing the whole tag,
                 *  also make sure other inner styles were well preserverd.(#3309)
                 */
                if (element == startPath.block || element == startPath.blockLimit)
                    break;

                if (this.checkElementRemovable(element)) {
                    var endOfElement = range.checkBoundaryOfElement(element, KER.END),
                        startOfElement = !endOfElement && range.checkBoundaryOfElement(element, KER.START);
                    if (startOfElement || endOfElement) {
                        boundaryElement = element;
                        boundaryElement.match = startOfElement ? 'start' : 'end';
                    } else {
                        /*
                         * Before removing the style node, there may be a sibling to the style node
                         * that's exactly the same to the one to be removed. To the user, it makes
                         * no difference that they're separate entities in the DOM tree. So, merge
                         * them before removal.
                         */
                        element._4e_mergeSiblings();
                        //yiminghe:note,bug for ckeditor
                        //qc #3700 for chengyu(yiminghe)
                        //从word复制过来的已编辑文本无法使用粗体和斜体等功能取消
                        if (element._4e_name() == this.element)
                            removeFromElement(this, element);
                        else
                            removeOverrides(element, getOverrides(this)[ element._4e_name() ]);
                    }
                }
            }

            // Re-create the style tree after/before the boundary element,
            // the replication start from bookmark start node to define the
            // new range.
            if (boundaryElement && boundaryElement[0]) {
                var clonedElement = startNode;
                for (i = 0; ; i++) {
                    var newElement = startPath.elements[ i ];
                    if (DOM._4e_equals(newElement, boundaryElement))
                        break;
                    // Avoid copying any matched element.
                    else if (newElement.match)
                        continue;
                    else
                        newElement = newElement._4e_clone();
                    newElement[0].appendChild(clonedElement[0]);
                    clonedElement = newElement;
                }
                DOM[ boundaryElement.match == 'start' ?
                    'insertBefore' : 'insertAfter' ](clonedElement[0], boundaryElement[0]);
            }
        } else {
            /*
             * Now our range isn't collapsed. Lets walk from the start node to the end
             * node via DFS and remove the styles one-by-one.
             */
            var endNode = bookmark.endNode,
                me = this;

            /*
             * Find out the style ancestor that needs to be broken down at startNode
             * and endNode.
             */
            function breakNodes() {
                var startPath = new ElementPath(startNode.parent()),
                    endPath = new ElementPath(endNode.parent()),
                    breakStart = null,
                    breakEnd = null;
                for (var i = 0; i < startPath.elements.length; i++) {
                    var element = startPath.elements[ i ];

                    if (element == startPath.block || element == startPath.blockLimit)
                        break;

                    if (me.checkElementRemovable(element))
                        breakStart = element;
                }
                for (i = 0; i < endPath.elements.length; i++) {
                    element = endPath.elements[ i ];

                    if (element == endPath.block || element == endPath.blockLimit)
                        break;

                    if (me.checkElementRemovable(element))
                        breakEnd = element;
                }

                if (breakEnd)
                    endNode._4e_breakParent(breakEnd);
                if (breakStart)
                    startNode._4e_breakParent(breakStart);
            }

            breakNodes();

            // Now, do the DFS walk.
            var currentNode = new Node(startNode[0].nextSibling);
            while (currentNode[0] !== endNode[0]) {
                /*
                 * Need to get the next node first because removeFromElement() can remove
                 * the current node from DOM tree.
                 */
                var nextNode = currentNode._4e_nextSourceNode();
                if (currentNode[0] && currentNode[0].nodeType == KEN.NODE_ELEMENT && this.checkElementRemovable(currentNode)) {
                    // Remove style from element or overriding element.
                    if (currentNode._4e_name() == this.element)
                        removeFromElement(this, currentNode);
                    else
                        removeOverrides(currentNode, getOverrides(this)[ currentNode._4e_name() ]);

                    /*
                     * removeFromElement() may have merged the next node with something before
                     * the startNode via mergeSiblings(). In that case, the nextNode would
                     * contain startNode and we'll have to call breakNodes() again and also
                     * reassign the nextNode to something after startNode.
                     */
                    if (nextNode[0].nodeType == KEN.NODE_ELEMENT && nextNode._4e_contains(startNode)) {
                        breakNodes();
                        nextNode = new Node(startNode[0].nextSibling);
                    }
                }
                currentNode = nextNode;
            }
        }
        range.moveToBookmark(bookmark);
    }

    // Turn inline style text properties into one hash.
    function parseStyleText(styleText) {
        var retval = {};
        styleText.replace(/&quot;/g, '"')
            .replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
            retval[ name ] = value;
        });
        return retval;
    }

    function compareCssText(source, target) {
        typeof source == 'string' && ( source = parseStyleText(source) );
        typeof target == 'string' && ( target = parseStyleText(target) );
        for (var name in source) {
            // Value 'inherit'  is treated as a wildcard,
            // which will match any value.
            if (!( name in target &&
                ( target[ name ] == source[ name ]
                    || source[ name ] == 'inherit'
                    || target[ name ] == 'inherit' ) )) {
                return false;
            }
        }
        return true;
    }

    function normalizeCssText(unparsedCssText, nativeNormalize) {
        var styleText;
        if (nativeNormalize !== false) {
            // Injects the style in a temporary span object, so the browser parses it,
            // retrieving its final format.
            var temp = document.createElement('span');
            temp.style.cssText = unparsedCssText;
            //temp.setAttribute('style', unparsedCssText);
            styleText = temp.style.cssText || '';
        }
        else
            styleText = unparsedCssText;

        // Shrinking white-spaces around colon and semi-colon (#4147).
        // Compensate tail semi-colon.
        return styleText.replace(/\s*([;:])\s*/, '$1')
            .replace(/([^\s;])$/, '$1;')
            .replace(/,\s+/g, ',')// Trimming spaces after comma (e.g. font-family name)(#4107).
            .toLowerCase();
    }

    function getAttributesForComparison(styleDefinition) {
        // If we have already computed it, just return it.
        var attribs = styleDefinition._AC;
        if (attribs)
            return attribs;

        attribs = {};

        var length = 0,

            // Loop through all defined attributes.
            styleAttribs = styleDefinition.attributes;
        if (styleAttribs) {
            for (var styleAtt in styleAttribs) {
                length++;
                attribs[ styleAtt ] = styleAttribs[ styleAtt ];
            }
        }

        // Includes the style definitions.
        var styleText = KEStyle.getStyleText(styleDefinition);
        if (styleText) {
            if (!attribs[ 'style' ])
                length++;
            attribs[ 'style' ] = styleText;
        }

        // Appends the "length" information to the object.
        attribs._length = length;

        // Return it, saving it to the next request.
        return ( styleDefinition._AC = attribs );
    }


    /**
     * Get the the collection used to compare the elements and attributes,
     * defined in this style overrides, with other element. All information in
     * it is lowercased.
     * @param  style
     */
    function getOverrides(style) {
        if (style._.overrides)
            return style._.overrides;

        var overrides = ( style._.overrides = {} ),
            definition = style._.definition.overrides;

        if (definition) {
            // The override description can be a string, object or array.
            // Internally, well handle arrays only, so transform it if needed.
            if (!S.isArray(definition))
                definition = [ definition ];

            // Loop through all override definitions.
            for (var i = 0; i < definition.length; i++) {
                var override = definition[i];
                var elementName;
                var overrideEl;
                var attrs;

                // If can be a string with the element name.
                if (typeof override == 'string')
                    elementName = override.toLowerCase();
                // Or an object.
                else {
                    elementName = override.element ? override.element.toLowerCase() : style.element;
                    attrs = override.attributes;
                }

                // We can have more than one override definition for the same
                // element name, so we attempt to simply append information to
                // it if it already exists.
                overrideEl = overrides[ elementName ] || ( overrides[ elementName ] = {} );

                if (attrs) {
                    // The returning attributes list is an array, because we
                    // could have different override definitions for the same
                    // attribute name.
                    var overrideAttrs = ( overrideEl.attributes = overrideEl.attributes || new Array() );
                    for (var attName in attrs) {
                        // Each item in the attributes array is also an array,
                        // where [0] is the attribute name and [1] is the
                        // override value.
                        overrideAttrs.push([ attName.toLowerCase(), attrs[ attName ] ]);
                    }
                }
            }
        }

        return overrides;
    }


    // Removes a style from an element itself, don't care about its subtree.
    function removeFromElement(style, element) {
        var def = style._.definition,
            attributes = S.mix(S.mix({}, def.attributes), getOverrides(style)[ element._4e_name()]),
            styles = def.styles,
            // If the style is only about the element itself, we have to remove the element.
            removeEmpty = S.isEmptyObject(attributes) && S.isEmptyObject(styles);

        // Remove definition attributes/style from the elemnt.
        for (var attName in attributes) {
            // The 'class' element value must match (#1318).
            if (( attName == 'class' || style._.definition.fullMatch )
                && element.attr(attName) != normalizeProperty(attName, attributes[ attName ]))
                continue;
            removeEmpty = removeEmpty || !!element._4e_hasAttribute(attName);
            element.removeAttr(attName);
        }

        for (var styleName in styles) {
            // Full match style insist on having fully equivalence. (#5018)
            if (style._.definition.fullMatch
                && element._4e_style(styleName) != normalizeProperty(styleName, styles[ styleName ], true))
                continue;

            removeEmpty = removeEmpty || !!element._4e_style(styleName);
            element._4e_style(styleName, "");
        }

        removeEmpty && removeNoAttribsElement(element);
    }

    function normalizeProperty(name, value, isStyle) {
        var temp = new Node('<span></span>');
        temp [ isStyle ? '_4e_style' : 'attr' ](name, value);
        return temp[ isStyle ? '_4e_style' : 'attr' ](name);
    }


    // Removes a style from inside an element.
    function removeFromInsideElement(style, element) {
        var //def = style._.definition,
            //attribs = def.attributes,
            //styles = def.styles,
            overrides = getOverrides(style),
            innerElements = element.all(style.element);

        for (var i = innerElements.length; --i >= 0;)
            removeFromElement(style, new Node(innerElements[i]));

        // Now remove any other element with different name that is
        // defined to be overriden.
        for (var overrideElement in overrides) {
            if (overrideElement != style.element) {
                innerElements = element.all(overrideElement);
                for (i = innerElements.length - 1; i >= 0; i--) {
                    var innerElement = new Node(innerElements[i]);
                    removeOverrides(innerElement, overrides[ overrideElement ]);
                }
            }
        }

    }

    /**
     *  Remove overriding styles/attributes from the specific element.
     *  Note: Remove the element if no attributes remain.
     * @param {Object} element
     * @param {Object} overrides
     */
    function removeOverrides(element, overrides) {
        var attributes = overrides && overrides.attributes;

        if (attributes) {
            for (var i = 0; i < attributes.length; i++) {
                var attName = attributes[i][0], actualAttrValue;

                if (( actualAttrValue = element.attr(attName) )) {
                    var attValue = attributes[i][1];

                    // Remove the attribute if:
                    //    - The override definition value is null ;
                    //    - The override definition valie is a string that
                    //      matches the attribute value exactly.
                    //    - The override definition value is a regex that
                    //      has matches in the attribute value.
                    if (attValue === null ||
                        ( attValue.test && attValue.test(actualAttrValue) ) ||
                        ( typeof attValue == 'string' && actualAttrValue == attValue ))
                        element[0].removeAttribute(attName);
                }
            }
        }

        removeNoAttribsElement(element);
    }

    // If the element has no more attributes, remove it.
    function removeNoAttribsElement(element) {
        // If no more attributes remained in the element, remove it,
        // leaving its children.
        if (!element._4e_hasAttributes()) {
            // Removing elements may open points where merging is possible,
            // so let's cache the first and last nodes for later checking.
            var firstChild = element[0].firstChild,lastChild = element[0].lastChild;

            element._4e_remove(true);

            if (firstChild) {
                // Check the cached nodes for merging.
                firstChild.nodeType == KEN.NODE_ELEMENT && DOM._4e_mergeSiblings(firstChild);

                if (lastChild && !firstChild === lastChild
                    && lastChild.nodeType == KEN.NODE_ELEMENT)
                    DOM._4e_mergeSiblings(lastChild);
            }
        }
    }

    KE.Style = KEStyle;
});
