/**
 * Just For Fun ,no copy no copy 
 * @author:yiminghe@gmail.com
 * @声明：我支持开放
 */
KISSY.ready(function(S) {
    var t = "textarea",
        m = "禁止copy!",
        Event = S.Event,
        doc = document,
        body = doc.body,
        DOM = S.DOM,
        Node = S.Node,
        clip = new Node(body.appendChild(DOM.create('<' + t + ' rows="1" cols="1" style="position:absolute;left:-9999px;">' + m + '</' + t + '>')))

    Event.on(document, "contextmenu", function(ev) {
        ev.halt();
    });
    Event.on(document, "keydown", function(ev) {
        var keyCode = ev.keyCode;

        //mac and win
        //捕获复制快捷键
        if (keyCode === 67 && (ev.ctrlKey || ev.metaKey)) {
            //没有警告信息这个就够了
            //ev.halt();
            //return;

            //保存原来的选择区域
            var s = new S.Selection(doc),r = s.getRanges()[0];
            //警告
            // clip.html("禁止copy！");
            clip[0].focus();
            clip[0].select();
            //异步
            setTimeout(function() {
                r.select();
            }, 0);
        }
    });
    body.appendChild(document.createTextNode("我是内容，你可以copy我看看！"));
});