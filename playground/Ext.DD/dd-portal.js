Ext.onReady(function () {
  //拖放区域内的所有item处理拖（drag）
  new Ext.dd.DragZone('portal-wrapper', {
    //开始拖动，则当前元素当做占位符外表
    onStartDrag: function () {
      Ext.fly(this.dragData.ddel).addClass('item-replace');
    },
    //结束拖动，则当前元素回复
    onEndDrag: function (dragData, e) {
      Ext.fly(dragData.ddel).removeClass('item-replace');
    },
    //得到当前的单个拖对象
    getDragData: function (e) {
      //handle内才开始
      if (!e.getTarget('.handle')) return;

      //得到整个要移动对象
      var sourceEl = e.getTarget('.portal', 10);
      if (sourceEl) {
        return {
          //ddel 必须，当前的拖元素
          ddel: sourceEl,
        };
      }
    },
    //proxy 隐藏掉自带的是否可以放置标志
  }).proxy.el
    .child('.x-dd-drop-icon')
    .setDisplayed(false);
  //拖放区域内的所有item处理放（drop）
  new Ext.dd.DropZone('portal-wrapper', {
    //自己和自己不应该反应
    //@param target{HTMLElement} 当前的hover对象
    //@param data.ddel{HTMLElement} 当前的drag对象
    isMyself: function (target, data) {
      return target == data.ddel;
    },
    //当前鼠标滑是否是可drop子区域
    getTargetFromEvent: function (e) {
      return e.getTarget('.portal');
    },
    //根据鼠标在drop目标的位置决定占位符是否应该插前还是插后
    move: function (target, data, e) {
      target = Ext.get(target);
      var tx = target.getY();
      var ex = e.getPageY();
      var tw = target.getHeight();
      var del = Ext.get(data.ddel);
      if (ex - tx < tw / 2) {
        //是否需要改变位置?
        if (target.prev('.portal') && target.prev('.portal').dom == data.ddel)
          return;
        del.insertBefore(target);
      } else {
        //是否需要改变位置?
        if (del.prev('.portal') && del.prev('.portal').dom == target.dom)
          return;
        del.insertAfter(target);
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
      var target2 = Ext.get(target);
      var tx = target2.getY();
      var ex = e.getPageY();
      if (this.isMyself(target, data)) return;
      this.move(target, data, e);
    },
    /*
        空列
        */
    onContainerOver: function (dd, e, data) {
      var col = e.getTarget('.portal-col', 10, true);
      if (!col || col.child('.portal')) return;
      col.insertFirst(data.ddel);
    },
  });
});
