//修改自 ： http://weblogs.asp.net/skillet/archive/2005/03/24/395838.aspx , Strifer
var TextRangeUtil = function() {
    var re = {};
    var nonIE = function(fieldId) {
        var field = document.getElementById(fieldId);
        var pos = {};
        pos.start = field.selectionStart;
        pos.end = field.selectionEnd;
        return pos;
    };
    var IE = function(fieldId) {
        var field = document.getElementById(fieldId);
        var pos = {};
        var range = document.selection.createRange();
        //parentElement : 获取给定文本范围的父元素。
        if (fieldId != range.parentElement().id) return
        // create a selection of the whole textarea
        var range_all = document.body.createTextRange();
        //moveToElementText	Moves the text range so that
        //the start and end positions of the range encompass the text in the given element.
        range_all.moveToElementText(field);
        // calculate selection start point by moving beginning of range_all to beginning of range
        //看这 ： http://msdn.microsoft.com/en-us/library/ms536373%28VS.85%29.aspx
        // Compare the start of the TextRange object with the start of the oRange parameter.
        //
        //   				StartToEnd
        //   				   Compare the start of the TextRange object with the end of the oRange parameter.
        //   				StartToStart
        //   				   Compare the start of the TextRange object with the start of the oRange parameter.
        //   				EndToStart
        //   				   Compare the end of the TextRange object with the start of the oRange parameter.
        //   				EndToEnd
        //   				   Compare the end of the TextRange object with the end of the oRange parameter.
        //
        //   				-1
        //   				   The end point of the object is further to the left than the end point of oRange.
        //   				0
        //   				   The end point of the object is at the same location as the end point of oRange.
        //   				1
        //   				   The end point of the object is further to the right than the end point of oRange.
        for (var sel_start = 0; range_all.compareEndPoints('StartToStart', range) < 0; sel_start++) {
            range_all.moveStart('character', 1);
        }
        // get number of line breaks from textarea start to selection start and add them to sel_start
        //不懂！
        for (var i = 0; i <= sel_start; i++) {
            if (field.value.charAt(i) == '\n')
            sel_start++;
        }
        pos.start = sel_start;
        // create a selection of the whole textarea
        var range_all = document.body.createTextRange();
        range_all.moveToElementText(field);
        // calculate selection end point by moving beginning of range_all to end of range
        for (var sel_end = 0; range_all.compareEndPoints('StartToEnd', range) < 0; sel_end++)
        range_all.moveStart('character', 1);
        // get number of line breaks from textarea start to selection end and add them to sel_end
        for (var i = 0; i <= sel_end; i++) {
            if (field.value.charAt(i) == '\n')
            sel_end++;
        }
        pos.end = sel_end;
        // get selected and surrounding text
        return pos;
    };
    re.getTextRange = function(fieldId) {
        var field = document.getElementById(fieldId);
        //non-ie
        //html5 draft : http://www.w3.org/TR/2009/WD-html5-20090423/editing.html
        if (typeof field.selectionStart === 'number') {
            re.getTextRange = nonIE;
        }
        //ie 复杂
        //看下 ： http://msdn.microsoft.com/en-us/library/ms535872%28VS.85%29.aspx
        else if (document.selection) {
            re.getTextRange = IE;
        }
        return re.getTextRange(fieldId);
    };

    return re;
} ();