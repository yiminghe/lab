KISSY.add("editor-plugin-format", function(S) {
    var KE = KISSYEDITOR,
        KEStyle = S.Style,
        Node = S.Node,
        FORMAT_SELECTION_HTML = "<select><option value=''>请选择格式</option>",
        FORMATS = {
            "普通":"p",
            "标题1":"h1",
            "标题5":"h5"
        },FORMAT_STYLES = {},KEStyle = S.Style;

    for (var p in FORMATS) {
        if (FORMATS[p]) {
            FORMAT_STYLES[FORMATS[p]] = new KEStyle({
                element:FORMATS[p]
            });
            FORMAT_SELECTION_HTML += "<option value='" + FORMATS[p] + "'>" + p + "</option>"
        }
    }
    FORMAT_SELECTION_HTML += "</select>";
    function Format(cfg) {
        Format.superclass.constructor.call(this, cfg);
        var self = this;
        self.el = new Node(FORMAT_SELECTION_HTML);
        this._init();
    }

    Format.ATTRS = {
        v:{
            value:""
        },
        editor:{}
    }

    S.extend(Format, S.Base, {

        _init:function() {
            var editor = this.get("editor"),toolBarDiv = editor.toolBarDiv,
                el = this.el;
            var self = this;
            toolBarDiv[0].appendChild(this.el[0]);
            el.on("change", this._change, this);
            editor.on("selectionChange", this._selectionChange, this);
            this.on("afterVChange", this._vChange, this);
        },

        _vChange:function(ev) {
            var editor = this.get("editor"),v = ev.newVal,pre = ev.preVal;
            editor.focus();
            if (!v) {
                v = pre;
                FORMAT_STYLES[v].remove(editor.document);
            } else {
                FORMAT_STYLES[v].apply(editor.document);
            }
            editor.fire("formatChange", this.get("v"));
        },
        _change:function() {
            var el = this.el;
            this.set("v", el.val());
        },

        _selectionChange:function(ev) {
            var editor = this.get("editor");
            var currentValue = this.get("v");
            var elementPath = ev.path,
                elements = elementPath.elements;
            // For each element into the elements path.

            // Check if the element is removable by any of
            // the styles.
            for (var value in FORMAT_STYLES) {
                if (FORMAT_STYLES[ value ].checkActive(elementPath)) {
                    if (value != currentValue) {
                        this._set("v", value);
                        this.el.val(value);
                    }
                    return;
                }
            }

            // If no styles match, just empty it.
            if (currentValue != '') {
                this._set("v", '');
                this.el.val("");
            }
        }
    });


    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new Format({
            editor:editor
        });
    });

});