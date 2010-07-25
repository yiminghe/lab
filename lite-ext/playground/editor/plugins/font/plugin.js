KISSY.add("editor-plugin-font", function(S) {
    var KE = KISSYEDITOR,
        KEStyle = S.Style,
        Node = S.Node,
        FONT_SIZES = ["30px","50px","70px"],
        FONT_STYLES = {},
        FONT_SELECTION_HTML = "<select><option value=''>请选择字体大小</option>";
    var fontSize_style = {
        element        : 'span',
        styles        : { 'font-size' : '#(size)' },
        overrides    : [
            { element : 'font', attributes : { 'size' : null } }
        ]
    };

    for (var i = 0; i < FONT_SIZES.length; i++) {
        var size = FONT_SIZES[i];
        FONT_STYLES[size] = new KEStyle(fontSize_style, {
            size:size
        });
        FONT_SELECTION_HTML += "<option value='" + size + "'>" + size + "</option>"
    }
    FONT_SELECTION_HTML += "select";


    function Font(cfg) {
        Font.superclass.constructor.call(this, cfg);
        var self = this;
        self.el = new Node(FONT_SELECTION_HTML);
        this._init();
    }

    Font.ATTRS = {
        v:{
            value:""
        },
        editor:{}
    }

    S.extend(Font, S.Base, {

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
            if (!v) {
                v = pre;
                FONT_STYLES[v].remove(editor.document);
            } else {
                FONT_STYLES[v].apply(editor.document);
            }
            editor.fire("fontSizeChange", this.get("v"));
        },
        _change:function() {
            var el = this.el;
            this.set("v", el.val());
        },

        _selectionChange:function(ev) {
            var currentValue = this.get("v");
            var elementPath = ev.path,
                elements = elementPath.elements;
            // For each element into the elements path.
            for (var i = 0, element; i < elements.length; i++) {
                element = elements[i];

                // Check if the element is removable by any of
                // the styles.
                for (var value in FONT_STYLES) {
                    if (FONT_STYLES[ value ].checkElementRemovable(element, true)) {
                        if (value != currentValue) {
                            this._set("v", value);
                            this.el.val(value);
                        }
                        return;
                    }
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
        new Font({
            editor:editor
        });

    });

})
    ;