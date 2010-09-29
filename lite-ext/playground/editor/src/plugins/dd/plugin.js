/**
 * dd support for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSY.Editor.add("dd", function() {
    var S = KISSY,
        KE = S.Editor,
        Event = S.Event,
        DOM = S.DOM,
        Node = S.Node;
    if (KE.DD) return;

    KE.DD = {};

    function Manager() {
        Manager.superclass.constructor.apply(this, arguments);
        this._init();
    }

    Manager.ATTRS = {
        /**
         * mousedown 后 buffer 触发时间
         */
        timeThred:{},
        /**
         * 当前激活的拖对象
         */
        activeDrag:{},
        /**
         * 所有注册对象
         */
        drags:{value:{}}
    };

    S.extend(Manager, S.Base, {
        _init:function() {
            KE.Utils.lazyRun(this, "_prepare", "_real");

        },
        reg:function(node) {
            var drags = this.get("drags");
            if (!node[0].id) {
                node[0].id = S.guid("drag-");
            }
            drags[node[0].id] = node;
            this._prepare();
        },
        _move:function(ev) {
            var activeDrag = this.get("activeDrag");
            if (!activeDrag) return;
            activeDrag._move(ev);
        },
        _start:function(drag) {
            var self = this;
            self.set("activeDrag", drag);
            self._pg.css({
                display: "",
                height: DOM.docHeight()
            });
        },
        _end:function(ev) {
            var self = this,activeDrag = self.get("activeDrag");
            if (!activeDrag) return;
            activeDrag._end(ev);
            self.set("activeDrag", null);
            self._pg.css({
                display:"none"
            });
        },
        _prepare:function() {
            var self = this;
            //创造垫片，防止进入iframe，外面document监听不到 mousedown/up/move
            self._pg = new Node("<div " +
                "style='" +
                //red for debug
                "background-color:red;" +
                "position:absolute;" +
                "left:0;" +
                "width:100%;" +
                "top:0;" +
                "z-index:9999;" +
                "'></div>").appendTo(document.body);
            //0.5 for debug
            self._pg.css("opacity", 0);
            Event.on(document, "mousemove", KE.Utils.throttle(this._move, this, 10));
            Event.on(document, "mouseup", this._end, this);

        },

        _real:function() {

        }

    });

    KE.DD.DDM = new Manager();
    var DDM = KE.DD.DDM;

    function Draggable() {
        Draggable.superclass.constructor.apply(this, arguments);
        this._init();
    }

    Draggable.ATTRS = {
        //拖放节点
        node:{},
        //handler 集合
        handlers:{value:{}}
    };

    S.extend(Draggable, S.Base, {
        _init:function() {
            var self=this,node = self.get("node"),handlers = self.get("handlers");
            DDM.reg(node);
            if (S.isEmptyObject(handlers)) {
                handlers[node[0].id] = node;
            }
            for (var h in handlers) {
                if (!handlers.hasOwnProperty(h)) continue;
                var hl = handlers[h],ori = hl.css("cursor");
                if (!ori || ori === "auto")
                    hl.css("cursor", "move");
                //ie 不能被选择了
                hl._4e_unselectable();
            }
            node.on("mousedown", self._handleMouseDown, self);
            node.on("mouseup", function() {
                DDM._end();
            });
        },
        _check:function(t) {
            var handlers = this.get("handlers");
            for (var h in handlers) {
                if (!handlers.hasOwnProperty(h)) continue;
                if (handlers[h]._4e_equals(t)) return true;
            }
            return false;
        },
        _handleMouseDown:function(ev) {
            var self=this,t = new Node(ev.target);
            if (!self._check(t)) return;
            ev.halt();
            DDM._start(self);
            var node = self.get("node");
            var mx = ev.pageX,my = ev.pageY,nxy = node.offset();
            self.startMousePos = {
                left:mx,
                top:my
            };
            self.startNodePos = nxy;
            self._diff = {
                left:mx - nxy.left,
                top:my - nxy.top
            };
            self.fire("start");
        },
        _move:function(ev) {
            this.fire("move", ev)
        },
        _end:function() {

        }
    });


    function Drag() {
        Drag.superclass.constructor.apply(this, arguments);
    }

    S.extend(Drag, Draggable, {
        _init:function() {
            Drag.superclass._init.apply(this, arguments);
            var node = this.get("node"),self = this;
            self.on("move", function(ev) {
                var left = ev.pageX - self._diff.left,
                    top = ev.pageY - self._diff.top;
                node.offset({
                    left:left,
                    top:top
                })
            });
        }
    });

    KE.Draggable = Draggable;
    KE.Drag = Drag;

});