/**
 * background-color support for kissy editor
 * @author : yiminghe@gmail.com
 */
KISSY.Editor.add("bgcolor", function(editor) {
    var S = KISSY,
        KE = S.Editor,
        ColorSupport = KE.ColorSupport,
        VALID_COLORS = ColorSupport.VALID_COLORS,
        BACK_STYLES = {},
        colorButton_backStyle = {
            element        : 'span',
            styles        : { 'background-color' : '#(color)' }
        };
    // Value 'inherit'  is treated as a wildcard,
    // which will match any value.
    //清除已设格式
    BACK_STYLES["inherit"] = new KE.Style(colorButton_backStyle, {
        color:"inherit"
    });
    for (var i = 0; i < VALID_COLORS.length; i++) {
        var currentColor = VALID_COLORS[i];
        BACK_STYLES[currentColor] = new KE.Style(colorButton_backStyle, {
            color:currentColor
        });
    }

    editor.addPlugin(function() {
        new ColorSupport({
            editor:editor,
            styles:BACK_STYLES,
            title:"背景颜色",
            contentCls:"ke-toolbar-bgcolor",
            text:"bgcolor"
        });
    });
});
