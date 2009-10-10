/**
author : yiminghe

version : v4(20090326) 创建项目,原型完成
v4.1(20090326) fix ie7 clear bug 
v4.2(20090328) use display mode to avoid scrollbar
v4.2.5(20090328) modal show and disable level1 selection
v4.3(20090328) level2 show change , level2 and level3 can't be selected simultaneously
v4.5(20090328) 增加将level3弹出框限制在树控件中，提高效率(level3弹出框需要时才创建) 
v5.0(20090329) 界面进行革新优化，支持拖放
v5.1(20090330) 在li上支持点击，单选支持（没有弹出提示框，直接替换）,支持第三级菜单拖放,已选择框和树节点框通过相同后缀id联系 
v5.2(20090407) 修改 css html 支持 w3c css2.1 ,修改id生成，可以多颗重复数据树生成
v5.3(20090417) 清理浮动css xhtml整理
v5.5(20090422) 大幅度清除无用生成标签(span div),增加取消回调,已选择部分压缩空间,
v5.6(20090423) 采用ext事件处理机制，抽象出window
v6.0(20090427) 与windowlite 结合，支持拖放，调节大小
v6.5(20090514) javascript 大部分重写,两层区域树结构一次生成添加到DOM，采用事件委托，只设置三组事件处理函数，两层区域，弹出菜单区域，选择区域。
v6.6(20090518) 利用ext的css selector功能修复（6.5之前功能） 选择个数限制，二级三级菜单项不能同时选择，即全部和底下的菜单不能同时选中。
v6.7(20090525) 修复ie7，8显示细节问题,已选择移到下面和按钮临近
v7.0(20090919) 整合windowlite 2.9.8
v7.1(20091009) 界面优化大幅变动，增加操作方便（二级框选择，取消叉与阴影）

Any problem contact hym_sunrise@126.com
**/
Ext.namespace('Ext.ux');
Ext.ux.MultiTree = function(config) {
    //注入初始参数
    if (!config.id) config.id = 'ID' + Ext.id() + '_';
    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    this.addEvents('ok', 'cancel');
    Ext.ux.MultiTree.superclass.constructor.call(this);
    //树形容器
    config.buttons = [{
        text: '取消',
        handler: function() {
            if (this.fireEvent("cancel", this) !== false) this.hide();
        },
        scope: this
    },
    {
        text: '确定选择',
        handler: function() {
            this.fireEvent("ok", this);
        },
        scope: this
    }];
    //设置了窗口大小以及button，
    //后面只要将树添加到 window body中即可
    this.multiTreeWin = new Ext.ux.WindowLite(config);
    //调用构造函数
    this.multiTreeWin.body.dom.innerHTML = "";
    this.create(this.data);
}
Ext.extend(Ext.ux.MultiTree, Ext.util.Observable, {
    /*
    	   *正中显示
    	   */
    show: function() {
        this.multiTreeWin.show();
    },
    /*
         *隐藏树状窗体           
         */
    hide: function() {
        this.multiTreeWin.hide();
    },
    initialSelectNodes: function(keys, selectNodesLis) {
        keys = keys || [];
        var selectedInfos = [];
        var numberReg = /\d+/;
        this.gatherInfoByKey(keys, selectedInfos, this.data);
        for (var i = 0; i < keys.length; i++) {
            if (!numberReg.test((keys[i]))) {
                selectedInfos.push({
                    key: keys[i],
                    label: keys[i]
                });
            }
        }
        for (var i = 0; i < selectedInfos.length; i++) {
            var sInfo = this.createSelectNode(selectedInfos[i]);
            if (sInfo) {
                selectNodesLis.push(sInfo);
            }
            this.createSelectNode(selectedInfos[i], selectNodesLis);
        }
    },
    createSelectNode: function(info) {
        if (!info.key || !String(info.key).trim()) return;
        var selectNodesLi = {
            tag: 'li',
            key: info.key,
            id: this.id + 'selectNodes_' + info.key,
            label: info.label,
            cn: [{
                tag: 'a',
                cls: 'x-tool x-tool-close',
                href: "#",
                style: "float:left;margin-right:5px;"
            },
            {
                tag: 'a',
                href: "#",
                cls: 'selectedItem',
                html: info.label
            }]
        };
        return selectNodesLi;
    },
    addSelectNodeInstantly: function(info) {
        var sInfo = this.createSelectNode(info);
        if (sInfo) Ext.DomHelper.append(this.selectedNodesUl, sInfo);
    },
    removeSelectNodeInstantly: function(info) {
        this.selectedNodes.remove(info.key);
        if (Ext.fly(this.id + 'selectNodes_' + info.key)) Ext.fly(this.id + 'selectNodes_' + info.key).remove();
        if (Ext.get(this.id + 'dataNodes_' + info.key)) Ext.get(this.id + 'dataNodes_' + info.key).dom.checked = false;
    },
    /**
				 *移除所有的 已选择节点
				 */
    removeAllSelectNodes: function() {
        var keys = this.getSelectKeys();
        for (var i = 0; i < keys.length; i++) this.removeSelectNodeInstantly({
            key: keys[i]
        });
    },
    /*
         *得到所有选择的主键对象集合 
         *@return Array of Keys 
         *
         */
    getSelectKeys: function() {
        if (!this.selectedNodesUl) return [];
        var selects = [];
        var selects_nodes = this.selectedNodesUl.dom.childNodes;
        for (var i = 0; i < selects_nodes.length; i++) if (selects_nodes[i].getAttribute('key')) selects.push(selects_nodes[i].getAttribute('key'));
        return selects;
    },
    _getSelectMap: function() {
        var arr = this.getSelectKeys();
        var map = {};
        for (var i = arr.length - 1; i >= 0; i--) {
            map[arr[i]] = true;
        }
        return map;
    },
    /*
         *建立第一层 ul
         *@params info 节点对象
         *@return 
         */
    createDataUl: function(info, dataUls) {
        var dataUl = {
            tag: 'ul',
            cls: 'clearfix topSeperator',
            cn: []
        };
        this.createDataLi({
            key: info.key,
            label: info.label
        },
        true, dataUl.cn);
        if (info.children) {
            for (var i = 0; i < info.children.length; i++) {
                this.createDataLi(info.children[i], false, dataUl.cn);
            }
        }
        dataUls.push(dataUl);
    },
    /*
*建立第一层的 li
*/
    createDataLi: function(info, level1, dataLis) {
        var dataLi = {
            tag: 'li',
            cn: [
            {
            	tag:'div',
            	style:{
            		'float':'left'
            	},
            	cn:[{
                tag: 'input',
                type: 'checkbox',
                id: this.id + 'dataNodes_' + info.key
            },
            {
                tag: 'span',
                html: info.label
            }]
          }],
            key: info.key,
            cls: 'level2',
            style: 'cursor:default;',
            label: info.label
        };
        if (level1) {
            dataLi.cls = 'level1';
            delete dataLi.cn;
            dataLi.html = info.label;
        } else if (info.children) {
        		dataLi.cn[0].style.width="120px";
        		dataLi.cn[0].style.overflow="hidden";
            dataLi.cn.unshift({
                tag: 'div',
                cls: 'x-tool x-tool-right-arrow'
            });
            dataLi.style = 'cursor:pointer;';
        } else {
            dataLi.cn[0].cn[1].tag = "label";
            dataLi.cn[0].cn[1]["for"] = this.id + 'dataNodes_' + info.key;
        }
        dataLis.push(dataLi);
    },
    /*
建立一个弹出窗口第三层 
*/
    createThirdUl: function(info) {
        var ts = [];
        this.gatherInfoByKey([info.getAttribute('key')], ts, this.data);
        //第一次创建事件选择要构钩上
        var selectedMap = this._getSelectMap();
        info = ts[0];
        if (!info) return;
        var dataNodesSubUlData = {
            tag: 'ul',
            cls: 'bottomNode clearfix',
            id: this.id + 'level3_' + info.key,
            style: 'display:none',
            cn: []
        };
        //this.createDataSubLi(info,true,dataNodesSubUlData.cn);
        if (info.children) for (var i = 0; i < info.children.length; i++) {
            dataNodesSubUlData.cn.push(this.createDataSubLi(info.children[i], selectedMap));
        }
        return Ext.DomHelper.append(this.bottomNodesContainer, dataNodesSubUlData, true);
    },
    /*
         *建立第三层弹出菜单的一个列表li ,(将第二层节点在第三层特殊显示)
         */
    createDataSubLi: function(info, selectedMap) {
        var checked = selectedMap[info.key] ? 'checked': false;
        var checkedbox = {
            tag: 'input',
            type: 'checkbox',
            id: this.id + 'dataNodes_' + info.key
        };
        if (checked) checkedbox.checked = checked;
        var dataNodesLi = {
            tag: 'li',
            label: info.label,
            key: info.key,
            cn: [checkedbox, {
                tag: 'label',
                html: info.label,
                'for': checkedbox.id
            }]
        };
        return dataNodesLi;
    },
    /*
		建立整个选择树
	*/
    create: function(config) {
        //当前弹出子菜单
        this.currentSubMenu = null;
        //两层结构当前鼠标项
        this.currentItem = null;
        //弹出菜单当前鼠标项
        this.currentSubItem = null;
        var bodyData = {
            tag: 'div',
            cls: 'mulTreeContainer',
            cn: []
        };
        var selectedNodesUlData = {
            tag: 'ul',
            cls: 'clearfix selectedNodes',
            cn: []
        };
        if (!this.selectedNodes) this.selectedNodes = [];
        this.initialSelectNodes(this.selectedNodes, selectedNodesUlData.cn);
        var dataUlSection = {
            tag: 'div',
            cls: 'dataUlSection',
            cn: []
        };
        bodyData.cn.push(dataUlSection);
        var dataUls = dataUlSection.cn;
        for (var i = 0; i < config.length; i++) this.createDataUl(config[i], dataUls);
        bodyData.cn.push({
            tag: 'h3',
            html: "提示：" + "当您选择箭头下的具体选项时，将会获得更为准确的搜索结果,您最多可以选择" + this.limit + "个选项 "
        });
        bodyData.cn.push(selectedNodesUlData);
        this.body = Ext.DomHelper.append(this.multiTreeWin.body, bodyData, true);
        this.selectedNodesUl = this.multiTreeWin.body.select('ul.selectedNodes').item(0);
        this.dataNodesUls = this.multiTreeWin.body.select('div.dataUlSection').item(0);
        this.bottomNodesContainer = Ext.DomHelper.append(document.body, {
            tag: 'div',
            cls: 'bottomNodes'
        },
        true);
        this.bottomNodesContainer.on('mouseover', this.subOnMouseOver, this);
        this.dataNodesUls.on('mouseover', this.dataOnMouseOver, this);
        this.dataNodesUls.on('click', this.dataOnClick, this);
        this.selectedNodesUl.on('click', this.selectOnClick, this);
        this.bottomNodesContainer.on('click', this.checkboxOnClick, this);
        this.multiTreeWin.on('hide',
        function() {
            if (this.currentSubMenu) this.currentSubMenu.hide();
            this.currentSubMenu = null;
        },
        this);
        /**
	      	设置阴影
	      **/
        if (Ext.Shadow && this.shadow !== false) {
            this.shadowOffset = this.shadowOffset || 4;
            this.shadow = new Ext.Shadow({
                offset: this.shadowOffset,
                mode: this.shadow || 'sides'
            });
        }
        //选上事件选上的再说
        for (var i = this.selectedNodes.length - 1; i >= 0; i--) {
            if (Ext.get(this.id + "dataNodes_" + this.selectedNodes[i])) {
                Ext.get(this.id + "dataNodes_" + this.selectedNodes[i]).dom.checked = true;
            }
        }
    },
    //选择区域项取消选择
    selectOnClick: function(eventExt) {
        var target = eventExt.getTarget();
        if (target.nodeName.toLowerCase() == 'li') return;
        var targetLi = Ext.fly(Ext.fly(target).parent("li", true));
        this.removeSelectNodeInstantly({
            label: targetLi.dom.getAttribute('label'),
            key: targetLi.dom.getAttribute('key')
        });
        eventExt.stopEvent();
    },
    //两层菜单选择，弹出三层菜单
    dataOnClick: function(eventExt) {
        var target = eventExt.getTarget();
        var targetLi;
        if (target.nodeName.toLowerCase() == 'li') targetLi = Ext.get(target);
        else targetLi = Ext.fly(target).parent("li");
        this.checkboxOnClick(eventExt);
        if (target.nodeName.toLowerCase() == 'input') return;
        if (!targetLi) return;
        var arrow = targetLi.child(".x-tool");
        if (!arrow) return;
        this.currentSubMenu = Ext.get(this.id + 'level3_' + targetLi.dom.getAttribute('key')) || this.createThirdUl(targetLi.dom);
        this.currentSubMenu.show();
        var xy = arrow.getXY();
        xy[0] += arrow.getComputedWidth() + 2;
        this.currentSubMenu.setXY(xy);
        //如果用户需要弹出框在 树控件内部
        var origianlRegion = this.currentSubMenu.getRegion();
        var containerRegion = this.multiTreeWin.body.getRegion();
        if (this.initialConfig.constrain) {
            if (!containerRegion.contains(origianlRegion)) {
                //调整 弹出框 使其在 树控件内部
                if (origianlRegion.bottom > containerRegion.bottom) {
                    origianlRegion.top -= origianlRegion.bottom - containerRegion.bottom;
                    origianlRegion.bottom = containerRegion.bottom;
                } else if (origianlRegion.top < containerRegion.top) {
                    origianlRegion.bottom -= origianlRegion.bottom - containerRegion.bottom;
                    origianlRegion.top = containerRegion.top;
                }
                if (origianlRegion.left < containerRegion.left) {
                    origianlRegion.right -= origianlRegion.left - containerRegion.left;
                    origianlRegion.left = containerRegion.left;
                } else if (origianlRegion.right > containerRegion.right) {
                    origianlRegion.left += containerRegion.right - origianlRegion.right;
                    origianlRegion.right = containerRegion.right;
                }
                this.currentSubMenu.setRegion(origianlRegion);
            }
        } else {
            var viewSize = Ext.getDoc().getViewSize();
            if (origianlRegion.right > viewSize.width) {
                var change = origianlRegion.right - viewSize.width + 10;
                this.currentSubMenu.setLeft((origianlRegion.left - change) + "px");
                origianlRegion = this.currentSubMenu.getRegion();
            }
            if (origianlRegion.bottom > viewSize.height) {
                var change = origianlRegion.bottom - viewSize.height;
                this.currentSubMenu.setTop((origianlRegion.top - change) + "px");
                //origianlRegion = this.currentSubMenu.getRegion();
            }
        }
        if (this.shadow) {
            this.shadow.show(this.currentSubMenu);
        }
        eventExt.stopEvent();
    },
    //checkbox 点击处理
    checkboxOnClick: function(eventExt) {
        var target = eventExt.getTarget();
        if (target.nodeName.toLowerCase() != 'input' || target.type.toLowerCase() != 'checkbox') return true;
        var targetLi;
        if (target.nodeName.toLowerCase() == 'li') targetLi = Ext.get(target);
        else targetLi = Ext.fly(target).parent("li");
        if (target.checked) {
            //选择上限限制
            if (this.limit && (
            //三级菜单没有选过，选过了则二级菜单可以选，因为以后三级菜单会被清空
            !Ext.get(this.id + 'level3_' + targetLi.dom.getAttribute('key')) || Ext.get(this.id + 'level3_' + targetLi.dom.getAttribute('key')).select("input:checked").getCount() == 0)) {
                if (this.limit == 1) {
                    this.removeAllSelectNodes();
                } else {
                    var keys = this.getSelectKeys();
                    if (keys.length >= this.limit) {
                        alert('最多选择' + this.limit + '个');
                        target.checked = false;
                        eventExt.stopEvent();
                        return;
                    }
                }
            }
            this.addSelectNodeInstantly({
                label: targetLi.dom.getAttribute('label'),
                key: targetLi.dom.getAttribute('key')
            });
        } else {
            this.removeSelectNodeInstantly({
                label: targetLi.dom.getAttribute('label'),
                key: targetLi.dom.getAttribute('key')
            });
        }
        //二级类选择了，去掉三级类,三级类选择了，去掉二级类,大量使用css选择器功能
        if (targetLi.hasClass('level2')) {
            this.currentSubMenu = Ext.get(this.id + 'level3_' + targetLi.dom.getAttribute('key'))
            || this.createThirdUl(targetLi.dom);
            var li = this.currentSubMenu.child("li");
            while (li) {
                var liInput = li.child('input');
                if (liInput.dom.checked && !liInput.dom.disabled) {
                    this.removeSelectNodeInstantly({
                        label: li.dom.getAttribute('label'),
                        key: li.dom.getAttribute('key')
                    });
                }
                liInput.dom.disabled = !liInput.dom.disabled;
                liInput.dom.checked = liInput.dom.disabled;
                li = li.next('li');
            }
        }
    },
    //两层结构项高亮
    dataOnMouseOver: function(eventExt) {
        var target = eventExt.getTarget('li', this.body, true);
        if (!target) return true;
        //防止子选择重复冒泡到父元素当前
        if (this.currentItem != null && target.dom.id == this.currentItem.id) return true;
        //console.log(target.dom.id);
        //移除原先的弹出菜单
        if (this.currentSubMenu) {
            this.currentSubMenu.hide();
            this.currentSubMenu = null;
        }
        if (this.shadow) {
            this.shadow.hide();
        }
        //移出原先的选择项
        if (this.currentItem) {
            this.currentItem.removeClass('highlightExt');
            this.currentItem = null;
        }
        if (!target.hasClass('level1')) {
            this.currentItem = target;
            this.currentItem.addClass('highlightExt');
        }
        eventExt.stopEvent();
    },
    //弹出菜单项高亮
    subOnMouseOver: function(eventExt) {
        var target = eventExt.getTarget('li', this.bottomNodesContainer, true);
        if (!target) return true;
        //防止子选择重复冒泡到父元素当前
        if (this.currentSubItem != null && target.dom.id == this.currentSubItem.id) return true;
        //移出原先的选择项
        if (this.currentSubItem) {
            this.currentSubItem.removeClass('highlightExt');
            this.currentSubItem = null;
        }
        this.currentSubItem = target;
        this.currentSubItem.addClass('highlightExt');
        eventExt.stopEvent();
    },
    /*
         *由keys从datas得到信息结构,递归，结果放在预先的数组 infos
         *         
         */
    gatherInfoByKey: function(keys, infos, datas) {
        for (var i = 0; i < datas.length; i++) {
            for (var j = 0; j < keys.length; j++) {
                if (String(keys[j]) == String(datas[i].key)) {
                    infos.push(datas[i]);
                }
            }
            if (datas[i].children) this.gatherInfoByKey(keys, infos, datas[i].children);
        }
    }
});