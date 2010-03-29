/*
	@author:yiminghe.javaeye.com
	v1.0(20090825) 找了个 +,- 做个树 ,理清递归结构就好了
	v1.5(20100329) 树显示改变，添加连接线，利用 fragment 提高性能
*/
Ext.namespace('Ext.ux');
Ext.ux.TreeLite = function (config) {
    config = config || {};
    if (!config.id) {
        alert("no parent to append");
        return;
    }
    this.indent = "";
    var treeWrap = Ext.get(config.id);
    this.addEvents('click');
    Ext.ux.TreeLite.superclass.constructor.call(this);
    //fragment 提高性能
    var fragment = document.createDocumentFragment();
    this.buildSubtrees(fragment, config.treeNodes);
    treeWrap.dom.appendChild(fragment);
    /*
		收缩扩展处理,集中处理吧,效率高点
	*/
    treeWrap.on("click", function (evt, target) {
        if (evt.getTarget("a.tree-node-group", 2)) {
            var path = Ext.fly(target).parent("div", true);
            var ul = Ext.fly(path).next("ul", true);
            if (ul) {
                if (Ext.fly(target).hasClass("tree-node-expand")) {
                    Ext.fly(target).removeClass("tree-node-expand");
                    Ext.fly(target).addClass("tree-node-collapse");
                    Ext.fly(target).next("span").removeClass("folder-open");
                    Ext.fly(target).next("span").addClass("folder");
                    //不用 get ,少占用内存吧
                    Ext.fly(ul, "_treeLite_submenu").slideOut("t", {
                        easing: 'easeOut',
                        duration: .3,
                        useDisplay: true
                    });
                } else {
                    Ext.fly(target).addClass("tree-node-expand");
                    Ext.fly(target).removeClass("tree-node-collapse");
                    Ext.fly(target).next("span").removeClass("folder");
                    Ext.fly(target).next("span").addClass("folder-open");
                    Ext.fly(ul, "_treeLite_submenu").slideIn("t", {
                        easing: 'easeIn',
                        duration: .3,
                        useDisplay: true
                    });
                }
            }
        }
        /*
			底层节点点击处理
		*/
        else if (evt.getTarget("a.nodeItem", 2)) {
            this.fireEvent("click", target.id);
        }
        evt.stopEvent();
    },
    this);
};
Ext.extend(Ext.ux.TreeLite, Ext.util.Observable, {
    /**
     深度优先构建树
     **/
    buildSubtrees: function (parentLi, treeNodes, deep) {
        var ul = document.createElement("ul");
        parentLi.appendChild(ul);
        //记下当前深度的缩进代码
        var curIndent = this.indent;
        for (var i = 0; i < treeNodes.length - 1; i++) {
            var node = treeNodes[i];
            this.buildSubtree(node, ul);
            this.indent = curIndent;
        }
        if (treeNodes.length > 0) {
            var node = treeNodes[i];
            //如果是最后一个项，则当前深度缩进代码要特殊考虑
            this.buildSubtree(node, ul, true);
            this.indent = curIndent;
        }
    },
    buildSubtree: function (node, ul, end) {
        var parentLi = document.createElement("li");
        ul.appendChild(parentLi);
        if (node.cn) {
            parentLi.innerHTML = '<div>' + this.indent + '<a class="tree-node-group tree-node-expand" href="#" hideFocus="on"></a><span class="tree-node-group folder-open"></span>' + node.text + '</div>';
            //如果为最后一个文件夹，则只缩进就可以了不要连接线
            this.indent += "<span class='indent " + (end ? "" : "line") + "'></span>";
            this.buildSubtrees(parentLi, node.cn, true);
        } else {
            parentLi.innerHTML = this.indent +
            //如果为最后一个叶子，则前面连接线不一样
            "<span class='indent " + (end ? "end" : "cross") + "'></span>" + '<a href="#" class="nodeItem" id="' + node.id + '">' + node.text + '</a>';
        }
    }
});