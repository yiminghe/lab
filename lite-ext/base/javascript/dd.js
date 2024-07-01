/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

/**
 * @class Ext.dd.DragSource
 * @extends Ext.dd.DDProxy
 * A simple class that provides the basic implementation needed to make any element draggable.
 * @constructor
 * @param {Mixed} el The container element
 * @param {Object} config
 */
Ext.dd.DragSource = function (el, config) {
  this.el = Ext.get(el);
  if (!this.dragData) {
    this.dragData = {};
  }

  Ext.apply(this, config);

  if (!this.proxy) {
    this.proxy = new Ext.dd.StatusProxy();
  }
  Ext.dd.DragSource.superclass.constructor.call(
    this,
    this.el.dom,
    this.ddGroup || this.group,
    {
      dragElId: this.proxy.id,
      resizeFrame: false,
      isTarget: false,
      scroll: this.scroll === true,
    },
  );

  this.dragging = false;
};

Ext.extend(Ext.dd.DragSource, Ext.dd.DDProxy, {
  /**
   * @cfg {String} ddGroup
   * A named drag drop group to which this object belongs.  If a group is specified, then this object will only
   * interact with other drag drop objects in the same group (defaults to undefined).
   */
  /**
   * @cfg {String} dropAllowed
   * The CSS class returned to the drag source when drop is allowed (defaults to "x-dd-drop-ok").
   */
  dropAllowed: 'x-dd-drop-ok',
  /**
   * @cfg {String} dropNotAllowed
   * The CSS class returned to the drag source when drop is not allowed (defaults to "x-dd-drop-nodrop").
   */
  dropNotAllowed: 'x-dd-drop-nodrop',

  /**
   * Returns the data object associated with this drag source
   * @return {Object} data An object containing arbitrary data
   */
  getDragData: function (e) {
    return this.dragData;
  },

  // private
  onDragEnter: function (e, id) {
    var target = Ext.dd.DragDropMgr.getDDById(id);
    this.cachedTarget = target;
    if (this.beforeDragEnter(target, e, id) !== false) {
      if (target.isNotifyTarget) {
        var status = target.notifyEnter(this, e, this.dragData);
        this.proxy.setStatus(status);
      } else {
        this.proxy.setStatus(this.dropAllowed);
      }

      if (this.afterDragEnter) {
        /**
         * An empty function by default, but provided so that you can perform a custom action
         * when the dragged item enters the drop target by providing an implementation.
         * @param {Ext.dd.DragDrop} target The drop target
         * @param {Event} e The event object
         * @param {String} id The id of the dragged element
         * @method afterDragEnter
         */
        this.afterDragEnter(target, e, id);
      }
    }
  },

  /**
   * An empty function by default, but provided so that you can perform a custom action
   * before the dragged item enters the drop target and optionally cancel the onDragEnter.
   * @param {Ext.dd.DragDrop} target The drop target
   * @param {Event} e The event object
   * @param {String} id The id of the dragged element
   * @return {Boolean} isValid True if the drag event is valid, else false to cancel
   */
  beforeDragEnter: function (target, e, id) {
    return true;
  },

  // private
  alignElWithMouse: function () {
    Ext.dd.DragSource.superclass.alignElWithMouse.apply(this, arguments);
    this.proxy.sync();
  },

  // private
  onDragOver: function (e, id) {
    var target = this.cachedTarget || Ext.dd.DragDropMgr.getDDById(id);
    if (this.beforeDragOver(target, e, id) !== false) {
      if (target.isNotifyTarget) {
        var status = target.notifyOver(this, e, this.dragData);
        this.proxy.setStatus(status);
      }

      if (this.afterDragOver) {
        /**
         * An empty function by default, but provided so that you can perform a custom action
         * while the dragged item is over the drop target by providing an implementation.
         * @param {Ext.dd.DragDrop} target The drop target
         * @param {Event} e The event object
         * @param {String} id The id of the dragged element
         * @method afterDragOver
         */
        this.afterDragOver(target, e, id);
      }
    }
  },

  /**
   * An empty function by default, but provided so that you can perform a custom action
   * while the dragged item is over the drop target and optionally cancel the onDragOver.
   * @param {Ext.dd.DragDrop} target The drop target
   * @param {Event} e The event object
   * @param {String} id The id of the dragged element
   * @return {Boolean} isValid True if the drag event is valid, else false to cancel
   */
  beforeDragOver: function (target, e, id) {
    return true;
  },

  // private
  onDragOut: function (e, id) {
    var target = this.cachedTarget || Ext.dd.DragDropMgr.getDDById(id);
    if (this.beforeDragOut(target, e, id) !== false) {
      if (target.isNotifyTarget) {
        target.notifyOut(this, e, this.dragData);
      }
      this.proxy.reset();
      if (this.afterDragOut) {
        /**
         * An empty function by default, but provided so that you can perform a custom action
         * after the dragged item is dragged out of the target without dropping.
         * @param {Ext.dd.DragDrop} target The drop target
         * @param {Event} e The event object
         * @param {String} id The id of the dragged element
         * @method afterDragOut
         */
        this.afterDragOut(target, e, id);
      }
    }
    this.cachedTarget = null;
  },

  /**
   * An empty function by default, but provided so that you can perform a custom action before the dragged
   * item is dragged out of the target without dropping, and optionally cancel the onDragOut.
   * @param {Ext.dd.DragDrop} target The drop target
   * @param {Event} e The event object
   * @param {String} id The id of the dragged element
   * @return {Boolean} isValid True if the drag event is valid, else false to cancel
   */
  beforeDragOut: function (target, e, id) {
    return true;
  },

  // private
  onDragDrop: function (e, id) {
    var target = this.cachedTarget || Ext.dd.DragDropMgr.getDDById(id);
    if (this.beforeDragDrop(target, e, id) !== false) {
      if (target.isNotifyTarget) {
        if (target.notifyDrop(this, e, this.dragData)) {
          // valid drop?
          this.onValidDrop(target, e, id);
        } else {
          this.onInvalidDrop(target, e, id);
        }
      } else {
        this.onValidDrop(target, e, id);
      }

      if (this.afterDragDrop) {
        /**
         * An empty function by default, but provided so that you can perform a custom action
         * after a valid drag drop has occurred by providing an implementation.
         * @param {Ext.dd.DragDrop} target The drop target
         * @param {Event} e The event object
         * @param {String} id The id of the dropped element
         * @method afterDragDrop
         */
        this.afterDragDrop(target, e, id);
      }
    }
    delete this.cachedTarget;
  },

  /**
   * An empty function by default, but provided so that you can perform a custom action before the dragged
   * item is dropped onto the target and optionally cancel the onDragDrop.
   * @param {Ext.dd.DragDrop} target The drop target
   * @param {Event} e The event object
   * @param {String} id The id of the dragged element
   * @return {Boolean} isValid True if the drag drop event is valid, else false to cancel
   */
  beforeDragDrop: function (target, e, id) {
    return true;
  },

  // private
  onValidDrop: function (target, e, id) {
    this.hideProxy();
    if (this.afterValidDrop) {
      /**
       * An empty function by default, but provided so that you can perform a custom action
       * after a valid drop has occurred by providing an implementation.
       * @param {Object} target The target DD
       * @param {Event} e The event object
       * @param {String} id The id of the dropped element
       * @method afterInvalidDrop
       */
      this.afterValidDrop(target, e, id);
    }
  },

  // private
  getRepairXY: function (e, data) {
    return this.el.getXY();
  },

  // private
  onInvalidDrop: function (target, e, id) {
    this.beforeInvalidDrop(target, e, id);
    if (this.cachedTarget) {
      if (this.cachedTarget.isNotifyTarget) {
        this.cachedTarget.notifyOut(this, e, this.dragData);
      }
      this.cacheTarget = null;
    }
    this.proxy.repair(
      this.getRepairXY(e, this.dragData),
      this.afterRepair,
      this,
    );

    if (this.afterInvalidDrop) {
      /**
       * An empty function by default, but provided so that you can perform a custom action
       * after an invalid drop has occurred by providing an implementation.
       * @param {Event} e The event object
       * @param {String} id The id of the dropped element
       * @method afterInvalidDrop
       */
      this.afterInvalidDrop(e, id);
    }
  },

  // private
  afterRepair: function () {
    if (Ext.enableFx) {
      this.el.highlight(this.hlColor || 'c3daf9');
    }
    this.dragging = false;
  },

  /**
   * An empty function by default, but provided so that you can perform a custom action after an invalid
   * drop has occurred.
   * @param {Ext.dd.DragDrop} target The drop target
   * @param {Event} e The event object
   * @param {String} id The id of the dragged element
   * @return {Boolean} isValid True if the invalid drop should proceed, else false to cancel
   */
  beforeInvalidDrop: function (target, e, id) {
    return true;
  },

  // private
  handleMouseDown: function (e) {
    if (this.dragging) {
      return;
    }
    var data = this.getDragData(e);
    if (data && this.onBeforeDrag(data, e) !== false) {
      this.dragData = data;
      this.proxy.stop();
      Ext.dd.DragSource.superclass.handleMouseDown.apply(this, arguments);
    }
  },

  /**
   * An empty function by default, but provided so that you can perform a custom action before the initial
   * drag event begins and optionally cancel it.
   * @param {Object} data An object containing arbitrary data to be shared with drop targets
   * @param {Event} e The event object
   * @return {Boolean} isValid True if the drag event is valid, else false to cancel
   */
  onBeforeDrag: function (data, e) {
    return true;
  },

  /**
   * An empty function by default, but provided so that you can perform a custom action once the initial
   * drag event has begun.  The drag cannot be canceled from this function.
   * @param {Number} x The x position of the click on the dragged object
   * @param {Number} y The y position of the click on the dragged object
   */
  onStartDrag: Ext.emptyFn,

  // private override
  startDrag: function (x, y) {
    this.proxy.reset();
    this.dragging = true;
    this.proxy.update('');
    this.onInitDrag(x, y);
    this.proxy.show();
  },

  // private
  onInitDrag: function (x, y) {
    var clone = this.el.dom.cloneNode(true);
    clone.id = Ext.id(); // prevent duplicate ids
    this.proxy.update(clone);
    this.onStartDrag(x, y);
    return true;
  },

  /**
   * Returns the drag source's underlying {@link Ext.dd.StatusProxy}
   * @return {Ext.dd.StatusProxy} proxy The StatusProxy
   */
  getProxy: function () {
    return this.proxy;
  },

  /**
   * Hides the drag source's {@link Ext.dd.StatusProxy}
   */
  hideProxy: function () {
    this.proxy.hide();
    this.proxy.reset(true);
    this.dragging = false;
  },

  // private
  triggerCacheRefresh: function () {
    Ext.dd.DDM.refreshCache(this.groups);
  },

  // private - override to prevent hiding
  b4EndDrag: function (e) {},

  // private - override to prevent moving
  endDrag: function (e) {
    this.onEndDrag(this.dragData, e);
  },

  // private
  onEndDrag: function (data, e) {},

  // private - pin to cursor
  autoOffset: function (x, y) {
    this.setDelta(-12, -20);
  },
});
/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

