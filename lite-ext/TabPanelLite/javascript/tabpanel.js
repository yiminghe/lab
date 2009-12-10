/**
	v1.0(20090423) 从markup 直接生成 ext style tabpanel 
	v1.1(20090428) # bug修正
	v1.2(20090430) 增加activate 函数,激活某个标签页
	v1.3(20090504) ie显示修正，通过css2.1 validation
	v1.4(20090730) 添加皮肤支持，修正bug:tabpanel互相嵌套
	v1.4.5(20090806) 修复bug:点击当前tab也会触发change
	v1.4.7(20090901) 加入皮肤 AOL,see tab_layout_skin.html
	v1.5(20091210) mac chrome tab 添加删除效果实现
**/

Ext.namespace('Ext.ux');
Ext.ux.TabPanelLite = function(config) {
    config = config || {};
    if (!config.id)
    config.id = 'ID' + Ext.id() + '_';

    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    this.addEvents('change');
    Ext.ux.TabPanelLite.superclass.constructor.call(this);
    if (!config.containerId) return;

    var tabPanel = Ext.get(config.containerId);
    var me = this;
    this.headerContainer = tabPanel.child("> .tabheader > .tabpanel_nav");
    this.panelContainer = tabPanel.child("> .panels");
    var lis = this.headerContainer.select(" > li");
    var activeIndex = 0;
    lis.each(function(el, this_, index_) {
        //add close icon button
        if (el.hasClass("x-tab-strip-closable")) {
            me._addClose(Ext.get(el));
        }
        if (el.hasClass("tab_active")) {
            activeIndex = index_;
        }
    });

    this.activate(activeIndex);
    this.headerContainer.on('click',
    function(evt, t) {
        var cur = Ext.get(t);
        var lis = this.headerContainer.select(" > li");
        var panels = this.panelContainer.select("> div.panel");
        if (!cur.hasClass('tab_active')) {
            var index = this._getTabIndex(t);
            lis.removeClass('tab_active');
            panels.addClass('hiddenTab');
            cur.addClass('tab_active');
            panels.item(index).removeClass('hiddenTab');
            this.fireEvent("change", t, cur.dom.id);
        }
        evt.stopEvent();
    },
    this, {
        delegate: "li"
    });
};



Ext.extend(Ext.ux.TabPanelLite, Ext.util.Observable, {
    _getTabIndex: function(li) {
        var index = -1;
        var lis = this.headerContainer.select(" > li");
        lis.each(function(el, this_, index_) {
            if (el.dom == li) {
                index = index_;
                return false;
            }
        });
        return index;
    }
    ,
    activate: function(index) {
        var tabPanel = Ext.get(this.containerId);
        var lis = this.headerContainer.select(" > li");
        if (lis.getCount() < index) return;
        var panels = this.panelContainer.select("> div.panel");
        if (panels.getCount() < index) return;
        lis.removeClass('tab_active');
        lis.item(index).addClass('tab_active');
        panels.addClass('hiddenTab');
        panels.item(index).removeClass('hiddenTab');
    }

    ,
    _addClose: function(addLi) {
        var close = Ext.DomHelper.append(addLi, {
            tag: "a",
            cls: "x-tab-strip-close",
            title: "close",
            href: "#",
            hideFocus: "on",
            html: "close"
        },
        true);
        close.on("click",
        function(evt) {
            Ext.destroy(close);
            this._removeTab(addLi);
            evt.stopEvent();
        },
        this)
    }
    ,
    addTab: function(config) {
        var lis = this.headerContainer.select(" > li");
        var addLi = lis.item(0).dom.cloneNode(true);
        addLi.id = config.tabId || Ext.id();
        addLi = Ext.get(addLi);
        addLi.child("span.tab_text", true).innerHTML = config.tabText;
        if (config.closable) {
            addLi.addClass("x-tab-strip-closable");
            this._addClose(addLi);
        }
        this.headerContainer.dom.appendChild(addLi.dom);
        Ext.DomHelper.append(this.panelContainer, {
            cls: 'panel',
            cn: [config.dom]
        });
        this.activate(lis.getCount());
		var me=this;
        /*从下到上动画出现*/
		var wrap=this._getEffectWrap(addLi);
        addLi.slideIn('b', {
            duration: .35,
            wrap: wrap,
            callback: function() {
				wrap.dom.parentNode.insertBefore(addLi.dom, wrap.dom);
	            wrap.remove();
				me.activate(lis.getCount());
            }
        });

    }

    ,
    _removeTab: function(li) {
        var index = this._getTabIndex(li.dom || li);
        this.removeTab(index);
    }
    ,
    _getEffectWrap: function(li) {
        var wrap = li.wrap({
            style: {
                position: "relative",
                float: "left",
                overflow: "hidden"
            }
        });
        return wrap;
    }
    ,
    removeTab: function(index) {
        if (index.dom || index.nodeName) {
            return this._removeTab(index);
        }
        var activeIndex = 0;
        var lis = this.headerContainer.select(" > li");
        if (isNaN(index) || index >= lis.getCount() || index < 0) {
            alert("error : range : 0 - " + (lis.getCount() - 1));
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
            duration: .35,
            wrap: wrap,
            callback: function(el) {
                Ext.destroy(el);
                Ext.destroy(wrap);
                var panels = me.panelContainer.select("> div.panel");
                Ext.destroy(panels.item(index));
            }
        });
    }


});