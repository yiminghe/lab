/*
	v1.0(20090616) 根据淘宝首页slider的样子，加入渐隐效果，鼠标移动缓冲
	v1.5(20090706) 小标标号计算改变，增强容错处理.
	v1.5.5(20091023) js不支持时设计考虑
	v1.6(20091113) puzzle mode support,code reorganize	
	v1.7(20091114) 添加水平垂直滚动，考虑js不支持的情况
	v1.8(20091120) fadeTo 两幅同时变化
	v2.0(20100225) 利用Ext.lib.AnimMgr停止前面动画避免过快鼠标移动变化，利用mask替位尚未载入图片
*/
Ext.namespace('Ext.ux');
Ext.ux.SliderLite = function (config) {
    config = config || {};
    if (!config.id) {
        alert("no id !");
        return null;
    }
    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    var container = Ext.get(config.id);
    var that = this;
    this.el = container;
    this.imageContainer = container.child(".sliderImages");
    this._images = container.select(".sliderImages>li", true);
    //支持 js 才显示下标数字
    container.addClass("js");
    this._numbers = container.select(".sliderNumbers>li", true);
    this._totalNum = this._numbers.getCount();
    if (this._totalNum != this._images.getCount()) {
        alert("number of pics and lables not equal!");
        return;
    }
    //一个及以下就不需要轮换显示了
    if (this._totalNum <= 1) {
        return;
    }
    var containerWidth = this.el.getWidth(true);
    var containerHeight = this.el.getHeight(true);
    function update(holder) {
        holder.unmask();
    }
    this._images.each(function (el) {
        var img = el.child("img");
        var holder = img.parent().wrap();
        if (img.dom.complete) {} else {
            holder.setSize(containerWidth, containerHeight);
            holder.mask("载入中 ...", "x-mask-loading");
            img.on("load", function () {
                update(holder);
            });
        }
    });
    this.init();
};
Ext.extend(Ext.ux.SliderLite, Ext.util.Observable, {
    init: function () {
        var container = this.el;
        var that = this;
        this.el.unmask();
        this._imageDimension = [];
        this._images.each(function (el) {
            that._imageDimension.push({
                width: el.getComputedWidth(),
                height: el.getComputedHeight()
            });
        });
        this.anim = this[this.anim] ? this.anim : "fadeTo";
        if (this.setUp[this.anim]) {
            this.setUp[this.anim].call(this);
        }
        this._numbers.item(0).addClass('current');
        this._currentNum = 0;
        //给小标编号，便于查找对应图片对应
        this._numbers.each(function (el, this_, index) {
            el.dom.sliderNumberIndex = index;
        });
        var numUl = this.el.select(".sliderNumbers").item(0);
        //鼠标经过数字变换当前图片
        //注意设置buffer防止鼠标移动过快，和渐隐效果冲突
        numUl.on("mouseover", this._mouseover, this, {
            //ie can not stop mouseover
            //stopEvent :true,
            delegate: "li",
            buffer: 100
            //之前已经触发过 container mouseover ,slider 已停
            //400 和 _unHightlight duration 参数相等
        });
        //经过容器就停止图片自动变换
        if (Ext.isIE) {
            this.el.on("mouseenter", function () {
                this.stopSlider();
            },
            this);
        } else {
            this.el.on("mouseover", function (evt) {
                if (container.contains(evt.getRelatedTarget()) || container.dom == evt.getRelatedTarget()) {} else {
                    this.stopSlider();
                }
            },
            this);
        }
        //移出容器就开始图片自动变换
        if (Ext.isIE) {
            this.el.on("mouseleave", function (evt) {
                this.startSlider();
            },
            this);
        } else {
            //离开 li 会触发 li mouseout,container mouseout,container mouseover
            //进入 li 会触发 container mouseout ,li mouseover,container mouseover
            //模拟 ie 的 mouseleave
            this.el.on("mouseout", function (evt) {
                if (container.contains(evt.getRelatedTarget()) || container.dom == evt.getRelatedTarget()) {} else {
                    this.startSlider();
                }
            },
            this);
        }
        this.interval = this.interval || 5000;
        this.interval = Math.max(this.interval, 2000);
        this.startSlider();
    },
    setUp: {
        commonHide: function () {
            this._images.each(function (el) {
                el.setDisplayed(false);
            });
            this._images.item(0).setDisplayed(true);
        },
        commonShow: function () {
            this._images.each(function (el) {
                el.setDisplayed(true);
            });
        },
        fadeTo: function () {
            this._images.each(function (el, this_, index) {
                el.position("absolute");
                el.setLeftTop(0, 0);
                el.hide();
                el.setStyle({
                    zIndex: index
                });
            });
            this._images.item(0).show();
        },
        puzzleTo: function () {
            this.setUp.commonHide.call(this);
            this.animParts = this.animParts || [2, 2]
        },
        scrollHorizontal: function () {
            this.imageContainer.setStyle({
                width: (this._getScrollDistance(0, this._totalNum).width + this._getScrollDistance(0, 1).width) + "px"
            });
            this.imageContainer.dom.appendChild(this.imageContainer.first().dom.cloneNode(true));
            this.scrollWrap = this.imageContainer.wrap({
                style: {
                    width: this._getScrollDistance(0, 1).width + "px",
                    overflow: 'hidden'
                }
            });
        },
        scrollVertical: function () {
            this.imageContainer.addClass("scrollTopImg");
            var that = this;
            this.imageContainer.setStyle({
                height: (this._getScrollDistance(0, this._totalNum).height + this._getScrollDistance(0, 1).height) + "px"
            });
            this.imageContainer.dom.appendChild(this.imageContainer.first().dom.cloneNode(true));
            this.scrollWrap = this.imageContainer.wrap({
                style: {
                    height: this._getScrollDistance(0, 1).height + "px",
                    width: this._getScrollDistance(0, 1).width + "px",
                    overflow: 'hidden'
                }
            });
            this.scrollWrap.scrollTo("top", 1);
        }
    },
    _getScrollDistance: function (start, end) {
        if (start > end) {
            var t = start;
            start = end;
            end = t;
        }
        var r = {
            width: 0,
            height: 0
        };
        for (var i = start; i < end; i++) {
            r.width += this._imageDimension[i].width;
            r.height += this._imageDimension[i].height;
        }
        return r;
    },
    getImageByIndex: function (num) {
        return this._images.item(num);
    },
    getNumberLiByIndex: function (num) {
        return this._numbers.item(num);
    },
    _goTo: function (numInt) {
        if (this._currentNum == numInt) return;
        this._stopAnims();
        this._numbers.removeClass("current");
        this.getNumberLiByIndex(numInt).addClass("current");
        this[this.anim](numInt);
        this._currentNum = numInt;
    },
    _mouseover: function (evt, numEl) {
        var numInt = numEl.sliderNumberIndex;
        this._goTo(numInt);
    },
    //自动轮换
    _timeRunner: function (numInt) {
        this._goTo(numInt);
        this.startSlider();
    },
    _randIt: function (l, u) {
        return l + Math.floor(Math.random() * (u - l + 1));
    },
    _stopAnims: function () {
        if (this.anims) {
            for (var i = 0; i < this.anims.length; i++) {
                var anim = this.anims[i];
                Ext.lib.AnimMgr.stop(anim);
            }            
        }
        this.anims = [];
    },
    scrollHorizontal: function (numInt) {
        var d = this._getScrollDistance(0, numInt).width;
        var that = this;
        var animOpt = {
            duration: 1,
            callback: function () {
                if (numInt == 0) {
                    that.scrollWrap.scrollTo("left", 0);
                }
            }
        };
        this.scrollWrap.scrollTo("left", d, animOpt);
        this.anims.push(animOpt.anim);
    },
    scrollVertical: function (numInt) {
        var d = this._getScrollDistance(0, numInt).height;
        var that = this;
        var animOpt = {
            duration: 1,
            callback: function () {
                if (numInt == 0) {
                    that.scrollWrap.scrollTo("top", 1);
                }
            }
        };
        this.scrollWrap.scrollTo("top", d, animOpt);
        this.anims.push(animOpt.anim);
    },
    //inspired by :http://cnwander.com/blog/?p=13
    puzzleTo: function (numInt) {
        this.getImageByIndex(this._currentNum).setDisplayed(false);
        //current image to show
        var curImg = this.getImageByIndex(numInt).child("img");
        //current image wrap a
        var curA = this.getImageByIndex(numInt).child("a");
        this.getImageByIndex(numInt).show();
        var width = this._imageDimension[numInt].width;
        var height = this._imageDimension[numInt].height;
        //a can not has div child ,so use it's wrap
        var curAWrap = curA.parent();
        curA.hide();
        //part's individual dimension
        var partWidth = width / this.animParts[0];
        var partHeight = height / this.animParts[1];
        var curAXY = curAWrap.getXY();
        var total = this.animParts[0] * this.animParts[1];
        //current parts
        var totalParts = [];
        for (var i = 0; i < this.animParts[0]; i++) {
            for (var j = 0; j < this.animParts[1]; j++) {
                //the end position this part should be
                var destinedLeft = curAXY[0] + i * partWidth;
                var destinedTop = curAXY[1] + j * partHeight;
                //this part's start position ,random
                var cx = this._randIt(destinedLeft - partWidth, destinedLeft + partWidth);
                var cy = this._randIt(destinedTop - partHeight, destinedTop + partHeight);
                //xhtml tag rule no valid ,sorry
                var part = Ext.DomHelper.append(curAWrap, {
                    tag: 'div',
                    style: {
                        "background": "url(" + curImg.dom.src + ") -" + (i * partWidth) + "px -" + (j * partHeight) + "px",
                        position: 'absolute',
                        overflow: 'hidden',
                        width: partWidth + "px",
                        height: partHeight + "px"
                    }
                },
                true);
                //in order to get left top css value
                part.setXY([destinedLeft, destinedTop]);
                part.setOpacity(0);
                var dleft = part.getLeft(true);
                var dtop = part.getTop(true);
                part.setXY([cx, cy]);
                //now anim it
                this.anims.push(part.anim({
                    left: {
                        to: dleft
                    },
                    top: {
                        to: dtop
                    },
                    opacity: {
                        to: 1
                    }
                },
                {
                    duration: 1,
                    callback: function (elA) {
                        total--;
                        //if all parts anim complete
                        if (total == 0) {
                            //show the whole picture
                            curA.show();
                            totalParts.push(elA);
                            //remove all anim parts
                            Ext.each(totalParts, function (el) {
                                el.remove();
                            });
                            totalParts = null;
                        } else totalParts.push(elA);
                    }
                }));
            }
        }
    },
    //设置当前图片
    fadeTo: function (numInt) {
        var oneHide = this.getImageByIndex(this._currentNum);
        var oneShow = this.getImageByIndex(numInt);
        var oneHZ = +oneHide.getStyle("zIndex");
        var oneSZ = +oneShow.getStyle("zIndex");
        if (oneHZ > oneSZ) {
            oneHide.setStyle({
                zIndex: oneSZ
            });
            oneShow.setStyle({
                zIndex: oneHZ
            });
        }
        var animOpt = {
            endOpacity: 0.5,
            duration: 0.5
            //ie6 canot hide ,if set Zindex	
            ,
            callback: function (el) {
                el.setOpacity(0);
            }
        };
        //图片渐隐隐藏    
        this.getImageByIndex(this._currentNum).fadeOut(animOpt);
        this.anims.push(animOpt.anim);
        //图片渐隐出现
        var animOpt = {
            duration: 0.5
        };
        this.getImageByIndex(numInt).fadeIn(animOpt);
        this.anims.push(animOpt.anim);
    },
    //自动轮换开始
    _runSlider: function () {
        var nextInt = (this._currentNum + 1) % this._totalNum;
        this._timeRunner(nextInt);
    },
    //5秒后开始轮换图片
    startSlider: function () {
        this.stopSlider();
        this.timeRunnerId = this._runSlider.defer(this.interval, this);
    },
    //停止自动轮换图片
    stopSlider: function () {
        if (this.timeRunnerId) {
            clearTimeout(this.timeRunnerId);
            this.timeRunnerId = null;
        }
    }
});