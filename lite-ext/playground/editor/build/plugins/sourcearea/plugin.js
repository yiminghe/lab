/**
 * source editor for kissy editor
 * @author: yiminghe@gmail.com
 */
KISSY.Editor.add("sourcearea", function(editor) {
    editor.addPlugin("sourcearea", function() {
        var S = KISSY,
            KE = S.Editor,
            UA = S.UA;
        //firefox 3.5 不支持，有bug
        if (UA.gecko < 1.92) return;


        var SOURCE_MODE = KE.SOURCE_MODE ,
            WYSIWYG_MODE = KE.WYSIWYG_MODE;
        var context = editor.addButton("sourcearea", {
            title:"源码",
            contentCls:"ke-toolbar-source",
            loading:true
        });

        KE.use("sourcearea/support", function() {
            context.reload({
                init:function() {
                    var self = this,
                        btn = self.btn,
                        editor = self.editor;
                    editor.on("wysiwygmode", btn.boff, btn);
                    editor.on("sourcemode", btn.bon, btn);
                },
                offClick:function() {
                    var self = this,
                        editor = self.editor;
                    editor.execCommand("sourceAreaSupport", SOURCE_MODE);
                },
                onClick:function() {
                    var self = this,
                        editor = self.editor;
                    editor.execCommand("sourceAreaSupport", WYSIWYG_MODE);
                }
            });
            editor.addCommand("sourceAreaSupport", KE.SourceAreaSupport);
        });

        this.destroy = function() {
            context.destroy();
        };
    });
}, {
    attach:false
});
