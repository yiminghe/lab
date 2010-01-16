/*
Form 1.2(200904221754) 加入对不同规则显示不同的出错串,优化出错视觉提醒
Form 1.5(200905062249) 加入输入框悬停提示，没有填写时出现,必须有定位的div父元素包含
Form 2.0(200905121707) 封装模块 Ext.ux.FormLite ,增加配置项
Form 2.2(200905191625) 加入验证失败覆盖层遮盖提交按钮，修改tip提醒设置方法
Form 2.3(200906021755) 错误提示修正，表单状态查询，validField增加
Form 2.4(20090803) 增加msgType 配置，结合TipLite 实现错误信息 tip显示
Form 2.4.1(20091215) 防止提示重复出现
Form 2.4.2(20100116) placeholder for webkit 采用
*/

Ext.ns('Ext.ux');
Ext.ux.FormLite = function(config) {
    config = config || {};
    config.msgType = config.msgType || 'side';
    if (!config.formId) {
        alert('FormLite error:请提供 form id !');
        return;
    }
    if (!config.id)
    	config.id = 'ID' + Ext.id() + '_';
    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    this.addEvents('invalid');
    Ext.ux.FormLite.superclass.constructor.call(this);
    this.formExt = Ext.get(this.formId);
    if (!this.formExt.select('.submit-area').item(0)) {
        //alert('FormLite error:no class submit-area for submit button');
        //return;
    }
    this.formExt.addClass('formlite');
    this._applyTips();
    this._applyFeedBack();
}


