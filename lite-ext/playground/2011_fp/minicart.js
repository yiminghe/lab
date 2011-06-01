/**
 * mini 购物车逻辑
 * @creater qiaohua
 * @depends ks-core, TB.Global
 */
(function(undefined) {
    var S = KISSY, win = window, doc = document,

        isIE76 = !'0'[0],
        isIE6 = isIE76 && !window.XMLHttpRequest,
        domain = doc.domain,
        IS_DAILY = !(domain.indexOf('taobao.com') > -1 || domain.indexOf('tmall.com') > -1),
        HOSTNAME = IS_DAILY ? '.daily.taobao.net' : '.taobao.com',
        BUY_HOST = 'http://buy' + HOSTNAME +'/',

        CARTDATA_API = BUY_HOST + 'auction/cart/trail_mini_cart.htm?',
        REMOVE_API = BUY_HOST + 'auction/cart/del_mini_cart.htm?',
        REMOVEING = '正在删除中', REMOVE = '删除',
        MINI_CLS = 'mini-cart-',
        HD_CLS = MINI_CLS + 'hd', BD_CLS = MINI_CLS + 'bd', IMG_CLS = MINI_CLS + 'img',
        COUNT_CLS = MINI_CLS + 'count', DEL_CLS = MINI_CLS + 'del',
        TITLE_CLS = MINI_CLS + 'title', INFO_CLS = MINI_CLS + 'info',
        FT_CLS = MINI_CLS + 'ft', PRICE_CLS = MINI_CLS + 'price', BT_CLS = MINI_CLS + 'bt',
        CONTENT_CLS = MINI_CLS + 'content', LOADING_CLS = MINI_CLS + 'loading', READY_CLS = MINI_CLS + 'ready',
        HOVER_CLS = 'hover', MINI_CART_ID = 'data-cartId', DOT = '.', EMPTY = '',
        escapeHTML = function (str) {
            /**
             * escape
             * 实体字符特殊处理
             */
            // @see http://www.strictly-software.com//scripts/downloads/encoder.js
            var arr = str.match(/&#[0-9]{1,5};/g);

            if (arr != null) {
                var m, c, x;
                for (x = 0; x < arr.length; x++) {
                    m = arr[x];
                    c = m.substring(2, m.length - 1);
                    if (c >= -32768 && c <= 65535) {
                        str = str.replace(m, String.fromCharCode(c));
                    } else {
                        str = str.replace(m, "");
                    }
                }
            }

            return str.replace('<', '&lt;').replace('>', '&gt;');
            /*var div = doc.createElement('div'),
                text = doc.createTextNode(str);
            div.appendChild(text);

            return div.innerHTML;*/
        },
        ellipsis = function(el) {
            el.css({'white-space': 'nowrap', 'overflow': 'hidden'});
            // if browser support 'text-overflow' property, just use it
            if ('textOverflow' in doc.documentElement.style ||
                'OTextOverflow' in doc.documentElement.style) {
                el.css({
                    'text-overflow': 'ellipsis',
                    '-o-text-overflow': 'ellipsis'
                });
            } else { //firefox does not support the text-overflow property, so...
                var obj = el;
                if (!obj.data('text')) obj.data('text', obj.text());
                var text = obj.attr('text') || obj.text(),
                    w = obj.width(),
                    a = 0,
                    b = text.length,
                    c = b,
                    t = new S.Node(obj[0].cloneNode(true)).insertAfter(obj);
                obj.text(text);
                t.text(text).css({
                        'position': 'absolute',
                        'width': 'auto',
                        'visibility': 'hidden',
                        'overflow': 'hidden'
                    });
                if (t.width() > w) {
                    while ((c = Math.floor((b + a) / 2)) > a) {
                        t.text(text.substr(0, c) + '…');
                        if (t.width() > w) b = c;
                        else a = c;
                    }
                    obj.text(text.substr(0, c) + '…');
                    if (!obj.attr('title')) obj.attr('title', text);
                }
                t.remove();
            }
        },
        send = function(url) {
            if (IS_DAILY) return;
            
            new Image().src = 'http://www.atpanel.com/jsclick?minicart='+ url + '&cache=' + S.now();
        },
        EMPTY_MSG = '您购物车里还没有任何宝贝。',
        TIMEOVER_MSG = '系统目前繁忙，请稍后再试。',
        INVALID_MSG = '您购物车里的宝贝均已失效。',
        isHTTPS = (doc.location.href.indexOf("https://") === 0);

        win.MiniCart = {
            /**
             * 初始化 Mini购物车对象
             * @creater
             * @param num {Number}
             */
            init: function(num, show) {
                var self = this;

                // 购物车数量为负数 不显示
                num = parseInt(num);
                if (isNaN(num) || num < 0) return;

                // 购物车数量
                self.cartNum = num;
                self._rendUI();

                // 不显示浮层
                if (!show) return;
                self._bindUI();
                // 是否过期, 请求过后的 10s 内不会过期
                //self.isExpired = true;
                // 是否正在请求中
                self._loading = false;
                // 是否点击了 trigger
                //self._clicked = false;
                // 是否鼠标进入了浮层
                //self._entered = false;
            },
            _rendUI: function() {
                var self = this;

                // 吊顶购物车容器
                self.trigger = S.one('#site-nav .cart');
                // 吊顶购物车a
                self.elem = new S.Node(self.trigger.children()[0]);
                // 浮出层容器
                self.content = new S.Node('<div>').addClass(CONTENT_CLS).appendTo(doc.body);

                if (isIE6 && !isHTTPS) {
                    self._shim = new S.Node("<" + "iframe style='position: absolute; width:0; height: 0;" +
                        "filter:alpha(opacity=0);" +
                        "z-index:9998;'>").appendTo(doc.body);
                }
            },

            _bindUI: function() {
                var self = this,
                    trigger = self.trigger,
                    content = self.content, showTimer, hideTimer;

                function clearTimer(timer) {
                    if (timer) {
                        timer.cancel();
                    }
                    return undefined;
                }
                function setHideTimer() {
                    hideTimer = S.later(function() {
                        self.hide();
                    }, 320);
                }

                // 鼠标移入/移出 吊顶购物车时
                trigger.on('mouseenter', function(ev) {
                    if (TB.Global._OFF) return;
                    
                    self._entered = true;
                    // fix 鼠标移入到数字/下拉按钮时, 重复触发 enter 事件
                    var target = new S.Node(ev.target)[0].tagName.toLowerCase();
                    if (target === 'b' || target === 'i' ) {
                        ev.halt();
                        return;
                    }

                    hideTimer = clearTimer(hideTimer);
                    showTimer = S.later(function() {
                        if (content.css('display') === 'none' && !self._clicked) {
                            send('http://www.atpanel.com/jsclick?cache=*&minicart=popup');
                            self.show();
                        }
                        showTimer = undefined;
                    }, 100);
                }).on('mouseleave', function() {
                    if (TB.Global._OFF) return;
                    
                    self._entered = false;
                    showTimer = clearTimer(showTimer);
                    setHideTimer();
                }).on('click', function() {
                    if (TB.Global._OFF) return;
                    self._clicked = true;
                    send('topclick');
                });

                content.on('mouseenter', function() {
                    if (TB.Global._OFF) return;
                    
                    self._entered = true;
                    hideTimer = clearTimer(hideTimer);
                }).on('mouseleave', function() {
                    if (TB.Global._OFF) return;
                    
                    self._entered = false;
                    setHideTimer();
                }).on( 'click', function(e) {
                    if (TB.Global._OFF) return;
                    
                    var target = new S.Node(e.target), prt;

                    if (target[0].tagName.toLowerCase() === 'a') {
                        prt = target.parent();

                        // 点击删除事件
                        if (prt.hasClass(DEL_CLS)) {
                            e.preventDefault();
                            e.halt();

                            if (target.html() === REMOVEING) return;

                            send('delete');
                            target.html(REMOVEING);
                            S.getScript(REMOVE_API + 'callback=MiniCart.remove' + '&del_id=' + prt.parent().attr(MINI_CART_ID) + '&t=' + S.now(), function() {
                                target.html(REMOVE);
                                this.parentNode.removeChild(this);
                            });
                        }
                        // 点击 查看我的购物车按钮
                        else if (prt.hasClass(BT_CLS)) {
                            send('showmycart');
                        }
                    }
                });
            },
            _hideContent: function() {
                var self = this;
                self._entered = false;
                S.later(function() {
                    if (!self._entered) {
                        self.hide();
                    }
                }, 2000);
            },
            remove: function(data) {
                var self = this;

                if (!data) return;

                // 删除成功
                if (data.status) {
                    var content = self.content,
                        allItems = content.one(DOT+BD_CLS);

                    // 先隐藏被删除的条目, 再更新数据
                    S.each(allItems.children(), function(current) {
                        current = new S.Node(current);
                        if (current.attr(MINI_CART_ID) == data.delCart) {
                            var _update = function() {
                                current.remove ? current.remove() : current[0].parentNode.removeChild(current[0]);
                                self.setData(data);

                                // 剩空时, fix 不能直接隐藏浮层 bug
                                if (self.cartNum === 0) self._hideContent();
                            };
                            if (!isIE6) current.animate ? current.animate('opacity: 0', 1, 'easeOut', _update) : _update();
                            else _update();
                            return false;
                        }
                    });
                } else {
                    alert(data.errMsg);
                }
            },
            show: function() {
                var self = this,
                    content = self.content,
                    elem = self.elem,
                    _setData = function(msg) {
                        self.setData({
                            status: false,
                            errMsg: msg
                        });
                        S.log(msg);
                    };

                content.addClass(LOADING_CLS).offset({left: self.trigger.offset().left+0.5});
                elem.addClass(HOVER_CLS);

                // 没有请求过 或者 10s 内没请求过了
                if  ((!self._data || self.isExpired) && !self._loading) {
                    content.html(EMPTY);

                    if (self.cartNum < 1) {
                        _setData(EMPTY_MSG);
                        return;
                    }
                    self._loading = true;
                    self._setTimeout(function() {
                        _setData(TIMEOVER_MSG);
                    });

                    S.later(function() {
                        if (self._clicked) return;

                        S.getScript(CARTDATA_API + 'callback=MiniCart.setData' + '&t=' + S.now(), function() {
                            self._loading = false;

                            this.parentNode.removeChild(this);
                        });
                    }, 300);
                } else {
                    // 没有过期时, 直接显示之前的内容, 10s 后再次请求
                    if (!self._loading) {
                        content.removeClass(LOADING_CLS);
                    }
                    content.addClass(READY_CLS);
                }

                self._shim && self._shim.show();
            },
            hide: function() {
                var self = this;

                self.content.removeClass(LOADING_CLS).removeClass(READY_CLS);
                self.elem.removeClass(HOVER_CLS);

                self._shim && self._shim.hide();

                if (TB.Global._OFF) {
                    try {
                        S.Event.remove(self.content[0]);
                        S.Event.remove(self.elem[0]);
                    } catch(e) {
                        S.log(e);
                    }
                }
            },

            _parseItem: function(data) {
                var self = this,
                    html = EMPTY, item = data.item, itemLen = item ? item.length : 0, rest = 0;

                if (itemLen > 0) {
                    rest = data.num - itemLen;

                    html += '<div class="' + HD_CLS + '">最近加入的宝贝:</div>'
                        + '<ul class="' + BD_CLS + '">';

                    S.each(item, function(item) {
                        var link = 'http://item' + HOSTNAME + '/item.htm?id=' + item.itemId,
                            title = escapeHTML(item.title)/*,
                            complete = title*/;
                        /*if (title.length > 15) {
                            title = title.slice(0, 15) + '...';
                        }*/
                        html += '<li ' + MINI_CART_ID + '="' + item.cartId + '">'
                             + '<div class="' + IMG_CLS + '"><a target="_top" href="' + link + '"><img src="' + item.picUrl + '" /></a></div>'

                             + '<div class="' + COUNT_CLS + '">&yen;<strong class="' + PRICE_CLS + '">' + item.price + '</strong></div>'

                             + '<div class="' + DEL_CLS + '"><a href="#">删除</a></div>'
                             + '<div class="' + TITLE_CLS + '"><a target="_top" href="' + link + '" title="' + title + '">' + title + '</a></div>'
                             + (item.sku && item.sku.length ?'<div class="' + INFO_CLS + '"><span>' + item.sku.join('</span><span>') + '</span></div>':EMPTY)
                             + '</li>';
                    });
                    html += '</ul>';
                }
                if (rest > 0) {
                    html += '<div class="' + FT_CLS + '">'
                         + self._parseRest(rest, data.num)
                         + '</div>';
                }
                return html;
            },
            _parseRest: function(rest, total) {
                if (rest>0) {
                    return '购物车里还有' + rest + '件宝贝';//, 总计' + total + '件宝贝';
                }
                return EMPTY;
            },
            _parseMsg: function(msg) {
                var html = EMPTY;

                html += '<div class="' + BT_CLS + '">'
                     + '<a target="_top" href="'+'http://ju.atpanel.com/?url='+ BUY_HOST
                     + 'auction/cart/my_cart.htm?from=mini&ad_id=&am_id=&cm_id=&pm_id=150042785330be233161'+'">查看我的购物车</a>'
                     + (msg || EMPTY)
                     + '</div>';

                return html;
            },

            // 发出请求的十秒后, 还没有执行相应的代码, 就执行 callback
            _setTimeout: function(callback) {
                var self = this;

                if (self._timeout) return;
                self._timeout = S.later(function() {
                    callback();
                    self._timeout = undefined;
                }, 10000);
            },
            _clearTimeout: function() {
                var self = this;

                if (self._timeout) self._timeout.cancel();
                self._timeout = undefined;
            },
            // 设置购物车浮层数据
            setData: function(data) {
                var self = this, html = EMPTY, content = self.content;
                self._clearTimeout();
                
                if (!data) return;

                if (data.status) {
                    var num = data.num,
                        is_remove = false;
                    // num < 0 时,
                    // 为 -2 时, 表示删除成功, 但取不到正确的数值, 得依靠客户端修改数值
                    if (S.isNumber(num) && num === -2) {
                        num = self.cartNum - 1;
                        is_remove = true;
                    }
                    TB.Global.setCartNum(num);

                    self._data = data;
                    // 购物车有>0的数值时, 设置购物车数量
                    if (num > 0) {
                        if (data.item && data.item.length) {
                            html = self._parseItem(data) + self._parseMsg(EMPTY);
                        }
                        // 数字大于0 , 但是属于 num -1 时情况时
                        else if (is_remove) {
                            // 更新浮层上的数字信息
                            var ft = content.one(DOT+FT_CLS),
                                li_num = content.one(DOT+BD_CLS).all('li').length;
                            // 删除后, 仍有商品
                            if (li_num) {
                                // 原本有无效商品提示
                                ft && ft.html(self._parseRest(num - li_num, num));
                                html = content.html();
                            }
                            // 删除后, 已经没有商品
                            else {
                                html = self._parseMsg(ft ? INVALID_MSG : EMPTY_MSG);
                                self._hideContent();
                            }
                        }
                        // 没有返回记录, 但 data.num >0 , 表示购物车里失效
                        else {
                            html = self._parseMsg(INVALID_MSG);
                            self._hideContent();
                        }
                    } else if (num === 0) {
                        html = self._parseMsg(EMPTY_MSG);
                    }/* else {
                        // 避免出现空白浮层, 显示查看购物车按钮
                        html = self._parseMsg(data.errMsg);
                    }*/

                    // 每当重新请求一次时, 设置为在 30s 后过期;
                    self.isExpired = false;
                    setTimeout(function() {
                        self.isExpired = true;
                    }, 30000);
                } else {
                    html = self._parseMsg(data.errMsg);
                }
                // data.num 非 -1 时正常显示, 为 -1 时, 在 setCartNum 时已经隐藏了
                if (data.num !== -1) {
                    content.html(html).removeClass(LOADING_CLS).addClass(READY_CLS);

                    // ellipsis
                    S.each(S.all(DOT+TITLE_CLS), function(el) {
                        var el = new S.Node(el),
                            ct = 280 - el.prev(DOT+COUNT_CLS).width() - 70, // 总宽度 - 左侧图片 - 右侧价格
                            a = el.one('a');
                        a.width(ct);
                        ellipsis(a);
                    });
                    // 更新浮层shim  +24/+12 是浮层的 padding 和 border
                    self._shim && self._shim.offset(content.offset()).width(content.width()+24).height(content.height()+12);

                    // 鼠标在 data 到来之前就移出浮层时, 需要隐藏
                    if (!self._entered) self.hide();
                }
            }
        };
})();


/**
 * NOTE:
 * - 购物车数量>0时, 才显示浮出层
 * - 鼠标移入/移出时间, 延迟 300 ms
 * - 显示浮出层, 请求数据后, 数据的过期时间为 10000 ms, 当层正在显示时, 碰到过期, 不会更新当前层数据. 只有重新hover上去才会更新
 * - 删除时, 数据返回有可能不成功
 */