Ext.dd.DragTracker = function (config) {
  Ext.apply(this, config);
  this.addEvents(
    'mousedown',
    'mouseup',
    'mousemove',
    'dragstart',
    'dragend',
    'drag',
  );

  this.dragRegion = new Ext.lib.Region(0, 0, 0, 0);

  if (this.el) {
    this.initEl(this.el);
  }
};

Ext.extend(Ext.dd.DragTracker, Ext.util.Observable, {
  active: false,
  tolerance: 5,
  autoStart: false,

  initEl: function (el) {
    this.el = Ext.get(el);
    el.on(
      'mousedown',
      this.onMouseDown,
      this,
      this.delegate ? { delegate: this.delegate } : undefined,
    );
  },

  destroy: function () {
    this.el.un('mousedown', this.onMouseDown, this);
  },

  onMouseDown: function (e, target) {
    if (
      this.fireEvent('mousedown', this, e) !== false &&
      this.onBeforeStart(e) !== false
    ) {
      this.startXY = this.lastXY = e.getXY();
      this.dragTarget = this.delegate ? target : this.el.dom;
      e.preventDefault();
      var doc = Ext.getDoc();
      doc.on('mouseup', this.onMouseUp, this);
      doc.on('mousemove', this.onMouseMove, this);
      doc.on('selectstart', this.stopSelect, this);
      if (this.autoStart) {
        this.timer = this.triggerStart.defer(
          this.autoStart === true ? 1000 : this.autoStart,
          this,
        );
      }
    }
  },

  onMouseMove: function (e, target) {
    if (this.active && Ext.isIE && !e.browserEvent.button) {
      e.preventDefault();
      this.onMouseUp(e);
      return;
    }
    e.preventDefault();
    var xy = e.getXY(),
      s = this.startXY;
    this.lastXY = xy;
    if (!this.active) {
      if (
        Math.abs(s[0] - xy[0]) > this.tolerance ||
        Math.abs(s[1] - xy[1]) > this.tolerance
      ) {
        this.triggerStart();
      } else {
        return;
      }
    }
    this.fireEvent('mousemove', this, e);
    this.onDrag(e);
    this.fireEvent('drag', this, e);
  },

  onMouseUp: function (e) {
    var doc = Ext.getDoc();
    doc.un('mousemove', this.onMouseMove, this);
    doc.un('mouseup', this.onMouseUp, this);
    doc.un('selectstart', this.stopSelect, this);
    e.preventDefault();
    this.clearStart();
    this.active = false;
    delete this.elRegion;
    this.fireEvent('mouseup', this, e);
    this.onEnd(e);
    this.fireEvent('dragend', this, e);
  },

  triggerStart: function (isTimer) {
    this.clearStart();
    this.active = true;
    this.onStart(this.startXY);
    this.fireEvent('dragstart', this, this.startXY);
  },

  clearStart: function () {
    if (this.timer) {
      clearTimeout(this.timer);
      delete this.timer;
    }
  },

  stopSelect: function (e) {
    e.stopEvent();
    return false;
  },

  onBeforeStart: function (e) {},

  onStart: function (xy) {},

  onDrag: function (e) {},

  onEnd: function (e) {},

  getDragTarget: function () {
    return this.dragTarget;
  },

  getDragCt: function () {
    return this.el;
  },

  getXY: function (constrain) {
    return constrain
      ? this.constrainModes[constrain].call(this, this.lastXY)
      : this.lastXY;
  },

  getOffset: function (constrain) {
    var xy = this.getXY(constrain);
    var s = this.startXY;
    return [s[0] - xy[0], s[1] - xy[1]];
  },

  constrainModes: {
    point: function (xy) {
      if (!this.elRegion) {
        this.elRegion = this.getDragCt().getRegion();
      }

      var dr = this.dragRegion;

      dr.left = xy[0];
      dr.top = xy[1];
      dr.right = xy[0];
      dr.bottom = xy[1];

      dr.constrainTo(this.elRegion);

      return [dr.left, dr.top];
    },
  },
});
/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

