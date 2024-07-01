/**
 v1.0(20090423) 从markup 直接生成 ext style tabpanel 
 v1.1(20090428) # bug修正
 v1.2(20090430) 增加activate 函数,激活某个标签页
 v1.3(20090504) ie显示修正，通过css2.1 validation
 v1.4(20090730) 添加皮肤支持，修正bug:tabpanel互相嵌套
 v1.4.5(20090806) 修复bug:点击当前tab也会触发change
 v1.4.7(20090901) 加入皮肤 AOL,see tab_layout_skin.html
 v1.5(20091210) mac chrome tab 添加删除效果实现
 v2.0(20091214) 加入 tab 过多时滚动处理
 v2.1(20091230) 加入tab_js.html,完全由javascript创建组件,使用dom node template	
 **/
Ext.namespace('Ext.ux.TabPanelLite');
Ext.ux.TabPanelLite = function (config) {
  config = config || {};
  if (!config.id) config.id = 'ID' + Ext.id() + '_';
  Ext.apply(this, {
    initialConfig: config,
  });
  Ext.apply(this, config);
  this.addEvents('change', 'add', 'remove', 'show', 'hide', 'render');
  Ext.ux.TabPanelLite.superclass.constructor.call(this);
  var tabPanel;
  var me = this;
  if (!config.containerId) {
    //construct from hand by template node ,inspired by YUI container
    tabPanel = Ext.get(Ext.ux.TabPanelLite.template.getSkeleton());
  } else {
    //from existing markup
    tabPanel = Ext.get(config.containerId);
  }
  this.el = tabPanel;
  this.tabHeader = tabPanel.child('.tabheader');
  this.headerContainer = this.tabHeader.child('.tabpanel_nav');
  this.headerWrap = this.headerContainer.wrap({
    cls: 'x-tab-list-wrap',
    style: {
      width: this.tabHeader.getWidth(true) + 'px',
    },
  });
  this.headerContainer.addClass('x-tab-list');
  /*
		for detect all tabs's width using offset to edge
	*/
  this.tabEdge = Ext.DomHelper.append(
    this.headerContainer,
    {
      cls: 'x-tab-edge',
      tag: 'li',
    },
    true,
  );
  this.scrollLeftHandler = Ext.DomHelper.insertBefore(
    this.headerWrap,
    {
      cls: 'x-tab-scroller-left',
      tag: 'a',
      style: {
        height: this.tabHeader.getHeight(true) - 1 + 'px',
      },
    },
    true,
  );
  this.scrollRightHandler = Ext.DomHelper.insertBefore(
    this.headerWrap,
    {
      cls: 'x-tab-scroller-right',
      tag: 'a',
      style: {
        height: this.tabHeader.getHeight(true) - 1 + 'px',
      },
    },
    true,
  );
  this.panelContainer = tabPanel.child('.panels');
  var lis = this.headerContainer.select(" > li[class!='x-tab-edge']");
  var activeIndex = 0;
  //对已有 markup 进行增强
  lis.each(function (el, this_, index_) {
    //add close icon button
    if (el.hasClass('x-tab-strip-closable')) {
      me._addClose(Ext.get(el.dom));
    }
    if (el.hasClass('tab_active')) {
      activeIndex = index_;
    }
  });
  //change event when on click
  this.headerContainer.on(
    'click',
    function (evt, t) {
      var cur = Ext.get(t);
      var lis = this.headerContainer.select(" > li[class!='x-tab-edge']");
      var panels = this.panelContainer.select('> div.panel');
      if (!cur.hasClass('tab_active')) {
        var index = this._getTabIndex(t);
        lis.removeClass('tab_active');
        panels.addClass('hiddenTab');
        cur.addClass('tab_active');
        panels.item(index).removeClass('hiddenTab');
        this.fireEvent('change', t, cur.dom.id);
      }
      evt.stopEvent();
    },
    this,
    {
      delegate: 'li',
    },
  );
  //when change ,scroll to current tab
  this.on('change', function (tab) {
    tab = Ext.get(tab);
    this.scrollToTab(tab, this.adjustScroll);
  });
  //when remove ,update scroll button status
  this.on('remove', function (tab) {
    var tabWidth = tab.getComputedWidth();
    var lastPos = this.tabEdge.getOffsetsTo(this.headerContainer)[0];
    var wrapWidth = this.headerWrap.getWidth();
    var me = this;
    if (lastPos - tabWidth > wrapWidth + this.headerWrap.dom.scrollLeft) {
    } else {
      //不要使当前 tabs 不满
      this.headerWrap.scroll('left', -tabWidth, {
        duration: 0.5,
        callback: function () {
          me.adjustScroll();
        },
      });
    }
  });
  //when add,scroll to this tab and update scroll status
  this.on('add', function (tab, panel, config) {
    this.adjustScroll();
    //only when new added tab has actived,then scroll to new tab
    if (!config.hideActive) this.scrollToTab(tab, this.adjustScroll);
  });
  //manually scroll to left
  this.scrollLeftHandler.on(
    'click',
    function () {
      if (!this._scrollLeft) return;
      var tab = this._getNextTabScrollLeft();
      if (tab) {
        this.scrollToTab(tab, this.adjustScroll);
      }
    },
    this,
  );
  //manually scroll to right
  this.scrollRightHandler.on(
    'click',
    function () {
      if (!this._scrollRight) return;
      var tab = this._getNextTabScrollRight();
      if (tab) {
        this.scrollToTab(tab, this.adjustScroll);
      }
    },
    this,
  );
  //after render ,adjust scrollbar and scroll to active configured tab
  this.on(
    'render',
    function () {
      this.adjustScroll();
      this.scrollToTab(this.getActivedTab(), this.adjustScroll);
    },
    this,
  );
  if (this.renderTo) {
    this.render(this.renderTo);
  } else if (this.containerId) {
    this._rendered = true;
    this.fireEvent('render');
  }
};
Ext.extend(Ext.ux.TabPanelLite, Ext.util.Observable, {
  _scrollLeft: true,
  _scrollRight: true,
  show: function () {
    this.el.setDisplayed(true);
    this.fireEvent('show');
  },
  hide: function () {
    this.el.setDisplayed(false);
    this.fireEvent('hide');
  },
  isDisplayed: function () {
    return this.el.isDisplayed();
  },
  toogle: function () {
    this.isDisplayed() ? this.hide() : this.show();
  },
  /*
		得到左边不在屏幕的下一个 tab
	*/
  _getNextTabScrollLeft: function () {
    var tab = null;
    var lis = this.headerContainer.select(" > li[class!='x-tab-edge']");
    var me = this;
    lis.each(function (el) {
      var next = el.next('li');
      if (next) {
        var curPos = el.getOffsetsTo(me.headerContainer)[0];
        var nextPos = next.getOffsetsTo(me.headerContainer)[0];
        if (
          curPos < me.headerWrap.dom.scrollLeft &&
          nextPos >= me.headerWrap.dom.scrollLeft
        ) {
          tab = el.dom;
          return false;
        }
      }
    });
    return tab;
  },
  /*
		得到右边不在屏幕的下一个 tab
	*/
  _getNextTabScrollRight: function () {
    var tab = null;
    var lis = this.headerContainer.select(" > li[class!='x-tab-edge']");
    var me = this;
    var wrapWidth = this.headerWrap.getWidth();
    //console.log(me.headerWrap.dom.scrollLeft + wrapWidth);
    lis.each(function (el) {
      var next = el.next('li');
      if (next) {
        var curPos = el.getOffsetsTo(me.headerContainer)[0];
        var nextPos = next.getOffsetsTo(me.headerContainer)[0];
        //console.log(curPos+ el.getComputedWidth() +" - "+(nextPos+next.getComputedWidth()));
        if (
          curPos + el.getComputedWidth() <=
            me.headerWrap.dom.scrollLeft + wrapWidth + 1 &&
          nextPos + next.getComputedWidth() >
            me.headerWrap.dom.scrollLeft + wrapWidth + 1
        ) {
          tab = next.dom;
          return false;
        }
      }
    });
    //console.log(tab.innerHTML);
    return tab;
  },
  /*
		根据位置调整滚动显示
	*/
  adjustScroll: function () {
    if (!this.isDisplayed() || !this._rendered) return;
    var headerWidth = this.tabHeader.getWidth(true);
    var wrapWidth = this.headerWrap.getWidth();
    var lastPos = this.tabEdge.getOffsetsTo(this.headerContainer)[0];
    if (lastPos > wrapWidth + this.headerWrap.dom.scrollLeft + 1) {
      this._scrollRight = true;
    } else {
      this._scrollRight = false;
    }
    if (this.headerWrap.dom.scrollLeft > 0) {
      this._scrollLeft = true;
    } else {
      this._scrollLeft = false;
    }
    if (this._scrollLeft || this._scrollRight) {
      this.headerWrap.setWidth(headerWidth - 36);
      this.tabHeader.addClass('x-tab-scrolling');
      if (this._scrollLeft) this._enableScroll('Left');
      else this._disableScroll('Left');
      if (this._scrollRight) this._enableScroll('Right');
      else this._disableScroll('Right');
    } else {
      this.headerWrap.setWidth(headerWidth);
      this.tabHeader.removeClass('x-tab-scrolling');
    }
  },
  _disableScroll: function (d) {
    this['_scroll' + d] = false;
    this['scroll' + d + 'Handler'].setOpacity(0.3);
    this['scroll' + d + 'Handler'].setStyle({
      cursor: 'default',
    });
  },
  _enableScroll: function (d) {
    this['_scroll' + d] = true;
    this['scroll' + d + 'Handler'].setOpacity(1);
    if (!this['scroll' + d + 'Handler'].dom.style.height) {
      this['scroll' + d + 'Handler'].setHeight(this.tabHeader.getHeight(true));
    }
    this['scroll' + d + 'Handler'].setStyle({
      cursor: 'pointer',
    });
  },
  /*
		关键：滚动到当前 tab
		@param tab{HTMLElement} tab which will scroll to view
		@param callback{Function} after scroll then call something,
		such as update scrollbar ui status
	*/
  scrollToTab: function (tab, callback) {
    if (!this.tabHeader.hasClass('x-tab-scrolling')) return;
    tab = Ext.get(tab);
    var tabWidth = Ext.get(tab).getComputedWidth();
    var wrapWidth = this.headerWrap.getWidth();
    var currentPos = tab.getOffsetsTo(this.headerContainer)[0];
    if (currentPos > wrapWidth + this.headerWrap.dom.scrollLeft + 1) {
      this.headerWrap.scroll(
        'left',
        currentPos - this.headerWrap.dom.scrollLeft - wrapWidth + tabWidth,
        {
          duration: 0.5,
          callback: callback,
          scope: this,
        },
      );
    } else if (
      currentPos <= wrapWidth + this.headerWrap.dom.scrollLeft + 1 &&
      currentPos + tabWidth > wrapWidth + this.headerWrap.dom.scrollLeft + 1
    ) {
      this.headerWrap.scroll(
        'left',
        currentPos - this.headerWrap.dom.scrollLeft - wrapWidth + tabWidth,
        {
          duration: 0.5,
          callback: callback,
          scope: this,
        },
      );
    } else if (currentPos + tabWidth < this.headerWrap.dom.scrollLeft) {
      this.headerWrap.scroll(
        'left',
        currentPos + tabWidth - this.headerWrap.dom.scrollLeft,
        {
          duration: 0.5,
          callback: callback,
          scope: this,
        },
      );
    } else if (
      currentPos + tabWidth >= this.headerWrap.dom.scrollLeft &&
      currentPos < this.headerWrap.dom.scrollLeft
    ) {
      this.headerWrap.scroll(
        'left',
        currentPos - this.headerWrap.dom.scrollLeft,
        {
          duration: 0.5,
          callback: callback,
          scope: this,
        },
      );
    }
  },
  _getTabIndex: function (li) {
    var index = -1;
    var lis = this.headerContainer.select(" > li[class!='x-tab-edge']");
    lis.each(function (el, this_, index_) {
      if (el.dom == li) {
        index = index_;
        return false;
      }
    });
    return index;
  },
  /**
     active index tab,show according panel
     @param index{Number} the order of tab to activate
     */
  activate: function (index) {
    var tabPanel = this.el;
    var lis = this.headerContainer.select(" > li[class!='x-tab-edge']");
    if (lis.getCount() < index) return;
    var panels = this.panelContainer.select('> div.panel');
    if (panels.getCount() < index) return;
    lis.removeClass('tab_active');
    lis.item(index).addClass('tab_active');
    panels.addClass('hiddenTab');
    panels.item(index).removeClass('hiddenTab');
  },
  getActivedTab: function () {
    var lis = this.headerContainer.select(" > li[class*='tab_active']");
    return lis.item(0);
  },
  _addClose: function (addLi) {
    var close = Ext.DomHelper.append(
      addLi,
      {
        tag: 'a',
        cls: 'x-tab-strip-close',
        title: 'close',
        href: '#',
        hideFocus: 'on',
        html: 'close',
      },
      true,
    );
    close.on(
      'click',
      function (evt) {
        Ext.destroy(close);
        this._removeTab(addLi);
        evt.stopEvent();
      },
      this,
    );
  },
  /**
     add a tab to tabpanel
     @param{Object} config :{
     tabId{String} : tab's id
     ,tabText{String}:tab's text to show
     ,closable{Boolean} : whether allowed to close
     ,dom{Array OR Object} : Ext.DomHelper DOM spec
     ,hideActive{Boolean}: whether added tab show immediately
     }
     */
  addTab: function (config) {
    var lis = this.headerContainer.select(" > li[class!='x-tab-edge']");
    var addLi = Ext.ux.TabPanelLite.template.getTab();
    addLi.id = config.tabId || Ext.id();
    addLi = Ext.get(addLi);
    addLi.child('span.tab_text', true).innerHTML = config.tabText;
    if (config.closable) {
      addLi.addClass('x-tab-strip-closable');
      this._addClose(addLi);
    }
    this.headerContainer.dom.insertBefore(addLi.dom, this.tabEdge.dom);
    var addPanel = Ext.DomHelper.append(
      this.panelContainer,
      {
        cls: 'panel',
        cn: Ext.isArray(config.dom) ? config.dom : [config.dom],
      },
      true,
    );
    if (!config.hideActive) this.activate(lis.getCount());
    //if already rendered ,then anim it
    if (this.rendered) {
      var me = this;
      /*从下到上动画出现*/
      var wrap = this._getEffectWrap(addLi);
      addLi.slideIn('b', {
        duration: 0.35,
        wrap: wrap,
        callback: function () {
          wrap.dom.parentNode.insertBefore(addLi.dom, wrap.dom);
          //默认visibility : visible ,父容器隐藏，这个还在
          //手动清除
          addLi.setStyle({
            visibility: '',
          });
          wrap.remove();
          if (!config.hideActive) {
            me.activate(lis.getCount());
          }
          me.fireEvent('add', addLi, addPanel, config);
        },
      });
    } else {
      this.fireEvent('add', addLi, addPanel, config);
    }
  },
  _removeTab: function (li) {
    var index = this._getTabIndex(li.dom || li);
    this.removeTab(index);
  },
  _getEffectWrap: function (li) {
    var wrap = li.wrap({
      style: {
        position: 'relative',
        float: 'left',
        overflow: 'hidden',
      },
    });
    return wrap;
  },
  removeTab: function (index) {
    if (index.dom || index.nodeName) {
      return this._removeTab(index);
    }
    var activeIndex = 0;
    var lis = this.headerContainer.select(" > li[class!='x-tab-edge']");
    if (isNaN(index) || index >= lis.getCount() || index < 0) {
      alert('error : range : 0 - ' + (lis.getCount() - 1));
      return;
    }
    if (index == 0 && lis.getCount() == 1) {
      activeIndex = -1;
    } else if (index == 0) {
      activeIndex = 1;
    } else {
      activeIndex = index - 1;
    }
    /*首先激活下一个备选项*/
    if (activeIndex >= 0) this.activate(activeIndex);
    var me = this;
    /*建立tab包装层，用来定位改变大小并移动，关键overflow:hidden，tab在其中绝对定位*/
    var wrap = this._getEffectWrap(lis.item(index));
    /*开始动画*/
    lis.item(index).slideOut('bl', {
      duration: 0.35,
      wrap: wrap,
      callback: function (el) {
        var panels = me.panelContainer.select('> div.panel');
        Ext.destroy(panels.item(index));
        me.fireEvent('remove', Ext.get(lis.item(index)));
        Ext.destroy(el);
        Ext.destroy(wrap);
      },
    });
  },
  render: function (p) {
    this.el.appendTo(p);
    this._rendered = true;
    this.fireEvent('render');
  },
});
Ext.ux.TabPanelLite.template = (function () {
  var holder = document.createElement('div');
  holder.className = 'tabpanel';
  holder.innerHTML =
    '' +
    "<div class='tabheader'>" +
    "<ul class='tabpanel_nav clearfix'><ul></div><div class='panels'></div>";
  var li = document.createElement('li');
  li.innerHTML =
    '' +
    "<a class='tab_left' href='#' hideFocus='on'>" +
    "	<em class='tab_right'>" +
    "		<span class='tab_inner'>" +
    "			<span class='tab_text'>??" +
    '			</span>' +
    '		</span>' +
    '	</em>' +
    '	</a>';
  var p = document.createElement('div');
  p.className = 'panel';
  return {
    getSkeleton: function () {
      return holder.cloneNode(true);
    },
    getPanel: function () {
      return p.cloneNode();
    },
    getTab: function (active) {
      return li.cloneNode(true);
    },
  };
})();
