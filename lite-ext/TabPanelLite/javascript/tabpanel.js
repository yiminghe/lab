/**
	v1.0(20090423) 从markup 直接生成 ext style tabpanel 
	v1.1(20090428) # bug修正
	v1.2(20090430) 增加activate 函数,激活某个标签页
	v1.3(20090504) ie显示修正，通过css2.1 validation
	v1.4(20090730) 添加皮肤支持，修正bug:tabpanel互相嵌套
	v1.4.5(20090806) 修复bug:点击当前tab也会触发change
	v1.4.7(20090901) 加入皮肤 AOL,see tab_layout_skin.html
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
    this.activate(0);
    var lis = tabPanel.select('> .tabheader > .tabpanel_nav > li');
    var panels = tabPanel.select('> .panels > div.panel');
    var me = this;
    lis.each(function(el, this_, indexI) {
        var cur = Ext.get(el.dom);
        cur.on('click',
        function(evt) {
            if (!cur.hasClass('tab_active')) {
                lis.removeClass('tab_active');
                panels.addClass('hiddenTab');
                cur.addClass('tab_active');
                panels.item(indexI).removeClass('hiddenTab');
                me.fireEvent("change", this, cur.dom.id);
            }
            evt.stopEvent();
        });
    });
};



Ext.extend(Ext.ux.TabPanelLite, Ext.util.Observable, {
    activate: function(index) {
        var tabPanel = Ext.get(this.containerId);
        var lis = tabPanel.select('> .tabheader > .tabpanel_nav > li');
        if (lis.getCount() < index) return;
        var panels = tabPanel.select('> .panels > div.panel');
        if (panels.getCount() < index) return;
        lis.removeClass('tab_active');
        lis.item(index).addClass('tab_active');
        panels.addClass('hiddenTab');
        panels.item(index).removeClass('hiddenTab');
    }
});