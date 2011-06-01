/**
 * 全局模块
 * @desc 仅处理顶通和一些全局功能的载入
 * @creater sorrycc@gmail.com(yunqian)
 * @depends tb-core
 */

var TB = KISSY.app('TB');

TB.add('mod~global', function() {

    var S = KISSY,
        isIE76 = !'0'[0],
        isIE6 = isIE76 && !window.XMLHttpRequest,
        doc = document, win = window, assetsHost, urlConfig,
        SPACE = ' ', HOVER = 'hover',
        isIE = !!window.ActiveXObject,
        siteNavElem,
        APPID = 'g_config' in win ? ('appId' in win['g_config'] ? parseInt(win['g_config']['appId']): undefined) : undefined ,
        MINICART_CLS = 'mini-cart', MINICART_NO_LAYER_CLS = 'mini-cart-no-layer',
        hostname = location.hostname.split('.'),
        domain = doc.domain,
        IS_TMALL = domain.indexOf('tmall.com') > -1,
        IS_DAILY = !(domain.indexOf('taobao.com') > -1 || IS_TMALL),
        HOSTNAME = IS_DAILY ? '.daily.taobao.net' : '.taobao.com',
        EMPTY = '',

        // https 请求 (登录注册页面)
        isHTTPS = (doc.location.href.indexOf("https://") === 0),
    
        // 所有用到的 cookie
        COOKIES = {},

        // 初始化函数队列
        runItems = {

            /**
             * 顶通
             */
            siteNav: function() {
                if (!siteNavElem) return;
                siteNavElem.setAttribute("role","navigation");
                var submenus = [];
                S.each(getElementsByClassName('menu', '*', siteNavElem), function(el) {
                    /*aria support by 承玉*/
                    var el_bd = getElementsByClassName('menu-bd', '*', el)[0];
                    var el_hd = getElementsByClassName('menu-hd', '*', el)[0];
                    el_hd.tabIndex=0;
                    submenus.push(el_bd);
                    
                    el_bd.setAttribute("role","menu");
                    el_bd.setAttribute("aria-hidden","true");  
                                      
                    if(!el_bd.getAttribute("id")){
                        el_bd.setAttribute("id",S.guid("menu-"));
                    }
                    
                    el_hd.setAttribute("aria-haspopup",el_bd.getAttribute("id"));
                    el_hd.setAttribute("aria-label","右键弹出菜单，tab键导航，esc关闭当前菜单");
                    
                    if (el && el_bd) {
                        // 添加 iframe shim 层
                        // 在 https 页面，当 iframe 的 src 设为 about:blank 会使得 IE 弹出"安全确认框"，而
                        // 登陆注册页的下拉覆盖区域并没有 SELECT 元素需要覆盖，所以在这些页面中不创建对应的 iframe
                        var iframe = false;
                        if (!isHTTPS&&isIE6) {
                            iframe = doc.createElement('iframe');
                            iframe.src = 'about: blank';
                            iframe.className = 'menu-bd';
                            el.insertBefore(iframe, el_bd);
                        }

                        //var prt = el.parentNode;
                        addEvent(el, 'mouseover', function(event) {
                            // Check if mouse(over|out) are still within the same parent element
                            var parent = event.relatedTarget;                           
                          
                            // Traverse up the tree
                            while (parent && parent !== el) {
                                parent = parent.parentNode;
                            }

                            if (parent !== el) {
                                
                                S.each(submenus,function(submenu){
                                    if(submenu!== el_bd){
                                       removeClass(submenu.parentNode, HOVER);
                                       submenu.setAttribute("aria-hidden","true");   
                                    }
                                });
                                
                                //addClass(prt, HOVER);
                                addClass(el, HOVER);
                                el_bd.setAttribute("aria-hidden","false");
                                
                                if(!iframe) return;
                                // 只有 menulist 显示出来后，才能获取 offset 值
                                // 高度减 5 是因为 ie6 下，iframe 处理 padding - bottom 的一个 bug
                                iframe.style.height = parseInt(el_bd.offsetHeight) + 25 + 'px';
                                iframe.style.width = parseInt(el_bd.offsetWidth) + 1 + 'px';
                            }
                        });
                        addEvent(el, 'mouseout', function(event) {
                             // Check if mouse(over|out) are still within the same parent element
                            var parent = event.relatedTarget;                           
                          
                            // Traverse up the tree
                            while (parent && parent !== el) {
                                parent = parent.parentNode;
                            }

                            if (parent !== el) {
                                removeClass(el, HOVER);
                                el_bd.setAttribute("aria-hidden","true");  
                            }
                        });
                        
                        
                        
                        addEvent(el,'keydown',function(event){
                            var key=event.keyCode;
                            //esc
                            if(key==27||key==37||key==38){                                
                                removeClass(el, HOVER);
                                el_bd.setAttribute("aria-hidden","true");  
                                el_hd.focus();
                                preventDefault(event);
                            }else if(key==39||key==40){
                                addClass(el, HOVER);
                                el_bd.setAttribute("aria-hidden","false");  
                                preventDefault(event);
                            }
                        });
                        
                        var hiddenTimer;
                       
                        addEvent(el,isIE?"focusin":"focus",function(){
                            if(hiddenTimer) {
                                clearTimeout(hiddenTimer);
                                hiddenTimer=null;
                            }                                
                        },!isIE);
                        
                        addEvent(el,isIE?"focusout":"blur",function(){
                            hiddenTimer = setTimeout(function(){
                                removeClass(el, HOVER);
                                el_bd.setAttribute("aria-hidden","true");      
                            },100);    
                        },!isIE);
                        
                    }
                });
                
                
                

                // 监听顶部搜索提交
                addEvent(doc.forms['topSearch'], 'submit', function() {
                    if (form['q'].value == EMPTY) { // 空搜索，跳转到我要买
                        form.action = 'http://list.taobao.com/browse/cat-0.htm';
                    }
                });
            },

            /**
             * WebWW (tdog)
             */
            tDog: function() {
                // 加载 webww js 的开关：
                // （url 中有 tstart/tdog 参数） 或 （有 g_config 全局变量，且 appId 值不为 -1）
                if ((APPID && APPID != -1) || 'tstart' in urlConfig || 'tdog' in urlConfig) {
                    S.ready(function() {
                        var url = 'http://' + assetsHost + '/p/header/webww-min.js?t=20110513.js';
                        S.getScript(url);
                    });
                }
            },

            /**
             * 淘宝实验室
             */
            tLabs: function() {
                var l = getCookie('l');
                if (!l) return;

                S.ready(function() {
                    var url = 'http://' + assetsHost + '/p/tlabs/??' +
                        'tlabs.js,base64.js,cookie.js,validator.js,loader.js,util.js,top.js?t=20101012.js';
                    if ('ks-local' in urlConfig) {
                        url = 'http://test.taobao.com/code/fed/2010/tlabs/combo.php?b=src&' +
                            'f=tlabs.js,base64.js,cookie.js,validator.js,loader.js,util.js,top.js';
                    }
                    S.getScript(url, function() {
                        if (typeof TLabs !== 'undefined') {
                            TLabs.init( IS_DAILY ? {baseUrl: 'http://dev.labs.daily.taobao.net/l?b=/f/&f=', l:l} : {l:l});
                        }
                    });
                });
            },

            /**
             * 测试环境中替换页头链接taobao.com为{test}.taobao.net
             */
            initHeaderLinks: function () {
                if (domain.indexOf('.taobao.net') === -1) return;
                var els = siteNavElem ? siteNavElem.getElementsByTagName('a') : [],
                    i = 0,
                    len = els.length,
                    hn = hostname;

                while (hn.length > 3) {
                    hn.shift();
                }

                hn = hn.join('.');

                for (; i < len; i++) {
                    els[i].href = els[i].href.replace('taobao.com', hn);
                }
            },
            /**
             * 初始化登出链接
             */
            initLogout: function() {
                /* 如果用户已登录，给[退出]链接注册事件，先发送注销请求到alipay，避免窜号bug */
                var logoutEl = doc.getElementById('#J_Logout');
                if (!logoutEl) return;

                addEvent(logoutEl, 'click', function(ev) {
                    ev.halt();

                    var logoutUrl = logoutEl.href;

                    new Image().src = '//taobao.alipay.com/user/logout.htm';
                    setTimeout(function() {
                        location.href = logoutUrl;
                    }, 20);
                });
            },

            /**
             * 初始化网站导航异步加载
             */
            initSiteNav: function() {
                var trigger = doc.getElementById('J_Service'), container = doc.getElementById('J_ServicesContainer'), node,
                    URL = 'http://www.taobao.com/index_inc/2010c/includes/get-services.php', CALLBACK = '__services_results';

                if (!trigger || !container) return;

                addEvent(trigger, 'mouseover', handler);
                /*aria support by 承玉*/
                addEvent(trigger,'keydown',handler);

                function handler(e) {                    
                    if(e.type=='keydown' && e.keyCode!=39&&e.keyCode!=40){
                        return;
                    }
                    node = S.getScript(URL + '?cb=' + CALLBACK);
                    preventDefault(e);
                }

                window[CALLBACK] = function(html) {
                    if (node) node.parentNode.removeChild(node);
                    node = null;
                    // 确保一定的容错，但考虑到可能的使用率，故只简单地处理可能出现的错误
                    try {
                        container.innerHTML = html;
                        container.style.height = 'auto';
                        removeEvent(trigger, 'mouseover', handler);
                        removeEvent(trigger, 'keydown', handler);
                    } catch(e) {
                        container.style.display = 'none';
                    }
                };
            },

            /**
             * tracker.ued.taobao.net
             */
            jsBugTracker: function() {
                if (location.hostname.indexOf('daily.taobao.net') === -1) return;
                if (location.hostname.indexOf('localhost') === -1) return;
                win.onerror = function(m, f, l) {
                    var nick = getCookie('_nk_'),
                        trackNick = getCookie('tracknick'),
                        url = 'http://tracker.ued.taobao.net/?collect&'+S.param({
                            url: location.href,
                            error: m,
                            file: f,
                            line: l,
                            ua: navigator.userAgent,
                            type: APPID,
                            username: nick || trackNick,
                            login: !!(getCookie('_l_g_') && nick || getCookie('ck1') && trackNick)
                        })+'&t='+(+new Date());
                    new Image().src = url;
                };
            },

            /**
             * 前端单元测试框架载入
             */
            test: function() {
                S.ready(function() {
                    if (location.hostname.indexOf('daily.taobao.net') > -1
                            && location.href.indexOf('__test__') > -1) {
                        S.getScript('http://assets.daily.taobao.net/p/test/1.0/loader.js?t='+(+new Date()));
                    }
                });
            },

            /**
             * 初始化 mini 购物车
             * qiaohua
             */
            miniCart: function() {
                var TG = TB.Global;
                if (TG._OFF) return;
                
                if (IS_TMALL || domain.indexOf('tmall.net') > -1) {
                    if (S.isUndefined(APPID)) {
                        // 等待, 商城 php 获取不到 cookie , 但吊顶每次都会给 http://www.taobao.com/go/app/tmall/login-api.php 发请求
                        return;
                    }
                    else if (!(getCookie('uc2') && getCookie('mt'))) {
                        // 商城应用 不能实时同步 cookie, 需要发送http://www.taobao.com/go/app/tmall/login-api.php 发请求
                        S.getScript('http://www'+HOSTNAME+'/go/app/tmall/login-api.php'+'?t='+S.now());
                        return;
                    }
                }
                TG.initMiniCart();
            }
        };

    TB.Global = {
        /**
         * 初始化 Global 模块
         */
        init: function(cfg) {
            assetsHost = IS_DAILY ? 'assets.daily.taobao.net' : 'a.tbcdn.cn';
            urlConfig = S.unparam(location.search.substring(1));
            siteNavElem = doc.getElementById('site-nav');

            // minicart 开关标志
            this._OFF = !!!siteNavElem;
            this.config = cfg;
            if (cfg && cfg.mc && cfg.mc === -1)  this._OFF = true;

            // 页面被嵌入时, 不需要进行初始化
            if (window.top !== window.self) {
                S.log(['in frame, exit']);
                this._OFF = true;
            }

            for (var k in runItems) {
                runItems[k]();
            }
        },
        
        /**
         * 登录信息
         * config: {memberServer:'', loginServer:'', redirectUrl:'', loginUrl:'', logoutUrl:'', forumServer:''}
         * 注：config 的各项都是可选项
         */
        writeLoginInfo: function(config) {
            config = config || {};

            var self = this,
                nick = getCookie('_nk_') || getCookie('tracknick'), // 用户昵称，Session 内有效
                ucMap = unparam(getCookie('uc1')),// user cookie 用户的配置信息
                msgCount = parseInt(ucMap['_msg_']) || 0, // 站内信未读数量
                timeStamp = S.now(), // 时间戳

                memberServer = config['memberServer'] || 'http://member1.taobao.com',
                loginServer = config['loginServer'] || 'https://login.taobao.com',
                loginUrl = config['loginUrl'] || loginServer + '/member/login.jhtml?f=top', // 对于彩票等应用，直接传入loginUrl

                defaultRedirectUrl = location.href,
                redirectUrl, logoutUrl, regUrl, pMsgUrl, spaceUrl, output = EMPTY;

            // 对于登录页面，登录后默认跳转到我的淘宝。其它页面跳回当前页面
            if (/^http.*(\/member\/login\.jhtml)$/i.test(defaultRedirectUrl)) {
                // 为空时，后端会默认跳转到我的淘宝
                defaultRedirectUrl = EMPTY;
            }

            redirectUrl = config['redirectUrl'] || defaultRedirectUrl;
            if (redirectUrl) loginUrl += '&redirectURL=' + encodeURIComponent(redirectUrl);

            logoutUrl = config['logoutUrl'] || loginServer + '/member/logout.jhtml?f=top'; // 注销url
            regUrl = memberServer + '/member/newbie.htm'; // 注册url
            pMsgUrl = memberServer + '/message/list_private_msg.htm?t=' + timeStamp;
            spaceUrl = 'http://jianghu.taobao.com/admin/home.htm?t=' + timeStamp;

            if (self.isLogin()) { // 已登录，显示：您好，XXX！[退出] 站内信(n)
                output = '您好，<a class="user-nick" href="' + spaceUrl + '" target="_top">'
                    + escapeHTML(unescape(nick.replace(/\\u/g, '%u'))) + '</a>！'
                    + self.showVIP()
                    + '<a id="J_Logout" href="' + logoutUrl + '" target="_top">退出</a>'
                    + '<a href="' + pMsgUrl + '" target="_top">站内信';
                if (msgCount) {
                    output += '(' + msgCount + ')';
                }
                output += '</a>';
            } else { // 未登录，显示：您好，欢迎来淘宝！[请登录] [免费注册]
                output = '您好，欢迎来淘宝！<a href="' + loginUrl + '" target="_top">请登录</a>';
                output += '<a href="' + regUrl + '" target="_top">免费注册</a>';
            }

            doc.write(output);
        },

        /**
         * 登录用户显示VIP 图标
         * 0：普通会员，不展示
         * 1：VIP黄金会员
         * 2：VIP白金会员
         * 3：VIP钻石会员
         * -100：存量激活的会员
         */
        showVIP: function() {
            var tag = parseInt(unparam(getCookie('uc1'))['tag']) || 0,
                ret = EMPTY,
                vip_host = 'http://vip' + HOSTNAME;
            S.log(['vip', tag]);
            if (S.indexOf(tag, [1, 2, 3]) > -1) {
                ret = '<span class="menu"><a href="'+vip_host+'" rel="nofollow" target="_top"  class="user-vip vip-icon'+tag+'" title="'+(tag===1? '黄金': (tag === 2? '白金':'钻石'))+'会员"> </a></span>';
            } else if (tag === -100) {
                ret = '<span class="menu">'
                    + '<span class="vip-ovl menu-bd">您已具备VIP资格<a href="'+vip_host+'/apply_vip.htm" rel="nofollow" target="_top" >点亮VIP图标</a></span>'
                    + '<a class="vip-icon0 menu-hd" rel="nofollow" target="_top" href="'+vip_host+'"> <b></b></a>'
                    + '</span>';
            }
            return ret;
        },
        /**
         * 判断是否是登录用户
         * 用户是否已经登录。注意：必须同时判断 nick 值，因为 _nk_ 和 _l_g_ 有时不同步
         */
        isLogin: function() {
            /*if (win.userCookie) {
                return !!(win.userCookie._nk_);
            }*/
            var trackNick = getCookie('tracknick'),
                nick = getCookie('_nk_') || trackNick;

            return !!(getCookie('_l_g_') && nick || getCookie('ck1') && trackNick);
        },

        /**
         * 判断是否是灰度用户
         */
        isGreyUser: function() {
            var uc2 = unparam(getCookie('uc2')),
                ab, tmp;

            tmp = !!(uc2 && (ab = uc2.ab) && ab.length > 0 && ab.substring(0, 1) === 'J');
            S.log(['isGreyUser', tmp]);
            return tmp;
        },

        /**
         * 是否在列表中
         */
        isInList: function() {
            // 搜索(3), detail(1), 我的购物车(19), 3C list(8), spu detail(7), 淘宝首页(6), 鞋城(17), 交易页面(15)
            // 主list(18), 店铺(2), 收藏夹(5), 机票彩票(10), 聚划算(9)
            var tmp = (S.indexOf(APPID, [2, 5, 6, 3, 1, 15, 19, 7, 8, 9, 17, 18, 10]) > -1 || IS_TMALL || domain.indexOf('tmall.net') > -1);
            // 店铺不显示
            /*if (S.indexOf(APPID, [2]) > -1) {
                tmp = false;
            }*/
            S.log(['isInList', tmp]);
            return tmp;
        },
        /**
        * 吊顶是否具有购物车元素
        */
        getCartElem: function() {
            return siteNavElem  && getElementsByClassName('cart', 'li', siteNavElem)[0];
        },
        /**
         * 初始化 mini 购物车
         */
        initMiniCart: function() {
            // 到此 要保证有 cookie or userCookie 值
            var self= this,
                CARTNUM_API = 'http://buy' + HOSTNAME
                            + '/auction/cart/top_cart_quantity.htm?',
                request = function() {
                    // 请求购物车数量
                    S.getScript(CARTNUM_API + 'callback=TB.Global.setCartNum' + '&t=' + S.now() + (APPID ? '&appid=' + APPID : EMPTY));
                };
            // 在列表里或是商城页面, 且是灰度用户
            //if (!(SHOW_MC = (!!self.getCartElem()) && self.isInList() && self.isGreyUser())) return;
            if (self._OFF = (self._OFF || !!!self.getCartElem())) return;
            S.log(['off', self._OFF]);

            var mt = unparam(getCookie('mt')), ci, cp;

            // 读取 cookie 成功
            if (mt && (ci = mt.ci)) {
                ci = ci.split('_');
                cp = parseInt(ci[1]);
                ci = parseInt(ci[0]);
                //  是否关掉, true 为 关掉, false/undefined 为 开启
                self._OFF = ci < 0;

                if (ci < 0) {
                    S.log('ci < 0, not request and not init minicart');
                    return;
                }
                if (self.isLogin()) {
                    if (cp === 0) {
                        S.log('login , cp = 0, ci >= 0, requesting');
                        request();
                    } else if (cp === 1) {
                        S.log('login , cp = 1, minicart is init.');
                        TB.Global.setCartNum(ci);
                    }
                } else {
                    if (cp === 0) {
                        S.log('not login , cp = 0, ci >= 0, minicart is init.');
                        TB.Global.setCartNum(ci);
                    }
                    else if (cp === 1) {
                        S.log('not login , cp = 1, ci >= 0, requesting.');
                        request();
                    }
                }
            } else {
                S.log(['no mt, requesting']);
                request();
            }
        },
        /**
         * 设置 mini 购物车的数量
         */
        setCartNum: function(num) {
            //  不用this, 而用 TB.Global 是因为 detail 上, 调用 setCartNum 时 this 为 window 了
            if (!S.isNumber(num) || TB.Global._OFF) return;

            var trigger = TB.Global.getCartElem();

            if (!trigger) return;

            var elem = trigger.getElementsByTagName('a')[0],
                title = '<b class="mini-cart-line"></b><s></s>' +'购物车',
                // 在购物车页面, 不显示浮层
                showLayer = APPID !== 19;

            // 数量小于 0 时
            if (num<0) {
                // 只要有 -1 就表示关闭
                TB.Global._OFF = num === -1;

                elem.innerHTML = title;
                removeClass(trigger, MINICART_CLS);

                win.MiniCart && win.MiniCart.hide();
                return;
            }

            elem.innerHTML = title + '<b' + (num<10?' class="mc-pt3"':EMPTY) + '>' + num + '</b>' + '件' + (showLayer?'<i></i>':EMPTY);
            elem.href = 'http://ju.atpanel.com/?url=http://buy' + HOSTNAME
                      + '/auction/cart/my_cart.htm?from=mini&ad_id=&am_id=&cm_id=&pm_id=150042785330be233161';
            addClass(trigger, MINICART_CLS);
            if (!showLayer) {
                addClass(trigger, MINICART_NO_LAYER_CLS);
            }

            if (win.MiniCart) {
                win.MiniCart.cartNum = num;
                win.MiniCart.isExpired = true;
            } else {
                S.ready(function() {
                    var times = 0;
                    S.getScript('./minicart.js', function() {
                        // minicart.js 依赖于 ks-core, 延迟+检测S.DOM是否ok
                        if (S.DOM) {
                            win.MiniCart.init(num, showLayer);
                        } else {
                            S.log('minicart: try ' + times);
                            if (times < 10) {
                                setTimeout(arguments.callee, 1000);
                                times++;
                            }
                            // 如果实在没有 ks-core
                            else {
                                S.use('core', function() {
                                    win.MiniCart.init(num, showLayer);
                                });
                            }
                        }
                    });
                });
            }
        },

        /**
         * 给 tmall 下运行那些依赖于 cookie 的功能, 包含 mini购物车, Tlabs
         * @param cfg
         */
        run: function(cfg) {
            var self = this;

            self.initMiniCart();
            runItems.tLabs();


            // 显示 vip icon
            if (self.isLogin()) {
                var times = 0;

                // 等待 login-api, 设置 DOM 后, 再加入 VIP 标志, 不然的话总是没有登出元素的
                S.later(function() {
                    var logoutEl = doc.getElementById('J_Logout');
                    S.log(['tmall vip try: ', times]);
                    if (!logoutEl) {
                        if (times < 20) {
                            setTimeout(arguments.callee, 20);
                            times++;
                        }
                        return;
                    }

                    var html = self.showVIP();
                    if (html.length < 1) return;

                    var div = doc.createElement('div');
                    div.innerHTML = html;
                    logoutEl.parentNode.insertBefore(div.firstChild, logoutEl);
                }, 30);
            }
        }
    };

    //////////////////////////////////////////////////////
    // Utilities

    /**
     * 获取 Cookie
     */
    function getCookie(name) {
        if (win.userCookie && !S.isUndefined(win.userCookie[name])) {
            return win.userCookie[name];
        }

        if (S.isUndefined(COOKIES[name])) {
            var m = doc.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
            COOKIES[name] = (m && m[1]) ? decodeURIComponent(m[1]) : EMPTY;
        }
        return COOKIES[name];
    }

    /**
     * 编码 HTML (from prototype framework 1.4)
     */
    function escapeHTML(str) {
        var div = doc.createElement('div'),
            text = doc.createTextNode(str);
        div.appendChild(text);
        return div.innerHTML;
    }

    /**
     * 通过 ClassName 获取元素
     */
    function getElementsByClassName(cls, tag, context) {
        var els = context.getElementsByTagName(tag || '*'),
            ret = [], i = 0, j = 0, len = els.length, el, t;

        cls = SPACE + cls + SPACE;
        for (; i < len; ++i) {
            el = els[i];
            t = el.className;
            if (t && (SPACE + t + SPACE).indexOf(cls) > -1) {
                ret[j++] = el;
            }
        }
        return ret;
    }

    /**
     * 添加事件
     */
    function addEvent(el, type, fn, capture) {
        if (!el) return;
        if (el.addEventListener) {
            el.addEventListener(type, fn, !!capture);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, fn);
        }
    }

    /**
     * 删除事件
     */
    function removeEvent(el, type, fn, capture) {
        if (!el) return;
        if (el.removeEventListener) {
            el.removeEventListener(type, fn, !!capture);
        } else if (el.detachEvent) {
            el.detachEvent('on' + type, fn);
        }
    }

    /**
     * 简易版增加/删除元素的 class
     * @param elem
     * @param cls
     */
    function addClass(elem, cls) {
        var className = SPACE + elem.className + SPACE;

        if (className.indexOf(SPACE + cls + SPACE) === -1) {
            className += cls;
            elem.className = S.trim(className);
        }
    }
    function removeClass(elem, cls) {
        var className = SPACE + elem.className + SPACE;

        if (className.indexOf(SPACE + cls + SPACE) !== -1) {
            className = className.replace(SPACE + cls + SPACE, SPACE);
            elem.className = S.trim(className);
        }
    }

    /**
     * unparam
     */
    function unparam(str) {
        if (win.userCookie && win.userCookie.version == "2") {
            return S.unparam(str, "&amp;");
        }
        return S.unparam(str);
    }
    
    function preventDefault(e){
        // if preventDefault exists run it on the original event
        if (e.preventDefault) {
            e.preventDefault();
        }
        // otherwise set the returnValue property of the original event to false (IE)
        else {
            e.returnValue = false;
        }
    }
});

