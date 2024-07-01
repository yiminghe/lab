/**
 * 右侧便民中心的逻辑
 */
FP.add('expressway', function (S) {
  var DOM = S.DOM;
  S.namespace('Expressway');
  S.Expressway.init = function () {
    var announce = new S.Tabs('#J_announce', { aria: true });

    var anounceHd = S.get('#J_announce .hd');
    DOM.query('li', anounceHd).each(function (n) {
      n.hideFocus = true;
      n.style.outline = 'none';
    });

    /*
		var announceLoad = new S.DataLazyload({
			mod:'auto',
			areaes:S.one('#J_announce').all('textarea')
		});
		*/
    if (!S.one('#J_expressway')) {
      return;
    }

    var expressway = new S.Tabs('#J_expressway', {
      aria: true,
      //navCls: 'tab-holder',
      //contentCls: 'bd',
      //activeTriggerCls: 'selected',
      activeIndex:
        parseInt(S.get('#J_expressway').getAttribute('data-active-index')) || 0,
    });
    var expresswayHd = S.get('#J_expressway .hd');
    DOM.query('li', expresswayHd).each(function (n) {
      n.hideFocus = true;
      n.style.outline = 'none';
    });

    /*
		var tabIfram = new S.DataLazyload({
			mod:'auto',
			areaes:S.one('#J_expressway').all('textarea')
		});	
		*/
  };
});
