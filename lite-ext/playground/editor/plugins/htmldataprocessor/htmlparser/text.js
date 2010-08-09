KISSYEDITOR.add("editor-htmlparser-text", function(KE) {
    var S = KISSY,
        KEN = KE.NODE,
        spacesRegex = /[\t\r\n ]{2,}|[\t\r\n]/g;

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
         * The node type. This is a constant value set to {@link KEN.NODE_TEXT}.
         * @type Number
         * @example
         */
        type : KEN.NODE_TEXT,

        /**
         * Writes the HTML representation of this text to a HtmlWriter.
         * @param {HtmlWriter} writer The writer to which write the HTML.
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