/**
 * @class Ext.dd.DragZone
 * @extends Ext.dd.DragSource
 * This class provides a container DD instance that proxies for multiple child node sources.<br />
 * By default, this class requires that draggable child nodes are registered with {@link Ext.dd.Registry}.
 * @constructor
 * @param {Mixed} el The container element
 * @param {Object} config
 */
Ext.dd.DragZone = function (el, config) {
  Ext.dd.DragZone.superclass.constructor.call(this, el, config);
  if (this.containerScroll) {
    Ext.dd.ScrollManager.register(this.el);
  }
};

Ext.extend(Ext.dd.DragZone, Ext.dd.DragSource, {
  /**
   * @cfg {Boolean} containerScroll True to register this container with the Scrollmanager
   * for auto scrolling during drag operations.
   */
  /**
   * @cfg {String} hlColor The color to use when visually highlighting the drag source in the afterRepair
   * method after a failed drop (defaults to "c3daf9" - light blue)
   */

  /**
   * Called when a mousedown occurs in this container. Looks in {@link Ext.dd.Registry}
   * for a valid target to drag based on the mouse down. Override this method
   * to provide your own lookup logic (e.g. finding a child by class name). Make sure your returned
   * object has a "ddel" attribute (with an HTML Element) for other functions to work.
   * @param {EventObject} e The mouse down event
   * @return {Object} The dragData
   */
  getDragData: function (e) {
    return Ext.dd.Registry.getHandleFromEvent(e);
  },

  /**
   * Called once drag threshold has been reached to initialize the proxy element. By default, it clones the
   * this.dragData.ddel
   * @param {Number} x The x position of the click on the dragged object
   * @param {Number} y The y position of the click on the dragged object
   * @return {Boolean} true to continue the drag, false to cancel
   */
  onInitDrag: function (x, y) {
    var clone = this.dragData.ddel.cloneNode(true);
    clone.id = Ext.id(); // prevent duplicate ids
    this.proxy.update(clone);
    this.onStartDrag(x, y);
    return true;
  },

  /**
   * Called after a repair of an invalid drop. By default, highlights this.dragData.ddel
   */
  afterRepair: function () {
    if (Ext.enableFx) {
      Ext.Element.fly(this.dragData.ddel).highlight(this.hlColor || 'c3daf9');
    }
    this.dragging = false;
  },

  /**
   * Called before a repair of an invalid drop to get the XY to animate to. By default returns
   * the XY of this.dragData.ddel
   * @param {EventObject} e The mouse up event
   * @return {Array} The xy location (e.g. [100, 200])
   */
  getRepairXY: function (e) {
    return Ext.Element.fly(this.dragData.ddel).getXY();
  },
});
/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

