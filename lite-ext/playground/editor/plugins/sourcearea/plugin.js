/**
 * source editor for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-sourcearea", function(KE) {
    var S = KISSY,TripleButton = KE.TripleButton;

    function SourceArea(editor) {
        this.editor = editor;
        this._init();
    }

    S.augment(SourceArea, {
        _init:function() {
            var self = this,editor = self.editor;
            self.el = new TripleButton({
                container:editor.toolBarDiv,
                cls:"ke-tool-editor-source",
                title:"源码",
                contentCls:"ke-toolbar-source"
                //text:"source"
            });
            self.el.on("offClick", self._show, self);
            self.el.on("onClick", self._hide, self);

            //不被父容器阻止默认，可点击
            editor.textarea.on("mousedown", function(ev) {
                ev.stopPropagation();
            });
        },
        _show:function() {
            var self = this,
                editor = self.editor,
                textarea = editor.textarea,
                iframe = editor.iframe,
                el = self.el;
            textarea.val(editor.getData());
            editor._showSource();
            el.set("state", TripleButton.ON);
        },
        _hide:function() {
            var self = this,
                editor = self.editor,
                textarea = editor.textarea,
                iframe = editor.iframe,
                el = self.el;
            editor._hideSource();
            el.set("state", TripleButton.OFF);
        }
    });


    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new SourceArea(editor);
    });
});