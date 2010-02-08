Ext.onReady(function () {
    //拖放区域内的所有item处理拖（drag）
    new Ext.dd.DragZone("zone", {
        //得到当前的单个拖对象
        getDragData: function (e) {
            var sourceEl = e.getTarget(".item", 10);
            if (sourceEl) {
                return {
                    repairXY: Ext.fly(sourceEl).getXY(),
                    //ddel 必须，当前的拖元素
                    ddel: sourceEl
                }
            }
        },
        //使用缓存
        getRepairXY: function () {
            return this.dragData.repairXY;
        }
    });
    //拖放区域内的所有item处理放（drop）
    new Ext.dd.DropZone("zone", {
        //自己和自己不应该交换
        //@param target{HTMLElement} 当前的hover对象
        //@param data.ddel{HTMLElement} 当前的drag对象
        isMyself: function (target, data) {
            return target == data.ddel;
        },
        //当前鼠标滑是否是可drop子区域
        getTargetFromEvent: function (e) {
            return e.getTarget('.item');
        },
        onNodeEnter: function (target, dd, e, data) {
            if (this.isMyself(target, data)) return false;
            Ext.fly(target).addClass('item-hover');
        },
        onNodeOut: function (target, dd, e, data) {
            if (this.isMyself(target, data)) return false;
            Ext.fly(target).removeClass('item-hover');
        },
        onNodeOver: function (target, dd, e, data) {
            if (this.isMyself(target, data)) return false;
            return Ext.dd.DropZone.prototype.dropAllowed;
        },
        //交换两元素位置
        onNodeDrop: function (target, dd, e, data) {
            if (this.isMyself(target, data)) return false;
            //被拖放元素
            var dragEl = Ext.get(data.ddel);
            //底层放置元素
            var dropEl = Ext.get(target);
            //交换两元素位置
            var dragNext = dragEl.next("div", true);
            var dropNext = dropEl.next("div", true);
            var parent = dragEl.parent("div", true);
            //相邻
            if (dragNext == dropEl.dom) {
                dropEl.insertBefore(dragEl);
            } else if (dropNext == dragEl.dom) {
                dragEl.insertBefore(dropEl);
            } else {
                if (dragNext) dropEl.insertBefore(dragNext);
                else parent.appendChild(dropEl.dom);
                if (dropNext) dragEl.insertBefore(dropNext);
                else parent.appendChild(dragEl.dom);
            }
            dropEl.highlight();
            dragEl.highlight();
            return true;
        }
    });
});
/*占位符功能*/
Ext.onReady(function () {
    //拖放区域内的所有item处理拖（drag）
    new Ext.dd.DragZone("zone2", {
        //开始拖动，则当前元素当做占位符外表
        onStartDrag: function () {
            Ext.fly(this.dragData.ddel).addClass("item-replace");
        },
        //结束拖动，则当前元素回复
        onEndDrag: function (dragData, e) {
            Ext.fly(dragData.ddel).removeClass("item-replace");
        },
        //得到当前的单个拖对象
        getDragData: function (e) {
            var sourceEl = e.getTarget(".item", 10);
            if (sourceEl) {
                return {
                    //ddel 必须，当前的拖元素
                    ddel: sourceEl
                }
            }
        }
        //proxy 隐藏掉自带的是否可以放置标志
    }).proxy.el.child(".x-dd-drop-icon").setDisplayed(false);
    //拖放区域内的所有item处理放（drop）
    new Ext.dd.DropZone("zone2", {
        //自己和自己不应该反应
        //@param target{HTMLElement} 当前的hover对象
        //@param data.ddel{HTMLElement} 当前的drag对象
        isMyself: function (target, data) {
            return target == data.ddel;
        },
        //当前鼠标滑是否是可drop子区域
        getTargetFromEvent: function (e) {
            return e.getTarget('.item');
        },
        //根据鼠标在drop目标的位置决定占位符是否应该插前还是插后
        move: function (target, data, e) {
            target = Ext.get(target);
            var tx = target.getX();
            var ex = e.getPageX();
            var tw = target.getWidth();
            var del = Ext.get(data.ddel);
            if (ex - tx < (tw / 2)) {
                //是否需要改变位置?
                if (target.prev("div") && target.prev("div").dom == data.ddel) return;
                del.insertBefore(target);
            } else {
                //是否需要改变位置?
                if (del.prev("div") && del.prev("div").dom == target.dom) return;
                target.insertBefore(del);
            }
        },
        /*
                    	在进入节点以及在节点间移动时，判断鼠标位置，开始移动占位符
                    */
        onNodeEnter: function (target, dd, e, data) {
            if (this.isMyself(target, data)) return;
            this.move(target, data, e);
        },
        onNodeOver: function (target, dd, e, data) {
            if (this.isMyself(target, data)) return;
            this.move(target, data, e);
        }
    });
});