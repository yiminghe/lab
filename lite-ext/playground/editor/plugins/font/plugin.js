/**
 * font formatting,modified from ckeditor
 * @modifier:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-font", function(KE) {
    var S = KISSY,
        KEStyle = KE.Style,
        Node = S.Node,
        FONT_SIZES = ["8px","10px","12px",
            "14px","18px","24px","36px"],
        FONT_SIZE_STYLES = {},
        FONT_SIZE_SELECTION_HTML = "<select title='大小'><option value=''>请选择字体大小</option>",
        fontSize_style = {
            element        : 'span',
            styles        : { 'font-size' : '#(size)' },
            overrides    : [
                { element : 'font', attributes : { 'size' : null } }
            ]
        },
        FONT_FAMILIES = ["宋体","黑体","隶书",
            "楷体_GB2312","微软雅黑","Georgia","Times New Roman",
            "Impact","Courier New","Arial","Verdana","Tahoma"],
        FONT_FAMILY_STYLES = {},
        FONT_FAMILY_SELECTION_HTML = "<select title='字体'><option value=''>请选择字体</option>",
        fontFamily_style = {
            element        : 'span',
            styles        : { 'font-family' : '#(family)' },
            overrides    : [
                { element : 'font', attributes : { 'face' : null } }
            ]
        };

    for (var i = 0; i < FONT_SIZES.length; i++) {
        var size = FONT_SIZES[i];
        FONT_SIZE_STYLES[size] = new KEStyle(fontSize_style, {
            size:size
        });
        FONT_SIZE_SELECTION_HTML += "<option value='" + size + "'>" + size + "</option>"
    }
    FONT_SIZE_SELECTION_HTML += "</select>";

    for (var i = 0; i < FONT_FAMILIES.length; i++) {
        var family = FONT_FAMILIES[i];
        FONT_FAMILY_STYLES[family] = new KEStyle(fontFamily_style, {
            family:family
        });
        FONT_FAMILY_SELECTION_HTML += "<option value='" + family + "'>" + family + "</option>"
    }
    FONT_FAMILY_SELECTION_HTML += "</select>";


    function Font(cfg) {
        Font.superclass.constructor.call(this, cfg);
        var self = this;
        this._init();
    }

    Font.ATTRS = {
        v:{
            value:""
        },
        html:{},
        styles:{},
        editor:{}
    }

    S.extend(Font, S.Base, {

        _init:function() {
            var editor = this.get("editor"),
                toolBarDiv = editor.toolBarDiv,
                html = this.get("html");
            var self = this;
            self.el = new Node(html);
            toolBarDiv[0].appendChild(this.el[0]);
            self.el.on("change", this._change, this);
            editor.on("selectionChange", this._selectionChange, this);
            this.on("afterVChange", this._vChange, this);
        },

        _vChange:function(ev) {
            var editor = this.get("editor"),
                v = ev.newVal,
                pre = ev.preVal,
                styles = this.get("styles");
            editor.focus();
            editor.fire("save");
            if (!v) {
                v = pre;
                styles[v].remove(editor.document);
            } else {
                styles[v].apply(editor.document);
            }
            editor.fire("save");
            //editor.fire("fontSizeChange", this.get("v"));
        },

        _change:function() {
            var el = this.el;
            this.set("v", el.val());
        },

        _selectionChange:function(ev) {
            var editor = this.get("editor");
            var currentValue = this.get("v");
            var elementPath = ev.path,
                elements = elementPath.elements,
                styles = this.get("styles");
            // For each element into the elements path.
            for (var i = 0, element; i < elements.length; i++) {
                element = elements[i];
                // Check if the element is removable by any of
                // the styles.
                for (var value in styles) {
                    if (styles[ value ].checkElementRemovable(element, true)) {
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
            editor:editor,
            styles:FONT_SIZE_STYLES,
            html:FONT_SIZE_SELECTION_HTML
        });

        new Font({
            editor:editor,
            styles:FONT_FAMILY_STYLES,
            html:FONT_FAMILY_SELECTION_HTML
        });

    });

});