/**
 * @class Ext.dd.DropTarget
 * @extends Ext.dd.DDTarget
 * A simple class that provides the basic implementation needed to make any element a drop target that can have
 * draggable items dropped onto it.  The drop has no effect until an implementation of notifyDrop is provided.
 * @constructor
 * @param {Mixed} el The container element
 * @param {Object} config
 */
Ext.dd.DropTarget = function (el, config) {
  this.el = Ext.get(el);

  Ext.apply(this, config);

  if (this.containerScroll) {
    Ext.dd.ScrollManager.register(this.el);
  }

  Ext.dd.DropTarget.superclass.constructor.call(
    this,
    this.el.dom,
    this.ddGroup || this.group,
    { isTarget: true },
  );
};

Ext.extend(Ext.dd.DropTarget, Ext.dd.DDTarget, {
  /**
   * @cfg {String} ddGroup
   * A named drag drop group to which this object belongs.  If a group is specified, then this object will only
   * interact with other drag drop objects in the same group (defaults to undefined).
   */
  /**
   * @cfg {String} overClass
   * The CSS class applied to the drop target element while the drag source is over it (defaults to "").
   */
  /**
   * @cfg {String} dropAllowed
   * The CSS class returned to the drag source when drop is allowed (defaults to "x-dd-drop-ok").
   */
  dropAllowed: 'x-dd-drop-ok',
  /**
   * @cfg {String} dropNotAllowed
   * The CSS class returned to the drag source when drop is not allowed (defaults to "x-dd-drop-nodrop").
   */
  dropNotAllowed: 'x-dd-drop-nodrop',

  // private
  isTarget: true,

  // private
  isNotifyTarget: true,

  /**
   * The function a {@link Ext.dd.DragSource} calls once to notify this drop target that the source is now over the
   * target.  This default implementation adds the CSS class specified by overClass (if any) to the drop element
   * and returns the dropAllowed config value.  This method should be overridden if drop validation is required.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop target
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {String} status The CSS class that communicates the drop status back to the source so that the
   * underlying {@link Ext.dd.StatusProxy} can be updated
   */
  notifyEnter: function (dd, e, data) {
    if (this.overClass) {
      this.el.addClass(this.overClass);
    }
    return this.dropAllowed;
  },

  /**
   * The function a {@link Ext.dd.DragSource} calls continuously while it is being dragged over the target.
   * This method will be called on every mouse movement while the drag source is over the drop target.
   * This default implementation simply returns the dropAllowed config value.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop target
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {String} status The CSS class that communicates the drop status back to the source so that the
   * underlying {@link Ext.dd.StatusProxy} can be updated
   */
  notifyOver: function (dd, e, data) {
    return this.dropAllowed;
  },

  /**
   * The function a {@link Ext.dd.DragSource} calls once to notify this drop target that the source has been dragged
   * out of the target without dropping.  This default implementation simply removes the CSS class specified by
   * overClass (if any) from the drop element.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop target
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   */
  notifyOut: function (dd, e, data) {
    if (this.overClass) {
      this.el.removeClass(this.overClass);
    }
  },

  /**
   * The function a {@link Ext.dd.DragSource} calls once to notify this drop target that the dragged item has
   * been dropped on it.  This method has no default implementation and returns false, so you must provide an
   * implementation that does something to process the drop event and returns true so that the drag source's
   * repair action does not run.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop target
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {Boolean} True if the drop was valid, else false
   */
  notifyDrop: function (dd, e, data) {
    return false;
  },
});
/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

