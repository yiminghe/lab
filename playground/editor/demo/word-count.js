//字数模块 by 龙啸
(function () {
  var S = KISSY;

  S.namespace('wordcount');

  //参数：textarea的ID，初始化编辑器源代码数，最大限制数，编辑器editor对象
  KISSY.wordcount.bind = function (textarea, max, editor) {
    //在当前text编辑器后面加入操作节点
    var size = 0;
    S.DOM.insertAfter(
      S.DOM.create(
        '<div class="J_WS">源码:已输入 <em class="J_WordSize">' +
          size +
          '</em>/最多输入 <em class="J_WsMax">' +
          max +
          '</em> <span class="J_WsTips"></span></div>',
      ),
      S.one(textarea).parent('.ke-editor-wrap'),
    );
    var wordsizenode = S.one(textarea)
      .parent('.ke-editor-wrap')
      .next('.J_WS')
      .children('.J_WordSize');
    var tips = '请减少源码数量，否则无法发布成功';
    S.DOM.css('.J_WordSize', { 'font-weight': 'bold', color: 'green' });
    S.DOM.css('.J_WsMax', 'font-weight', 'bold');
    S.DOM.css('.J_WS', { 'font-size': '13px', 'padding-left': '5px' });
    S.DOM.css('.J_WsTips', 'color', 'red');
    var _change = function (node, s) {
        if (s <= max) {
          node.text(s).css('color', 'green');
          node.siblings('.J_WsTips').text('');
        } else {
          node.text(s).css('color', 'red');
          node.siblings('.J_WsTips').text(tips);
        }
      },
      timer;
    //绑定save事件
    editor.ready(function () {
      _change(wordsizenode, editor.getData().length);
      editor.on('save restore', function (ev) {
        if (ev.buffer) {
          timer && clearTimeout(timer);
          timer = setTimeout(function () {
            _change(wordsizenode, editor.getData().length);
          }, 500);
        } else {
          _change(wordsizenode, editor.getData().length);
        }
      });
    });
  };
})();
