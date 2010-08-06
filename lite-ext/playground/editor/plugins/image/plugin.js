/**
 * insert image for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-image", function(KE) {
    var S = KISSY,Node = S.Node;

    function ImageInserter(cfg) {
        ImageInserter.superclass.constructor.call(this, cfg);
        this._init();
    }

    var TripleButton = KE.TripleButton;

    ImageInserter.ATTRS = {
        editor:{}
    };

    S.extend(ImageInserter, S.Base, {
        _init:function() {
            var editor = this.get("editor"),toolBarDiv = editor.toolBarDiv;

            this.el = new TripleButton({
                text:"img",
                title:"ÕºœÒ",
                container:toolBarDiv
            });

            this.el.on("offClick", this._insert, this);
        },


        _insert:function() {
            var editor = this.get("editor");
            var url = window.prompt("«Î ‰»ÎÕº∆¨µÿ÷∑", "http://img02.taobaocdn.com/tps/i2/T1QXVsXnFjXXXXXXXX-167-63.png");
            if (!url) return;
            var img = new Node("<img src='" + url + "'/>", null, editor.document);
            editor.insertElement(img);
        }
    });

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new ImageInserter({
            editor:editor
        });

    });

});