/*
	http://yiminghe.javaeye.com/blog/374182
	v1.0(20090424) 偷窃ext window素材以及利用ext core,DD,Resizable 简化重新实现Window
	v1.1(20090424) 修正ie显示问题
	v1.5  抄袭extjs window 拖放ghost实现  
	v1.6(20090426) 增加底部按钮设置（静态，动态）
	v1.6.5(20090427) 修正resize 工具条上移，计算button高度,难点:resize后动态按纽处理
	v1.7(20090428) ie6 按钮底部多出bug修正,overflow要设置hidden
	v1.8(200900504) 通过css2.1 validation
	v2.0(200900509) 提升初始化效率,修改宽度高度计算,setHeight,setWidth,setSize Ext-core已经自动减去 边框长度和padding 
		实际上是 setOffsetHeight setOffsetWidth setOffsetSize 
	v2.0.1(200900512)	隐藏设置高度为0，防止占用页面空间
	v2.2(200900525) 增加利用windowlite 编写 alertlite 示范,fix ie6 height:100% bug
	v2.3(200900610) 增加窗体阴影Shadow-min.js设置，resize错误修正,利用闭包实现alert单例模式
	v2.3.5(200900611) 增加设置：defaultButton，buttonAlign(默认右对齐)，方法：focusButton,removeButton,修正removeAllButtons，见示例html
	v2.4(200900613) 逼近extjs window:增加方法autoHeight,根据内容自适应高度,resize计算改变,增加show方法参数animEl,alertlite 增加icon以及callback设置
	v2.4.2(20090616) 增加closable配置，修正没有默认按钮焦点设置问题
	v2.5(20090723) 增加 maximizable 配置(窗口最大化处理).
	v2.5.1(20090728) 增加 closeAction 配置，默认hide,可以完全内存中移除window
	v2.5.2(20090730) ie6 select 突出bug解决,close内存释放改进
	v2.5.3(20090811) width不设置时，自动宽度大小调整
	v2.8(20090812) show 方法调整，option 配置，添加 constrainToView ，避免浏览器出现滚动条，
									双击标题关闭窗口，点击窗体使得所属窗口到最前端，
									优化代码结构，支持多达1.5M table数据直接渲染到 窗体body ，参见：windowlite_close.html
	v2.9(20090902) 代码整理，加入 AOL 皮肤，详见示例
	v2.9.2(20090903) 加入 tools 配置 [{cls:'',click:function(evt){}},...] ,添加其他图标
	v2.9.5(20090909) 修正 constrainToView 在浏览器出现滚动条时，仍然全部保留在当前可见区域中。(show({x:,y:})):x,y应为当前窗口可见区域,
									 show (x,y ,constrainToView:true)保证窗口的四个角有一个角在x,y位置，参见window的右键菜单功能表示
									 
	v2.9.8(20090914)	对浏览器出现滚动条时的 constrainToView 行为大量修正，保证window时出现在视窗里面。具体：
	 		              最大化窗口里在window弹出的浏览器滚动条问题修正,body - > overflow:auto,left,top->scrollTop,scrollLeft
				            注意滚动条在firefox3中占据viewsize !
  v2.9.8.2(20090919) 全屏时firefox修正		
  v2.9.8.5(20090927) 增加minHeight,maxHeight配置，可单独调用constrainHeight.
  v3(20091010) 重要更新：增加 taskbar 配置，可以出现 窗口管理栏了，参见 windowlite_taskbar.html
    (20091014) 修正设置 containerId 时的定位行为
  v3.1(20091023) size问题调整              
*/
Ext.namespace('Ext.ux');
Ext.ux.WindowLite = function (config) {
    config = config || {};
    if (!config.id) config.id = 'ID' + Ext.id() + '_';
    config.closeAction = config.closeAction || 'hide';
    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    this.buttonAlign = this.buttonAlign || 'right';
    this.addEvents('hide', 'beforehide', 'beforeclose', 'show', 'close');
    Ext.ux.WindowLite.superclass.constructor.call(this);
    this.el = Ext.DomHelper.append(Ext.get(config.containerId) || document.body, {
        tag: 'div',
        cls: 'windowContainer',
        style: {
            'visibility': 'hidden',
            'left': '-9999px',
            'top': '-9999px'
        },
        cn: [ // start header
        {
            tag: 'div',
            cls: 'window-header-l',
            cn: [{
                tag: 'div',
                cls: 'window-header-r',
                cn: [{
                    tag: 'div',
                    cls: 'window-header-c',
                    cn: [{
                        tag: 'div',
                        cls: 'window-header-text',
                        style: 'zoom:1',
                        cn: [{
                            tag: 'a',
                            cls: 'x-tool x-tool-close',
                            style: this.closable ? 'display:block;' : 'display:none;',
                            href: '#close',
                            html: 'close',
                            title: 'close window'
                        },
                        {
                            tag: 'a',
                            cls: 'x-tool x-tool-maximize',
                            style: this.maximizable ? 'display:block;' : 'display:none;',
                            href: '#maximize',
                            html: 'maximize',
                            title: 'maximize window'
                        },
                        {
                            tag: 'a',
                            cls: 'x-tool x-tool-restore',
                            style: 'display:none;',
                            href: '#restore',
                            html: 'restore',
                            title: 'restore window'
                        },
                        {
                            tag: 'a',
                            cls: 'x-tool x-tool-minimize',
                            style: 'display:none;',
                            href: '#minimize',
                            html: 'minimize',
                            title: 'minimize window'
                        },
                        {
                            tag: 'span',
                            html: this.title || '&nbsp;'
                        }]
                    }]
                }]
            }]
        },
        //end header
        {
            tag: 'div',
            cls: 'window-body',
            cn: [ //start body-content
            {
                tag: 'div',
                cls: 'window-body-ml',
                cn: [{
                    tag: 'div',
                    cls: 'window-body-mr',
                    cn: [{
                        tag: 'div',
                        cls: 'window-body-mc'
                    }]
                }]
            },
            //end body-content
            //start bottom
            {
                tag: 'div',
                cls: 'window-body-bl',
                cn: [{
                    tag: 'div',
                    cls: 'window-body-br',
                    cn: [{
                        tag: 'div',
                        cls: 'window-body-bc nobutton',
                        style: 'text-align:' + this.buttonAlign
                    }]
                }]
            } //end bottom
            ]
        } //end body
        ] //end container cn
    },
    true); //标题头
    this.header = this.el.child('div.window-header-l'); //主体：内容+按钮栏
    this.main = this.el.child('div.window-body'); //标题头内容
    this.title = this.header.child('div.window-header-text span'); //右上角按钮组
    this._toolsSection = this.header.child('div.window-header-text'); //右上角关闭
    this._closebarA = this.header.child('a.x-tool-close'); //右上角最大化
    this._maximizeA = this.header.child('a.x-tool-maximize'); //右上角恢复大小
    this._restoreA = this.header.child('a.x-tool-restore'); //右上角最小化
    this._minimizeA = this.header.child('a.x-tool-minimize'); //内容
    this.body = this.el.child('div.window-body-mc'); //按钮栏
    this.bottom = this.el.child('div.window-body-bc');
    this._tools = [];
    if (this.tools) {
        Ext.each(this.tools, function (el) {
            var t = Ext.DomHelper.insertAfter(this._restoreA, {
                tag: 'a',
                cls: el.cls
            },
            true);
            t.on("click", el['click'], this);
            this._tools.push(t);
        },
        this);
    }
    if (this.items) {
        this.body.update('');
        for (var i = 0; i < this.items.length; i++) {
            this.body.appendChild(this.items[i]);
        }
    } //防止this.html 过大，直接搞了
    else if (this.html) {
        this.body.update(this.html);
    }
    if (this.closable) {
        this._closebarA.on('click', function (eventExt) {
            this[this.closeAction]();
            eventExt.stopEvent();
        },
        this); //改做双击关闭
    }
    if (this.maximizable) {
        this._maximizeA.on('click', function (eventExt) {
            this.maximize();
            eventExt.stopEvent();
        },
        this);
        this._restoreA.on('click', function (eventExt) {
            this.restore();
            eventExt.stopEvent();
        },
        this);
        this.header.on('dblclick', function (evt) {
            if (this._maximizeA.isDisplayed()) {
                this.maximize();
            } else {
                this.restore();
            } //this[this.closeAction]();
            evt.stopEvent();
        },
        this);
    }
    if (this.minimizable && this.taskbar) {
        this._minimizeA.setDisplayed(true);
        this._minimizeA.on('click', function (eventExt) {
            this.hide();
            eventExt.stopEvent();
        },
        this);
    }
    var fobiddenFront = ['a', 'input', 'button']; //单击带领窗口到最前端
    this.el.on('click', function (evt, target) {
        var nodeName = target.nodeName.toLowerCase();
        for (var i = fobiddenFront.length - 1; i--; i >= 0) {
            if (fobiddenFront[i] == nodeName) return;
        }
        this.toFront(); //evt.stopEvent();
    },
    this);
    /**
        设置可以拖放，拖放点在标题栏
    **/
    if (Ext.dd && Ext.dd.DD && this.drag) {
        this.ddHandler = new Ext.ux.WindowLite.DD(this);
    }
    /**
      	设置阴影
      **/
    if (Ext.Shadow && this.shadow !== false) {
        this.shadowOffset = config.shadowOffset || 4;
        this.shadow = new Ext.Shadow({
            offset: this.shadowOffset,
            mode: config.shadow || 'sides'
        });
        this.el.setStyle({
            'background-image': 'none'
        });
    }
    /*
    		for ie6 iframe select relationship
			*/
    if (Ext.isIE6) {
        this.shim = this.el.createShim();
        this.shim.enableDisplayMode('block');
        this.shim.dom.style.display = 'none';
        this.shim.dom.style.visibility = 'visible';
    }
    /**
       设置按钮
    **/
    if (this.buttons && Object.prototype.toString.apply(this.buttons) == '[object Array]') {
        for (var i = 0; i < this.buttons.length; i++) {
            this.addButton(this.buttons[i], true);
        }
    } //body与container的高度差,prototype写死提高效率
    //this._offsetHeightBodyToContainer =this.el.getComputedHeight()-this.body.getComputedHeight();
    //利用 body 和 windowContainer 之间关系设置 windowContainer 宽度
    //this.offsetBodyToContainer=this.body.getOffsetsTo(this.el);  
    //性能考虑，写死掉
    this.offsetBodyToContainer = [6, 24];
    if (!this.width) { //没有上限 09-07-30
        //this.width=this.offsetWidth=this.body.getTextWidth(null,50);
        //offset 很费时间，html 很多时，请尽量设置宽度 09-08-12
        this.width = Math.max(this.body.getTextWidth(null, 0) + 25, this.header.getTextWidth(null, 0) + 30);
    } //尽量使用setStyle ,el.setWidth 很费时间 09-08-12
    this.setWidth(this.width);
    if (this.height) {
        this.setHeight(this.height);
    }
    /**
	     设置用户调节大小,动态设置css，width height
	   **/
    if (Ext.Resizable && this.resizable) {
        var that = this;
        this.resizer = new Ext.Resizable(this.el.id, {
            handles: 'all',
            transparent: true,
            pinned: true
        }); //ie6 height:100% bug
        if (Ext.isIE6) {
            this.resizer.syncHandleHeight();
        }
        this.resizer.on("resize", this.resizeAction, this); //this.resizer.on("beforeresize", this.beforeResize,this);
    }
    /**
      设置遮罩层，绝对定位，
     **/
    if (this.modal) {
        this.mask = Ext.getBody().createChild({
            cls: "ext-el-mask"
        },
        this.el.dom);
        this.mask.enableDisplayMode("block");
        this.mask.hide();
        this.mask.on('click', this.focus, this);
    } //修正extjs中点击窗体ie系列失去焦点问题，但是多窗体会出问题
    //改做单击窗口搞在最前端
    //this.el.on('click',this.focus,this);
    //效率问题，改做初始化直接设置style
    //this.el.hide();
    Ext.EventManager.onWindowResize(this.onResize, this); //this._FrameWidthLR=this.body.getFrameWidth("lr");
    //this._FrameWidthTB=this.body.getFrameWidth("tb");
    //为了效率，prototype写死
    /*
        建造任务栏，如果你想要的话
    */
    if (this.taskbar && !Ext.ux.WindowLite.TaskBar.registerTaskBar) {
        Ext.ux.WindowLite.TaskBar.enable();
    }
    this.taskbar && Ext.ux.WindowLite.TaskBar.registerTaskBar(this);
};
Ext.extend(Ext.ux.WindowLite, Ext.util.Observable, {
    _FrameWidthLR: 2,
    _FrameWidthTB: 2,
    //带工具条body与container的高度差
    _offsetHeightBodyToContainerWithButton: 0,
    //不带工具条body与container的高度差
    _offsetHeightBodyToContainer: 0,
    closable: true,
    _getOffsetHeightBodyToContainer: function () {
        if (this.bottom.hasClass('nobutton')) {
            if (!this._offsetHeightBodyToContainer) {
                this._offsetHeightBodyToContainer = this.el.getComputedHeight() - this.body.getComputedHeight();
            }
            return this._offsetHeightBodyToContainer;
        }
        if (!this._offsetHeightBodyToContainerWithButton) {
            this._offsetHeightBodyToContainerWithButton = this.el.getComputedHeight() - this.body.getComputedHeight();
        }
        return this._offsetHeightBodyToContainerWithButton;
    },
    //带领窗口到所有已有窗口的最前端		
    toFront: function () {
        if (this.el.getStyle('z-index') < Ext.ux.WindowLite.ZIndex) {
            this.el.setStyle({
                'z-index': ++Ext.ux.WindowLite.ZIndex
            });
        }
        this.fireEvent("show");
    },
    setTitle: function (str) {
        this.title.update(str);
    },
    onResize: function () {
        if (!this.el.isVisible()) return; //mask 重新最大
        if (this.modal) {
            this.mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
        } //maxmize 重新最大化
        if (this._restoreA.isDisplayed()) {
            this.fitViewport();
            return;
        }
    },
    /*
			用于anim效果
		*/
    getProxy: function () {
        if (!this.proxy) {
            this.proxy = this.el.createProxy('x-window-proxy');
            this.proxy.enableDisplayMode('block');
        }
        return this.proxy;
    },
    focus: function () {
        if (this.defaultButton) {
            this.focusButton.defer(10, this, [this.defaultButton]);
        } else {
            this._closebarA.focus.defer(10, this._closebarA);
        }
    },
    /*
			阴影与窗体大小同步
			ie6 shim included
		*/
    syncShadow: function () {
    		//顺便更新下resizer的ie6问题
    		if (Ext.isIE6 && this.resizer) {
            this.resizer.syncHandleHeight();
            this.el.repaint();
        }
        var sw = this.shadow;
        var sh = this.shim;
        if (this.el.isVisible() && sw && !this._restoreA.isDisplayed()) { //防止其关联的 windowContainer z-index 改变了 
            sw.show(this.el);
        } else if (sw) {
            sw.hide();
        } //ie6 iframe
        if (sh) {
            if (this.el.isVisible()) {
                var elSize = this.el.getSize();
                var w = elSize.width,
                h = elSize.height;
                var l = this.el.getLeft(true),
                t = this.el.getTop(true);
                sh.setStyle('z-index', parseInt(this.el.getStyle("z-index"), 10) - 2);
                sh.show();
                if (sw && sw.isVisible()) {
                    var a = sw.adjusts;
                    sh.setStyle({
                        left: (Math.min(l, l + a.l)) + "px",
                        top: (Math.min(t, t + a.t)) + "px",
                        width: (w + a.w) + "px",
                        height: (h + a.h) + "px"
                    });
                } else { //最大化 iframe 全屏时 iframe 小点
                    if (this._restoreA.isDisplayed()) {
                        w -= 5;
                        h -= 5;
                    }
                    sh.setSize(w, h);
                    sh.setLeftTop(l, t);
                }
            } else {
                sh.hide();
            }
        }
    },
    autoHeight: function () {
        this.body.setStyle({
            height: 'auto'
        });
    },
    //body size change then window size change
    //注意：先更新宽度，再更新高度,(高度不用指定死了，由儿子决定)
    //性能考虑，又可以不用更新shadow 09-08-12
    updateWindowSize: function (noShadow) {
        this.el.setStyle({
            'width': (parseInt(this.body.getStyle("width")) + this._FrameWidthLR + this.offsetBodyToContainer[0] * 2) + "px"
        }); //windowContainer 永远是自动高度的，只有body可能固定高度,而resizer会把window设高度，这里强制取消
        this.el.setStyle({
            height: 'auto'
        });
        if (!noShadow) this.syncShadow();
    },
    addButton: function (config, noShadow) { //第一次高度变化，其他就不需要了
        var first = false;
        if (this.bottom.hasClass('nobutton')) {
            first = true;
            this.bottom.removeClass('nobutton');
        }
        var b = Ext.DomHelper.append(this.bottom, {
            tag: 'input',
            style: 'margin:5px;',
            type: 'button',
            value: config.text
        },
        true);
        b.on('click', config.handler, config.scope || this);
        if (first) {
            if (!noShadow) this.syncShadow();
        }
    },
    removeButton: function (text) {
        var b = this.bottom.select("[value='" + text + "']").item(0);
        if (b) {
            b.removeAllListeners();
            b.remove();
        }
    },
    removeAllButtons: function () {
        var bs = this.bottom.select("[type='button']");
        bs.removeAllListeners();
        bs.remove();
        this.bottom.addClass('nobutton');
        this.syncShadow(); //底边拖放条没了
        if (Ext.isIE6) {
            this.el.repaint();
        }
    },
    focusButton: function (text) {
        var b = this.bottom.select("[value='" + text + "']").item(0);
        if (b) {
            b.focus();
        }
    },
    /*
		*正中显示,动画效果起始animateTarget
		*/
    show: function (option) { //显示遮罩层，body内的select,等隐藏掉，防止遮罩层,大小设为屏幕大小.
        if (typeof option == 'string') option = {
            animateTarget: option
        };
        option = option || {};
        var animateTarget = option.animateTarget;
        if (this.el.isVisible()) {
            this.toFront();
            return;
        }
        if (this.modal) {
            Ext.getBody().addClass("x-masked");
            this.mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
            this.mask.setStyle('z-index', ++Ext.ux.WindowLite.ZIndex);
            this.mask.show();
        } //设定taskbar了！
        if (!animateTarget && this.animateTarget) {
            option.animateTarget = animateTarget = this.animateTarget;
        }
        this.el.setStyle('z-index', ++Ext.ux.WindowLite.ZIndex); //直接设置位置
        if (option.x && option.y) { //指定位置弹出不能超过视窗(即使浏览器有滚动条)，参考windows右键弹出窗口
            //保证四个角有一个角在x，y，获取最大可能的windowlite显示区域
            if (option.constrainToView) {
                var viewSize = Ext.getDoc().getViewSize();
                var middleHeightLine = viewSize.height / 2;
                var middleWidthLine = viewSize.width / 2;
                var winScroll = Ext.getDoc().getScroll(); //如果 x在横坐标中线右边，移动到中线左边，可获得更大的显示位置
                if (option.x - winScroll.left > middleWidthLine) {
                    var originalX = option.x;
                    var width = parseInt(this.el.getStyle("width"));
                    option.x = option.x - width;
                    if (option.x < (10 + winScroll.left)) {
                        option.x = 10 + winScroll.left;
                        width = originalX - option.x;
                        this.setWidth(width);
                    }
                } //如果 y在纵坐标中线下边，移动到中线上边，可获得更大的显示位置
                if (option.y - winScroll.top > middleHeightLine) {
                    var originalY = option.y;
                    var height = this.getHeight();
                    option.y = option.y - height;
                    if (option.y < (10 + winScroll.top)) {
                        option.y = 10 + winScroll.top;
                        height = originalY - option.y;
                        this.setHeight(height);
                    }
                }
            }
            this.restorePosition = [option.x, option.y];
        }
        if (this.restorePosition) {
            this.el.setXY(this.restorePosition);
        } else {
            this.el.center();
        }
        if (animateTarget) {
            this.animateTarget = animateTarget;
            animateTarget = Ext.get(animateTarget);
            var proxy = this.getProxy();
            proxy.setStyle('z-index', Ext.ux.WindowLite.ZIndex);
            proxy.show();
            proxy.setBox(animateTarget.getBox());
            proxy.setOpacity(0);
            var b = this.el.getBox(false);
            b.callback = this.afterShow.createDelegate(this, [option]);
            b.scope = this;
            b.duration = option.duration || .25;
            b.easing = 'easeNone';
            b.opacity = option.opacity || .5;
            b.block = true;
            this.el.hide();
            proxy.shift(b);
        } else {
            this.afterShow(option);
        }
    },
    /*
			根据当前位置，调整windowlite大小，使得windowlite不超过当前浏览器窗口的可见区域.
		*/
    constrainToView: function () {
        var viewSize = Ext.getDoc().getViewSize();
        var width = parseInt(this.el.getStyle("width")); //提高效率，尽量用css属性
        var height = this.getHeight();
        var winScroll = Ext.getDoc().getScroll();
        var elX = this.el.getX();
        var elY = this.el.getY(); //本身已经在屏幕以外，大小无论如何调整都不行了
        var scrollWidth = document.documentElement.scrollWidth || document.body.scrollWidth;
        var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        if (elX < viewSize.width) {
            var diffW = Math.max(width + this.el.getX() - viewSize.width - winScroll.left, 0);
            if (diffW > 0) { //浏览器窗口出现了滚动条,width要多剪裁，firefox滚动条占地方
                if (scrollHeight > viewSize.height) {
                    diffW += 15;
                }
                width = width - diffW - 10;
            }
            if (diffW > 0) this.setWidth(width);
        }
        if (elY < viewSize.height) {
            var diffH = Math.max(height + this.el.getY() - viewSize.height - winScroll.top, 0); //出现在边缘，需要width剪裁
            if (diffH > 0) {
                if (scrollWidth > viewSize.width) {
                    diffH += 15;
                }
                height = height - diffH - 10;
            }
            if (diffH > 0) this.setHeight(height);
        }
        if (!this._restoreA.isDisplayed()) {
            this.syncShadow();
        }
    },
    constrainHeight: function (shadow) {
        if ((this.minHeight || this.maxHeight) && !this.height) {
            this.body.setStyle({
                height: 'auto'
            });
            var currentHeight = this.body.getComputedHeight();
            var change = false;
            if (this.minHeight && currentHeight < this.minHeight) {
                this.body.setHeight(this.minHeight);
                change = true;
            }
            if (this.maxHeight && currentHeight > this.maxHeight) {
                this.body.setHeight(this.maxHeight);
                change = true;
            }
            if (change && shadow !== false) this.syncShadow();
        }
    },
    afterShow: function (option) {
        option = option || {};
        if (option.animateTarget) this.getProxy().hide();
        var winScroll = Ext.getDoc().getScroll();
        if (this.el.getY() <= (10 + winScroll.top)) {
            this.el.setY(10 + winScroll.top);
        } //09-09-14 不要超出窗口所边界
        if (this.el.getX() <= (10 + winScroll.left)) {
            this.el.setX(10 + winScroll.left);
        }
        this.constrainHeight(false);
        this.el.setStyle({
            'visibility': 'visible'
        });
        if (option.constrainToView) {
            this.constrainToView();
        } else {
            if (!this._restoreA.isDisplayed()) this.syncShadow();
        }
        this.focus();
        this.fireEvent("show", this);
    },
    /*
		*隐藏窗体           
		*/
    hide: function () {
        if (this.fireEvent("beforehide", this) !== false) {
            if (this._restoreA.isDisplayed()) {
                this.restore();
            }
            this.restorePosition = this.el.getXY();
            this.el.setLeftTop(-99999, -99999);
            this.el.hide();
            this.syncShadow();
            if (this.animateTarget) {
                var animateTarget = Ext.get(this.animateTarget);
                var proxy = this.getProxy();
                proxy.setOpacity(.5);
                proxy.show();
                var tb = this.el.getBox(false);
                proxy.setBox(tb);
                var b = animateTarget.getBox();
                b.callback = this.afterHide;
                b.scope = this;
                b.duration = .25;
                b.easing = 'easeNone';
                b.block = true;
                b.opacity = 0;
                proxy.shift(b);
            } else {
                this.afterHide();
            }
        }
    },
    close: function () {
        if (this._restoreA.isDisplayed()) {
            this.restore();
        }
        if (this.fireEvent("beforeclose", this) !== false) {
            this.fireEvent("close", this);
            this.destroy();
        }
    },
    /*
			销毁窗体,destroy
		*/
    destroy: function () {
        Ext.EventManager.removeResizeListener(this.onResize, this);
        this.removeAllButtons();
        Ext.destroy(this.title, this._closebarA, this._maximizeA, this._minimizeA, this._restoreA, this._tools, this._toolsSection, this.header, this.body, this.bottom, this.main, this.resizer, this.mask, this.proxy, this.ddHandler, this.shim, this.animateTarget, this.el);
        if (this.shadow) this.shadow.hide();
        this.purgeListeners();
    },
    afterHide: function () {
        this.getProxy().hide(); //隐藏遮罩层
        if (this.modal) {
            this.mask.hide();
            Ext.getBody().removeClass("x-masked");
        }
        this.fireEvent("hide", this);
    },
    /**
			设置一个简易的代理窗口，隐藏掉原来的复杂窗口
		**/
    ghost: function () {
        var el = document.createElement('div');
        el.className = 'x-panel-ghost';
        el.style.opacity = '.65';
        el.style['filter'] = 'alpha(opacity=65)';
        if (this.header) {
            el.appendChild(this.el.dom.firstChild.cloneNode(true));
        }
        Ext.fly(el.appendChild(document.createElement('ul'))).setHeight(this.el.getComputedHeight() - this.header.getComputedHeight());
        el.style.width = this.el.getComputedWidth() + 'px';
        Ext.getBody().appendChild(el);
        var ghost = Ext.get(el);
        this.el.hide();
        this.syncShadow();
        var xy = this.el.getXY();
        ghost.setLeftTop(xy[0], xy[1]);
        this.activeGhost = ghost;
        return ghost;
    },
    /**
			删掉简易的代理窗口，恢复原来的复杂窗口
		**/
    unghost: function () {
        this.el.show();
        this.el.setXY(this.activeGhost.getXY());
        this.syncShadow();
        this.activeGhost.hide();
        this.activeGhost.remove();
        delete this.activeGhost;
        this.focus();
    },
    /*
		  缩放处理
		*/
    resizeAction: function (this_, width, height, e) {
        this.setSize(width, height);
        this.el.setStyle({
            height: 'auto'
        }); //ie6 height100% no effect!!
        if (Ext.isIE6) {
            this.resizer.syncHandleHeight();
            this.el.repaint();
        }
    },
    /*
			最大化处理
		*/
    maximize: function () {
        this.restorePosition = [this.el.getLeft(true), this.el.getTop(true)];
        this.restoreSize = this.el.getSize(); //Ext.getBody().maximizeWinlite=Ext.getBody().maximizeWinlite||0;
        //Ext.getBody().maximizeWinlite++;
        //Ext.getBody().addClass("x-window-maximized-ct");
        var scrolls = Ext.getDoc().getScroll();
        this.el.setXY([scrolls.left, scrolls.top]);
        this.fitViewport();
        if (this.ddHandler) {
            this.ddHandler.lock();
            this.header.setStyle({
                cursor: 'default'
            });
        }
        this._maximizeA.setDisplayed("none");
        this._restoreA.setDisplayed(true);
        this.syncShadow();
        this.toFront();
    },
    fitViewport: function () {
        var maxView = Ext.getDoc().getViewSize(); //firefox 滚动条也占据 viewwidth .....
        if (Ext.isGecko3 && !this.modal) {
            var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            var scrollWidth = document.documentElement.scrollWidth || document.body.scrollWidth; //4 magic number,滚动条使viewSize减少
            if (scrollHeight > maxView.height + 4) {
                maxView.width -= 20;
            }
            if (scrollWidth > maxView.width + 4) {
                maxView.height -= 20;
            }
        }
        this.setSize(maxView.width, maxView.height);
    },
    setSize: function (width, height) {
        this.setWidth(width);
        this.setHeight(height);
        this.syncShadow();
    },
    setWidth: function (width) {
        this.body.setStyle({
            width: width - this.offsetBodyToContainer[0] * 2 - this._FrameWidthLR + 'px'
        });
        this.el.setStyle({
            width: width + 'px'
        });
        this.syncShadow();
    },
    setHeight: function (height) {
        this.body.setStyle({
            height: height - this._getOffsetHeightBodyToContainer() - this._FrameWidthTB + 'px'
        });
        this.el.setStyle({
            height: 'auto'
        });
        this.syncShadow();
    },
    getHeight: function () {
        var height = parseInt(this.body.getStyle("height"));
        if (!height) return this.el.getComputedHeight();
        return height + this._getOffsetHeightBodyToContainer() + this._FrameWidthTB;
    },
    /*
			还原窗口
		*/
    restore: function () { //Ext.getBody().maximizeWinlite=Ext.getBody().maximizeWinlite||0;
        //Ext.getBody().maximizeWinlite--;
        //多个窗口最大化，互相干扰，没有窗口最大化时才完全去除
        //if(Ext.getBody().maximizeWinlite==0)
        //	Ext.getBody().removeClass("x-window-maximized-ct");
        this.el.setLeftTop(this.restorePosition[0], this.restorePosition[1]);
        if (this.ddHandler) {
            this.ddHandler.unlock();
            this.header.setStyle({
                cursor: 'move'
            });
        }
        this._maximizeA.setDisplayed(true);
        this._restoreA.setDisplayed("none");
        this.setSize(this.restoreSize.width, this.restoreSize.height);
    }
});
if (Ext.dd && Ext.dd.DD) {
    Ext.ux.WindowLite.DD = function (win) {
        this.win = win;
        Ext.ux.WindowLite.DD.superclass.constructor.call(this, win.el.id, 'WindowDD-' + win.el.id);
        this.setHandleElId(win.header.id);
        win.header.setStyle({
            cursor: 'move'
        });
        this.scroll = false;
    };
    Ext.extend(Ext.ux.WindowLite.DD, Ext.dd.DD, {
        moveOnly: true,
        headerOffsets: [100, 25],
        startDrag: function () {
            var win = this.win;
            this.proxy = win.ghost(); //iframe 拖动时也要跟着
            if (win.shim) {
                var w = this.proxy.getWidth(),
                h = this.proxy.getHeight();
                var l = this.proxy.getLeft(true),
                t = this.proxy.getTop(true);
                win.shim.show();
                win.shim.setSize(w, h);
                win.shim.setLeftTop(l, t);
            }
        },
        b4Drag: Ext.emptyFn,
        onDrag: function (e) {
            if (e.getPageY() > 10) this.alignElWithMouse(this.proxy, e.getPageX(), e.getPageY());
            if (this.win.shim & e.getPageY() > 10) {
                this.alignElWithMouse(this.win.shim, e.getPageX(), e.getPageY());
            }
        },
        endDrag: function (e) {
            this.win.unghost();
        }
    });
}
Ext.ux.WindowLite.ZIndex = 10000;
Ext.ux.WindowLite.TaskBar = function () {
    function closeTask(win) {
        Ext.destroy(taskBarBtns[win.id]);
        taskBarBtns[win.id] = null;
        delete taskBarBtns[win.id];
    }
    /*
        左右滚动标志控制
    */
    function scrollTaskCheck() {
        var viewSize = Ext.getDoc().getViewSize();
        if (Ext.isIE6) scrollTaskContainer.setWidth(viewSize.width - 36); //直接页面展示位置比较，不需要考虑滚动多少
        var scrollWidth = scrollTaskEdge.getOffsetsTo(scrollTaskContainer)[0];
        if (scrollTaskContainer.dom.scrollLeft > 0) {
            scrollTaskLeft.show();
        } else {
            scrollTaskLeft.hide();
        }
        if (scrollWidth > scrollTaskContainer.getComputedWidth()) {
            scrollTaskRight.show();
        } else {
            scrollTaskRight.hide();
        }
        scrollTaskLeft.dom.title = "total " + currentTaskBtnStack.length + " windows";
        scrollTaskRight.dom.title = "total " + currentTaskBtnStack.length + " windows";
    }

    function scrollTaskRightAction() {
        var scrollWidth = scrollTaskEdge.getOffsetsTo(scrollTaskContainer)[0];
        var diff = Math.min(scrollWidth - scrollTaskContainer.getComputedWidth(), 150);
        scrollTaskContainer.scroll("l", diff, {
            duration: 0.5,
            callback: scrollTaskCheck
        });
    };

    function scrollTaskLeftAction() {
        scrollTaskContainer.scroll("r", 150, {
            duration: 0.5,
            callback: scrollTaskCheck
        });
    }
    /*
        task menu status change according to windows
    */
    function taskBtnStatus(win, show, close) {
        var taskBarBtn = taskBarBtns[win.id]; //如果以前加过这个window task menu
        var bIndex = currentTaskBtnStack.indexOf(taskBarBtn);
        if (bIndex != -1) {
            var del = currentTaskBtnStack.splice(bIndex, 1);
            if (del[0] && close) {
                Ext.destroy(del[0]);
                closeTask(win);
            }
        }
        if (show) {
            if (currentTaskBtnStack.length != 0) {
                currentTaskBtnStack[currentTaskBtnStack.length - 1].el.removeClass("x-btn-active3");
            }
            taskBarBtn.el.addClass("x-btn-active3");
            currentTaskBtnStack.push(taskBarBtn);
        } else {
            if (!close) taskBarBtn.el.removeClass("x-btn-active3");
            if (currentTaskBtnStack.length != 0) {
                currentTaskBtnStack[currentTaskBtnStack.length - 1].el.addClass("x-btn-active3");
            }
        }
        if (currentTaskBtnStack.length != 0) {
            autoScroll(currentTaskBtnStack[currentTaskBtnStack.length - 1]);
        }
    }
    /*
        增加或删除 taskbar，指定btn自动滚到合适位置
    */
    function autoScroll(btn) {
        var scrollWidth = Ext.fly(btn.el.parent("li", true)).getOffsetsTo(scrollTaskContainer)[0];
        var diff = scrollWidth - scrollTaskContainer.getComputedWidth(); //注意diff 是 btn 左边界和 container 右边界的距离差        
        diff += Ext.fly(btn.el.parent("li", true)).getComputedWidth(); //把当前元素右边界和最右边靠其，如果scrollLeft已经为0 则没有办法了，原地不动
        var toValue = Math.max(diff + scrollTaskContainer.dom.scrollLeft, 0);
        scrollTaskContainer.scrollTo("left", toValue, {
            duration: 0.5,
            callback: scrollTaskCheck
        });
    }

    function taskBtnClick(win) {
        var taskBarBtn = taskBarBtns[win.id];
        if (taskBarBtn.el.hasClass("x-btn-active3")) {
            win.hide();
        } else {
            win.show();
        }
    }
    /*
        create task menu for this window
    */
    function registerTaskBar(win) {
        if (taskBarBtns[win.id]) {
            return;
        }
        var li = Ext.DomHelper.insertBefore(scrollTaskEdge, {
            tag: 'li'
        });
        var t = win.title.dom.innerHTML;
        (t.length > 15) && (t = t.substring(0, 12) + "...");
        var b = Ext.DomHelper.append(li, {
            tag: 'button',
            'id': Ext.id(),
            title: win.title.dom.innerHTML,
            html: t
        });
        var taskBarBtn = taskBarBtns[win.id] = new Ext.ux.ButtonLite({
            id: b.id,
            version: '3'
        });
        taskBarBtn._button.on("click", taskBtnClick.createCallback(win));
        win.on("show", taskBtnStatus.createCallback(win, true));
        win.on("hide", taskBtnStatus.createCallback(win, false));
        win.on("close", taskBtnStatus.createCallback(win, false, true));
        win.animateTarget = taskBarBtn.el; //不用显式 autoscroll 了，show 事件中会的
        //autoScroll(taskBarBtn);
    }
    var re = {};
    var taskBarBtns = {}; //栈，所有正在显示的window task menu
    var currentTaskBtnStack = []; //窗口变化，也要检查task bar了
    var viewSize = Ext.getDoc().getViewSize();
    var taskbar = Ext.fly(Ext.DomHelper.append(Ext.getBody(), {
        tag: "div",
        cls: "taskWrap",
        cn: [{
            tag: 'a',
            href: "#",
            cls: "task-scroll-left"
        },
        {
            tag: 'a',
            href: "#",
            cls: "task-scroll-right"
        },
        {
            tag: 'div',
            cls: "tasksContainer",
            style: (Ext.isIE6 ? {
                width: (viewSize.width - 36) + "px"
            } : ''),
            cn: [{
                tag: "ul",
                //cls:"clearfix",
                cn: [{
                    tag: 'li'
                }]
            }]
        }]
    })).child("ul");
    var scrollTaskEdge = Ext.fly(taskbar).child("li");
    var scrollTaskContainer = Ext.fly(taskbar).parent();
    var scrollTaskRight = scrollTaskContainer.prev("a");
    var scrollTaskLeft = scrollTaskRight.prev("a");
    scrollTaskRight.on("click", scrollTaskRightAction);
    scrollTaskLeft.on("click", scrollTaskLeftAction);
    Ext.EventManager.onWindowResize(scrollTaskCheck);
    return {
        'registerTaskBar': registerTaskBar
    };
};
Ext.ux.WindowLite.TaskBar.enable = function () {
    Ext.ux.WindowLite.TaskBar = Ext.ux.WindowLite.TaskBar();
};