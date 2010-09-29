/**
 * preview for kissy editor
 * @author: yiminghe@gmail.com
 */
KISSY.Editor.add("preview", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,TripleButton = KE.TripleButton;
    if (!KE.Preview) {
        (function() {
            function Preview(editor) {
                this.editor = editor;
                this._init();
            }

            S.augment(Preview, {
                _init:function() {
                    var self = this,editor = self.editor;
                    self.el = new TripleButton({
                        container:editor.toolBarDiv,
                        title:"预览",
                        contentCls:"ke-toolbar-preview"
                        //text:"preview"
                    });
                    self.el.on("offClick", this._show, this);
                },
                _show:function() {
                    var self = this,editor = self.editor;
                    //try {
                    //editor will be unvisible
                    //  editor.focus();
                    //} catch(e) {
                    // }
                    var iWidth = 640,    // 800 * 0.8,
                        iHeight = 420,    // 600 * 0.7,
                        iLeft = 80;	// (800 - 0.8 * 800) /2 = 800 * 0.1.
                    try {
                        var screen = window.screen;
                        iWidth = Math.round(screen.width * 0.8);
                        iHeight = Math.round(screen.height * 0.7);
                        iLeft = Math.round(screen.width * 0.1);
                    } catch (e) {
                    }
                    var sHTML = editor._prepareIFrameHtml().replace(/<body[^>]+>.+<\/body>/, "<body>\n" + editor.getData() + "\n</body>");
                    var sOpenUrl = '';
                    var oWindow = window.open(sOpenUrl, null, 'toolbar=yes,location=no,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width=' +
                        iWidth + ',height=' + iHeight + ',left=' + iLeft);
                    oWindow.document.open();
                    oWindow.document.write(sHTML);
                    oWindow.document.close();
                    //ie 重新显示
                    oWindow.focus();
                }
            });
            KE.Preview = Preview;
        })();
    }

    editor.addPlugin(function() {
        new KE.Preview(editor);
    });
});
