Ext.onReady(function() {
    //拖放区域内的所有item处理拖（drag）
    new Ext.dd.DragZone("zone", {

        //得到当前的单个拖对象
        getDragData: function(e) {
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
        getRepairXY: function() {
            return this.dragData.repairXY;
        }
    });



    //拖放区域内的所有item处理放（drop）
    new Ext.dd.DropZone("zone", {

        //自己和自己不应该交换
		//@param target{HTMLElement} 当前的hover对象
		//@param data.ddel{HTMLElement} 当前的drag对象
        isMyself: function(target, data) {
            return target == data.ddel;
        },

        //当前鼠标滑是否是可drop子区域
        getTargetFromEvent: function(e) {
            return e.getTarget('.item');
        },

        onNodeEnter: function(target, dd, e, data) {
            if (this.isMyself(target, data)) return false;
            Ext.fly(target).addClass('item-hover');
        },
        onNodeOut: function(target, dd, e, data) {
            if (this.isMyself(target, data)) return false;
            Ext.fly(target).removeClass('item-hover');
        },
		
		
        onNodeOver: function(target, dd, e, data) {
            if (this.isMyself(target, data)) return false;
            return Ext.dd.DropZone.prototype.dropAllowed;
        },

		//交换两元素位置
        onNodeDrop: function(target, dd, e, data) {
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
                if (dragNext)
                dropEl.insertBefore(dragNext);
                else
                parent.appendChild(dropEl.dom);
                if (dropNext)
                dragEl.insertBefore(dropNext);
                else
                parent.appendChild(dragEl.dom);
            }

            dropEl.highlight();
            dragEl.highlight();
            return true;
        }
    });
});