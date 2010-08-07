/**
 * templates support for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-templates", function(KE) {
    var S = KISSY,
        Node = S.Node,
        Event = S.Event,
        KEN = KE.NODE,
        TripleButton = KE.TripleButton,
        Overlay = KE.SimpleOverlay,
        templates = [
            {
                demo:"模板1效果演示html"  ,
                html:"<div style='border:1px solid red'>模板1效果演示html</div>"
            },
            {
                demo:"模板2效果演示html",
                html  :"<div style='border:1px solid red'>模板2效果演示html</div>"
            }
        ],
        HTML = "<div class='ke-tpl'>";

    for (var i = 0; i < templates.length; i++) {
        var t = templates[i];
        HTML += "<a href='javascript:void(0)' class='ke-tpl-list' tabIndex='-1'>" + t.demo + "</a>";
    }
    HTML += "</div>";


    function TplUI(editor) {
        this.editor = editor;
        this._init();
    }

    S.augment(TplUI, {
        _init:function() {
            var self = this,editor = self.editor,el = new TripleButton({
                container:editor.toolBarDiv,
                text:"template",
                title:"模板"
            }),ui = new Overlay({mask:false,title:"内容模板"});
            ui.body.html(HTML);
            var list = ui.body.all(".ke-tpl-list");
            ui.on("hide",function(){
               editor.focus();
            });
            list.on("click", function(ev) {
                ev.halt();
                var t = new Node(ev.target);
                var index = t._4e_index();
                if (index != -1) {
                    editor.insertHtml(templates[index].html);
                }
                ui.hide();
            });

            self.ui = ui;
            el.on("click", function() {
                ui.show();
            });


        }
    });

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new TplUI(editor);

    });

});