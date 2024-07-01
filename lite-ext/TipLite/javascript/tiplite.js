/*
	v1.0(20090509) 按照ext tip素材及思想补充重新实现 提示，动态设置 宽度，高度，自动隐藏，手动关闭
	v1.5(20090601) 享元模式采用，全局采用一个TipLite实例，内部数据，外部数据分开
	v1.6(20090602) 自适应高度修正，滚动条隐藏修正
	v1.6.5(20090803) 增加removeTip函数，可以随时移去某节点的提示功能
*/
Ext.namespace('Ext.ux');
Ext.ux.TipLite = function (config) {
  config = config || {};
  Ext.apply(this, {
    initialConfig: config,
  });
  Ext.apply(this, config);
  this.addEvents('hide', 'show');
  Ext.ux.TipLite.superclass.constructor.call(this);
  this.tipLiteContainer = Ext.DomHelper.append(
    document.body,
    {
      tag: 'div',
      cls: 'tip-lite',
      style: 'visibility:hidden',
    },
    true,
  );
  var thl = Ext.DomHelper.append(
    this.tipLiteContainer,
    {
      tag: 'div',
      cls: 'tip-lite-hl',
      cn: [
        {
          tag: 'div',
          cls: 'tip-lite-hr',
          cn: [
            {
              tag: 'div',
              cls: 'tip-lite-hc',
              cn: [
                {
                  tag: 'div',
                  cls: 'tip-lite-ht',
                },
              ],
            },
          ],
        },
      ],
    },
    true,
  );
  var tht = thl.child('div.tip-lite-ht');
  var closeTool = Ext.DomHelper.append(
    tht,
    {
      tag: 'div',
      cls: 'tip-lite-close',
      style: 'display:none',
    },
    true,
  );
  closeTool.on(
    'click',
    function () {
      if (this.tipLiteContainer.isVisible()) this.fireEvent('hide');
      this.tipLiteContainer.hide();
    },
    this,
  );
  this.title = Ext.DomHelper.append(
    tht,
    {
      tag: 'span',
      cls: 'tip-lite-ht-span',
      html: '&nbsp;',
    },
    true,
  );
  var bl = Ext.DomHelper.append(
    this.tipLiteContainer,
    {
      tag: 'div',
      cls: 'tip-lite-bl',
      cn: [
        {
          tag: 'div',
          cls: 'tip-lite-br',
          cn: [
            {
              tag: 'div',
              cls: 'tip-lite-bc',
              html: '&nbsp;',
            },
          ],
        },
      ],
    },
    true,
  );
  this.body = bl.child('.tip-lite-bc');
  Ext.DomHelper.append(this.tipLiteContainer, {
    tag: 'div',
    cls: 'tip-lite-fl',
    cn: [
      {
        tag: 'div',
        cls: 'tip-lite-fr',
        cn: [
          {
            tag: 'div',
            cls: 'tip-lite-fc',
          },
        ],
      },
    ],
  });
};

Ext.extend(Ext.ux.TipLite, Ext.util.Observable, {
  mouseOffset: [15, 18],
  showDelay: 500,
  hideDelay: 200,
  maxHeight: 300,
  maxWidth: 300,
  setWidth: function (width) {
    if (!width) {
      var tsize = Ext.util.TextMetrics.measure(
        this.title.dom,
        this.title.dom.innerHTML,
      );
      var bsize = Ext.util.TextMetrics.measure(
        this.body.dom,
        this.body.dom.innerHTML,
      );
      width =
        Math.min(Math.max(tsize.width, bsize.width, 40), this.maxWidth) + 40;
    }
    this.tipLiteContainer.setWidth(width);
  },

  setHeight: function (height) {
    this.body.setStyle({
      overflow: 'auto',
    });
    if (!height) {
      this.body.setStyle({
        height: '',
      });
      height = this.body.getComputedHeight();
      if (height > this.maxHeight) this.body.setHeight(this.maxHeight);
      else
        this.body.setStyle({
          overflow: 'hidden',
        });
    } else {
      this.body.setHeight(height);
    }
  },

  setCloseable: function (closeable) {
    var tht = this.tipLiteContainer.child('div.tip-lite-ht');
    var closeTool = this.tipLiteContainer.child('div.tip-lite-close');
    closeTool.setStyle({
      display: closeable ? '' : 'none',
    });
    return;
  },

  show: function () {
    this.fireEvent('show');
    this.tipLiteContainer.show();
  },

  //鼠标进入延迟显示
  onMouseOver: function (config, evt) {
    //console.log("onMouseOver");
    /*
  		享元模式，原先的内部数据作为外部数据参数传入
  	*/
    this.body.update(config.html || '&nbsp;');
    this.title.update(config.title || '&nbsp;');
    this.setWidth(config.width);
    this.setHeight(config.height);
    this.setCloseable(!config.autoHide);
    var xy = evt.getXY();
    xy = [xy[0] + this.mouseOffset[0], xy[1] + this.mouseOffset[1]];
    this.tipLiteContainer.setXY(xy);
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.showTimer = this.show.defer(this.showDelay, this);
    evt.stopEvent();
  },

  //鼠标移出，延迟隐藏
  onMouseOut: function (evt) {
    //console.log("onMouseOut");
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    this.fireEvent('hide');
    this.hideTimer = this.tipLiteContainer.hide.defer(
      this.hideDelay,
      this.tipLiteContainer,
    );
  },
});

/*
	享元模式管理器
*/
Ext.ux.TipLiteManager = (function () {
  var instance = null;
  //提示功能节点的事件保留，用于un
  var tipHolder = {};

  return {
    /*
			工厂模式控制单一实例
		*/
    getInstance: function () {
      if (!instance) {
        instance = new Ext.ux.TipLite();
      }
      return instance;
    },

    addTip: function (config) {
      var tipLite = this.getInstance();
      var targetEl = Ext.get(config.targetId);
      config.targetId = targetEl.id;
      var holder = tipHolder[config.targetId];
      if (holder) this.removeTip(config.targetId);
      holder = tipHolder[config.targetId] = {};
      var mo = (holder['mouseover'] = tipLite.onMouseOver.createDelegate(
        tipLite,
        [config],
        0,
      ));
      targetEl.on('mouseover', mo);
      if (config.autoHide) {
        var mou = (holder['mouseout'] = tipLite.onMouseOut);
        targetEl.on('mouseout', mou, tipLite);
      }
      return tipLite;
    },

    /*
			targetId 上的提示功能消失吧
		*/
    removeTip: function (targetId) {
      var targetEl = Ext.get(targetId);
      targetId = targetEl.id;
      if (!tipHolder[targetId]) return;
      var tipLite = this.getInstance();
      var mo = tipHolder[targetId]['mouseover'];
      var mou = tipHolder[targetId]['mouseout'];
      if (mo) {
        targetEl.un('mouseover', mo);
      }
      if (mou) {
        targetEl.un('mouseout', mou, tipLite);
      }
      tipHolder[targetId] = null;
    },
  };
})();
