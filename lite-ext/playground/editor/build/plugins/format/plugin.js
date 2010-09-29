/**
 * format formatting,modified from ckeditor
 * @modifier: yiminghe@gmail.com
 */
KISSY.Editor.add("format", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        Node = S.Node;
    var
        FORMAT_SELECTION_ITEMS = [],
        FORMATS = {
            "普通文本":"p",
            "标题1":"h1",
            "标题2":"h2",
            "标题3":"h3",
            "标题4":"h4",
            "标题5":"h5",
            "标题6":"h6"
        },
        FORMAT_SIZES = {
            p:"1em",
            h1:"2em",
            h2:"1.5em",
            h3:"1.17em",
            h4:"1em",
            h5:"0.83em",
            h6:"0.67em"
        },
        FORMAT_STYLES = {},
        KEStyle = KE.Style;

    for (var p in FORMATS) {
        if (FORMATS[p]) {
            FORMAT_STYLES[FORMATS[p]] = new KEStyle({
                element:FORMATS[p]
            });
            FORMAT_SELECTION_ITEMS.push({
                name:p,
                value:FORMATS[p],
                attrs:{
                    style:"font-size:" + FORMAT_SIZES[FORMATS[p]]
                }
            });

        }
    }

    if (!KE.Format) {
        (function() {

            function Format(cfg) {
                Format.superclass.constructor.call(this, cfg);
                var self = this;
                this._init();
            }

            Format.ATTRS = {
                editor:{}
            };
            var Select = KE.Select;
            S.extend(Format, S.Base, {
                _init:function() {
                    var self = this,
                        editor = this.get("editor"),
                        toolBarDiv = editor.toolBarDiv;
                    self.el = new Select({
                        container: toolBarDiv,
                        value:"",
                        doc:editor.document,
                        width:self.get("width"),
                        popUpWidth:self.get("popUpWidth"),
                        title:self.get("title"),
                        items:self.get("html")
                    });
                    self.el.on("click", self._vChange, self);
                    editor.on("selectionChange", self._selectionChange, self);
                    KE.Utils.sourceDisable(editor, self);
                },
                disable:function() {
                    this.el.set("state", Select.DISABLED);
                },
                enable:function() {
                    this.el.set("state", Select.ENABLED);
                },

                _vChange:function(ev) {
                    var self = this,
                        editor = self.get("editor"),
                        v = ev.newVal,
                        pre = ev.preVal;
                    editor.fire("save");
                    if (v != pre) {
                        FORMAT_STYLES[v].apply(editor.document);
                    } else {
                        FORMAT_STYLES["p"].apply(editor.document);
                        self.el.set("value", "p");
                    }
                    editor.fire("save");
                },

                _selectionChange:function(ev) {
                    var self = this,
                        editor = self.get("editor"),
                        elementPath = ev.path;
                    // For each element into the elements path.
                    // Check if the element is removable by any of
                    // the styles.
                    for (var value in FORMAT_STYLES) {
                        if (FORMAT_STYLES[ value ].checkActive(elementPath)) {
                            self.el.set("value", value);
                            return;
                        }
                    }

                    self.el.reset("value");
                }
            });
            KE.Format = Format;
        })();
    }

    editor.addPlugin(function() {
        new KE.Format({
            editor:editor,
            html:FORMAT_SELECTION_ITEMS,
            title:"标题",
            width:"100px",
            popUpWidth:"120px"
        });
    });

});
