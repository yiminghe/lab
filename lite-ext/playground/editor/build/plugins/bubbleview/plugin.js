/**
 * bubble or tip view for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSY.Editor.add("bubbleview", function() {
    var KE = KISSY.Editor,
        S = KISSY,
        Event = S.Event,
        DOM = S.DOM,
        Node = S.Node,
        markup = '<div class="ke-bubbleview-bubble" onmousedown="return false;"></div>';

    if (KE.BubbleView) return;
    function BubbleView(cfg) {
        BubbleView.superclass.constructor.apply(this, arguments);
        if (cfg.init)
            cfg.init.call(this);
    }

    var holder = {};


    /**
     * 延迟化创建实例
     * @param cfg
     */
    BubbleView.attach = function(cfg) {
        var pluginInstance = cfg.pluginInstance,
            pluginName = cfg.pluginName,
            editor = pluginInstance.editor,
            h = holder[pluginName];
        if (!h) return;
        var func = h.cfg.func,
            bubble = holder[pluginName].bubble;
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
                    bubble._plugin = pluginInstance;
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
        Event.on(document, "click", function() {
            bubble && bubble.hide();
        });
    };
    function getInstance(pluginName) {
        var h = holder[pluginName];
        if (!h.bubble)
            h.bubble = new BubbleView(h.cfg);
        return h.bubble;
    }

    BubbleView.register = function(cfg) {
        var pluginName = cfg.pluginName;
        holder[pluginName] = {
            cfg:cfg
        };
    };
    BubbleView.ATTRS = {
        //bubble 默认false
        focusMgr:{
            value:false
        },
        draggable:{
            value:false
        },
        "zIndex":{value:998}
    };
    S.extend(BubbleView, KE.SimpleOverlay, {
        /**
         * 当前选中元素
         */
        //_selectedEl,
        /**
         * 当前关联插件实例
         */
        //_plugin
        _createEl:function() {
            var self = this,el = new Node(markup).appendTo(document.body);
            self.el = el;
            self.set("el", el);
        },
        show:function() {
            var self = this,
                a = self._selectedEl,
                xy = a._4e_getOffset(document);
            xy.top += a.height() + 5;
            BubbleView.superclass.show.call(self, xy);
        }
    });

    KE.BubbleView = BubbleView;
});