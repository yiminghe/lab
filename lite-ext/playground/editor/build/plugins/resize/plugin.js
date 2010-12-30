KISSY.Editor.add("resize", function(editor) {
    var S = KISSY,
        Node = S.Node;


    S.use("dd", function() {
        var Draggable = S['Draggable'];
        var statusDiv = editor.statusDiv,
            resizer = new Node("<div class='ke-resizer'>"),
            cfg = editor.cfg["pluginConfig"]["resize"] || {};
        cfg = cfg["direction"] || ["x","y"];
        resizer.appendTo(statusDiv);
        //最大化时就不能缩放了
        editor.on("maximizeWindow", function() {
            resizer.css("display", "none");
        });
        editor.on("restoreWindow", function() {
            resizer.css("display", "");
        });
        var d = new Draggable({
            node:resizer
        }),
            height = 0,
            width = 0,
            heightEl = editor.wrap,
            widthEl = editor.editorWrap;
        d.on("dragstart", function() {
            height = heightEl.height();
            width = widthEl.width();
        });
        d.on("drag", function(ev) {
            var diffX = ev.left - this['startNodePos'].left,
                diffY = ev.top - this['startNodePos'].top;
            if (S.inArray("y", cfg)) heightEl.height(height + diffY);
            if (S.inArray("x", cfg)) widthEl.width(width + diffX);
        });

        editor.on("destroy", function() {
            d.destroy();
            resizer.remove();
        });
    });
}, {
    attach:false
});