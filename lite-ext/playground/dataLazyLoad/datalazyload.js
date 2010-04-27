/**
 YUI3数据延迟加载组件
 修改自：http://code.google.com/p/kissy/
 **/
YUI.add('dataLazyLoad', function (Y) {
    var LAZY_TEXTAREA_CSS = "ks-datalazyload";
    var EMPTY_IMG_SRC = "http://a.tbcdn.cn/kissy/1.0.4/build/datalazyload/dot.gif";
    var IMG_SRC_BAK = "data-src";
    var LAZY_LOAD_EVENT="lazyShow";
    
    Y.mix(Y, {
        filter: function (arr, callback) {
            if (!arr || !arr.length) return;
            for (var i = arr.length; i--;) {
                var el = arr[i];
                if (callback(el, i) === false) {
                    arr.splice(i, 1);
                }
            }
        }
    });
    function DataLazyLoad(config) {
    		//实例或工厂方法都可以
        if (!this instanceof DataLazyLoad) return new DataLazyLoad(config);
        DataLazyLoad.superclass.constructor.apply(this, arguments);
    }
    var WIN = Y.one(window);
    
    DataLazyLoad.NAME = "dataLazyLoad";
    DataLazyLoad.ATTRS = {
        containers: {
        		//Y.all形式参数统一化处理
            setter: function (nodes) {
                var containers = Y.all(nodes);
                if (!containers || containers.isEmpty()) {
                    Y.fail('no containers: ' + nodes);
                }
                return containers;
            }
        }
    };
    Y.extend(DataLazyLoad, Y.Base, {
    		//得到可见的文档纵轴下限
        _getLowerThreshold: function () {
            return (WIN.get("docScrollY") + WIN.get("winHeight")*1.5);
        },
        //初始化函数
        initializer: function (cfg) {
        		//即将由于延迟加载而显示的图片元素
        		this.publish(LAZY_LOAD_EVENT);
            var containers = this.get("containers");
            var self = this;
            var lazyImages = [];
            var lazyTextareas = [];
            var threshold = this._getLowerThreshold();
            containers.each(function (el) {
                el.all("img").each(function (img) {
                    var mY = img.getY();
                    //初始屏下的才惰性加载
                    if (mY <= threshold) {
                        return;
                    }
                    lazyImages.push(img);
                    img.setAttribute(IMG_SRC_BAK, img.get("src"))
                    img.set("src", EMPTY_IMG_SRC);
                });
                el.all("textarea." + LAZY_TEXTAREA_CSS).each(function (t) {
                    var mY = t.getY();
                    //初始屏下的才惰性加载，其他立即处理
                    if (mY <= threshold) {
                        t.insert(t.get("value"), "before");
                        t.remove();
                        return;
                    }
                    lazyTextareas.push(t);
                });
            });
            this.lazyImages = lazyImages;
            this.lazyTextareas = lazyTextareas;
            //resize以及scroll时都需要查看是否需要延时加载
            this._onScroll = WIN.on("scroll", this._loadByThreshold, this);
            this._onResize = WIN.on("resize", this._loadByThreshold, this);
        },
        
        //根据滚动条位置开始延迟加载
        _loadByThreshold: function () {
            var lazyImages = this.lazyImages;
            var lazyTextareas = this.lazyTextareas;
            var threshold = this._getLowerThreshold();
            var self=this;
            Y.filter(lazyImages, function (img) {
                var mY = img.getY();
                if (mY <= threshold) {
                    img.set("src", img.getAttribute(IMG_SRC_BAK));
                    self.fire(LAZY_LOAD_EVENT,img);
                    return false;
                }
            });
            Y.filter(lazyTextareas, function (textarea) {
                var mY = textarea.getY();
                if (mY <= threshold) {
                    textarea.insert(textarea.get("value"), "before");
                    textarea.remove();
                    return false;
                }
            });
            //如果可懒加载的都已处理，则去除resize,scroll的事件绑定
            if (lazyTextareas.length == 0 && lazyImages.length == 0) {
                this.destructor();
            }
        },
        _detachListens: function () {
            if (this._onScroll) {
                this._onScroll.detach();
                delete this._onScroll;
            }
            if (this._onResize) {
                this._onResize.detach();
                delete this._onResize;
            }
        },
        // the destroy() lifecycle phase
        destructor: function () {
            delete this.lazyImages;
            delete this.lazyTextareas;
            this._detachListens();
        }
    });
    Y.DataLazyLoad = DataLazyLoad;
});