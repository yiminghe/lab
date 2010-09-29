/**
 * align support for kissy editor
 * @author: yiminghe@gmail.com
 */
KISSY.Editor.add("justify", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,TripleButton = KE.TripleButton;

    if (!KE.Justify) {
        (function() {
            function Justify(editor, v, title, contentCls) {
                var self = this;
                self.editor = editor;
                self.v = v;
                self.contentCls = contentCls;
                self.title = title;
                self._init();
            }

            var alignRemoveRegex = /(-moz-|-webkit-|start|auto)/i,
                default_align = "left";
            S.augment(Justify, {
                _init:function() {
                    var self = this,editor = self.editor,toolBarDiv = editor.toolBarDiv;
                    self.el = new TripleButton({
                        contentCls:self.contentCls,
                        //text:self.v,
                        title:self.title,
                        container:toolBarDiv
                    });
                    editor.on("selectionChange", self._selectionChange, self);
                    self.el.on("offClick", self._effect, self);
                    KE.Utils.sourceDisable(editor, self);
                },
                disable:function() {
                    this.el.set("state", TripleButton.DISABLED);
                },
                enable:function() {
                    this.el.set("state", TripleButton.OFF);
                },
                _effect:function() {
                    var self = this,editor = self.editor,
                        selection = editor.getSelection(),
                        enterMode = "p",state = self.el.get("state");

                    if (!selection)
                        return;

                    var bookmarks = selection.createBookmarks(),
                        ranges = selection.getRanges(),
                        iterator,
                        block;
                    editor.fire("save");
                    for (var i = ranges.length - 1; i >= 0; i--) {
                        iterator = ranges[ i ].createIterator();
                        iterator.enlargeBr = true;
                        while (( block = iterator.getNextParagraph() )) {
                            //console.log(block._4e_name());
                            block.removeAttr('align');
                            if (state == TripleButton.OFF)
                                block.css('text-align', self.v);
                            else
                                block.css('text-align', '');
                        }
                    }
                    editor.notifySelectionChange();
                    selection.selectBookmarks(bookmarks);
                    editor.fire("save");
                },
                _selectionChange:function(ev) {
                    var self = this,
                        el = self.el,
                        path = ev.path,
                        //elements = path.elements,
                        block = path.block || path.blockLimit;
                    //如果block是body，就不要设置，
                    // <body>
                    // <ul>
                    // <li style='text-align:center'>
                    // </li>
                    // </ul>
                    // </body>
                    if (!block || block._4e_name() === "body") {
                        el.set("state", TripleButton.OFF);
                        return;
                    }

                    var align = block.css("text-align").replace(alignRemoveRegex, "");
                    if (align == self.v || (!align && self.v == default_align)) {
                        el.set("state", TripleButton.ON);
                    } else {
                        el.set("state", TripleButton.OFF);
                    }
                }
            });
            KE.Justify = Justify;
        })();
    }
    editor.addPlugin(function() {
        new KE.Justify(editor, "left", "左对齐 ", "ke-toolbar-alignleft");
        new KE.Justify(editor, "center", "居中对齐 ", "ke-toolbar-aligncenter");
        new KE.Justify(editor, "right", "右对齐 ", "ke-toolbar-alignright");
        //new Justify(editor, "justify", "两端对齐 ");
    });
});
