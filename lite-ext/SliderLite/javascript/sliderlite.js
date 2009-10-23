/*
	v1.0(20090616) 根据淘宝首页slider的样子，加入渐隐效果，鼠标移动缓冲
	v1.5(20090706) 小标标号计算改变，增强容错处理.
	v1.5.5(20091023) js不支持时设计考虑
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
    container.on("mouseover",
    function() {
        this.stopSlider();
    },
    this, {
        stopEvent: true
    });

    //移出容器就开始图片自动变换
    //离开 li 会触发 li mouseout,container mouseout,container mouseover
    //进入 li 会触发 container mouseout ,li mouseover,container mouseover
    container.on("mouseout",
    function(evt) {
        this.startSlider();
    },
    this, {
        stopEvent: true
    });
    this.interval = this.interval || 5000;
    this.interval = Math.max(this.interval, 1000);
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
        this.goTo(numInt);
    },

    //自动轮换
    _timeRunner: function(numInt) {
        this.goTo(numInt);
        this.startSlider();
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