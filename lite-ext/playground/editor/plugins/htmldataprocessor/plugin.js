/**
 * modified from ckeditor,process malform html for kissyeditor
 * @modifier:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-htmldataprocessor", function(KE) {
    var S = KISSY,
        UA = S.UA,
        HtmlParser = KE.HtmlParser,
        htmlFilter = new HtmlParser.Filter(),
        dataFilter = new HtmlParser.Filter();
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
            //防止word的垃圾class，全部杀掉算了，除了以ke_开头的编辑器内置class
            'class' : function(value
                // , element
                ) {
                if (/ke_/.test(value)) return value;
                return false;
            }
        }
    };
    if (UA.ie) {
        // IE outputs style attribute in capital letters. We should convert
        // them back to lower case.
        defaultHtmlFilterRules.attributes.style = function(value
            // , element
            ) {
            return value.toLowerCase();
        };
    }

    htmlFilter.addRules(defaultHtmlFilterRules);
    dataFilter.addRules(defaultHtmlFilterRules);

    KE.HtmlDataProcessor = {
        htmlFilter:htmlFilter,
        dataFilter:dataFilter,
        //编辑器html到外部html
        toHtml:function(html, fixForBody) {
            //fixForBody = fixForBody || "p";
            // Now use our parser to make further fixes to the structure, as
            // well as apply the filter.
            var writer = new HtmlParser.HtmlWriter(),
                fragment = HtmlParser.Fragment.fromHtml(html, fixForBody);
            fragment.writeHtml(writer, htmlFilter);
            return writer.getHtml(true);
        },
        //外部html进入编辑器
        toDataFormat : function(html, fixForBody) {
            //fixForBody = fixForBody || "p";
            var writer = new HtmlParser.HtmlWriter(),
                fragment = HtmlParser.Fragment.fromHtml(html, fixForBody);
            writer.reset();
            fragment.writeHtml(writer, dataFilter);
            return writer.getHtml(true);
        }
    };
});