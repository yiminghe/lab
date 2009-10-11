/*
	v1.0(20090425) 偷窃ext grid素材以及利用ext core 简化重新实现grid ,暂时去除store层(后期再加入)，
	翻页事件留给用户,表格逻辑只包括数据显示，按钮隐藏
	v1.1 jump 在当前页输入框直接输入数字然后按enter即可
	v1.2 增加设置表格宽度，设置表格容器位置，行单击事件
	v1.5 仿照Ext grid 调整数据格式,fromNo设置,curentPage不要设置了
	v1.5.1((20090430)) 当总数为0时，显示工具按钮修正
	v1.6(20090529) 采用事件委托，修正ie，chrome显示问题
	v2.0(20090531) 添加ajax模式获取数据，loadAjax方法，底部分页按钮仿照extjs pagetoolbar美化,
	增加整列宽度设置
	v2.0.1(20090601) css子选择器 > 使用，避免分页条高亮
	v2.0.2(20090602) _getPropertyValue('x.y.z') 取值容错处理
	v2.2(20090604) 单元格内容调整单行显示
	v2.3(20090604) 列宽拖放调整实现
	v2.3.1(20090606) 列宽拖放滚动条问题处理
	v2.4(20090625) 客户端表格单列排序增加sortable配置,待实现:多列联合排序
	v2.4.1(20090718) 第一次鼠标经过行跳动修正
	v2.4.2(20090720) 行手型鼠标可改变,selectMode='row'时才可点行反应
	v2.4.3(20090805) numberLen 配置增加，表示计数宽度,pageSize 没有时隐藏分页工具条
	v2.5(20090806) 加入destroy函数，可以从内存中清除掉Ext.destroy(grid);sIEve 测试ie6 完全释放
	v2.5.1(20090820) tr border ie6 不能用,只能设在 td border上
	v2.5.5(20090824) 加入 groupCol ，对指定列id的数据进行分组显示。
*/
Ext.namespace('Ext.ux');
Ext.ux.GridLite = function(config) {

	config = config || {};
	if (!config.id) {
		alert("no parent to append");
		return;
	}
	config.selectMode = config.selectMode || "row";
	config.numberLen = config.numberLen || '42px';
	Ext.apply(this, {
		initialConfig: config
	});
	Ext.apply(this, config);

	this.addEvents('lastPage', 'prevPage', 'firstPage', 'nextPage', 'jump', 'rowClick','beforedestroy');
	Ext.ux.GridLite.superclass.constructor.call(this);


	this.tableContainer = Ext.DomHelper.append(Ext.get(config.id), {
		tag: 'div'
	},
	true);
	

	var hsize = this.initialConfig.headers.length;
	
	var heads = [];
	//显示的列
	this._showHeads = [];
	var cols = [];
	var last = true;
	for (var i = hsize - 1; i >= 0; i--) {

		if (this.initialConfig.headers[i].show) {
			this._showHeads.unshift(this.initialConfig.headers[i]);
			cols.unshift({
				tag: 'col',
				cls: last ? 'last': ''
			});
			last = false;
			heads.unshift({
				tag: 'th',
				cls: 'x-grid3-cell',
				style: (this.initialConfig.headers[i].width ? ('width:' + this.initialConfig.headers[i].width + ';') : ''),
				cn: [{
					tag: 'div',
					cls: 'x-grid3-hd-inner',
					cn: [{
						tag: 'span',
						html: this.initialConfig.headers[i].title
					}]
				}]
			});
		}
	}

	cols.unshift({
		tag: 'col'
	});

	heads.unshift({
		tag: 'th',
		cls: 'x-grid3-cell',
		style: 'width:' + this.numberLen,
		cn: [{
			tag: 'div',
			cls: "x-grid3-hd-inner",
			html: '&nbsp;'
		}]
	});

	var tableWidth = (this.initialConfig.width ? ('width:' + this.initialConfig.width) : '');

	this.mainTable = Ext.DomHelper.append(this.tableContainer, {
		tag: 'table',
		cellSpacing: '0',
		cellPadding: "0",
		cls: 'gridLite',
		//firefox chrome 一定要这样初始化设置，否则在后面再设置就不起作用了。
		style: tableWidth,
		summary: 'GridLite 生成表格',
		cn: [{
			tag: 'caption',
			html: this.initialConfig.title || '&nsbp;'
		},
		{
			tag: 'colgroup',
			cn: cols
		},
		{
			tag: 'thead',
			cn: [{
				tag: 'tr',
				cn: heads
			}]
		}]
	},
	true);

	this.tbody = Ext.DomHelper.append(this.mainTable, {
		tag: 'tbody',
		cls: 'x-grid3-body'
	},
	true);

	/**
			分页工具条组件
		**/
	var tfootHtml = "<tr>" + "<td colspan='" + (this._showHeads.length + 1) + "'>" + "<div class='pagingWrap'>" + "<table class='pagingTable' cellspacing='0'>" + "<tr>" + '<td>' + this._getButtonHtml({
		id: this.initialConfig.id + 'firstPage',
		cls: 'firstPage'
	}) + '</td>' + '<td>' + this._getButtonHtml({
		id: this.initialConfig.id + 'prevPage',
		cls: 'prevPage'
	}) + '</td>' + '<td>' + "<span class='pagingSeperator'></span>" + '</td>' + '<td>' + "<span class='pageCurInfo'>" + "第 <input id='" + this.initialConfig.id + "currentPage' title='按回车跳页' /> 页，共 <span id='" + this.initialConfig.id + "totalPage'></span> 页" + "</span>" + '</td>' + '<td>' + "<span class='pagingSeperator'></span>" + '</td>' + '<td>' + this._getButtonHtml({
		id: this.initialConfig.id + 'nextPage',
		cls: 'nextPage'
	}) + '</td>' + '<td>' + this._getButtonHtml({
		id: this.initialConfig.id + 'lastPage',
		cls: 'lastPage'
	}) + '</td>' + '<td>' + "<span class='pagingSeperator'></span>" + '</td>' + '<td>' + this._getButtonHtml({
		id: this.initialConfig.id + 'refresh',
		cls: 'refresh'
	}) + '</td>' + '<td>' + "<span class='pagingSeperator'></span>" + '</td>' + "</tr>" + "</table>" + "<div class='pageInfo' id='" + this.initialConfig.id + "pageInfo'></div>" + "</div>" + "</td>" + "</tr>";

	this._tfoot = Ext.DomHelper.append(this.mainTable, {
		tag: 'tfoot',
		html: tfootHtml,
		style: {
			'display': 'none'
		}
	},
	true);
	this._tfoot.enableDisplayMode();

	this.title = this.mainTable.select('caption').item(0);

	this._tfoot.select('.x-btn').addClassOnOver('x-btn-over');
	this._tfoot.select('.x-btn').addClassOnClick('x-btn-click');

	/*
			页面工具控制
		*/
	this.registerButton('firstPage');
	this.registerButton('nextPage');
	this.registerButton('lastPage');
	this.registerButton('prevPage');
	this.registerButton('refresh');

	/*
			页框输入数字跳转
		*/
	if (Ext.get(this.initialConfig.id + 'currentPage')) Ext.get(this.initialConfig.id + 'currentPage').on('keydown',
	function(evt) {
		var k = evt.getKey();
		if (k == Ext.EventObject.ENTER) {
			this.fireEvent('jump', this, Ext.get(this.initialConfig.id + 'currentPage').getValue());
		}
	},
	this);

	/*
			ie6 鼠标移过高亮
		*/
	if (Ext.isIE6) {

		this.tbody.on('mouseover',
		function(evt, target) {
			this.tbody.select('tr').removeClass('trhover');
			Ext.get(target).addClass('trhover');
		},
		this, {
			delegate: 'tr',
			stopEvent: true
			//buffer:250
		});
		this.mainTable.select('thead th').addClassOnOver('x-grid3-hd-over');

	}

	/*
			行单击事件，由tbody统一处理
		*/
	//09-07-20 cell select mode consideration
	if (this.selectMode == 'row') {
		this.tbody.on('click',
			function(evt, target) {
				this.fireEvent('rowClick', target.data);
			},
			this, {
				delegate: 'tr',
				stopEvent: true
			}
		);
	}
	
	/*
		分组事件，由tbody统一处理
	*/
	if(this.groupCol) {
		
		this.tbody.on('click',
			
			function(evt, target) {
				
				var cur_tr=Ext.fly(target.parentNode);
				var trs=[];				
				//属于该组的其他数据行		
				while(cur_tr=cur_tr.next()) {
					//不包含分组边界，属于同一组
					if(!cur_tr.child("td.x-grid3-tool-group-wrap",true)) {
						trs.push(cur_tr);
					}else{
						break;
					}
				}
				target=Ext.fly(target.getElementsByTagName("a")[0]);
				var expanded=true;
				
				if(target.hasClass("x-grid3-tool-expand")){
						target.removeClass("x-grid3-tool-expand");
						target.addClass("x-grid3-tool-collapse");
						expanded=false;
				
				}else {
						target.removeClass("x-grid3-tool-collapse");
						target.addClass("x-grid3-tool-expand");
				
				}
				
				//该组数据行隐藏与显示
				Ext.each(trs,function(one){
					one.setDisplayed(expanded);					
				});				
				
			},
			this, {
				delegate: 'td.x-grid3-tool-group-wrap',
				stopEvent: true
			}
		);
	}
	
	

	var grid = this;

	/*
			拖放与排序按钮处理
		*/
		
	this._ddHandlers=[];	
	this.mainTable.select('thead th div.x-grid3-hd-inner').each(function(el, this_, index) {

		var tools = Ext.DomHelper.append(el, {
			tag: 'div',
			cls: 'x-grid3-tool',
			style: 'right:' + (Ext.isIE ? 8 : 0) + 'px;'
		},
		true);

		/**
				注意隐藏列！！
			**/
		if (grid._showHeads[index - 1] && grid._showHeads[index - 1].sortable) {

			var sortTool = Ext.DomHelper.append(tools, {
				tag: 'div',
				cls: 'x-grid3-tool-sort'
			},
			true);

			sortTool.on('click', grid._sortAction.createDelegate(grid, [sortTool, grid._showHeads[index - 1]]));

		}

		if (Ext.ux.GridLite.DD) {

			if (index == 0) return;
			var splitTool = Ext.DomHelper.append(tools, {
				tag: 'div',
				cls: 'x-grid3-tool-split',
				style: 'cursor: col-resize;'
			},
			true);
			Ext.get(tools.select('.x-grid3-tool-split').item(0).dom);
			grid._ddHandlers.push(new Ext.ux.GridLite.DD(grid, splitTool));
		}

	});

	if (Ext.ux.GridLite.DD) {
		this.resizeMarker = Ext.DomHelper.append(this.tableContainer, {
			tag: 'div',
			cls: 'x-grid3-resize-marker'
		},
		true);
	}

	//Ext.DomHelper.useDom=false;		
	var wrapStyle = {
		width: this.mainTable.getComputedWidth() + 10 + 'px',
		overflow: 'auto',
		'overflow-y': 'hidden',
		padding: '0 0 10px 0'
	};
	if (!Ext.isIE) {
		wrapStyle.padding = '1px';
	}
	this.tableContainer.setStyle(wrapStyle);
	this.tableContainer.position();

	if (this.initialConfig.pageRecords) this.loadData(this.initialConfig.pageRecords);
};

