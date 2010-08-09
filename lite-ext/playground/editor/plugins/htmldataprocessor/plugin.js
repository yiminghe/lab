/**
 * modified from ckeditor,process malform html for kissyeditor
 * @modifier:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-htmldataprocessor", function(KE) {
    var S = KISSY,HtmlParser = KE.HtmlParser;

    KE.HtmlDataProcessor = {
        toDataFormat : function(html, fixForBody) {
            fixForBody = fixForBody || "p";
            var htmlFilter = new HtmlParser.Filter(),
                writer = new HtmlParser.HtmlWriter(),
                fragment = HtmlParser.Fragment.fromHtml(html, fixForBody);

            writer.reset();

            fragment.writeHtml(writer, htmlFilter);

            return writer.getHtml(true);
        }
    };
});