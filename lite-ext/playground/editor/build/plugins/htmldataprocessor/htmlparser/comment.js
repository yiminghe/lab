KISSY.Editor.add("htmlparser-comment", function(editor) {
    var KE = KISSY.Editor,KEN = KE.NODE;
    if (KE.HtmlParser.Comment) return;

    function Comment(value) {
        /**
         * The comment text.
         * @type String
         * @example
         */
        this.value = value;

        /** @private */
        this._ =
        {
            isBlockLike : false
        };
    }

    KE.HtmlParser.Comment = Comment;

    Comment.prototype = {
        constructor:Comment,
        /**
         * The node type. This is a constant value set to  NODE_COMMENT.
         * @type Number
         * @example
         */
        type : KEN.NODE_COMMENT,

        /**
         * Writes the HTML representation of this comment to a CKEDITOR.htmlWriter.
         * @param  writer The writer to which write the HTML.
         * @example
         */
        writeHtml : function(writer, filter) {
            var comment = this.value;

            if (filter) {
                if (!( comment = filter.onComment(comment, this) ))
                    return;

                if (typeof comment != 'string') {
                    comment.parent = this.parent;
                    comment.writeHtml(writer, filter);
                    return;
                }
            }

            writer.comment(comment);
        }
    };
});
