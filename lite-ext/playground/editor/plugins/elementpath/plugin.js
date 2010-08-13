/**
 * element path shown in status bar,modified from ckeditor
 * @modifier:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-elementpaths", function(KE) {
    var S = KISSY,Node = S.Node,DOM = S.DOM;

    function ElementPaths(cfg) {
        this.cfg = cfg;
        this._init();
        this._cache = [];

    }

    S.augment(ElementPaths, {
        _init:function() {
            var cfg = this.cfg,
                editor = cfg.editor,
                textarea = editor.textarea[0];
            editor.statusDiv.css("display", "");
            editor.on("selectionChange", this._selectionChange, this);
        },
        _selectionChange:function(ev) {
            //console.log(ev);
            var cfg = this.cfg,editor = cfg.editor,statusDiv = editor.statusDiv,
                statusDom = statusDiv[0] || statusDiv;
            var elementPath = ev.path,
                elements = elementPath.elements,
                cache = this._cache;

            for (var i = 0; i < cache.length; i++) {
                cache[i].detach("click");
                cache[i].remove();
            }
            this._cache = [];
            // For each element into the elements path.
            for (var i = 0, element; i < elements.length; i++) {
                element = elements[i];

                var a = new Node("<a href='#' class='elementpath'>" +
                    //¿¼ÂÇ fake objects 
                    (element.attr("_ke_real_element_type") || element._4e_name())
                    + "</a>");
                this._cache.push(a);
                (function(element) {
                    a.on("click", function(ev2) {
                        ev2.halt();
                        editor.focus();
                        setTimeout(function() {
                            editor.getSelection().selectElement(element);
                        }, 50);
                    });
                })(element);
                if (statusDom.firstChild) {
                    DOM.insertBefore(a[0], statusDom.firstChild);
                }
                else {
                    statusDom.appendChild(a[0]);
                }
            }

        }
    });

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new ElementPaths({
            editor:editor
        });
    });


});