/**
 * @class Ext.dd.DropZone
 * @extends Ext.dd.DropTarget
 * This class provides a container DD instance that proxies for multiple child node targets.<br />
 * By default, this class requires that child nodes accepting drop are registered with {@link Ext.dd.Registry}.
 * @constructor
 * @param {Mixed} el The container element
 * @param {Object} config
 */
Ext.dd.DropZone = function (el, config) {
  Ext.dd.DropZone.superclass.constructor.call(this, el, config);
};

Ext.extend(Ext.dd.DropZone, Ext.dd.DropTarget, {
  /**
   * Returns a custom data object associated with the DOM node that is the target of the event.  By default
   * this looks up the event target in the {@link Ext.dd.Registry}, although you can override this method to
   * provide your own custom lookup.
   * @param {Event} e The event
   * @return {Object} data The custom data
   */
  getTargetFromEvent: function (e) {
    return Ext.dd.Registry.getTargetFromEvent(e);
  },

  /**
   * Called internally when the DropZone determines that a {@link Ext.dd.DragSource} has entered a drop node
   * that it has registered.  This method has no default implementation and should be overridden to provide
   * node-specific processing if necessary.
   * @param {Object} nodeData The custom data associated with the drop node (this is the same value returned from
   * {@link #getTargetFromEvent} for this node)
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop zone
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   */
  onNodeEnter: function (n, dd, e, data) {},

  /**
   * Called internally while the DropZone determines that a {@link Ext.dd.DragSource} is over a drop node
   * that it has registered.  The default implementation returns this.dropNotAllowed, so it should be
   * overridden to provide the proper feedback.
   * @param {Object} nodeData The custom data associated with the drop node (this is the same value returned from
   * {@link #getTargetFromEvent} for this node)
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop zone
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {String} status The CSS class that communicates the drop status back to the source so that the
   * underlying {@link Ext.dd.StatusProxy} can be updated
   */
  onNodeOver: function (n, dd, e, data) {
    return this.dropAllowed;
  },

  /**
   * Called internally when the DropZone determines that a {@link Ext.dd.DragSource} has been dragged out of
   * the drop node without dropping.  This method has no default implementation and should be overridden to provide
   * node-specific processing if necessary.
   * @param {Object} nodeData The custom data associated with the drop node (this is the same value returned from
   * {@link #getTargetFromEvent} for this node)
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop zone
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   */
  onNodeOut: function (n, dd, e, data) {},

  /**
   * Called internally when the DropZone determines that a {@link Ext.dd.DragSource} has been dropped onto
   * the drop node.  The default implementation returns false, so it should be overridden to provide the
   * appropriate processing of the drop event and return true so that the drag source's repair action does not run.
   * @param {Object} nodeData The custom data associated with the drop node (this is the same value returned from
   * {@link #getTargetFromEvent} for this node)
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop zone
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {Boolean} True if the drop was valid, else false
   */
  onNodeDrop: function (n, dd, e, data) {
    return false;
  },

  /**
   * Called internally while the DropZone determines that a {@link Ext.dd.DragSource} is being dragged over it,
   * but not over any of its registered drop nodes.  The default implementation returns this.dropNotAllowed, so
   * it should be overridden to provide the proper feedback if necessary.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop zone
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {String} status The CSS class that communicates the drop status back to the source so that the
   * underlying {@link Ext.dd.StatusProxy} can be updated
   */
  onContainerOver: function (dd, e, data) {
    return this.dropNotAllowed;
  },

  /**
   * Called internally when the DropZone determines that a {@link Ext.dd.DragSource} has been dropped on it,
   * but not on any of its registered drop nodes.  The default implementation returns false, so it should be
   * overridden to provide the appropriate processing of the drop event if you need the drop zone itself to
   * be able to accept drops.  It should return true when valid so that the drag source's repair action does not run.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop zone
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {Boolean} True if the drop was valid, else false
   */
  onContainerDrop: function (dd, e, data) {
    return false;
  },

  /**
   * The function a {@link Ext.dd.DragSource} calls once to notify this drop zone that the source is now over
   * the zone.  The default implementation returns this.dropNotAllowed and expects that only registered drop
   * nodes can process drag drop operations, so if you need the drop zone itself to be able to process drops
   * you should override this method and provide a custom implementation.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop zone
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {String} status The CSS class that communicates the drop status back to the source so that the
   * underlying {@link Ext.dd.StatusProxy} can be updated
   */
  notifyEnter: function (dd, e, data) {
    return this.dropNotAllowed;
  },

  /**
   * The function a {@link Ext.dd.DragSource} calls continuously while it is being dragged over the drop zone.
   * This method will be called on every mouse movement while the drag source is over the drop zone.
   * It will call {@link #onNodeOver} while the drag source is over a registered node, and will also automatically
   * delegate to the appropriate node-specific methods as necessary when the drag source enters and exits
   * registered nodes ({@link #onNodeEnter}, {@link #onNodeOut}). If the drag source is not currently over a
   * registered node, it will call {@link #onContainerOver}.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop zone
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {String} status The CSS class that communicates the drop status back to the source so that the
   * underlying {@link Ext.dd.StatusProxy} can be updated
   */
  notifyOver: function (dd, e, data) {
    var n = this.getTargetFromEvent(e);
    if (!n) {
      // not over valid drop target
      if (this.lastOverNode) {
        this.onNodeOut(this.lastOverNode, dd, e, data);
        this.lastOverNode = null;
      }
      return this.onContainerOver(dd, e, data);
    }
    if (this.lastOverNode != n) {
      if (this.lastOverNode) {
        this.onNodeOut(this.lastOverNode, dd, e, data);
      }
      this.onNodeEnter(n, dd, e, data);
      this.lastOverNode = n;
    }
    return this.onNodeOver(n, dd, e, data);
  },

  /**
   * The function a {@link Ext.dd.DragSource} calls once to notify this drop zone that the source has been dragged
   * out of the zone without dropping.  If the drag source is currently over a registered node, the notification
   * will be delegated to {@link #onNodeOut} for node-specific handling, otherwise it will be ignored.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop target
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag zone
   */
  notifyOut: function (dd, e, data) {
    if (this.lastOverNode) {
      this.onNodeOut(this.lastOverNode, dd, e, data);
      this.lastOverNode = null;
    }
  },

  /**
   * The function a {@link Ext.dd.DragSource} calls once to notify this drop zone that the dragged item has
   * been dropped on it.  The drag zone will look up the target node based on the event passed in, and if there
   * is a node registered for that event, it will delegate to {@link #onNodeDrop} for node-specific handling,
   * otherwise it will call {@link #onContainerDrop}.
   * @param {Ext.dd.DragSource} source The drag source that was dragged over this drop zone
   * @param {Event} e The event
   * @param {Object} data An object containing arbitrary data supplied by the drag source
   * @return {Boolean} True if the drop was valid, else false
   */
  notifyDrop: function (dd, e, data) {
    if (this.lastOverNode) {
      this.onNodeOut(this.lastOverNode, dd, e, data);
      this.lastOverNode = null;
    }
    var n = this.getTargetFromEvent(e);
    return n
      ? this.onNodeDrop(n, dd, e, data)
      : this.onContainerDrop(dd, e, data);
  },

  // private
  triggerCacheRefresh: function () {
    Ext.dd.DDM.refreshCache(this.groups);
  },
});
/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

