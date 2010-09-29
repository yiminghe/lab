/**
 * triple state button for kissy editor
 * @author: yiminghe@gmail.com
 */
KISSY.Editor.add("button", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        ON = "on",
        OFF = "off",
        DISABLED = "disabled",
        Node = S.Node,
        BUTTON_CLASS = "ke-triplebutton",
        ON_CLASS = "ke-triplebutton-on",
        OFF_CLASS = "ke-triplebutton-off",
        DISABLED_CLASS = "ke-triplebutton-disabled",
        BUTTON_HTML = "<a class='" +
            [BUTTON_CLASS,OFF_CLASS].join(" ")
            + "' href='#'" +
            "" +
            //' tabindex="-1"' +
            //' hidefocus="true"' +
            ' role="button"' +
            //' onblur="this.style.cssText = this.style.cssText;"' +
            //' onfocus="event&&event.preventBubble();return false;"' +
            "></a>";
    if (KE.TripleButton) return;

    function TripleButton(cfg) {
        TripleButton.superclass.constructor.call(this, cfg);
        this._init();
    }

    TripleButton.ON = ON;
    TripleButton.OFF = OFF;
    TripleButton.DISABLED = DISABLED;

    TripleButton.ON_CLASS = ON_CLASS;
    TripleButton.OFF_CLASS = OFF_CLASS;
    TripleButton.DISABLED_CLASS = DISABLED_CLASS;

    TripleButton.ATTRS = {
        state: {value:OFF},
        container:{},
        text:{},
        contentCls:{},
        cls:{},
        el:{}
    };


    S.extend(TripleButton, S.Base, {
        _init:function() {
            var self = this,
                container = self.get("container"),
                elHolder = self.get("el"),
                title = self.get("title"),
                text = self.get("text"),
                contentCls = self.get("contentCls");
            self.el = new Node(BUTTON_HTML);
            var el = self.el;
            el._4e_unselectable();
            self._attachCls();
            //button有文子
            if (text) {
                el.html(text);
                //直接上图标
            } else if (contentCls) {
                el.html("<span class='ke-toolbar-item " +
                    contentCls + "'></span>");
                el.one("span")._4e_unselectable();
            }
            if (title) el.attr("title", title);
            //替换已有元素
            if (elHolder) {
                elHolder[0].parentNode.replaceChild(el[0], elHolder[0]);
            }
            //加入容器
            else if (container) {
                container.append(self.el);
            }
            el.on("click", self._action, self);
            self.on("afterStateChange", self._stateChange, self);
        },
        _attachCls:function() {
            var cls = this.get("cls");
            if (cls) this.el.addClass(cls);
        },

        _stateChange:function(ev) {
            var n = ev.newVal,self = this;
            self["_" + n]();
            self._attachCls();
        },
        disable:function() {
            var self = this;
            self._savedState = self.get("state");
            self.set("state", DISABLED);
        },
        enable:function() {
            var self = this;
            if (self.get("state") == DISABLED)
                self.set("state", self._savedState);
        },
        _action:function(ev) {
            var self = this;
            self.fire(self.get("state") + "Click", ev);
            self.fire("click", ev);
            ev.preventDefault();
        },
        _on:function() {
            this.el[0].className = [BUTTON_CLASS,ON_CLASS].join(" ");
        },
        _off:function() {
            this.el[0].className = [BUTTON_CLASS,OFF_CLASS].join(" ");
        },
        _disabled:function() {
            this.el[0].className = [BUTTON_CLASS,DISABLED_CLASS].join(" ");
        }
    });
    KE.TripleButton = TripleButton;
});
