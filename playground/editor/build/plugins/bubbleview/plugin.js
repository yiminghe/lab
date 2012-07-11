/**
 * bubble or tip view for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSY.Editor.add("bubbleview", function() {
    var S = KISSY,
        KE = S.Editor,
        Event = S.Event,
        DOM = S.DOM;

    if (KE.BubbleView) {
        S.log("attach bubbleview more", "warn");
        return;
    }

    var BubbleView = S['UIBase'].create(KE.Overlay,
        [], {
        renderUI:function() {
            var el = this.get("el");
            el.addClass("ke-bubbleview-bubble");
        },
        show:function() {
            var self = this,
                a = self._selectedEl,
                xy = a._4e_getOffset(document);
            xy.top += a.height() + 5;
            BubbleView['superclass'].show.call(self);
            self.set("xy", [xy.left,xy.top]);
        },
        destructor:function() {
            KE.Utils.destroyRes.call(this);
        }
    }, {
        ATTRS:{
            focus4e:false,
            "zIndex":{
                value:KE.baseZIndex(KE.zIndexManager.BUBBLE_VIEW)
            }
        }
    });


    var holder = {};

    function getInstance(pluginName) {
        var h = holder[pluginName];
        if (!h.bubble) {
            h.bubble = new BubbleView({
                autoRender:true
            });
            h.cfg.init && h.cfg.init.call(h.bubble);
        }
        return h.bubble;
    }

    BubbleView.destroy = function(pluginName) {
        var h = holder[pluginName];
        if (h && h.bubble) {
            h.bubble.destroy();
            h.bubble = null;
        }
    };

    BubbleView.attach = function(cfg) {
        var pluginName = cfg.pluginName;
        var cfgDef = holder[pluginName];
        S.mix(cfg, cfgDef.cfg, false);
        var pluginContext = cfg.pluginContext,
            func = cfg.func,
            editor = cfg.editor,
            bubble = cfg.bubble;
        //借鉴google doc tip提示显示
        editor.on("selectionChange", function(ev) {

            var elementPath = ev.path,
                elements = elementPath.elements,
                a,
                lastElement;
            if (elementPath && elements) {
                lastElement = elementPath.lastElement;
                if (!lastElement) return;
                a = func(lastElement);
                if (a) {
                    bubble = getInstance(pluginName);
                    bubble._selectedEl = a;
                    bubble._plugin = pluginContext;
                    bubble.hide();
                    bubble.show();
                } else if (bubble) {
                    bubble._selectedEl = bubble._plugin = null;
                    bubble.hide();
                }
            }
        });

        Event.on(DOM._4e_getWin(editor.document), "scroll blur", function() {
            bubble && bubble.hide();
        });
    };
    BubbleView.register = function(cfg) {
        var pluginName = cfg.pluginName;
        holder[pluginName] = holder[pluginName] || {
            cfg:cfg
        };
        Event.on(document, "click", function() {
            cfg.bubble && cfg.bubble.hide();
        });
        if (cfg.editor) {
            BubbleView.attach(cfg);
        }
    };

    KE.BubbleView = BubbleView;
}, {
    attach:false,
    requires:["overlay"]
});