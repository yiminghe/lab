/*
	v1.0(20090428) 自动补全防google实现，暂时实现内存store ,待实现 远程 JsonStore
	v1.5(20090526) 借鉴extjs combobox(trigger 细节考虑) 实现其大部分功能（除去ajax），摒弃其空白图片占位做法
	v1.6(20090606) 实现ajax获取数据的 Ext.ux.AutocompleteLite.RemoteStore
	v2.0(20090811) ie6 界面调整，失去焦点处理调整，ajax次序问题调整,添加triger配置，ext-core css标记浏览器方法避免
	v2.0.1(20090903) z-index change to 99999
	v2.5(20091203) 中文输入法兼容修正，改用轮询查询输入变化,算法大幅变动,hiddenName配置取消，没有意义
*/
Ext.namespace('Ext.ux');
Ext.ux.AutocompleteLite = function(config) {
    config = config || {};
    if (!config.id) {
        alert('no textfield id');
        return;
    }
    if (!config.store || typeof config.store.getSuggestions != 'function') {
        alert('no proper config storef');
        return;
    }
    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    this.maxHeight = this.maxHeight || 9999;
    Ext.ux.AutocompleteLite.superclass.constructor.call(this);
    this.textField = Ext.get(config.id);
    this.textField.addClass('x-form-text');
    this._wrapDiv = this.textField.wrap({
        tag: 'div',
        cls: 'x-trigger-wrap'
    });

    //提示文字
    if (this.emptyText) {
        this.labelTip = Ext.DomHelper.append(this._wrapDiv, {
            tag: 'label',
            cls: 'labelTip',
            html: this.emptyText,
            'htmlFor': this.textField.id
        },
        true);
        var xy = this.textField.getXY();
        xy[0] += 5;
        xy[1] += (this.textField.getComputedHeight() - this.labelTip.getComputedHeight()) / 2;
        this.labelTip.setXY(xy);
        if (this.textField.getValue())
        this.labelTip.hide();
    }

    if (this.triger) {
        var triger = Ext.DomHelper.append(this._wrapDiv, {
            tag: 'span',
            cls: 'x-form-trigger',
            html: '&nbsp;'
        },
        true);
		//特殊，点下拉箭头全部列出来
        function showAllAndFocus(evt) {
            this._wrapDiv.addClass('x-trigger-wrap-focus');
            this.selectRange(0, this.textField.getValue().length);
            if (!this._autoCompleteDiv.isVisible()) {
                this.store.getSuggestions(this, '', config.typeahead, true);
            } else {
                this._autoCompleteDiv.hide();
            }
			this.textField.dom.focus();
            evt.stopEvent();
        }
        triger.on('click', showAllAndFocus, this);
        if (!this.editable) {
            this.textField.dom.readOnly = true;
            this.textField.dom.style.cursor = 'pointer';
            this.textField.on('click', showAllAndFocus, this);
        }
        triger.addClassOnOver('x-form-trigger-over');
        triger.addClassOnClick('x-form-trigger-click');
        this.triger = 17;
    } else {
        this.triger = 0;
    }

    //对于中文输入法，兼容性处理，采用轮询方法
    this.currentText = "";
    var checkTimer;
    var checkInterval = function() {
        var originalText = this.textField.dom.value;
        //没有变化
        if (originalText == this._getCurrent()) {
            } else {
            //只有用户输入时才查询，选择建议项不会列入历史纪录，不能会退!
            this.originalText = originalText;
            var oldCur = this.currentText;
            this.currentText = originalText;
            this.store.getSuggestions(this, originalText,
            // this.originalText.length < currentText.length 删除不用 typeahead
            originalText.length < oldCur.length ? false: this.typeahead);

        }
        checkTimer = checkInterval.defer(250, this);
    }


	//启动轮训定时器
    this.textField.on('focus',
    function() {
        this._wrapDiv.addClass('x-trigger-wrap-focus');
        if (this.labelTip) {
            this.labelTip.hide();
        }
        checkInterval.call(this);
    },
    this);
	//关闭轮训定时期
    this.textField.on('blur',
    function() {
        this._wrapDiv.removeClass('x-trigger-wrap-focus');
        if (!this.textField.getValue() && this.labelTip)
        this.labelTip.show();
        if (checkTimer) {
            clearTimeout(checkTimer);
            checkTimer = null;
        }
    },
    this);


    this._autoCompleteUl = Ext.DomHelper.append(document.body, {
        tag: 'ul',
        cls: 'x-combo-list-inner'
    },
    true);

    this._autoCompleteDiv = this._autoCompleteUl.wrap({
        tag: 'div',
        cls: 'x-combo-list'
    });

    //设为和文本框宽度相同
	var suitWidth=this.textField.getComputedWidth() + this.triger;
    this._autoCompleteDiv.setWidth(suitWidth);
    this._wrapDiv.setWidth(suitWidth);

    //键盘导航
    this.textField.on('keydown',
    function(evt) {
        if (!this._autoCompleteDiv.isVisible()) return;

        switch (evt.getKey()) {
        case 38:
            //top
            this.keyboard('t');
            break;

        case 40:
            //bottom
            this.keyboard('b');
            break;

        case 27:
            //esc
            this.hide();
            this._updateCurrent(this.originalText);
            this.textField.focus();
            break;
        case 13:
            //enter
            this.hide();
            evt.stopEvent();
            break;


        }
    },
    this);

    //鼠标掠过高亮当前提示
    this._autoCompleteUl.on('mouseover',
    function(evt) {
        var target = evt.getTarget('li');
        if (target) {
            this.highlight(target);
        }
        evt.stopEvent();
    }
    ,
    this);

    this.hide();
};

