/**
 * mini ���ﳵ�߼�
 * @creater qiaohua
 * @depends ks-core, TB.Global
 */
(function (undefined) {
  var S = KISSY,
    win = window,
    doc = document,
    isIE76 = !'0'[0],
    isIE6 = isIE76 && !window.XMLHttpRequest,
    domain = doc.domain,
    IS_DAILY = !(
      domain.indexOf('taobao.com') > -1 || domain.indexOf('tmall.com') > -1
    ),
    HOSTNAME = IS_DAILY ? '.daily.taobao.net' : '.taobao.com',
    BUY_HOST = 'http://buy' + HOSTNAME + '/',
    CARTDATA_API = BUY_HOST + 'auction/cart/trail_mini_cart.htm?',
    REMOVE_API = BUY_HOST + 'auction/cart/del_mini_cart.htm?',
    REMOVEING = '����ɾ����',
    REMOVE = 'ɾ��',
    MINI_CLS = 'mini-cart-',
    HD_CLS = MINI_CLS + 'hd',
    BD_CLS = MINI_CLS + 'bd',
    IMG_CLS = MINI_CLS + 'img',
    COUNT_CLS = MINI_CLS + 'count',
    DEL_CLS = MINI_CLS + 'del',
    TITLE_CLS = MINI_CLS + 'title',
    INFO_CLS = MINI_CLS + 'info',
    FT_CLS = MINI_CLS + 'ft',
    PRICE_CLS = MINI_CLS + 'price',
    BT_CLS = MINI_CLS + 'bt',
    CONTENT_CLS = MINI_CLS + 'content',
    LOADING_CLS = MINI_CLS + 'loading',
    READY_CLS = MINI_CLS + 'ready',
    HOVER_CLS = 'hover',
    MINI_CART_ID = 'data-cartId',
    DOT = '.',
    EMPTY = '',
    escapeHTML = function (str) {
      /**
       * escape
       * ʵ���ַ����⴦��
       */
      // @see http://www.strictly-software.com//scripts/downloads/encoder.js
      var arr = str.match(/&#[0-9]{1,5};/g);

      if (arr != null) {
        var m, c, x;
        for (x = 0; x < arr.length; x++) {
          m = arr[x];
          c = m.substring(2, m.length - 1);
          if (c >= -32768 && c <= 65535) {
            str = str.replace(m, String.fromCharCode(c));
          } else {
            str = str.replace(m, '');
          }
        }
      }

      return str.replace('<', '&lt;').replace('>', '&gt;');
      /*var div = doc.createElement('div'),
                text = doc.createTextNode(str);
            div.appendChild(text);

            return div.innerHTML;*/
    },
    ellipsis = function (el) {
      el.css({ 'white-space': 'nowrap', overflow: 'hidden' });
      // if browser support 'text-overflow' property, just use it
      if (
        'textOverflow' in doc.documentElement.style ||
        'OTextOverflow' in doc.documentElement.style
      ) {
        el.css({
          'text-overflow': 'ellipsis',
          '-o-text-overflow': 'ellipsis',
        });
      } else {
        //firefox does not support the text-overflow property, so...
        var obj = el;
        if (!obj.data('text')) obj.data('text', obj.text());
        var text = obj.attr('text') || obj.text(),
          w = obj.width(),
          a = 0,
          b = text.length,
          c = b,
          t = new S.Node(obj[0].cloneNode(true)).insertAfter(obj);
        obj.text(text);
        t.text(text).css({
          position: 'absolute',
          width: 'auto',
          visibility: 'hidden',
          overflow: 'hidden',
        });
        if (t.width() > w) {
          while ((c = Math.floor((b + a) / 2)) > a) {
            t.text(text.substr(0, c) + '��');
            if (t.width() > w) b = c;
            else a = c;
          }
          obj.text(text.substr(0, c) + '��');
          if (!obj.attr('title')) obj.attr('title', text);
        }
        t.remove();
      }
    },
    send = function (url) {
      if (IS_DAILY) return;

      new Image().src =
        'http://www.atpanel.com/jsclick?minicart=' + url + '&cache=' + S.now();
    },
    EMPTY_MSG = '�����ﳵ�ﻹû���κα�����',
    TIMEOVER_MSG = 'ϵͳĿǰ��æ�����Ժ����ԡ�',
    INVALID_MSG = '�����ﳵ��ı�������ʧЧ��',
    isHTTPS = doc.location.href.indexOf('https://') === 0;

  win.MiniCart = {
    /**
     * ��ʼ�� Mini���ﳵ����
     * @creater
     * @param num {Number}
     */
    init: function (num, show) {
      var self = this;

      // ���ﳵ����Ϊ���� ����ʾ
      num = parseInt(num);
      if (isNaN(num) || num < 0) return;

      // ���ﳵ����
      self.cartNum = num;
      self._rendUI();

      // ����ʾ����
      if (!show) return;
      self._bindUI();
      // �Ƿ����, �������� 10s �ڲ������
      //self.isExpired = true;
      // �Ƿ�����������
      self._loading = false;
      // �Ƿ����� trigger
      //self._clicked = false;
      // �Ƿ��������˸���
      //self._entered = false;
    },
    _rendUI: function () {
      var self = this;

      // �������ﳵ����
      self.trigger = S.one('#site-nav .cart');
      // �������ﳵa
      self.elem = new S.Node(self.trigger.children()[0]);
      // ����������
      self.content = new S.Node('<div>')
        .addClass(CONTENT_CLS)
        .appendTo(doc.body);

      if (isIE6 && !isHTTPS) {
        self._shim = new S.Node(
          '<' +
            "iframe style='position: absolute; width:0; height: 0;" +
            'filter:alpha(opacity=0);' +
            "z-index:9998;'>",
        ).appendTo(doc.body);
      }
    },

    _bindUI: function () {
      var self = this,
        trigger = self.trigger,
        content = self.content,
        showTimer,
        hideTimer;

      function clearTimer(timer) {
        if (timer) {
          timer.cancel();
        }
        return undefined;
      }
      function setHideTimer() {
        hideTimer = S.later(function () {
          self.hide();
        }, 320);
      }

      // �������/�Ƴ� �������ﳵʱ
      trigger
        .on('mouseenter', function (ev) {
          if (TB.Global._OFF) return;

          self._entered = true;
          // fix ������뵽����/������ťʱ, �ظ����� enter �¼�
          var target = new S.Node(ev.target)[0].tagName.toLowerCase();
          if (target === 'b' || target === 'i') {
            ev.halt();
            return;
          }

          hideTimer = clearTimer(hideTimer);
          showTimer = S.later(function () {
            if (content.css('display') === 'none' && !self._clicked) {
              send('http://www.atpanel.com/jsclick?cache=*&minicart=popup');
              self.show();
            }
            showTimer = undefined;
          }, 100);
        })
        .on('mouseleave', function () {
          if (TB.Global._OFF) return;

          self._entered = false;
          showTimer = clearTimer(showTimer);
          setHideTimer();
        })
        .on('click', function () {
          if (TB.Global._OFF) return;
          self._clicked = true;
          send('topclick');
        });

      content
        .on('mouseenter', function () {
          if (TB.Global._OFF) return;

          self._entered = true;
          hideTimer = clearTimer(hideTimer);
        })
        .on('mouseleave', function () {
          if (TB.Global._OFF) return;

          self._entered = false;
          setHideTimer();
        })
        .on('click', function (e) {
          if (TB.Global._OFF) return;

          var target = new S.Node(e.target),
            prt;

          if (target[0].tagName.toLowerCase() === 'a') {
            prt = target.parent();

            // ���ɾ���¼�
            if (prt.hasClass(DEL_CLS)) {
              e.preventDefault();
              e.halt();

              if (target.html() === REMOVEING) return;

              send('delete');
              target.html(REMOVEING);
              S.getScript(
                REMOVE_API +
                  'callback=MiniCart.remove' +
                  '&del_id=' +
                  prt.parent().attr(MINI_CART_ID) +
                  '&t=' +
                  S.now(),
                function () {
                  target.html(REMOVE);
                  this.parentNode.removeChild(this);
                },
              );
            }
            // ��� �鿴�ҵĹ��ﳵ��ť
            else if (prt.hasClass(BT_CLS)) {
              send('showmycart');
            }
          }
        });
    },
    _hideContent: function () {
      var self = this;
      self._entered = false;
      S.later(function () {
        if (!self._entered) {
          self.hide();
        }
      }, 2000);
    },
    remove: function (data) {
      var self = this;

      if (!data) return;

      // ɾ���ɹ�
      if (data.status) {
        var content = self.content,
          allItems = content.one(DOT + BD_CLS);

        // �����ر�ɾ������Ŀ, �ٸ�������
        S.each(allItems.children(), function (current) {
          current = new S.Node(current);
          if (current.attr(MINI_CART_ID) == data.delCart) {
            var _update = function () {
              current.remove
                ? current.remove()
                : current[0].parentNode.removeChild(current[0]);
              self.setData(data);

              // ʣ��ʱ, fix ����ֱ�����ظ��� bug
              if (self.cartNum === 0) self._hideContent();
            };
            if (!isIE6)
              current.animate
                ? current.animate('opacity: 0', 1, 'easeOut', _update)
                : _update();
            else _update();
            return false;
          }
        });
      } else {
        alert(data.errMsg);
      }
    },
    show: function () {
      var self = this,
        content = self.content,
        elem = self.elem,
        _setData = function (msg) {
          self.setData({
            status: false,
            errMsg: msg,
          });
          S.log(msg);
        };

      content
        .addClass(LOADING_CLS)
        .offset({ left: self.trigger.offset().left + 0.5 });
      elem.addClass(HOVER_CLS);

      // û������� ���� 10s ��û�������
      if ((!self._data || self.isExpired) && !self._loading) {
        content.html(EMPTY);

        if (self.cartNum < 1) {
          _setData(EMPTY_MSG);
          return;
        }
        self._loading = true;
        self._setTimeout(function () {
          _setData(TIMEOVER_MSG);
        });

        S.later(function () {
          if (self._clicked) return;

          S.getScript(
            CARTDATA_API + 'callback=MiniCart.setData' + '&t=' + S.now(),
            function () {
              self._loading = false;

              this.parentNode.removeChild(this);
            },
          );
        }, 300);
      } else {
        // û�й���ʱ, ֱ����ʾ֮ǰ������, 10s ���ٴ�����
        if (!self._loading) {
          content.removeClass(LOADING_CLS);
        }
        content.addClass(READY_CLS);
      }

      self._shim && self._shim.show();
    },
    hide: function () {
      var self = this;

      self.content.removeClass(LOADING_CLS).removeClass(READY_CLS);
      self.elem.removeClass(HOVER_CLS);

      self._shim && self._shim.hide();

      if (TB.Global._OFF) {
        try {
          S.Event.remove(self.content[0]);
          S.Event.remove(self.elem[0]);
        } catch (e) {
          S.log(e);
        }
      }
    },

    _parseItem: function (data) {
      var self = this,
        html = EMPTY,
        item = data.item,
        itemLen = item ? item.length : 0,
        rest = 0;

      if (itemLen > 0) {
        rest = data.num - itemLen;

        html +=
          '<div class="' +
          HD_CLS +
          '">�������ı���:</div>' +
          '<ul class="' +
          BD_CLS +
          '">';

        S.each(item, function (item) {
          var link = 'http://item' + HOSTNAME + '/item.htm?id=' + item.itemId,
            title = escapeHTML(item.title); /*,
                            complete = title*/
          /*if (title.length > 15) {
                            title = title.slice(0, 15) + '...';
                        }*/
          html +=
            '<li ' +
            MINI_CART_ID +
            '="' +
            item.cartId +
            '">' +
            '<div class="' +
            IMG_CLS +
            '"><a target="_top" href="' +
            link +
            '"><img src="' +
            item.picUrl +
            '" /></a></div>' +
            '<div class="' +
            COUNT_CLS +
            '">&yen;<strong class="' +
            PRICE_CLS +
            '">' +
            item.price +
            '</strong></div>' +
            '<div class="' +
            DEL_CLS +
            '"><a href="#">ɾ��</a></div>' +
            '<div class="' +
            TITLE_CLS +
            '"><a target="_top" href="' +
            link +
            '" title="' +
            title +
            '">' +
            title +
            '</a></div>' +
            (item.sku && item.sku.length
              ? '<div class="' +
                INFO_CLS +
                '"><span>' +
                item.sku.join('</span><span>') +
                '</span></div>'
              : EMPTY) +
            '</li>';
        });
        html += '</ul>';
      }
      if (rest > 0) {
        html +=
          '<div class="' +
          FT_CLS +
          '">' +
          self._parseRest(rest, data.num) +
          '</div>';
      }
      return html;
    },
    _parseRest: function (rest, total) {
      if (rest > 0) {
        return '���ﳵ�ﻹ��' + rest + '������'; //, �ܼ�' + total + '������';
      }
      return EMPTY;
    },
    _parseMsg: function (msg) {
      var html = EMPTY;

      html +=
        '<div class="' +
        BT_CLS +
        '">' +
        '<a target="_top" href="' +
        'http://ju.atpanel.com/?url=' +
        BUY_HOST +
        'auction/cart/my_cart.htm?from=mini&ad_id=&am_id=&cm_id=&pm_id=150042785330be233161' +
        '">�鿴�ҵĹ��ﳵ</a>' +
        (msg || EMPTY) +
        '</div>';

      return html;
    },

    // ���������ʮ���, ��û��ִ����Ӧ�Ĵ���, ��ִ�� callback
    _setTimeout: function (callback) {
      var self = this;

      if (self._timeout) return;
      self._timeout = S.later(function () {
        callback();
        self._timeout = undefined;
      }, 10000);
    },
    _clearTimeout: function () {
      var self = this;

      if (self._timeout) self._timeout.cancel();
      self._timeout = undefined;
    },
    // ���ù��ﳵ��������
    setData: function (data) {
      var self = this,
        html = EMPTY,
        content = self.content;
      self._clearTimeout();

      if (!data) return;

      if (data.status) {
        var num = data.num,
          is_remove = false;
        // num < 0 ʱ,
        // Ϊ -2 ʱ, ��ʾɾ���ɹ�, ��ȡ������ȷ����ֵ, �������ͻ����޸���ֵ
        if (S.isNumber(num) && num === -2) {
          num = self.cartNum - 1;
          is_remove = true;
        }
        TB.Global.setCartNum(num);

        self._data = data;
        // ���ﳵ��>0����ֵʱ, ���ù��ﳵ����
        if (num > 0) {
          if (data.item && data.item.length) {
            html = self._parseItem(data) + self._parseMsg(EMPTY);
          }
          // ���ִ���0 , �������� num -1 ʱ���ʱ
          else if (is_remove) {
            // ���¸����ϵ�������Ϣ
            var ft = content.one(DOT + FT_CLS),
              li_num = content.one(DOT + BD_CLS).all('li').length;
            // ɾ����, ������Ʒ
            if (li_num) {
              // ԭ������Ч��Ʒ��ʾ
              ft && ft.html(self._parseRest(num - li_num, num));
              html = content.html();
            }
            // ɾ����, �Ѿ�û����Ʒ
            else {
              html = self._parseMsg(ft ? INVALID_MSG : EMPTY_MSG);
              self._hideContent();
            }
          }
          // û�з��ؼ�¼, �� data.num >0 , ��ʾ���ﳵ��ʧЧ
          else {
            html = self._parseMsg(INVALID_MSG);
            self._hideContent();
          }
        } else if (num === 0) {
          html = self._parseMsg(EMPTY_MSG);
        } /* else {
                        // ������ֿհ׸���, ��ʾ�鿴���ﳵ��ť
                        html = self._parseMsg(data.errMsg);
                    }*/

        // ÿ����������һ��ʱ, ����Ϊ�� 30s �����;
        self.isExpired = false;
        setTimeout(function () {
          self.isExpired = true;
        }, 30000);
      } else {
        html = self._parseMsg(data.errMsg);
      }
      // data.num �� -1 ʱ������ʾ, Ϊ -1 ʱ, �� setCartNum ʱ�Ѿ�������
      if (data.num !== -1) {
        content.html(html).removeClass(LOADING_CLS).addClass(READY_CLS);

        // ellipsis
        S.each(S.all(DOT + TITLE_CLS), function (el) {
          var el = new S.Node(el),
            ct = 280 - el.prev(DOT + COUNT_CLS).width() - 70, // �ܿ��� - ���ͼƬ - �Ҳ�۸�
            a = el.one('a');
          a.width(ct);
          ellipsis(a);
        });
        // ���¸���shim  +24/+12 �Ǹ���� padding �� border
        self._shim &&
          self._shim
            .offset(content.offset())
            .width(content.width() + 24)
            .height(content.height() + 12);

        // ����� data ����֮ǰ���Ƴ�����ʱ, ��Ҫ����
        if (!self._entered) self.hide();
      }
    },
  };
})();

/**
 * NOTE:
 * - ���ﳵ����>0ʱ, ����ʾ������
 * - �������/�Ƴ�ʱ��, �ӳ� 300 ms
 * - ��ʾ������, �������ݺ�, ���ݵĹ���ʱ��Ϊ 10000 ms, ����������ʾʱ, ��������, ������µ�ǰ������. ֻ������hover��ȥ�Ż����
 * - ɾ��ʱ, ���ݷ����п��ܲ��ɹ�
 */
