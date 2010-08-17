/**
 * remove inline-style format for kissy editor,modified from ckeditor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-removeformat", function(KE) {
    var S = KISSY,
        KER = KE.RANGE,
        ElementPath = KE.ElementPath,
        KEN = KE.NODE,
        TripleButton = KE.TripleButton,
        /**
         * A comma separated list of elements to be removed when executing the "remove
         " format" command. Note that only inline elements are allowed.
         * @type String
         * @default 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var'
         * @example
         */
        removeFormatTags = 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var';

    /**
     * A comma separated list of elements attributes to be removed when executing
     * the "remove format" command.
     * @type String
     * @default 'class,style,lang,width,height,align,hspace,valign'
     * @example
     */
    removeFormatAttributes = 'class,style,lang,width,height,align,hspace,valign'.split(',');

    removeFormatTags = new RegExp('^(?:' + removeFormatTags.replace(/,/g, '|') + ')$', 'i');

    function RemoveFormat(editor) {
        this.editor = editor;
        this._init();
    }

    S.augment(RemoveFormat, {
        _init:function() {
            var self = this,editor = self.editor;
            self.el = new TripleButton({
                title:"Çå³ý¸ñÊ½",
                contentCls:"ke-toolbar-removeformat",
                container:editor.toolBarDiv
            });
            self.el.on("offClick", self._remove, self);
        },
        _remove:function() {
            var self = this,
                editor = self.editor,
                tagsRegex = removeFormatTags,
                removeAttributes = removeFormatAttributes;

            tagsRegex.lastIndex = 0;
            editor.focus();
            var ranges = editor.getSelection().getRanges();
            editor.fire("save");
            for (var i = 0, range; range = ranges[ i ]; i++) {
                if (range.collapsed)
                    continue;

                range.enlarge(KER.ENLARGE_ELEMENT);

                // Bookmark the range so we can re-select it after processing.
                var bookmark = range.createBookmark();

                // The style will be applied within the bookmark boundaries.
                var startNode = bookmark.startNode;
                var endNode = bookmark.endNode;

                // We need to check the selection boundaries (bookmark spans) to break
                // the code in a way that we can properly remove partially selected nodes.
                // For example, removing a <b> style from
                //		<b>This is [some text</b> to show <b>the] problem</b>
                // ... where [ and ] represent the selection, must result:
                //		<b>This is </b>[some text to show the]<b> problem</b>
                // The strategy is simple, we just break the partial nodes before the
                // removal logic, having something that could be represented this way:
                //		<b>This is </b>[<b>some text</b> to show <b>the</b>]<b> problem</b>

                var breakParent = function(node) {
                    // Let's start checking the start boundary.
                    var path = new ElementPath(node);
                    var pathElements = path.elements;

                    for (var i = 1, pathElement; pathElement = pathElements[ i ]; i++) {
                        if (pathElement._4e_equals(path.block) || pathElement._4e_equals(path.blockLimit))
                            break;

                        // If this element can be removed (even partially).
                        if (tagsRegex.test(pathElement.getName()))
                            node.breakParent(pathElement);
                    }
                };

                breakParent(startNode);
                breakParent(endNode);

                // Navigate through all nodes between the bookmarks.
                var currentNode = startNode._4e_nextSourceNode(true, KEN.NODE_ELEMENT);

                while (currentNode) {
                    // If we have reached the end of the selection, stop looping.
                    if (currentNode._4e_equals(endNode))
                        break;

                    // Cache the next node to be processed. Do it now, because
                    // currentNode may be removed.
                    var nextNode = currentNode._4e_nextSourceNode(false, KEN.NODE_ELEMENT);

                    // This node must not be a fake element.
                    if (!( currentNode._4e_name() == 'img'
                        && currentNode.attr('_cke_realelement') )
                        ) {
                        // Remove elements nodes that match with this style rules.
                        if (tagsRegex.test(currentNode._4e_name()))
                            currentNode._4e_remove(true);
                        else {
                            removeAttrs(currentNode, removeAttributes);
                        }
                    }

                    currentNode = nextNode;
                }

                range.moveToBookmark(bookmark);
            }

            editor.getSelection().selectRanges(ranges);
            editor.fire("save");
        }

    });
    function removeAttrs(el, attrs) {
        for (var i = 0; i < attrs.length; i++)
            el.removeAttr(attrs[i]);
    }

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new RemoveFormat(editor);
    });

});