/**
 * @class Ext.dd.Registry
 * Provides easy access to all drag drop components that are registered on a page.  Items can be retrieved either
 * directly by DOM node id, or by passing in the drag drop event that occurred and looking up the event target.
 * @singleton
 */
Ext.dd.Registry = (function () {
  var elements = {};
  var handles = {};
  var autoIdSeed = 0;

  var getId = function (el, autogen) {
    if (typeof el == 'string') {
      return el;
    }
    var id = el.id;
    if (!id && autogen !== false) {
      id = 'extdd-' + ++autoIdSeed;
      el.id = id;
    }
    return id;
  };

  return {
    /**
     * Resgister a drag drop element
     * @param {String/HTMLElement) element The id or DOM node to register
     * @param {Object} data (optional) An custom data object that will be passed between the elements that are involved
     * in drag drop operations.  You can populate this object with any arbitrary properties that your own code
     * knows how to interpret, plus there are some specific properties known to the Registry that should be
     * populated in the data object (if applicable):
     * <pre>
Value      Description<br />
---------  ------------------------------------------<br />
handles    Array of DOM nodes that trigger dragging<br />
           for the element being registered<br />
isHandle   True if the element passed in triggers<br />
           dragging itself, else false
</pre>
     */
    register: function (el, data) {
      data = data || {};
      if (typeof el == 'string') {
        el = document.getElementById(el);
      }
      data.ddel = el;
      elements[getId(el)] = data;
      if (data.isHandle !== false) {
        handles[data.ddel.id] = data;
      }
      if (data.handles) {
        var hs = data.handles;
        for (var i = 0, len = hs.length; i < len; i++) {
          handles[getId(hs[i])] = data;
        }
      }
    },

    /**
     * Unregister a drag drop element
     * @param {String/HTMLElement) element The id or DOM node to unregister
     */
    unregister: function (el) {
      var id = getId(el, false);
      var data = elements[id];
      if (data) {
        delete elements[id];
        if (data.handles) {
          var hs = data.handles;
          for (var i = 0, len = hs.length; i < len; i++) {
            delete handles[getId(hs[i], false)];
          }
        }
      }
    },

    /**
     * Returns the handle registered for a DOM Node by id
     * @param {String/HTMLElement} id The DOM node or id to look up
     * @return {Object} handle The custom handle data
     */
    getHandle: function (id) {
      if (typeof id != 'string') {
        // must be element?
        id = id.id;
      }
      return handles[id];
    },

    /**
     * Returns the handle that is registered for the DOM node that is the target of the event
     * @param {Event} e The event
     * @return {Object} handle The custom handle data
     */
    getHandleFromEvent: function (e) {
      var t = Ext.lib.Event.getTarget(e);
      return t ? handles[t.id] : null;
    },

    /**
     * Returns a custom data object that is registered for a DOM node by id
     * @param {String/HTMLElement} id The DOM node or id to look up
     * @return {Object} data The custom data
     */
    getTarget: function (id) {
      if (typeof id != 'string') {
        // must be element?
        id = id.id;
      }
      return elements[id];
    },

    /**
     * Returns a custom data object that is registered for the DOM node that is the target of the event
     * @param {Event} e The event
     * @return {Object} data The custom data
     */
    getTargetFromEvent: function (e) {
      var t = Ext.lib.Event.getTarget(e);
      return t ? elements[t.id] || handles[t.id] : null;
    },
  };
})();
/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