Ext.extend(Ext.ux.GridLite, Ext.util.Observable, {

	/*
		根据每一列数据，排序
	*/
	_sortAction: function(sortTool, headerConfig) {

		if (!this._dataInfo || !this._dataInfo.datas) return;

		//以前的所有排序标志无效
		this.mainTable.select('thead tr th .x-grid3-tool-sort').each(function(el) {
			if (el.dom != sortTool.dom) el.dom.className = 'x-grid3-tool-sort';
		});

		var grid = this;
		var desc = true;
		//第一次点升序
		if (!sortTool.hasClass('x-grid3-tool-desc')) {
			sortTool.dom.className = 'x-grid3-tool-sort x-grid3-tool-desc';
		} else {
			sortTool.dom.className = 'x-grid3-tool-sort x-grid3-tool-asc';
			desc = false;
		}

		this._dataInfo.datas.sort(function(o1, o2) {
			//防止复合x['y.z.x']
			var i1 = grid._getPropertyValue(o1, headerConfig.id);
			var i2 = grid._getPropertyValue(o2, headerConfig.id);
			if (typeof headerConfig.sortable == 'function') {
				var v = headerConfig.sortable(i1, i2);
				return desc ? v: (0 - v);
			} else {
				var v = (i1 == i2 ? 0 : (i1 < i2 ? -1 : 1));
				return desc ? v: (0 - v);
			}
		});

		this.loadData(this._dataInfo);

	},

	/**
		获得一个Ext样式的按钮
	**/
	_getButtonHtml: function(config) {

		return '<table cellspacing="0" cellpadding="0" border="0" class="x-btn-wrap x-btn x-btn-icon" id="' + config.id + '" style="width: auto;">' + '<tbody>' + '<tr>' + '<td class="x-btn-left">' + '<i> </i>' + '</td>' + '<td class="x-btn-center">' + '<em unselectable="on">' + '<button type="button" hideFocus="hideFocus" class="x-btn-text ' + config.cls + '" ></button>' + '</em>' + '</td>' + '<td class="x-btn-right">' + '<i></i>' + '</td>' + '</tr>' + '</tbody>' + '</table>';

	},

	/**
		可以获得复合对象值x['y.z']==x.y.z
	**/
	_getPropertyValue: function(val, id) {
		var ids = id.split('.');
		var v = '';
		for (var i = 0; i < ids.length; i++) {
			if (!val) return;
			v = val[ids[i]];
			val = v;
		}
		return v;
	},

	/**
		无刷新的ajax取数据
	**/
	loadAjax: function(params) {
		if (!this.url) {
			alert('Ajax 需要 url 配置 !');
			return;
		}
		this.lastParams = params || {};
		this.tableContainer.mask('载入数据中....', 'x-mask-loading');
		this.disableButton('refresh');

		Ext.Ajax.request({
			url: this.url,
			success: function(response) {
				var returnData = {};
				try {

					returnData = Ext.util.JSON.decode(response.responseText.trim());
				} catch(e) {

}
				if (returnData && returnData.datas) this.loadData(returnData);
				else {
					alert(response.responseText.trim());
				}
				this.enableButton('refresh');
				this.tableContainer.unmask();
			},
			failure: function(response) {
				alert('对不起 ： ' + response.statusText);
				this.enableButton('refresh');
				this.tableContainer.unmask();
			},
			headers: {
				'useAjax': 'true'
			},
			params: params,
			scope: this
		});

	},

	reload: function() {
		this.loadAjax(this.lastParams || {});
	},

	/**
		由Json数据生成html，表格核心函数
	**/
	loadData: function(dataInfo) {
		this._dataInfo = dataInfo;

		if (dataInfo.pageSize !== undefined) {
			this._tfoot.show();
			var endRecord = dataInfo.totalRecord > dataInfo.fromNo + dataInfo.pageSize ? dataInfo.fromNo + dataInfo.pageSize: dataInfo.totalRecord;
			var totalPage = Math.floor(dataInfo.totalRecord / dataInfo.pageSize) + 1;
			if (dataInfo.totalRecord % dataInfo.pageSize == 0) {
				totalPage--;
			}
			this.totalCurrentPage = totalPage;
			var currentPage = Math.floor(dataInfo.fromNo / dataInfo.pageSize) + 1;
			var recordNo = dataInfo.fromNo + 1;
		} else {
			this._tfoot.hide();
			var recordNo = 1;
		}

		Ext.DomHelper.useDom = true;
		var trs = [];
		//上一组的值
		var lastGroupCol="";
		for (var i = 0; i < dataInfo.datas.length; i++) {
			var line = dataInfo.datas[i];
			
			
			var tr = {};
			tr.tag = 'tr';
			tr.cls = (i % 2 == 1 ? 'even': '');
			if (this.selectMode == 'row') tr.style = "cursor:pointer";
			tr.cn = [];			
			var td = {};
			td.tag = 'td';
			td.cls = "x-grid3-td-numberer x-grid3-cell";
			//允许分组，并且当前组不属于上一组,新开一组
			if(this.groupCol && lastGroupCol!=this._getPropertyValue(line,this.groupCol)) {
				td.cls="x-grid3-cell x-grid3-tool-group-wrap";
				td.cn = [{
					tag: 'a',
					hideFocus:'on',
					href:"#",
					cls: 'x-grid3-tool-expand x-grid3-tool-group',
					html: recordNo++
				}];
			}	else if(this.groupCol ) {
				
				td.cls="x-grid3-cell";
				
			}else {
				
				td.cn = [{
					tag: 'div',
					cls: 'x-grid3-cell-inner',
					html: recordNo++
				}];
		
			}
			
			tr.cn.push(td);
			
			for (var j = 0; j < this.initialConfig.headers.length; j++) {
				if (!this.initialConfig.headers[j].show) continue;
				var td = {};
				td.tag = 'td';
				td.cls = "x-grid3-cell";
				var cell = {};
				td.cn = [cell];
				cell.tag = 'div';
				cell.cls = 'x-grid3-cell-inner';
				if (this.initialConfig.headers[j].renderer) {
					cell.html = this.initialConfig.headers[j].renderer(this._getPropertyValue(line, this.initialConfig.headers[j].id), line);
				} else {
					cell.html = this._getPropertyValue(line, this.initialConfig.headers[j].id);
				}
				tr.cn.push(td);
			}
			trs.push(tr);
			
			
			if(this.groupCol) lastGroupCol=this._getPropertyValue(line,this.groupCol);
			
		}
		
		while (this.tbody.dom.firstChild) {
			if (this.tbody.dom.firstChild.data) {
				this.tbody.dom.firstChild.data = null;
			}
			Ext.fly(this.tbody.dom.firstChild).remove();
		}
		Ext.DomHelper.append(this.tbody, trs);

		//ie not work
		//this.tbody.update(trs);	
		//delegate event to tbody
		//if(Ext.isIE)
		//	this.tbody.select('tr').addClassOnOver('trhover');
		//associate data to dom tr
		this.tbody.select('tr').each(function(el, this_, index) {
			el.dom.data = dataInfo.datas[index];
		});

		if (dataInfo.pageSize !== undefined) {
			if (Ext.get(this.initialConfig.id + 'currentPage')) Ext.get(this.initialConfig.id + 'currentPage').dom.value = (currentPage);
			if (Ext.get(this.initialConfig.id + 'totalPage')) Ext.get(this.initialConfig.id + 'totalPage').update(totalPage);
			if (Ext.get(this.initialConfig.id + 'pageInfo')) Ext.get(this.initialConfig.id + 'pageInfo').update("显示 " + (dataInfo.fromNo + 1) + " - " + endRecord + "，共 " + dataInfo.totalRecord + " 条");

			if (currentPage <= 1) {
				this.disableButton('firstPage');
				this.disableButton('prevPage');
			} else {
				this.enableButton('firstPage');
				this.enableButton('prevPage');
			}

			if (currentPage >= totalPage) {
				this.disableButton('nextPage');
				this.disableButton('lastPage');
			} else {
				this.enableButton('nextPage');
				this.enableButton('lastPage');
			}
		}

		Ext.DomHelper.useDom = false;
	},

	/**
		按钮操作处理，刷新按钮特殊处理。
	**/
	registerButton: function(buttonId) {
		if (Ext.get(this.initialConfig.id + buttonId)) {

			Ext.get(this.initialConfig.id + buttonId).on('click',
			function(evt) {
				if (buttonId == 'refresh') {
					if (Ext.get(this.initialConfig.id + buttonId).child('button').hasClass('loading')) return;
				}
				if (Ext.get(this.initialConfig.id + buttonId).hasClass('x-item-disabled')) return;
				this.fireEvent(buttonId, this);
			},
			this, {
				stopEvent: true
			});

		}
	},

	disableButton: function(buttonId) {
		if (!Ext.get(this.initialConfig.id + buttonId)) return;
		if (buttonId == 'refresh') {
			Ext.get(this.initialConfig.id + buttonId).child('button').removeClass('refresh');
			Ext.get(this.initialConfig.id + buttonId).child('button').addClass('loading');
			return;
		}
		Ext.get(this.initialConfig.id + buttonId).addClass('x-item-disabled');
	},

	enableButton: function(buttonId) {
		if (!Ext.get(this.initialConfig.id + buttonId)) return;
		if (buttonId == 'refresh') {
			Ext.get(this.initialConfig.id + buttonId).child('button').removeClass('loading');
			Ext.get(this.initialConfig.id + buttonId).child('button').addClass('refresh');
			return;
		}
		Ext.get(this.initialConfig.id + buttonId).removeClass('x-item-disabled');
	},
	
	//?Bug? Ext.destroy 对于 composite 不能正确清除,要显示循环
	_destroyComposite : function(els){
		els.each(function(el){
				Ext.destroy(el);
		});
	},
	
	destroy:function(){
		if(this.fireEvent("beforedestroy",this)!==false) {
			
			this.purgeListeners();
			Ext.each(this._ddHandlers,function(el){
				Ext.destroy(el);
			});
			
			this._destroyComposite(this.mainTable.select('thead tr th .x-grid3-tool-sort'));
			
			this._destroyComposite(this.mainTable.select('thead th div.x-grid3-hd-inner'));
			
			
			this._destroyComposite(this.mainTable.select('thead th'));
			
			Ext.destroy(
				this.title
			);	
			
			this._destroyComposite(this.tbody.select('tr'));
			
			Ext.destroy(	
				this.tbody,
				Ext.get(this.initialConfig.id + 'currentPage')
			);
				
			this._destroyComposite(this._tfoot.select('.x-btn'));
			
			Ext.destroy(
				this._tfoot,			
				this.mainTable,
				this.resizeMarker,
				this.tableContainer
			);
			
		}
	}

});

