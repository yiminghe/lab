/*
	v1.0(20090616) 根据淘宝首页slider的样子，加入渐隐效果，鼠标移动缓冲
	v1.5(20090706) 小标标号计算改变，增强容错处理.
	v1.5.5(20091023) js不支持时设计考虑
	v1.6(20091113) puzzle mode support,code reorganize	
*/
Ext.namespace('Ext.ux');
Ext.ux.SliderLite = function(config) {
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
    //支持 js 才显示下标数字
    container.addClass("js");
    this._images = container.select(".sliderImages>li", true);
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
    this._images.item(0).addClass('current');
    this._numbers.item(0).addClass('current');
    this._currentNum = 0;


    //给小标编号，便于查找对应图片对应
    this._numbers.each(function(el, this_, index) {
        el.dom.sliderNumberIndex = index;
    });

    var numUl = container.select(".sliderNumbers").item(0);
    //鼠标经过数字变换当前图片
    //注意设置buffer防止鼠标移动过快，和渐隐效果冲突
    numUl.on("mouseover", this._mouseover, this, {
        //ie can not stop mouseover
        //stopEvent :true,
        delegate: "li",
        buffer: 400
        //之前已经触发过 container mouseover ,slider 已停
        //400 和 _unHightlight duration 参数相等
    });

    //经过容器就停止图片自动变换
    if(Ext.isIE) {
	    container.on("mouseenter",
		    function() {
		        this.stopSlider();
		    },
	    this);
  	} else {
  		container.on("mouseover",
		    function(evt) {
		    	if (container.contains(evt.getRelatedTarget()) || container.dom == evt.getRelatedTarget()) {
          } else {
            this.stopSlider();
          }
		    },
	    this);
  	}

    //移出容器就开始图片自动变换
    if (Ext.isIE) {
        container.on("mouseleave",
        function(evt) {
            this.startSlider();
            },
        this);
    } else {
        //离开 li 会触发 li mouseout,container mouseout,container mouseover
        //进入 li 会触发 container mouseout ,li mouseover,container mouseover
        //模拟 ie 的 mouseleave
        container.on("mouseout",
        function(evt) {
            if (container.contains(evt.getRelatedTarget()) || container.dom == evt.getRelatedTarget()) {

                } else {
               this.startSlider();
                }
						
        },
        this);
    }
    this.anim = this[this.anim] ? this.anim: "goTo";
    this.anim == "puzzleTo" && (this.animParts = this.animParts || [2, 2]);
    this.interval = this.interval || 5000;
    this.interval = Math.max(this.interval, 2000);
    this.startSlider();
};

Ext.extend(Ext.ux.SliderLite, Ext.util.Observable, {

    getImageByIndex: function(num) {
        return this._images.item(num);
    },

    getNumberLiByIndex: function(num) {
        return this._numbers.item(num);
    },

    _mouseover: function(evt, numEl) {
        var numInt = numEl.sliderNumberIndex;
        this[this.anim](numInt);
    },

    //自动轮换
    _timeRunner: function(numInt) {
        this[this.anim](numInt);
        this.startSlider();
    },
    _randIt: function(l, u) {
        return l + Math.floor(Math.random() * (u - l + 1));
    },
    //inspired by :http://cnwander.com/blog/?p=13
    puzzleTo: function(numInt) {
        if (this._currentNum != numInt) {
            this.getNumberLiByIndex(this._currentNum).removeClass("current");
            this.getNumberLiByIndex(numInt).addClass("current");
            this.getImageByIndex(this._currentNum).setDisplayed(false);
            //current image to show
            var curImg = this.getImageByIndex(numInt).child("img");
            //current image wrap a
            var curA = this.getImageByIndex(numInt).child("a");
            this.getImageByIndex(numInt).show();
            var width = curImg.getComputedWidth();
            var height = curImg.getComputedHeight();
            curImg.hide();
            //part's individual dimension
            var partWidth = width / this.animParts[0];
            var partHeight = height / this.animParts[1];
            var curAXY = curA.getXY();
            var total = this.animParts[0]*this.animParts[1];
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
                    var part = Ext.DomHelper.append(curA, {
                        tag: 'div',
                        style: {
                            "background": "url(" + curImg.dom.src + ") -" + (i * partWidth) + "px -" + (j * partHeight) + "px",
                            position: 'absolute',
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
                    part.anim({
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
                        callback: function(elA) {
                            total--;
                            //if all parts anim complete
                            if (total == 0) {
                                //show the whole picture
                                curImg.show();
                                totalParts.push(elA);
                                //remove all anim parts
                                Ext.each(totalParts,
                                function(el) {
                                    el.remove();
                                });
                                totalParts = null;
                            }
                            else totalParts.push(elA);
                        }
                    });
                }
            }
            this._currentNum = numInt;
        }
    },


    //设置当前图片
    goTo: function(numInt) {
        if (this._currentNum != numInt) {
            this.getNumberLiByIndex(this._currentNum).removeClass("current");
            this.getNumberLiByIndex(numInt).addClass("current");
            this._unHightlight(this._currentNum, this._highlight.createDelegate(this, [numInt]))
        }
    },


    //图片渐隐出现
    _highlight: function(num) {
        this.getImageByIndex(this._currentNum).removeClass("current");
        this.getImageByIndex(num).addClass("current");
        this._currentNum = num;
        this.getImageByIndex(num).fadeIn({
            endOpacity: 1,
            //can be any value between 0 and 1 (e.g. .5)
            easing: 'easeOut',
            duration: .5
        });

    },

    //图片渐隐隐藏
    _unHightlight: function(num, callback) {
        this.getImageByIndex(num).fadeOut({
            endOpacity: 0.2,
            //can be any value between 0 and 1 (e.g. .5)
            easing: 'easeOut',
            duration: .4,
            callback: callback
        });
    },

    //自动轮换开始
    _runSlider: function() {
        var nextInt = this._currentNum + 1;
        if (this._totalNum <= nextInt) nextInt = 0;
        this._timeRunner(nextInt);
    },

    //5秒后开始轮换图片
    startSlider: function() {
        this.stopSlider();
        this.timeRunnerId = this._runSlider.defer(this.interval, this);
    },

    //停止自动轮换图片
    stopSlider: function() {
        if (this.timeRunnerId) {
            clearTimeout(this.timeRunnerId);
            this.timeRunnerId = null;
        }
    }

});