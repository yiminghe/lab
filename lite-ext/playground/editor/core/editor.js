KISSY.app("KISSYEDITOR");
KISSY.mix(KISSYEDITOR, KISSY.EventTarget);
KISSY.add("editor", function(S) {
    var EventTarget = S.EventTarget;

    function Editor(document, toolBarDiv) {
        this.document = document;
        this.toolBarDiv = toolBarDiv;
        this._init();
    }

    S.augment(Editor, EventTarget, {
        _init:function() {
            var self = this,previousPath;
            setTimeout(function() {
                var selection = new S.Selection(self.document);
                var startElement = selection.getStartElement(),
                    currentPath = new S.ElementPath(startElement);

                if (!previousPath || !previousPath.compare(currentPath)) {
                    self.fire("selectionChange", { selection : self, path : currentPath, element : startElement });
                }
                setTimeout(arguments.callee, 200);
            }, 200);
            KISSYEDITOR.fire("instanceCreated", {editor:self});
        }
    });

    S.Editor = Editor;

});