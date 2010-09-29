/**
 * 多实例的管理，主要是焦点控制，主要是为了
 * 1.firefox 焦点失去 bug，记录当前状态
 * 2.窗口隐藏后能够恢复焦点
 * @author: <yiminghe@gmail.com>
 */
KISSY.Editor.add("focusmanager", function(KE) {
    var S = KISSY,
        DOM = S.DOM,
        Event = S.Event,
        focusManager = {},
        INSTANCES = {},
        //当前焦点所在处
        currentInstance,
        focusManager = {
            refreshAll:function() {
                for (var i in INSTANCES) {
                    var e = INSTANCES[i];
                    e.document.designMode = "off";
                    e.document.designMode = "on";
                }
            },
            currentInstance :function() {
                return currentInstance;
            },
            getInstance : function(id) {
                return INSTANCES[id];
            },
            add : function(editor) {
                var win = DOM._4e_getWin(editor.document);
                Event.on(win, "focus", focus, editor);
                Event.on(win, "blur", blur, editor);
            },
            register : function(editor) {
                INSTANCES[editor._UUID] = editor;
            },
            remove : function(editor) {
                delete INSTANCES[editor._UUID];
                var win = DOM._4e_getWin(editor.document);
                Event.remove(win, "focus", focus, editor);
                Event.remove(win, "blur", blur, editor);
            }
        };

    function focus() {
        //console.log(" i got focus");
        var editor = this;
        editor.iframeFocus = true;
        currentInstance = editor;
        /*for (var i in INSTANCES) {
         if (i != editor._UUID)
         INSTANCES[i].blur();
         }*/
    }

    function blur() {
        //console.log(" i lost focus");
        var editor = this;
        editor.iframeFocus = false;
        currentInstance = null;
    }

    KE.focusManager = focusManager;
});
