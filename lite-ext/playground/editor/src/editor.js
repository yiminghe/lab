/**
 * Constructor for kissy editor and module dependency definition
 * @author: yiminghe@gmail.com, lifesinger@gmail.com
 * @version: 2.0
 * @buildtime: @TIMESTAMP@
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
