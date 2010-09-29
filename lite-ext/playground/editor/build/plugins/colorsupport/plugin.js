/**
 * color support for kissy editor
 * @author : yiminghe@gmail.com
 */
KISSY.Editor.add("colorsupport", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        Node = S.Node,
        Event = S.Event,
        Overlay = KE.SimpleOverlay,
        TripleButton = KE.TripleButton,
        KEStyle = KE.Style,
        DOM = S.DOM;
    if (KE.ColorSupport) return;

    function padding2(str) {
        return ("0" + str).slice(str.length - 1, str.length + 1);
    }

    var rgbColorReg = /^rgb\((\d+),(\d+),(\d+)\)$/i;

    function normalColor(color) {
        color = S.trim(color);
        if (color.charAt(0) == "#") color = color.substring(1);
        //console.log(color);
        color = color.replace(/\s+/g, "");
        var str = "",simpleColorReg = /^[0-9a-f]{3,3}$/i;

        if (simpleColorReg.test(color)) {
            str = color.replace(/[0-9a-f]/ig, function(m) {
                return m + m;
            });
        } else {
            var m = color.match(rgbColorReg);
            if (m && m[0]) {
                for (var i = 1; i < 4; i++) {
                    str += padding2(parseInt(m[i]).toString(16));
                }
            } else {
                str = color;
            }
        }


        return "#" + str.toLowerCase();
    }

    var colorButton_colors =
        ('000,800000,8B4513,2F4F4F,008080,000080,4B0082,696969,' +
            'B22222,A52A2A,DAA520,006400,40E0D0,0000CD,800080,808080,' +
            'F00,FF8C00,FFD700,008000,0FF,00F,EE82EE,A9A9A9,' +
            'FFA07A,FFA500,FFFF00,00FF00,AFEEEE,ADD8E6,DDA0DD,D3D3D3,' +
            'FFF0F5,FAEBD7,FFFFE0,F0FFF0,F0FFFF,F0F8FF,E6E6FA,FFF').split(/,/),
        VALID_COLORS = [],
        html = "<div class='ke-popup-wrap ke-color-wrap'>" +
            "<a class='ke-color-remove' href=\"javascript:void('清除');\"><span>清除</span></a>" +
            "<table>";
    for (var i = 0; i < 5; i++) {
        html += "<tr>";
        for (var j = 0; j < 8; j++) {
            var currentColor = normalColor(colorButton_colors[8 * i + j]);
            html += "<td>";
            html += "<a href='javascript:void(0);' class='ke-color-a'><span style='background-color:"
                + currentColor
                + "'></span></a>";
            html += "</td>";
            VALID_COLORS.push(currentColor);
        }
        html += "</tr>";
    }

    html += "</table></div>";


    function ColorSupport(cfg) {
        var self = this;
        ColorSupport.superclass.constructor.call(self, cfg);
        self._init();
    }

    ColorSupport.VALID_COLORS = VALID_COLORS;

    ColorSupport.ATTRS = {
        editor:{},
        styles:{},
        contentCls:{},
        text:{}
    };
    S.extend(ColorSupport, S.Base, {
        _init:function() {
            var self = this,
                editor = self.get("editor"),
                toolBarDiv = editor.toolBarDiv,
                el = new TripleButton({
                    container:toolBarDiv,
                    title:self.get("title"),
                    contentCls:self.get("contentCls")
                    //text:this.get("text")
                });

            el.on("offClick", self._showColors, self);
            self.el = el;
            KE.Utils.lazyRun(self, "_prepare", "_real");
            KE.Utils.sourceDisable(editor, self);
        },
        disable:function() {
            this.el.set("state", TripleButton.DISABLED);
        },
        enable:function() {
            this.el.set("state", TripleButton.OFF);
        },
        _hidePanel:function(ev) {
            var self = this;
            //多窗口管理
            if (DOM._4e_ascendant(ev.target, function(node) {
                return node._4e_equals(self.el.el);
            }, true))return;
            self.colorWin.hide();
        },
        _selectColor:function(ev) {
            ev.halt();
            var self = this,editor = self.get("editor"),
                t = ev.target;
            if (DOM._4e_name(t) == "span" || DOM._4e_name(t) == "a") {
                t = new Node(t);
                if (t._4e_name() == "a")
                    t = t.one("span");
                var styles = self.get("styles");
                editor.fire("save");
                if (t._4e_style("background-color")) {
                    styles[normalColor(t._4e_style("background-color"))].apply(editor.document);
                }
                else {
                    styles["inherit"].remove(editor.document);
                }
                editor.fire("save");
                self.colorWin.hide();
            }
        },
        _prepare:function() {
            var self = this;
            self.colorPanel = new Node(html);
            self.colorWin = new Overlay({
                el:this.colorPanel,
                mask:false,
                focusMgr:false
            });
            document.body.appendChild(self.colorPanel[0]);
            self.colorPanel.on("click", self._selectColor, self);
            Event.on(document, "click", self._hidePanel, self);
            Event.on(editor.document, "click", self._hidePanel, self);
        },
        _real:function() {
            var self = this,xy = self.el.el.offset();
            xy.top += self.el.el.height() + 5;
            if (xy.left + self.colorPanel.width() > DOM.viewportWidth() - 60) {
                xy.left = DOM.viewportWidth() - self.colorPanel.width() - 60;
            }
            this.colorWin.show(xy);
        },
        _showColors:function(ev) {
            var self = this;
            self._prepare(ev);
        }
    });
    KE.ColorSupport = ColorSupport;
});
