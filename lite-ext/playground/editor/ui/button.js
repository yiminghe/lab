/**
 * triple state button for kissy editor
 * @author:yiminghe@gmail.com
 * @date:2010-08-02
 */
KISSY.add("kissy-editor-button", function(S) {
    var ON = "on",
        OFF = "off",
        DISABLED = "disabled",
        Node = S.Node,
        DOM = S.DOM;
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
            + "' href='#' onclick='return false;'></a>";

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
        text:{}
    };


    S.extend(TripleButton, S.Base, {
        _init:function() {

            this.el = new Node(BUTTON_HTML);
            this.el.html(this.get("text"));
            var container = this.get("container")[0] || this.get("container");
            container.appendChild(this.el[0]);
            this.el.on("click", this._action, this);
            this.on("afterStateChange", this._stateChange, this);
        },

        _stateChange:function(ev) {
            var n = ev.newVal,pre = ev.preVal;
            this["_" + n]();
        },

        _action:function(ev) {
            this.fire(this.get("state") + "Click", ev);
            this.fire("click", ev);
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

    S.TripleButton = TripleButton;

});