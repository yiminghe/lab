/**
 * modified from ckeditor,process malform html for kissyeditor
 * @modifier:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-htmldataprocessor", function(KE) {
    var S = KISSY,
        UA = S.UA,
        HtmlParser = KE.HtmlParser,htmlFilter = new HtmlParser.Filter();
    var defaultHtmlFilterRules = {
        elementNames : [
            // Remove script,iframe style,link,meta
            [ ( /^script$/ ), '' ],
            [ ( /^iframe$/ ), '' ],
            [ ( /^style$/ ), '' ],
            [ ( /^link$/ ), '' ],
            [ ( /^meta$/ ), '' ],
            // Ignore <?xml:namespace> tags.
            [ ( /^\?xml:namespace$/ ), '' ]
        ],
        elements : {
            embed : function(element) {
                var parent = element.parent;
                // If the <embed> is child of a <object>, copy the width
                // and height attributes from it.
                if (parent && parent.name == 'object') {
                    var parentWidth = parent.attributes.width,
                        parentHeight = parent.attributes.height;
                    parentWidth && ( element.attributes.width = parentWidth );
                    parentHeight && ( element.attributes.height = parentHeight );
                }
            },
            // Restore param elements into self-closing.
            param : function(param) {
                param.children = [];
                param.isEmpty = true;
                return param;
            },
            // Remove empty link but not empty anchor.(#3829)
            a : function(element) {
                if (!( element.children.length ||
                    element.attributes.name )) {
                    return false;
                }
            }
        },
        attributes :  {
        }
    };
    if (UA.ie) {
        var defaultHtmlFilterRules = {attributes:{}};
        // IE outputs style attribute in capital letters. We should convert
        // them back to lower case.
        defaultHtmlFilterRules.attributes.style = function(value, element) {
            return value.toLowerCase();
        };
    }
    htmlFilter.addRules(defaultHtmlFilterRules);

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