Ext.extend(Ext.ux.FormLite, Ext.util.Observable, {
    /*
			出错处理两种方式
		*/
    tip: function(el, errorStr) {
        if (errorStr) {
            Ext.ux.TipLiteManager.addTip({
                title: '注意',
                html: errorStr,
                autoHide: true,
                targetId: el
            });
        }
    },

    side: function(el, errorStr) {
        if (errorStr) {
	        el.next('span.feedback').update(errorStr);
	        el.next('span.feedback').setStyle({
	            'visibility': 'visible'
	        });
      	}
    },

    untip: function(el) {
        Ext.ux.TipLiteManager.removeTip(el);
    },
    
    unside: function(el) {
        if(el.next('span.feedback')) el.next('span.feedback').setStyle({
            'visibility': 'hidden'
        });
    },


    //手动使得复位
    validField: function(fid) {
        Ext.get(fid).dom.focus();
        Ext.get(fid).dom.blur();
    },

    //获得当前是否验证成功
    isValid: function() {
        return this.status;
    },

    //批量为类tip_input的输入框设置悬挂提示,值为它的value
    _applyTips: function() {
        var that = this;
        this.formExt.select('.tip_input').each(function(el) {
            var tip = el.dom.getAttribute("title");
            that._applyTip(el, tip);
        });
    },

    /*
		点击即隐藏的提示,为input输入框创造悬停提示
	*/
    _applyTip: function(el, tip, ignoreValue) {
        if (!tip) return;
        if(Ext.isWebKit){
        	el.dom.placeholder=tip;
    			el.dom.autosave=el.dom.id+"_save";
    			el.dom.results="10";
        	return;
        }
        var cel = Ext.get(el.dom);
        if("OK" == cel.dom.getAttribute("_formLiteTipAlready")) return;
        //alert(cel.dom.getAttribute("_formLiteTipAlready"));
        cel.dom.setAttribute("_formLiteTipAlready","OK");

        var label = Ext.DomHelper.insertBefore(cel, {
            tag: 'label',
            htmlFor: cel.id,
            cls: 'tip_input_label',
            'html': tip
        },
        true);

        var xy=cel.getXY();
        xy[0]+=8;
        xy[1]+=2;
        //label 绝对定位在 input 旁
        label.setXY(xy);

        cel.on('focus',
        function() {
            label.hide();
        });

        cel.on('blur',
        function() {
            if (!cel.getValue().trim()) label.show();
        });
				if (cel.getValue().trim()) label.hide();

    },

    /*
		表单出错处理
	*/
    _applyFeedBack: function() {

        var me = this;
        if (!this.checkFields || this.checkFields.length == 0) return;

        var that = this;

        //离开表单域 验证 ,tip显示
        for (var i = 0; i < this.checkFields.length; i++) {
            var currentEl = Ext.get(this.checkFields[i].fieldId);

            //tip显示
            if (this.checkFields[i].tip) {
                this._applyTip(currentEl, this.checkFields[i].tip);
            }



            if (me.msgType == 'side' && !currentEl.next('span.feedback')) {
                Ext.get(this.checkFields[i].fieldId).insertSibling({
                    tag: 'span',
                    cls: 'feedback'
                },
                'after');
            }

            currentEl.regs = this.checkFields[i].regs || [];
            currentEl.validator = this.checkFields[i].validator;



            currentEl.on('blur',
            function(eventExt) {
                var cuurentElOk = true;
                //当前的表单域的所有规则验证
                for (var i = 0; i < this.regs.length; i++) {
                    var reg = this.regs[i].reg;
                    if (!reg.test(this.getValue())) {
                        //反馈更新当前规则对应的出错信息
                        me[me.msgType](this, this.regs[i].info);
                        cuurentElOk = false;
                        break;
                    }
                }

                if (this.validator) {
                    var errorStr = this.validator();
                    if (errorStr) {
                        me[me.msgType](this, errorStr);
                        cuurentElOk = false;
                    }
                }


                //显示出错信息
                if (!cuurentElOk) {

                    me[me.msgType](this);
                    this.addClass('invalidInput');
                    that.fireEvent('invalid', [this]);
                    eventExt.stopEvent();

                } else {

                    this.removeClass('invalidInput');
                    me['un' + me.msgType](this);

                }


            });


        }

        //提交表单验证
        this.formExt.on('submit',
        function(eventExt) {


            var formOk = true;

            var errorFields = [];

            for (var i = 0; i < this.checkFields.length; i++) {


                var currentEl = Ext.get(this.checkFields[i].fieldId);
                var cuurentElOk = true;
                var regs = this.checkFields[i].regs || [];
                //当前的表单域的所有规则验证
                for (var ii = 0; ii < regs.length; ii++) {
                    var reg = regs[ii].reg;
                    if (!reg.test(currentEl.getValue())) {

                        //反馈更新当前规则对应的出错信息
                        me[me.msgType](currentEl, regs[ii].info);

                        cuurentElOk = false;
                        break;
                    }
                }

                if (this.checkFields[i].validator) {
                    var errorStr = this.checkFields[i].validator.apply(currentEl);
                    if (errorStr) {
                        me[me.msgType](currentEl, errorStr);
                        cuurentElOk = false;
                    }

                }


                //当前的表单域失败,则整个表单失败
                if (!cuurentElOk) {
                    formOk = false;
                    me[me.msgType](currentEl);
                    currentEl.addClass('invalidInput');
                    errorFields.push(currentEl);
                } else {
                    currentEl.removeClass('invalidInput');
                    me['un' + me.msgType](currentEl);
                }
            }

            //整个表单失败
            if (!formOk) {
                this.status = false;
                this.fireEvent('invalid', errorFields);

                //添加出错滑动提示，覆盖提交按钮	        	
                //ie6 不能正确定位，简化处理
                var submitArea = this.formExt.select('.submit-area').item(0);
                if (!submitArea || Ext.isIE6) {
                    alert("对不起，您填写的部分信息不合规范");
                } else {
                    var errorSlider = submitArea.child('.error-slider');

                    if (!errorSlider) {

                        errorSlider = Ext.DomHelper.append(submitArea, {
                            tag: 'div',
                            cls: 'error-slider',
                            cn: [{
                                tag: 'span',
                                html: '对不起，您填写的部分信息不合规范'
                            }]
                        },
                        true);
                        errorSlider.setHeight(submitArea.getComputedHeight());
                        errorSlider.setWidth(submitArea.getComputedWidth());
                    }

                    errorSlider.slideIn('t', {
                        easing: 'elasticOut',
                        duration: 1.5
                    });

                    (function() {
                        errorSlider.fadeOut({
                            endOpacity: 0,
                            easing: 'backIn',
                            duration: 0.5
                        });
                    }).defer(3000);

                }

                eventExt.stopEvent();
            } else {
                this.status = true;
            }

        },
        this);

    }
});