/**
 * 多实例的焦点控制，主要是为了firefox焦点失去bug，记录当前状态
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-focusmanager", function(KE) {
    var S = KISSY,
        DOM = S.DOM,
        Event = S.Event,
        focusManager = {};

    var INSTANCES = {};

    focusManager.add = function(editor) {
        INSTANCES[editor._UUID] = editor;
        var win = DOM._4e_getWin(editor.document);
        Event.on(win, "focus", focus, editor);
        Event.on(win, "blur", blur, editor);
    };
    focusManager.remove = function(editor) {
        delete INSTANCES[editor._UUID];
        var win = DOM._4e_getWin(editor.document);
        Event.remove(win, "focus", focus, editor);
        Event.remove(win, "blur", blur, editor);
    };
    function focus() {
        //console.log(" i got focus");
        var editor = this;
        editor.iframeFocus = true;
        /*for (var i in INSTANCES) {
         if (i != editor._UUID)
         INSTANCES[i].blur();
         }*/
    }

    function blur() {
        var editor = this;
        editor.iframeFocus = false;
    }

    KE.focusManager = focusManager;
});