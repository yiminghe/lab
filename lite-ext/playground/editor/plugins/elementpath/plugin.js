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
            var self = this,cfg = self.cfg,
                editor = cfg.editor,
                textarea = editor.textarea[0];
            self.holder = new Node("<div>");
            self.holder.appendTo(editor.statusDiv);
            editor.on("selectionChange", self._selectionChange, self);
        },
        _selectionChange:function(ev) {
            //console.log(ev);
            var self = this,cfg = self.cfg,editor = cfg.editor,holder = self.holder,
                statusDom = holder[0] || holder;
            var elementPath = ev.path,
                elements = elementPath.elements,
                cache = self._cache;

            for (var i = 0; i < cache.length; i++) {
                cache[i].detach("click");
                cache[i].remove();
            }
            self._cache = [];
            // For each element into the elements path.
            for (var i = 0, element; i < elements.length; i++) {
                element = elements[i];

                var a = new Node("<a href='#' class='elementpath'>" +
                    //¿¼ÂÇ fake objects 
                    (element.attr("_ke_real_element_type") || element._4e_name())
                    + "</a>");
                self._cache.push(a);
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