/**
 * namespace for kissy editor and event,editor instances holder
 * @author:yiminghe@gmail.com
 */
KISSY.app("KISSYEDITOR", KISSY.EventTarget);
(function() {
    var KISSYEDITOR_JS = "kissyeditor.js",
        KE = KISSYEDITOR,
        scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        if (script.src.indexOf(KISSYEDITOR_JS) != -1) {
            var start = script.src.indexOf(KISSYEDITOR_JS);
            KE.BASE_URL = script.src.substring(0, start);
            break;
        }
    }
})();