Ext.extend(Ext.ux.AutocompleteLite, Ext.util.Observable, {
    _updateCurrent: function(v) {
        this.textField.dom.value = v;
        this.currentText = v;
    },
    _getCurrent: function() {
        return this.currentText;
    },
    //失去焦点隐藏
    docMouseDown: function(evt, t) {
        //提示框滚动条点击,提示点击只隐藏提示
        if (!this._autoCompleteDiv.isVisible() || t.id == this.textField.id || t.id == this._autoCompleteDiv.id) return;
        this.hide();
        if (evt && (evt.within(this._autoCompleteDiv) || t.id == this._autoCompleteDiv.id)) return;
        //否则状态更新
        this._wrapDiv.removeClass('x-trigger-wrap-focus');
        //store its value according to label
        //提示文字
        if (!this.textField.getValue() && this.labelTip) {
            this.labelTip.show();
        }
    },

    //提示框出现,监听文档点击
    show: function() {
        this._autoCompleteDiv.setStyle({
            height: "auto"
        });
		//是否出现滚动条
        if (this._autoCompleteUl.getComputedHeight() > this.maxHeight) {
            this._autoCompleteDiv.setHeight(this.maxHeight);
        }
        Ext.getDoc().on("mousedown", this.docMouseDown, this);
        //设定文本框下面显示
        var textFieldXy = this.textField.getXY();
        textFieldXy[1] += this.textField.getComputedHeight();
        this._autoCompleteDiv.setXY(textFieldXy);
        this._autoCompleteDiv.show();
    },

    //提示框隐藏,注销监听文档点击
    hide: function() {
        Ext.getDoc().un("mousedown", this.docMouseDown, this);
        this._autoCompleteDiv.hide();

    },

    //设置提示列表，由ajax callback 函数调用
    autoComplete: function(suggestions, ahead, query, autoComplete) {
        //上次结果清空
        this._autoCompleteUl.update('');
        //重要，如果次序乱了，要看回调函数的query是否就是当前的query
        if (query != this.textField.getValue() && !autoComplete) {
            return;
        }
        //初始不在任何
        this.curLi = -1;
        //无提示信息 直接隐藏
        if (suggestions.length <= 0) {
            this.hide();
            return;
        }
        var lis = [];
        for (var i = 0; i < suggestions.length; i++) {
            lis.push({
                tag: 'li',
                html: suggestions[i].label,
                'value': suggestions[i].value
            });
        }
        Ext.DomHelper.append(this._autoCompleteUl, lis);
        if (ahead) this.typeAhead(suggestions[0]);
        this.show();
    },

    //补全文本框
    typeAhead: function(suggestion) {
        if (this.textField.getValue().length >= suggestion.label.length) return;
        if (this.textField.dom.createTextRange || this.textField.dom.setSelectionRange) {
            var ilen = this.textField.getValue().length;
            //同步更新currentText防止定时检测使得typeahead也发请求
            this._updateCurrent(suggestion.label);
            this.selectRange(ilen, suggestion.label.length);

        }
    },

    selectRange: function(start, end) {
        if (this.textField.dom.createTextRange) {
            var range = this.textField.dom.createTextRange();
            range.moveStart('character', start);
            range.moveEnd('character', end - this.textField.getValue().length);
            range.select();
        } else {
            this.textField.dom.setSelectionRange(start, end);
        }
        this.textField.focus();
    },

    //高亮当前列表项
    highlight: function(suggestionLi) {
        var that = this;
        this._autoCompleteUl.select('li').each(function(el, this_, index) {
            if (el.dom == suggestionLi) {
                el.addClass('x-combo-selected');
                that.curLi = index;
            }
            else el.removeClass('x-combo-selected');
        });
        //高亮同时更新textfield,cacheCurrent防止重复查询
        ////同步更新currentText防止定时检测使得typeahead也发请求
        this._updateCurrent(suggestionLi.innerHTML);
    },

    keyboard: function(direction) {
        var childs = this._autoCompleteUl.select('li');
        if (childs.getCount() <= 0) return;
        var li = null;
        if (direction == 't' && this.curLi > 0) li = childs.item(--this.curLi).dom;
        else if (direction == 'b' && this.curLi < childs.getCount() - 1) li = childs.item(++this.curLi).dom;
        //自动头尾循环	
        else if (direction == 't') {
            this.curLi = childs.getCount() - 1;
            li = childs.item(this.curLi).dom;
        }
        else if (direction == 'b') {
            this.curLi = 0;
            li = childs.item(this.curLi).dom;
        }
        //自动赋值高亮
        if (li) {
            //父窗口自动滚
            Ext.fly(li).scrollIntoView(this._autoCompleteDiv);
            this.highlight(li);

        }
    }

});


