/**
 * monitor user's paste key ,clear user input,modified from ckeditor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-clipboard", function(KE) {
    var S = KISSY,
        Node = S.Node,
        UA = S.UA,
        KERange = KE.Range,
        KER = KE.RANGE,
        Event = S.Event;

    function Paste(editor) {
        this.editor = editor;
        this._init();
    }

    S.augment(Paste, {
        _init:function() {
            var self = this,editor = self.editor;
            if (UA.ie)
                Event.on(editor.document, "keydown", self._paste, self);
            else  Event.on(editor.document, "paste", self._paste, self);
        },
        _paste:function(ev) {
            if (ev.type === 'keydown' &&
                !(ev.keyCode === 86 && (ev.ctrlKey || ev.metaKey))) {
                return;
            }

            var self = this,editor = self.editor,doc = editor.document;
            var sel = editor.getSelection(),
                range = new KERange(doc);

            // Create container to paste into
            var pastebin = new Node(UA.webkit ? '<body></body>' : '<div></div>', null, doc);
            // Safari requires a filler node inside the div to have the content pasted into it. (#4882)
            UA.webkit && pastebin[0].appendChild(doc.createTextNode('\xa0'));
            doc.body.appendChild(pastebin[0]);

            pastebin.css({
                position : 'absolute',
                // Position the bin exactly at the position of the selected element
                // to avoid any subsequent document scroll.
                top : sel.getStartElement().offset().top + 'px',
                width : '1px',
                height : '1px',
                overflow : 'hidden'
            });

            // It's definitely a better user experience if we make the paste-bin pretty unnoticed
            // by pulling it off the screen.
            pastebin.css('left', '-1000px');

            var bms = sel.createBookmarks();

            // Turn off design mode temporarily before give focus to the paste bin.

            range.setStartAt(pastebin, KER.POSITION_AFTER_START);
            range.setEndAt(pastebin, KER.POSITION_BEFORE_END);
            range.select(true);

            // Wait a while and grab the pasted contents
            setTimeout(function() {
                pastebin.remove();

                // Grab the HTML contents.
                // We need to look for a apple style wrapper on webkit it also adds
                // a div wrapper if you copy/paste the body of the editor.
                // Remove hidden div and restore selection.
                var bogusSpan;

                pastebin = ( UA.webkit
                    && ( bogusSpan = pastebin._4e_first() )
                    && ( bogusSpan[0] && bogusSpan.hasClass('Apple-style-span') ) ?
                    bogusSpan : pastebin );
                sel.selectBookmarks(bms);
                editor.insertHtml(pastebin.html());
            }, 0);
        }
    });

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new Paste(editor);
    });
});