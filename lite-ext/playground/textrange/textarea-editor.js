(function() {
    var OLD_IE = !window.getSelection,IE = window.ActiveXObject;

    /**
     * author:yiminghe@gmail.com
     * @refer:http://yiminghe.javaeye.com/blog/508999
     * @param textarea
     */
    function TextareaEditor(textarea) {
        this.textarea = textarea;
        if (IE) {
            var savedRange;
            textarea.onmousedown
                = textarea.onmouseup
                = textarea.onkeydown
                = textarea.onkeyup = function() {
                savedRange = document.selection.createRange();
            }
            textarea.onfocusin = function() {
                savedRange && savedRange.select();
            }
        }

    }

    TextareaEditor.prototype = {
        constructor:TextareaEditor,
        getSelection:OLD_IE ? function() {
            var textarea = this.textarea;
            textarea.focus();
            var pos = {},
                i,
                range = document.selection.createRange();
            //parentElement : 获取给定文本范围的父元素。
            if (textarea != range.parentElement()) return;
            // create a selection of the whole textarea
            var range_all = document.body.createTextRange();
            //moveToElementText	Moves the text range so that
            //the start and end positions of the range encompass the text in the given element.
            range_all.moveToElementText(textarea);
            // calculate selection start point by moving beginning of range_all to beginning of range
            //看这 ： http://msdn.microsoft.com/en-us/library/ms536373%28VS.85%29.aspx
            // Compare the start of the TextRange object with the start of the oRange parameter.
            //
            //StartToEnd
            //   Compare the start of the TextRange object with the end of the oRange parameter.
            //StartToStart
            //   Compare the start of the TextRange object with the start of the oRange parameter.
            //EndToStart
            //   Compare the end of the TextRange object with the start of the oRange parameter.
            //EndToEnd
            //   Compare the end of the TextRange object with the end of the oRange parameter.
            //
            //-1
            //   The end point of the object is further to the left than the end point of oRange.
            //0
            //   The end point of the object is at the same location as the end point of oRange.
            //1
            //   The end point of the object is further to the right than the end point of oRange.
            for (var sel_start = 0;
                 range_all.compareEndPoints('StartToStart', range) < 0;
                 sel_start++) {
                range_all.moveStart('character', 1);
            }
            // get number of line breaks from textarea start to selection start and add them to sel_start
            for (i = 0;
                 i <= sel_start;
                 i++) {
                if (textarea.value.charAt(i) == '\n')
                    sel_start++;
            }
            pos.selectionStart = sel_start;
            // create a selection of the whole textarea
            range_all = document.body.createTextRange();
            range_all.moveToElementText(textarea);
            // calculate selection end point by moving beginning of range_all to end of range
            for (var sel_end = 0;
                 range_all.compareEndPoints('StartToEnd', range) < 0;
                 sel_end++)
                range_all.moveStart('character', 1);
            // get number of line breaks from textarea start to selection end and add them to sel_end
            for (i = 0;
                 i <= sel_end;
                 i++) {
                if (textarea.value.charAt(i) == '\n')
                    sel_end++;
            }
            pos.selectionEnd = sel_end;
            // get selected and surrounding text
            return pos;
        } : function() {
            var textarea = this.textarea;
            return {
                selectionStart:textarea.selectionStart,
                selectionEnd:textarea.selectionEnd
            };
        },
        setSelectionRange:OLD_IE ? function(start, end) {
            var range = this.textarea.createTextRange();
            range.collapse(true);
            range.moveEnd("character", end);
            range.moveStart("character", start);
            range.select();
        } : function(start, end) {
            this.textarea.setSelectionRange(start, end);
        },
        insertData:OLD_IE ? function(text) {
            var textarea = this.textarea;
            textarea.focus();
            var range = document.selection.createRange();
            range.text = text;
        } : function(text) {
            var textarea = this.textarea,
                value = textarea.value;
            textarea.focus();
            var range = this.getSelection();
            var start = value.substring(0, range.selectionStart);
            var end = value.substring(range.selectionEnd, value.length);
            var sl = textarea.scrollLeft,st = textarea.scrollTop;
            textarea.value = start + text + end;
            textarea.scrollLeft = sl;
            textarea.scrollTop = st;
            var np = start.length + text.length;
            this.setSelectionRange(np, np);
        }

    };
    window.TextareaEditor = TextareaEditor;
})();