/**
 * insert music for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-music", function(KE) {
    var S = KISSY,
        Node = S.Node,
        DOM = S.DOM,
        Event = S.Event,
        // MUSIC_PLAYER = "niftyplayer.swf",
        //CLS_FLASH = 'ke_flash',
        CLS_MUSIC = 'ke_music',
        // TYPE_FLASH = 'flash',
        TYPE_MUSIC = 'music',
        Overlay = KE.SimpleOverlay,
        TripleButton = KE.TripleButton,
        html = "<div class='ke-popup-wrap' " +
            "style='width:250px;padding:10px;'>" +
            "<p style='margin:0 0 10px'>" +
            "<label>请输入音乐地址：<br/>" +
            "<input value='http://' style='width: 250px;' class='ke-music-url'/>" +
            "</label></p>" +
            "<p>" +
            "<button class='ke-music-insert'>插入</button>&nbsp;" +
            "<a href='#' class='ke-music-cancel'>取消</a>" +
            "</p>" +
            "</div>",
        MUSIC_MARKUP = '<object ' +
            ' width="165" height="37"' +
            ' codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0"' +
            ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' +
            '<param value="' + KE.BASE_URL
            + '../plugins/music/niftyplayer.swf?file=#(music)&amp;as=0"' +
            ' name="movie">' +
            '<param value="high" name="quality">' +
            '<param value="#FFFFFF" name="bgcolor">' +
            '<embed width="165" height="37" ' +
            'type="application/x-shockwave-flash" ' +
            'swliveconnect="true" ' +
            'src="' + KE.BASE_URL
            + '../plugins/music/niftyplayer.swf?file=#(music)&amp;as=0" ' +
            'quality="high" ' +
            'pluginspage="http://www.macromedia.com/go/getflashplayer"' +
            ' bgcolor="#FFFFFF">' +
            '</object>',
        music_reg = /#\(music\)/g;

    function MusicInserter(cfg) {
        MusicInserter.superclass.constructor.call(this, cfg);
        this._init();
    }

    MusicInserter.ATTRS = {
        editor:{}
    };

    S.extend(MusicInserter, S.Base, {
        _init:function() {
            var editor = this.get("editor"),toolBarDiv = editor.toolBarDiv;

            this.el = new TripleButton({
                //text:"music",
                contentCls:"ke-toolbar-music",
                title:"分享音乐",
                container:toolBarDiv
            });

            this.el.on("offClick", this.show, this);
            KE.Utils.lazyRun(this, "_prepare", "_real");
        },
        _prepare:function() {
            var self = this,editor = this.get("editor");
            this.content = new Node(html);
            this.d = new Overlay({
                el:this.content
            });
            document.body.appendChild(this.content[0]);
            var cancel = this.content.one(".ke-music-cancel"),ok = this.content.one(".ke-music-insert");
            this.musicUrl = this.content.one(".ke-music-url");
            cancel.on("click", function(ev) {
                this.d.hide();
                ev.halt();
            }, this);
            Event.on(document, "click", this.hide, this);
            Event.on(editor.document, "click", this.hide, this);
            ok.on("click", function() {
                self._insert();
            });
        },
        hide:function(ev) {
            var self = this;
            if (DOM._4e_ascendant(ev.target, function(node) {
                return node[0] === self.content[0] || node[0] === self.el.el[0];
            }))return;
            this.d.hide();
        },
        _real:function() {
            var xy = this.el.el.offset();
            xy.top += this.el.el.height() + 5;
            if (xy.left + this.content.width() > DOM.viewportWidth()-60) {
                xy.left = DOM.viewportWidth() - this.content.width()-60;
            }
            this.d.show(xy);
        },
        _insert:function() {
            var editor = this.get("editor");
            var url = this.musicUrl.val();
            if (!url) return;
            var music = new Node(MUSIC_MARKUP.replace(music_reg, url));
            var substitute = editor.createFakeElement(music, CLS_MUSIC, TYPE_MUSIC, true);
            editor.insertElement(substitute);
            this.d.hide();
        },
        show:function() {
            this._prepare();
        }
    });

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new MusicInserter({
            editor:editor
        });
    });

});