/**
 * Created by Shuilan on 14-8-31.
 */
KISSY.add(function (S, require) {

    require('node');
    var Event = require('event');
    var Util = require('./util');
    var $ = S.all;

    var defaultStep = 5,
        defaultPerspective = 800;

    function Curve(cfg){
        var self = this;
        self.perspective = cfg.perspective || defaultPerspective;
        self.step = cfg.step || defaultStep;
        self.cfg = cfg;

        self.items = [];
        self.itemList = [];
        self.itemCatch = {};

        self._checkEls(cfg.container);
        self._initStage();
    }

    S.augment(Curve,Event.Target, {

        /**
         * 节点检查
         * @param container
         * @private
         */
        _checkEls : function(container){
            var self = this;

            if(!container){
                S.warn('miss container');
                return;
            }

            var stage = container.one('.stage');

            if(!stage){
                S.warn('miss stage');
                return;
            }

            var items = stage.all('.item');
            if(!items || !items.length){
                S.warn('miss items');
                return;
            }

            S.each(items, function(item, index){
                self.items.push(item);
                self.itemList.push({
                    el : item,
                    index : index
                })
            });

            this.container = container;
            this.stage = stage;
        },


        _initStage : function(){
            var self = this;

            var item = $(this.items[0]);

            //单个元素宽高
            var itemH = item.outerHeight(),
                itemW = item.outerWidth();

            //容器宽度
            var W = self.container.outerWidth()/2;

            //半径
            var R = Util.getHypotenuse({
                o : itemW/2,
                d : self.step/2
            });

            //角度
            var D = Util.getDegree({
                o : W,
                r : R
            });

            //平面到圆心距离
            var H = Util.getAdjacent({
                d : D,
                r : R
            });

            //第一个元素到圆心的距离
            var Z = Util.getAdjacent({
                o : itemW/2,
                d : self.step/2
            });

            //初次渲染个数
            var N = self.items.length;

            //可旋转范围
            var startRotate = D - self.step/2;
            self.range = {
                min : startRotate,
                max : self.step * N - D - self.step/2,
                visualRange : 2 * D,
                visualNum : 2 * D/self.step
            };

            self.itemW = itemW;
            self.H = H;

            self._initItemCatch(Z, N, self.cfg.data);

            S.each(self.items, function(item, index){
                var pos = self.itemCatch[index].pos;
                self._rePositionItem(item, pos);
            });

            self.container.css({
                '-webkit-perspective': this.perspective + 'px',
                'perspective': this.perspective + 'px'
            });

            self.stage.css({
                'height': itemH,
                'width': itemW,
                'margin': '0 auto',
                'transform-style': 'preserve-3d',
                '-webkit-transition': '-webkit-transform 1s',
                'transition': '-webkit-transform 1s',
                '-ms-transform': 'translateZ(' + H + 'px) rotateY('+ startRotate +'deg)',
                '-webkit-transform': 'translateZ(' + H + 'px) rotateY('+ startRotate +'deg)',
                'transform': 'translateZ(' + H + 'px) rotateY('+ startRotate +'deg)'
            });
        },


        /**
         * 调整元素位置
         * @param itemEl 节点
         * @param itemPos  位置信息
         * @private
         */
        _rePositionItem : function(itemEl, itemPos){
            var d = 0 - itemPos.d;
            $(itemEl).css({
                '-ms-transform-origin-x': 'left',
                '-webkit-transform-origin-x': 'left',
                'transform-origin-x': 'left',
                '-ms-transform': 'translateZ(' + itemPos.z + 'px)  rotateY(' + d +'deg)',
                '-webkit-transform': 'translateZ(' + itemPos.z + 'px)  rotateY(' + d +'deg)',
                'transform': 'translateZ(' + itemPos.z + 'px)  rotateY(' + d +'deg)',
                'position' : 'absolute',
                'left': itemPos.left  + 'px'
            });
        },


        rotate : function(v){
            if(this.cfg.asyncLoad){
                this._asyncLoad(v);
            }else{
                if(v < this.range.min){
                    v = this.range.min;
                }else if(v > this.range.max){
                    v = this.range.max;
                }
                this._rotate(v);
            }
        },

        _rotate : function(v){
            this.stage.css({
                '-ms-transform': 'translateZ('+ this.H +'px) rotateY(' + v + 'deg)',
                '-webkit-transform': 'translateZ('+ this.H +'px) rotateY(' + v + 'deg)',
                'transform': 'translateZ('+ this.H +'px) rotateY(' + v + 'deg)'
            });
        },


        _asyncLoad : function(v){
            var self = this;

            if(v < this.range.min){
                this.fire('load',{
                    loadType : 'prepend',
                    n : Math.ceil((this.range.min - v)/this.step),
                    callback : function(data){
                        var currIndex = self.itemCatch.first;
                        var len = data.length;

                        var changedIndex = [];
                        for(var i = 1; i<=len; i++){
                            changedIndex.push(currIndex - i);
                        }

                        data.reverse();
                        self._prependItemCatch(len, data);
                        self._renderItems(changedIndex);

                        self._rotate(v);
                        self.range.min -= self.step * len;
                    }
                });

            }else if(v > this.range.max){
                this.fire('load',{
                    loadType : 'append',
                    n : Math.ceil((v - this.range.max)/this.step),
                    callback : function(data){
                        var len = data.length;

                        var currIndex = self.itemCatch.last;
                        var changedIndex = [];
                        for(var i = 0 ;i < len ; i++){
                            changedIndex.push(++currIndex);
                        }

                        self._appendItemCatch(len, data);
                        self._renderItems(changedIndex);

                        self.range.max += self.step * len;
                        self._rotate(v);
                    }
                });

            }else{
                this._rotate(v);
            }
        },


        _renderItems : function(list){
            var self = this;
            S.each(list, function(itemIndex){
                var pos = self.itemCatch[itemIndex].pos;
                var itemData = self.itemCatch[itemIndex].data;

                var item = $(self.cfg.renderTpl(itemData));
                self._rePositionItem(item, pos);

                self.stage.append(item);
                self.items.push(item);
            });
        },


        _initItemCatch: function(z, n, data){
            var self = this;

            self.itemCatch.first = 0;
            self.itemCatch.last = 0;

            if(data){
                n = data.length;
            }

            self.itemCatch[0] = {
                pos : {
                    d : 0, //选转角度
                    w : self.itemW,  //投影后的宽度
                    h : 0,  //高
                    z : -z,  //后退距离
                    left : 0  //偏移距离
                },
                data : data ? data[0] : {}
            };

            if(data){
                data.shift();
                n = data.length;
                self._appendItemCatch(n, data);
            }else{
                self._appendItemCatch(n);
            }

        },

        _prependItemCatch :function(n, data){

            var firstIndex = this.itemCatch.first;

            for(var i = 0; i< n; i++){

                var first = this.itemCatch[firstIndex].pos;
                var d = first.d - this.step;

                var w = Util.getAdjacent({
                    r : this.itemW,
                    d : d
                });

                var h = Util.getOpposite({
                    r : this.itemW,
                    d : d
                });

                var posInfo = {
                    d : d,
                    w : w,
                    h : h,
                    z : first.z - h,
                    left : first.left - w
                };

                this.itemCatch[--firstIndex]={
                    pos : posInfo,
                    data : data ? data[i] : {}
                };
            }

            this.itemCatch.first = firstIndex;

        },

        _appendItemCatch : function(n, data){

            var lastIndex = this.itemCatch.last;

            for(var i = 0; i< n; i++){

                var last = this.itemCatch[lastIndex].pos;
                var d = last.d + this.step;

                var w = Util.getAdjacent({
                    r : this.itemW,
                    d : d
                });

                var h = Util.getOpposite({
                    r : this.itemW,
                    d : d
                });

                var posInfo = {
                    d : d,
                    w : w,
                    h : h,
                    z : last.z + last.h,
                    left : last.left + last.w
                };

                this.itemCatch[++lastIndex]={
                    pos : posInfo,
                    data : data ? data[i] : {}
                };
            }

            this.itemCatch.last = lastIndex;
        }

    });

    return Curve;
});