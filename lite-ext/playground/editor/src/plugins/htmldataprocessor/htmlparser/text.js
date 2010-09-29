KISSY.Editor.add("htmlparser-text", function(
    //editor
    ) {
    var KE = KISSY.Editor,
        S = KISSY,
        KEN = KE.NODE;
    if (KE.HtmlParser.Text) return;
    /**
     * A lightweight representation of HTML text.
     * @constructor
     * @example
     */

    function Text(value) {
        /**
         * The text value.
         * @type String
         * @example
         */
        this.value = value;

        /** @private */
        this._ = {
            isBlockLike : false
        };
    }

    S.augment(Text, {
        /**
         * The node type. This is a constant value set to { KEN.NODE_TEXT}.
         * @type Number
         * @example
         */
        type : KEN.NODE_TEXT,

        /**
         * Writes the HTML representation of this text to a HtmlWriter.
         *  {HtmlWriter} writer The writer to which write the HTML.
         * @example
         */
        writeHtml : function(writer, filter) {
            var text = this.value;

            if (filter && !( text = filter.onText(text, this) ))
                return;

            writer.text(text);
        }
    });

    KE.HtmlParser.Text = Text;
});
