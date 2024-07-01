FP.add('sub-promotion', function (S) {
  var DOM = S.DOM;
  S.namespace('Subpromotion');
  S.Subpromotion.init = function () {
    //�����Ա����Ԥ����ɾ�������ݵ�ul

    var uls = S.all('#J_SubPromotion ul');
    var ta = [];
    var actIndex = parseInt(
      S.get('#J_SubPromotion').getAttribute('data-active-index'),
    );
    tryIndex = parseInt(
      S.get('#J_TinySlide .tiny-slide-content').getAttribute(
        'data-active-index',
      ),
    );
    uls.each(function (node) {
      var num = node.all('li').length;
      if (num == 0) {
        ta.push(node);
        //			}else{
        //				node.addClass('con-of-'+num);
      }
    });
    if (ta.length == 2) {
      S.one('#J_SubPromotion .txt-indicator').css('display', 'none');
      S.one('#J_SubPromotion .sp-prev').css('display', 'none');
      S.one('#J_SubPromotion .sp-next').css('display', 'none');
    }
    for (var i = 0; i < ta.length; i++) {
      ta[i].remove();
    }

    //�����Ա��
    var carousel_t = new S.Carousel('#J_SubPromotion', {
      effect: 'scrolly',
      easing: 'easeOutStrong',
      activeIndex: actIndex || 0,
      viewSize: [194],
      circular: false,
      prevBtnCls: 'sp-prev',
      nextBtnCls: 'sp-next',
      disableBtnCls: 'disable',
      interval: 6,
      aria: true,
      lazyDataType: 'img-src', //�ӳټ���ͼƬ��
    });

    var renderIndicator = function (index) {
      if (typeof index == 'undefined') {
        var index = actIndex || 0;
      }
      var all = S.one('#J_SubPromotion .ks-switchable-content').all(
          'li',
        ).length,
        uls = S.all('#J_SubPromotion ul').length,
        blocks = S.one('#J_SubPromotion .ks-switchable-content').all('ul'),
        prevs = 0,
        this_lis = 0;
      blocks.each(function (node, i) {
        //node.addClass('con-of-'+node.all('li').length);//���htmlд������������ȥ�����
        if (i < index) {
          prevs += node.all('li').length;
        } else {
          return;
        }
      });
      var rear = prevs + 1,
        top = S.Node(blocks[index]).all('li').length + prevs,
        str = '<em>' + rear + '-' + top + '</em>/' + all;
      S.one('#J_SubPromotion .txt-indicator').html(str);
    };
    renderIndicator();
    carousel_t.on('beforeSwitch', function (e) {
      renderIndicator(e.toIndex);
    });

    //�Ҳ������tab�л�
    var recom = new S.Tabs('#J_recom', {
      aria: true,
      activeIndex:
        parseInt(S.get('#J_recom').getAttribute('data-active-index')) || 0,
    });

    var recomHd = S.get('#J_recom .hd');
    DOM.query('li', recomHd).each(function (n) {
      n.hideFocus = true;
      n.style.outline = 'none';
    });

    //�Ҳ������������ɱ����ʱ
    if (S.get('#J_SecKillClock')) {
      var seckill = S.get('#J_SecKillClock'),
        lagTime = Math.floor(
          (+new Date() - S.DOM.attr(seckill, 'data-lag')) / 1000,
        ),
        secKillTime = S.DOM.attr(seckill, 'data-time') - lagTime,
        h = Math.floor(secKillTime / 3600),
        m = Math.floor((secKillTime % 3600) / 60),
        s = secKillTime - h * 3600 - m * 60;

      S.one(seckill).html(h + 'Сʱ' + m + '��' + s + '��');
      S.later(
        function () {
          if (s > 0) {
            s--;
          } else if (m > 0) {
            m--;
            s = 59;
          } else if (h > 0) {
            h--;
            m = 59;
            s = 59;
          } else if (S.DOM.attr(seckill, 'data-mk') == 17) {
            h = 17;
            m = 59;
            s = 59;
          } else {
            h = 5;
            m = 59;
            s = 59;
          }
          S.one(seckill).html(h + 'Сʱ' + m + '��' + s + '��');
        },
        1000,
        true,
      );
    }

    //�Ҳ������slide�л�
    var tiny_slide = new S.Carousel('#J_TinySlide', {
      activeIndex: tryIndex || 0,
      effect: 'scrollx',
      easing: 'easeOutStrong',
      viewSize: [274],
      circular: true,
      prevBtnCls: 'tiny-prev',
      nextBtnCls: 'tiny-next',
      interval: 6,
      aria: true,
      lazyDataType: 'img-src', //�ӳټ���ͼƬ��
    });

    var initTinyIndicator = function (index) {
      if (typeof index == 'undefined') {
        var index = tryIndex || 0;
      }
      index += 1;
      var all = S.one('#J_TinySlide .ks-switchable-content').all('li').length,
        str = '<em>' + index + '</em>/' + all;
      S.one('#J_TinySlide .txt-indicator').html(str);
    };

    initTinyIndicator();
    tiny_slide.on('beforeSwitch', function (e) {
      initTinyIndicator(e.toIndex);
    });
  };
});
