/**
 * forecolor support for kissy editor
 * @author : yiminghe@gmail.com
 */
KISSY.Editor.add("forecolor", function(editor) {
    var S = KISSY,
        KE = S.Editor,
        ColorSupport = KE.ColorSupport,
        VALID_COLORS = ColorSupport.VALID_COLORS,
        FORE_STYLES = {},
        colorButton_foreStyle = {
            element        : 'span',
            styles        : { 'color' : '#(color)' },
            overrides    : [
                { element : 'font', attributes : { 'color' : null } }
            ]
        };
    // Value 'inherit'  is treated as a wildcard,
    // which will match any value.
    //清除已设格式

    FORE_STYLES["inherit"] = new KE.Style(colorButton_foreStyle, {
        color:"inherit"
    });
    for (var i = 0; i < VALID_COLORS.length; i++) {
        var currentColor = VALID_COLORS[i];
        FORE_STYLES[currentColor] = new KE.Style(colorButton_foreStyle, {
            color:currentColor
        });
    }

    editor.addPlugin(function() {
        new ColorSupport({
            editor:editor,
            styles:FORE_STYLES,
            title:"文本颜色",
            contentCls:"ke-toolbar-color",
            text:"color"
        });
    });
});
