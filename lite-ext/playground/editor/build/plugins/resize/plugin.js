KISSY.Editor.add("resize", function(editor) {
    var S = KISSY,KE = S.Editor,Node = S.Node;
    if (!KE.Resizer) {
        (function() {
            var markup = "<div class='ke-resizer'></div>",
                Draggable = KE.Draggable;

            function Resizer(editor) {
                this.editor = editor;
                this._init();
            }

            S.augment(Resizer, {
                _init:function() {
                    var self = this,
                        editor = self.editor,
                        statusDiv = editor.statusDiv,
                        resizer = new Node(markup);
                    resizer.appendTo(statusDiv);

                    var d = new Draggable({
                        node:resizer
                    }),height = 0,width = 0,
                        heightEl = editor.wrap,
                        widthEl = editor.editorWrap;
                    d.on("start", function() {
                        height = heightEl.height();
                        width = widthEl.width();
                    });
                    d.on("move", function(ev) {
                        var diffX = ev.pageX - this.startMousePos.left,
                            diffY = ev.pageY - this.startMousePos.top;
                        heightEl.height(height + diffY);
                        widthEl.width(width + diffX);
                    });
                }
            });

            KE.Resizer = Resizer;
        })();
    }

    editor.addPlugin(function() {
        new KE.Resizer(editor);
    });
});