/**
 * @class Ext.dd.ScrollManager
 * <p>Provides automatic scrolling of overflow regions in the page during drag operations.</p>
 * <p>The ScrollManager configs will be used as the defaults for any scroll container registered with it,
 * but you can also override most of the configs per scroll container by adding a 
 * <tt>ddScrollConfig</tt> object to the target element that contains these properties: {@link #hthresh},
 * {@link #vthresh}, {@link #increment} and {@link #frequency}.  Example usage:
 * <pre><code>
var el = Ext.get('scroll-ct');
el.ddScrollConfig = {
    vthresh: 50,
    hthresh: -1,
    frequency: 100,
    increment: 200
};
Ext.dd.ScrollManager.register(el);
</code></pre>
 * <b>Note: This class uses "Point Mode" and is untested in "Intersect Mode".</b>
 * @singleton
 */
Ext.dd.ScrollManager = (function () {
  var ddm = Ext.dd.DragDropMgr;
  var els = {};
  var dragEl = null;
  var proc = {};

  var onStop = function (e) {
    dragEl = null;
    clearProc();
  };

  var triggerRefresh = function () {
    if (ddm.dragCurrent) {
      ddm.refreshCache(ddm.dragCurrent.groups);
    }
  };

  var doScroll = function () {
    if (ddm.dragCurrent) {
      var dds = Ext.dd.ScrollManager;
      var inc = proc.el.ddScrollConfig
        ? proc.el.ddScrollConfig.increment
        : dds.increment;
      if (!dds.animate) {
        if (proc.el.scroll(proc.dir, inc)) {
          triggerRefresh();
        }
      } else {
        proc.el.scroll(proc.dir, inc, true, dds.animDuration, triggerRefresh);
      }
    }
  };

  var clearProc = function () {
    if (proc.id) {
      clearInterval(proc.id);
    }
    proc.id = 0;
    proc.el = null;
    proc.dir = '';
  };

  var startProc = function (el, dir) {
    clearProc();
    proc.el = el;
    proc.dir = dir;
    var freq =
      el.ddScrollConfig && el.ddScrollConfig.frequency
        ? el.ddScrollConfig.frequency
        : Ext.dd.ScrollManager.frequency;
    proc.id = setInterval(doScroll, freq);
  };

  var onFire = function (e, isDrop) {
    if (isDrop || !ddm.dragCurrent) {
      return;
    }
    var dds = Ext.dd.ScrollManager;
    if (!dragEl || dragEl != ddm.dragCurrent) {
      dragEl = ddm.dragCurrent;
      // refresh regions on drag start
      dds.refreshCache();
    }

    var xy = Ext.lib.Event.getXY(e);
    var pt = new Ext.lib.Point(xy[0], xy[1]);
    for (var id in els) {
      var el = els[id],
        r = el._region;
      var c = el.ddScrollConfig ? el.ddScrollConfig : dds;
      if (r && r.contains(pt) && el.isScrollable()) {
        if (r.bottom - pt.y <= c.vthresh) {
          if (proc.el != el) {
            startProc(el, 'down');
          }
          return;
        } else if (r.right - pt.x <= c.hthresh) {
          if (proc.el != el) {
            startProc(el, 'left');
          }
          return;
        } else if (pt.y - r.top <= c.vthresh) {
          if (proc.el != el) {
            startProc(el, 'up');
          }
          return;
        } else if (pt.x - r.left <= c.hthresh) {
          if (proc.el != el) {
            startProc(el, 'right');
          }
          return;
        }
      }
    }
    clearProc();
  };

  ddm.fireEvents = ddm.fireEvents.createSequence(onFire, ddm);
  ddm.stopDrag = ddm.stopDrag.createSequence(onStop, ddm);

  return {
    /**
     * Registers new overflow element(s) to auto scroll
     * @param {Mixed/Array} el The id of or the element to be scrolled or an array of either
     */
    register: function (el) {
      if (Ext.isArray(el)) {
        for (var i = 0, len = el.length; i < len; i++) {
          this.register(el[i]);
        }
      } else {
        el = Ext.get(el);
        els[el.id] = el;
      }
    },

    /**
     * Unregisters overflow element(s) so they are no longer scrolled
     * @param {Mixed/Array} el The id of or the element to be removed or an array of either
     */
    unregister: function (el) {
      if (Ext.isArray(el)) {
        for (var i = 0, len = el.length; i < len; i++) {
          this.unregister(el[i]);
        }
      } else {
        el = Ext.get(el);
        delete els[el.id];
      }
    },

    /**
     * The number of pixels from the top or bottom edge of a container the pointer needs to be to
     * trigger scrolling (defaults to 25)
     * @type Number
     */
    vthresh: 25,
    /**
     * The number of pixels from the right or left edge of a container the pointer needs to be to
     * trigger scrolling (defaults to 25)
     * @type Number
     */
    hthresh: 25,

    /**
     * The number of pixels to scroll in each scroll increment (defaults to 50)
     * @type Number
     */
    increment: 100,

    /**
     * The frequency of scrolls in milliseconds (defaults to 500)
     * @type Number
     */
    frequency: 500,

    /**
     * True to animate the scroll (defaults to true)
     * @type Boolean
     */
    animate: true,

    /**
     * The animation duration in seconds -
     * MUST BE less than Ext.dd.ScrollManager.frequency! (defaults to .4)
     * @type Number
     */
    animDuration: 0.4,

    /**
     * Manually trigger a cache refresh.
     */
    refreshCache: function () {
      for (var id in els) {
        if (typeof els[id] == 'object') {
          // for people extending the object prototype
          els[id]._region = els[id].getRegion();
        }
      }
    },
  };
})();
/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