/*
	一个示例使用内存数据
*/
Ext.ux.AutocompleteLite.MemeryStore = function(config) {
    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    Ext.ux.AutocompleteLite.MemeryStore.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.AutocompleteLite.MemeryStore, Ext.util.Observable, {

    getSuggestions: function(autocompleteLite, query, ahead, allowEmpty) {
        var x = [];
        for (var i = 0; i < this.data.length; i++) {
            if ((allowEmpty && query.trim().length == 0) || this.data[i].label.indexOf(query) != -1) {
                x.push(this.data[i]);
            }
        }
        autocompleteLite.autoComplete(x, ahead, query, allowEmpty);
    }

});

/*
	一个示例，使用ajax获取数据
*/
Ext.ux.AutocompleteLite.RemoteStore = function(config) {
    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    Ext.ux.AutocompleteLite.RemoteStore.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.AutocompleteLite.RemoteStore, Ext.util.Observable, {

    getSuggestions: function(autocompleteLite, query, ahead, allowEmpty) {
        if ((allowEmpty && query.trim().length == 0) || query.trim().length) {

            Ext.Ajax.request({
                url: this.url,
                success: function(response) {
                    var returnData = {};
                    try {
                        returnData = Ext.util.JSON.decode(response.responseText);
                    } catch(e) {

                        }
                    if (returnData && returnData.data)
                    autocompleteLite.autoComplete(returnData.data, ahead, query, allowEmpty);
                    else {
                        alert(response.responseText.trim());
                    }
                },
                failure: function(response) {
                    alert('对不起 ： ' + response.statusText);
                },
                headers: {
                    'useAjax': 'true'
                },
                params: {
                    query: query
                },
                scope: this
            });

        } else {

            autocompleteLite.autoComplete([], ahead, query, allowEmpty);
        }
    }

});