/**
 * triple state button for kissy editor
 * @author:yiminghe@gmail.com
 * @date:2010-08-02
 */
KISSYEDITOR.add("kissy-editor-button", function(KE) {
    var S = KISSY,
        ON = "on",
        OFF = "off",
        DISABLED = "disabled",
        Node = S.Node;
    if (false && !S.TripleButton) {
        var seed = "";
        var styleSheet = document.createElement("style");
        styleSheet.type = 'text/css';
        document.getElementsByTagName("head")[0].appendChild(styleSheet);
        if (styleSheet.styleSheet) {
            styleSheet.styleSheet.cssText = seed;
        } else {
            styleSheet.appendChild(document.createTextNode(seed));
        }
    }

    var BUTTON_CLASS = "ke-triplebutton",
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
        cls:{}
    };


    S.extend(TripleButton, S.Base, {
        _init:function() {
            var self = this,container = self.get("container")[0] || self.get("container");
            self.el = new Node(BUTTON_HTML);
            self.el._4e_unselectable();
            self._attachCls();
            self.el.html(this.get("text"));
            if (self.get("title")) self.el.attr("title", self.get("title"));
            container.appendChild(self.el[0]);
            self.el.on("click", self._action, self);
            self.on("afterStateChange", self._stateChange, self);
        },
        _attachCls:function() {
            var cls = this.get("cls");
            if (cls) this.el.addClass(cls);
        },

        _stateChange:function(ev) {
            var n = ev.newVal;
            this["_" + n]();
            this._attachCls();
        },

        _action:function(ev) {
            this.fire(this.get("state") + "Click", ev);
            this.fire("click", ev);
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