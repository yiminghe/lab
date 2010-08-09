/**
 * modified from ckeditor,process malform html for kissyeditor
 * @modifier:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-htmldataprocessor", function(KE) {
    var S = KISSY,
        UA = S.UA,
        HtmlParser = KE.HtmlParser,htmlFilter = new HtmlParser.Filter();
    if (UA.ie) {
        var defaultHtmlFilterRules = {attributes:{}};
        // IE outputs style attribute in capital letters. We should convert
        // them back to lower case.
        defaultHtmlFilterRules.attributes.style = function(value, element) {
            return value.toLowerCase();
        };
        htmlFilter.addRules(defaultHtmlFilterRules);

    }
    KE.HtmlDataProcessor = {
        toDataFormat : function(html, fixForBody) {
            fixForBody = fixForBody || "p";
            var writer = new HtmlParser.HtmlWriter(),
                fragment = HtmlParser.Fragment.fromHtml(html, fixForBody);

            writer.reset();

            fragment.writeHtml(writer, htmlFilter);

            return writer.getHtml(true);
        }
    };
});