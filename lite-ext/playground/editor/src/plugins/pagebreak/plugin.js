KISSY.Editor.add("pagebreak", function(editor) {
    var S = KISSY,KE = S.Editor,
        dataProcessor = editor.htmlDataProcessor,
        dataFilter = dataProcessor && dataProcessor.dataFilter,
        CLS = "ke_pagebreak",
        TYPE = "div";
    if (dataFilter) {
        dataFilter.addRules({
            elements :
            {
                div : function(element) {
                    var attributes = element.attributes,
                        style = attributes && attributes.style,
                        child = style && element.children.length == 1 && element.children[ 0 ],
                        childStyle = child && ( child.name == 'span' ) && child.attributes.style;

                    if (childStyle && ( /page-break-after\s*:\s*always/i ).test(style) && ( /display\s*:\s*none/i ).test(childStyle))
                        return dataProcessor.createFakeParserElement(element, CLS, TYPE);
                }
            }
        });
    }

    if (!KE.PageBreak) {
        (function() {
            var Node = S.Node,
                TripleButton = KE.TripleButton,
                mark_up = '<div' +
                    ' style="page-break-after: always; ">' +
                    '<span style="DISPLAY:none">&nbsp;</span></div>';

            function PageBreak(editor) {
                var el = new TripleButton({
                    container:editor.toolBarDiv,
                    title:"分页",
                    contentCls:"ke-toolbar-pagebreak"
                });
                el.on("offClick", function() {
                    var real = new Node(mark_up, null, editor.document),
                        substitute = editor.createFakeElement ?
                            editor.createFakeElement(real,
                                CLS,
                                TYPE,
                                true,
                                mark_up) :
                            real,

                        insert = new Node("<div>", null, editor.document).append(substitute);
                    editor.insertElement(insert);
                });
                this.el = el;
                KE.Utils.sourceDisable(editor, this);
            }

            S.augment(PageBreak, {
                disable:function() {
                    this.el.set("state", TripleButton.DISABLED);
                },
                enable:function() {
                    this.el.set("state", TripleButton.OFF);
                }
            });

            KE.PageBreak = PageBreak;
        })();
    }

    editor.addPlugin(function() {
        new KE.PageBreak(editor);
    });
});