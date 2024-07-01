FP.namespace('TSearch');
FP.add('top-header', function (fp) {
  var S = KISSY,
    DOM = S.DOM,
    Event = fp.Event,
    Node = fp.Node;

  fp.TSearch = {
    config: {
      form: null /* DOM.get("#J_TSearchForm"),*/,

      // KISSY.get bug in ie6
      q: null /*DOM.get("#J_TSearchForm")["q"]*/,
    },

    init: function (config) {
      var that = this;
      KISSY.available('J_TSearchForm', function () {
        that.config = {
          form: DOM.get('#J_TSearchForm'),
          // KISSY.get bug in ie6
          q: DOM.get('#J_TSearchForm')['q'],
        };

        config = that.config = fp.merge(that.config, config);

        that.bindEvent(config.q);
        that.reset(config.form);
        that.focus(config.q);
        that.initSuggest(config.q, config.form);
        //that.initHeaderLinks(); ת�Ƶ� site-nav.js ��
      });
    },

    focus: function (q) {
      if (q.type != 'hidden' && q.style.display != 'none' && !q.disabled) {
        q.focus();
        if (fp.UA.ie) {
          // ie crazy cursor bug
          q.value = q.value;
        }
      }
    },

    bindEvent: function (q) {
      var that = this,
        field = fp.one(q).parent(),
        qNode = new Node(q),
        tabs = DOM.query('#J_TSearchTabs li'),
        form = that.config.form;

      DOM.addClass(form.parentNode, 'ks-switchable-content');
      DOM.addClass('#J_TSearchTabs', 'ks-switchable-nav');

      var tabPanelDiv = DOM.create("<div class='tab-panel'></div>");

      for (var i = 0; i < tabs.length; i++) {
        form.parentNode.appendChild(tabPanelDiv.cloneNode(true));
      }
      DOM.get('.tab-panel', form.parentNode).appendChild(form);

      var tab_as = DOM.query('#J_TSearchTabs a'),
        tabpanels = DOM.query(
          '.tab-panel',
          DOM.get('#J_TSearchTabs').parentNode,
        ),
        searchType = that.config.form['search_type'];

      var CURRENT = 'current',
        FOCUS = 'focus';
      (SEARCH_TYPE_LIST = [
        'item',
        'mall',
        'shop',
        'auction',
        'taoba',
        'share',
      ]),
        (SEARCH_TYPE_ACTION = {
          item: function () {
            if (q.value === '') {
              form.action = 'http://list.taobao.com/browse/cat-0.htm';
            }
          },
          mall: function () {
            form.action = 'http://list.tmall.com/search_product.htm';
          },
          shop: function () {
            form.action = 'http://shopsearch.taobao.com/browse/shop_search.htm';
          },
          auction: function () {
            // a - ���� / b - һ�ڼ�
            form['atype'].value = 'a';
          },
          taoba: function () {
            form.action = 'http://ba.taobao.com/index.htm';
          },
          share: function () {
            form['tracelog'].value = 'msearch2fx';
            if (q.value === '') {
              form.action = 'http://jianghu.taobao.com/square.htm';
            } else {
              form['keyword'].value = q.value;
              form.action = 'http://fx.taobao.com/view/share_search.htm';
            }
          },
        }),
        (tabType = ['bb', 'sc', 'dp', 'pm', 'tb', 'fx']);

      // util - tsearch tabs switch
      var switchToTab = function (n) {
        //                fp.__fp_sug.config.resultFormat = 'Լ%result%������';
        //                if(n == 4){
        //                    fp.__fp_sug.config.resultFormat = 'Լ%result%������';
        //                }
        if (n == 1) {
          fp.__fp_sug.dataSource =
            'http://suggest.taobao.com/sug?area=b2c&code=utf-8&extras=1&callback=KISSY.Suggest.callback';
        } else {
          fp.__fp_sug.dataSource =
            'http://suggest.taobao.com/sug?code=utf-8&extras=1&callback=KISSY.Suggest.callback';
        }
        fp.__fp_sug._dataCache = {};
      };

      // on input focus / blur
      qNode
        .on('focus', function (ev) {
          DOM.addClass(field, 'focus');
        })
        .on('blur', function (ev) {
          if (fp.trim(q.value) === '') {
            DOM.removeClass(field, 'focus');
          }
        });

      Event.on(tab_as, 'click', function (e) {
        e.preventDefault();
      });

      var searchTab = new S.Tabs(DOM.get('#J_TSearchTabs').parentNode, {
        aria: true,
        activeTriggerCls: 'current',
        triggerType: 'click',
      });

      searchTab.on('switch', function (ev) {
        var n = ev.currentIndex;
        tabpanels[n].appendChild(form);
        switchToTab(n);
        var type = ev.originalEvent.type;
        setTimeout(function () {
          if (type == 'click') {
            that.focus(q);
            field.addClass(FOCUS);
          } else {
            tabs[n].focus();
          }
        }, 0);

        searchType.value = SEARCH_TYPE_LIST[n];
        if (fp.get('#J_monitorImg')) {
          var time = new Date().getTime();
          fp.get('#J_monitorImg').src =
            'http://www.atpanel.com/jsclick?sysskjc=' +
            tabType[n] +
            '&t=' +
            time;
        }
      });

      var btn = form.getElementsByTagName('button')[0],
        submitHandler = function () {
          if (fp.get('#J_monitorImg')) {
            fp.get('#J_monitorImg').src =
              'http://www.atpanel.com/jsclick?sysskjc=ssan';
          }
          SEARCH_TYPE_ACTION[form['search_type'].value]();
        };

      if (S.UA.ie <= 8) {
        Event.on(btn, 'click', submitHandler);
      }
      Event.on(form, 'submit', submitHandler);

      setTimeout(function () {
        // Ĭ��ѡ�б���Tab
        searchType.value = 'item';
        switchToTab(0);
      }, 0);
    },

    // reset input in case of browser cache
    reset: function (form) {
      setTimeout(function () {
        form['atype'].value = '';
        if (form['keyword']) {
          form['keyword'].value = '';
        }
        if (form['tracelog']) {
          form['tracelog'].value = '';
        }
      }, 0);
    },

    // search suggest
    initSuggest: function (q, form) {
      var sug = new fp.Suggest(
        q,
        'http://suggest.taobao.com/sug?code=utf-8&extras=1',
        {
          resultFormat: 'Լ%result%������',
        },
      );
      fp.__fp_sug = sug;

      // old code copied:
      // ����1��ѡ����ʾ�Ĳ������
      var ssid = form['ssid'];
      if (ssid) {
        // ie no cache
        setTimeout(function () {
          ssid.value = 's5-e';
        }, 0);
        // w3c no cache
        ssid.setAttribute('autocomplete', 'off');

        var func = function () {
          if (ssid.value.indexOf('-p1') == -1) {
            ssid.value += '-p1';
          }
        };

        try {
          if (sug.subscribe) sug.subscribe('onItemSelect', func);
          if (sug.on) sug.on('onItemSelect', func);
        } catch (ex) {}
      }

      // ����2��ֻ�� item �� mall ������ʾ
      var searchType = form.elements['search_type'];
      var getCurrRel = function () {
        return searchType.value;
      };

      //            var _needUpdate = sug._needUpdate;
      //            sug._needUpdate = function() {
      //                var curRel = getCurrRel();
      //                return (curRel === 'item' || curRel === 'mall') && _needUpdate.call(sug);
      //            };

      sug.on('beforeStart', function () {
        var curRel = getCurrRel();
        return curRel === 'item' || curRel === 'mall';
      });

      // ͬ�깺�ӿ�
      sug.on('updateFooter', function (evt) {
        if (searchType.value === 'taoba') {
          return;
        }
        var tdgForm,
          inputs,
          DEFAULT = 'data-default';

        // �޽���Ͳ���ʾͬ�깺
        if (!this.content.innerHTML) return;

        // ͬ�깺����HTML
        tdgForm = DOM.create(
          '<form method="get" action="http://s.taobao.com/search" target="_top">',
        );
        tdgForm.innerHTML =
          '' +
          '<input type="hidden" name="q" />' +
          '<input type="hidden" value="tdg6" name="from" />' +
          '<h5>ͬ�깺��</h5>' +
          '<input type="text" data-default="��һ������" value="��һ������" class="tdg-input" tabindex="0" />' +
          '<em>+</em>' +
          '<input type="text" data-default="��һ����" value="��һ����" class="tdg-input" tabindex="1" />' +
          '<em>+</em>' +
          '<input type="text" data-default="��һ����" value="��һ����" class="tdg-input" tabindex="2" />' +
          '<button class="tdg-btn" type="submit" tabindex="3">����</button>';

        // ͬ�깺������߼�
        inputs = fp.all('.tdg-input', tdgForm);
        inputs.each(function (input, i) {
          input.attr(DEFAULT, input.val());
          if (0 === i) {
            input.val(evt.query).css('color', '#000');
          }
        });

        // ͬ�깺������¼�ע�ᣬ���������������ⲿ��������
        inputs.on('focus', _tdgInputFocusHandler);
        inputs.on('blur', _tdgInputBlurHandler);

        // ͬ�깺�����ύ����
        Event.on(tdgForm, 'submit', function () {
          var queries = [],
            value;
          inputs.each(function (input) {
            if ((value = input.val()) !== input.attr(DEFAULT)) {
              queries.push(value);
            }
          });
          this['q'].value = queries.join(' + ');
        });

        // ͬ�깺��������Tab��������
        Event.on(this.footer, 'keydown', function (evt) {
          var index;
          if (9 === evt.keyCode) {
            index = parseInt(DOM.attr(evt.target, 'tabindex'), 10);
            if (index < 2) {
              // if using focus(), may crash in fucking IE, but work fine
              try {
                inputs[++index].focus();
              } catch (ex) {}
            } else if (2 === index) {
              DOM.get('button.tdg-btn', this.footer).focus();
            } else {
              inputs[0].select();
            }
            evt.halt();
          }
        });

        // HTMLע��ҳ��
        this.footer.appendChild(tdgForm);

        // ͬ�깺����� focus �¼�����
        function _tdgInputFocusHandler(evt) {
          var target = evt.target.getDOMNode();

          if (fp.trim(target.value) === DOM.attr(target, DEFAULT)) {
            target.value = '';
          } else {
            target.select();
          }
          DOM.css(target, {
            color: '#000',
            borderColor: '#6694E3',
          });
        }

        // ͬ�깺����� blur �¼�����
        function _tdgInputBlurHandler(evt) {
          var target = evt.target.getDOMNode();

          if (fp.trim(target.value) === '') {
            target.style.cssText = '';
            target.value = DOM.attr(target, DEFAULT);
          }
          DOM.css(target, 'borderColor', '#A6A6A6');
        }
      });
    },
  };
});
/*������Կ�pid*/
FP.add('global', function (F) {
  var win = window,
    doc = document,
    S = KISSY,
    DOM = S.DOM,
    PID_REG = /pid=(mm_\d{0,10}_\d{0,10}_\d{0,10})/i,
    UNID_REG = /unid=(\d{0,10})/i,
    DEFAULT_PID_REG = /mm_\d+_\d+_\d+/gim,
    SEARCH_FORM_HOOK = 'J_TSearchForm',
    PID_NAME = 'pid',
    UNID_NAME = 'unid',
    A = 'a',
    pid = 'mm_14507416_2297358_8935934',
    unid = '',
    areas = [];

  F.Global = {
    // ��ȡpid, unid����
    init: function (containers) {
      var param = win.location.search,
        m;

      // ��ȡpid, unid
      if ((m = param.match(PID_REG)) && m[1]) {
        pid = m[1];
        if ((m = param.match(UNID_REG)) && m[1]) {
          unid = m[1];
        }
      }

      // ��ȡ�����滻��������
      if (!containers || !S.isArray(containers)) {
        areas = [doc];
      } else {
        S.each(containers, function (container, i) {
          areas[i] = DOM.get(container) || doc;
        });
      }

      this.setSearchParam();
      this.setLinks();
    },

    // ���������������
    setSearchParam: function () {
      var form = DOM.get('#' + SEARCH_FORM_HOOK),
        pidInput =
          form[PID_NAME] ||
          form.appendChild(
            DOM.create('<input type="hidden" name="' + PID_NAME + '" />'),
          ),
        unidInput =
          form[UNID_NAME] ||
          form.appendChild(
            DOM.create('<input type="hidden" name="' + UNID_NAME + '" />'),
          );

      pidInput.value = pid;
      unidInput.value = unid;
    },

    // ����ָ�����Ӳ���
    setLinks: function () {
      var param = pid + (unid ? '&unid=' + unid : '');
      // ����search8���ӣ������ڵ�Ʒ���ߵ�������
      S.each(areas, function (area) {
        var links = S.query(A, area);
        if (links && links.length !== 0) {
          S.each(links, function (link) {
            link.href = link.href.replace(DEFAULT_PID_REG, param);
          });
        }
      });
    },
  };
});
//����������Ĵ���
/*
KISSY.ready(function(S){
	var handleHScroll = function(){
		var rang = S.UA.ie > 0?1000:1020;
		if(S.DOM.viewportWidth()>rang){
			S.DOM.addStyleSheet('html {overflow-x:hidden !important; }');
		}else{
			S.DOM.addStyleSheet('html {overflow-x:auto !important;}');
		}
		//S.log(S.DOM.viewportWidth());
	};
	S.Event.on(window,'resize',function(e){
		handleHScroll();
	});

	handleHScroll();
});
*/
