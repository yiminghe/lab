/**
 * align support for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-justify", function(KE) {
    var S = KISSY,TripleButton = KE.TripleButton;


    function Justify(editor, v, title) {
        var self = this;
        self.editor = editor;
        self.v = v;
        self.title = title;
        self._init();
    }

    var alignRemoveRegex = /(-moz-|-webkit-|start|auto)/i,
        default_align = "left";
    S.augment(Justify, {
        _init:function() {
            var self = this,editor = self.editor,toolBarDiv = editor.toolBarDiv;
            self.el = new TripleButton({
                text:self.v,
                title:self.title,
                container:toolBarDiv
            });
            editor.on("selectionChange", self._selectionChange, self);
            self.el.on("click", self._effect, self);
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
                    block.removeAttr('align');
                    if (state == TripleButton.OFF)
                        block.css('text-align', self.v);
                    else
                        block.css('text-align', '');
                }
            }

            editor.focus();
            editor.notifySelectionChange();
            selection.selectBookmarks(bookmarks);
            editor.fire("save");
        },
        _selectionChange:function(ev) {
            var self = this,
                el = self.el,
                path = ev.path,elements = path.elements,block = path.block || path.blockLimit;

            var align = block.css("text-align").replace(alignRemoveRegex, "");
            if (align == self.v || (!align && self.v == default_align)) {
                el.set("state", TripleButton.ON);
            } else {
                el.set("state", TripleButton.OFF);
            }
        }
    });


    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new Justify(editor, "left", "左对齐");
        new Justify(editor, "center", "居中对齐");
        new Justify(editor, "right", "右对齐");
        new Justify(editor, "justify", "两端对齐");
    });
});