/**
 * @class Ext.dd.StatusProxy
 * A specialized drag proxy that supports a drop status icon, {@link Ext.Layer} styles and auto-repair.  This is the
 * default drag proxy used by all Ext.dd components.
 * @constructor
 * @param {Object} config
 */
Ext.dd.StatusProxy = function (config) {
  Ext.apply(this, config);
  this.id = this.id || Ext.id();
  this.el = new Ext.Layer({
    dh: {
      id: this.id,
      tag: 'div',
      cls: 'x-dd-drag-proxy ' + this.dropNotAllowed,
      children: [
        { tag: 'div', cls: 'x-dd-drop-icon' },
        { tag: 'div', cls: 'x-dd-drag-ghost' },
      ],
    },
    shadow: !config || config.shadow !== false,
  });
  this.ghost = Ext.get(this.el.dom.childNodes[1]);
  this.dropStatus = this.dropNotAllowed;
};

Ext.dd.StatusProxy.prototype = {
  /**
   * @cfg {String} dropAllowed
   * The CSS class to apply to the status element when drop is allowed (defaults to "x-dd-drop-ok").
   */
  dropAllowed: 'x-dd-drop-ok',
  /**
   * @cfg {String} dropNotAllowed
   * The CSS class to apply to the status element when drop is not allowed (defaults to "x-dd-drop-nodrop").
   */
  dropNotAllowed: 'x-dd-drop-nodrop',

  /**
   * Updates the proxy's visual element to indicate the status of whether or not drop is allowed
   * over the current target element.
   * @param {String} cssClass The css class for the new drop status indicator image
   */
  setStatus: function (cssClass) {
    cssClass = cssClass || this.dropNotAllowed;
    if (this.dropStatus != cssClass) {
      this.el.replaceClass(this.dropStatus, cssClass);
      this.dropStatus = cssClass;
    }
  },

  /**
   * Resets the status indicator to the default dropNotAllowed value
   * @param {Boolean} clearGhost True to also remove all content from the ghost, false to preserve it
   */
  reset: function (clearGhost) {
    this.el.dom.className = 'x-dd-drag-proxy ' + this.dropNotAllowed;
    this.dropStatus = this.dropNotAllowed;
    if (clearGhost) {
      this.ghost.update('');
    }
  },

  /**
   * Updates the contents of the ghost element
   * @param {String/HTMLElement} html The html that will replace the current innerHTML of the ghost element, or a
   * DOM node to append as the child of the ghost element (in which case the innerHTML will be cleared first).
   */
  update: function (html) {
    if (typeof html == 'string') {
      this.ghost.update(html);
    } else {
      this.ghost.update('');
      html.style.margin = '0';
      this.ghost.dom.appendChild(html);
    }
    var el = this.ghost.dom.firstChild;
    if (el) {
      Ext.fly(el).setStyle(Ext.isIE ? 'styleFloat' : 'cssFloat', 'none');
    }
  },

  /**
   * Returns the underlying proxy {@link Ext.Layer}
   * @return {Ext.Layer} el
   */
  getEl: function () {
    return this.el;
  },

  /**
   * Returns the ghost element
   * @return {Ext.Element} el
   */
  getGhost: function () {
    return this.ghost;
  },

  /**
   * Hides the proxy
   * @param {Boolean} clear True to reset the status and clear the ghost contents, false to preserve them
   */
  hide: function (clear) {
    this.el.hide();
    if (clear) {
      this.reset(true);
    }
  },

  /**
   * Stops the repair animation if it's currently running
   */
  stop: function () {
    if (this.anim && this.anim.isAnimated && this.anim.isAnimated()) {
      this.anim.stop();
    }
  },

  /**
   * Displays this proxy
   */
  show: function () {
    this.el.show();
  },

  /**
   * Force the Layer to sync its shadow and shim positions to the element
   */
  sync: function () {
    this.el.sync();
  },

  /**
   * Causes the proxy to return to its position of origin via an animation.  Should be called after an
   * invalid drop operation by the item being dragged.
   * @param {Array} xy The XY position of the element ([x, y])
   * @param {Function} callback The function to call after the repair is complete
   * @param {Object} scope The scope in which to execute the callback
   */
  repair: function (xy, callback, scope) {
    this.callback = callback;
    this.scope = scope;
    if (xy && this.animRepair !== false) {
      this.el.addClass('x-dd-drag-repair');
      this.el.hideUnders(true);
      this.anim = this.el.shift({
        duration: this.repairDuration || 0.5,
        easing: 'easeOut',
        xy: xy,
        stopFx: true,
        callback: this.afterRepair,
        scope: this,
      });
    } else {
      this.afterRepair();
    }
  },

  // private
  afterRepair: function () {
    this.hide(true);
    if (typeof this.callback == 'function') {
      this.callback.call(this.scope || this);
    }
    this.callback = null;
    this.scope = null;
  },
};