if (Ext.dd && Ext.dd.DD) {
	Ext.ux.GridLite.DD = function(grid, toolSplit) {
		this.grid = grid;
		this.toolSplit = toolSplit;
		this.scroll = false;
		//表格头的纵坐标，固定用户不能改变
		this.baseY = this.grid.mainTable.select('thead').item(0).getY();
		Ext.ux.GridLite.DD.superclass.constructor.call(this, toolSplit.id, 'GridDD-' + toolSplit.id);
		this.setHandleElId(toolSplit.id);
	};

	Ext.extend(Ext.ux.GridLite.DD, Ext.dd.DD, {
		//列最小宽度
		minWidth: 30,

		startDrag: function(x, y) {
			this.grid.resizeMarker.show();
			this.setDelta(0, 0);
			this.startPos = x;
			//调节条marker高度，和tbody高度相等
			var baseHeight = this.grid.mainTable.getComputedHeight() - this.grid.mainTable.select('tfoot').item(0).getComputedHeight();
			this.grid.resizeMarker.setHeight(baseHeight);
			this.alignElWithMouse(this.grid.resizeMarker, x, this.baseY);
		},
		b4Drag: Ext.emptyFn,

		onDrag: function(e) {
			//只改变纵坐标，横坐标固定不变
			this.alignElWithMouse(this.grid.resizeMarker, e.getPageX(), this.baseY);
		},

		endDrag: function(e) {
			this.grid.resizeMarker.hide();
			var th = this.toolSplit.parent('th');
			var origianlWidth = th.getComputedWidth();
			var finalWidth = origianlWidth + e.getPageX() - this.startPos;
			if (finalWidth < this.minWidth) finalWidth = this.minWidth;
			th.setWidth(finalWidth);

		}
	});
}