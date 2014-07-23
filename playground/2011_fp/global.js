/**
 * ȫ��ģ��
 * @desc �����?ͨ��һЩȫ�ֹ��ܵ�����
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

        // https ���� (��¼ע��ҳ��)
        isHTTPS = (doc.location.href.indexOf("https://") === 0),
    
        // �����õ��� cookie
        COOKIES = {},

        // ��ʼ���������
        runItems = {

            /**
             * ��ͨ
             */
            siteNav: function() {
                if (!siteNavElem) return;
                siteNavElem.setAttribute("role","navigation");
                var submenus = [];
                S.each(getElementsByClassName('menu', '*', siteNavElem), function(el) {
                    /*aria support by ����*/
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
                    el_hd.setAttribute("aria-label","�Ҽ���˵���tab���esc�رյ�ǰ�˵�");
                    
                    if (el && el_bd) {
                        // ��� iframe shim ��
                        // �� https ҳ�棬�� iframe �� src ��Ϊ about:blank ��ʹ�� IE ����"��ȫȷ�Ͽ�"����
                        // ��½ע��ҳ��������������û�� SELECT Ԫ����Ҫ���ǣ���������Щҳ���в�������Ӧ�� iframe
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
                                // ֻ�� menulist ��ʾ�����󣬲��ܻ�ȡ offset ֵ
                                // �߶ȼ� 5 ����Ϊ ie6 �£�iframe ���� padding - bottom ��һ�� bug
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
                
                
                

                // ���������ύ
                addEvent(doc.forms['topSearch'], 'submit', function() {
                    if (form['q'].value == EMPTY) { // ����������ת����Ҫ��
                        form.action = 'http://list.taobao.com/browse/cat-0.htm';
                    }
                });
            },

            /**
             * WebWW (tdog)
             */
            tDog: function() {
                // ���� webww js �Ŀ��أ�
                // ��url ���� tstart/tdog ���� �� ���� g_config ȫ�ֱ������� appId ֵ��Ϊ -1��
                if ((APPID && APPID != -1) || 'tstart' in urlConfig || 'tdog' in urlConfig) {
                    S.ready(function() {
                        var url = 'http://' + assetsHost + '/p/header/webww.js?t=20110513.js';
                        S.getScript(url);
                    });
                }
            },

            /**
             * �Ա�ʵ����
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
             * ���Ի������滻ҳͷ����taobao.comΪ{test}.taobao.net
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
             * ��ʼ���ǳ�����
             */
            initLogout: function() {
                /* ����û��ѵ�¼����[�˳�]����ע���¼����ȷ���ע������alipay������ܺ�bug */
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
             * ��ʼ����վ�����첽����
             */
            initSiteNav: function() {
                var trigger = doc.getElementById('J_Service'), container = doc.getElementById('J_ServicesContainer'), node,
                    URL = 'http://www.taobao.com/index_inc/2010c/includes/get-services.php', CALLBACK = '__services_results';

                if (!trigger || !container) return;

                addEvent(trigger, 'mouseover', handler);
                /*aria support by ����*/
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
                    // ȷ��һ�����ݴ?�����ǵ����ܵ�ʹ���ʣ���ֻ�򵥵ش�����ܳ��ֵĴ���
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
             * ǰ�˵�Ԫ���Կ������
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
             * ��ʼ�� mini ���ﳵ
             * qiaohua
             */
            miniCart: function() {
                var TG = TB.Global;
                if (TG._OFF) return;
                
                if (IS_TMALL || domain.indexOf('tmall.net') > -1) {
                    if (S.isUndefined(APPID)) {
                        // �ȴ�, �̳� php ��ȡ���� cookie , ������ÿ�ζ���� http://www.taobao.com/go/app/tmall/login-api.php ������
                        return;
                    }
                    else if (!(getCookie('uc2') && getCookie('mt'))) {
                        // �̳�Ӧ�� ����ʵʱͬ�� cookie, ��Ҫ����http://www.taobao.com/go/app/tmall/login-api.php ������
                        S.getScript('http://www'+HOSTNAME+'/go/app/tmall/login-api.php'+'?t='+S.now());
                        return;
                    }
                }
                TG.initMiniCart();
            }
        };

    TB.Global = {
        /**
         * ��ʼ�� Global ģ��
         */
        init: function(cfg) {
            assetsHost = IS_DAILY ? 'assets.daily.taobao.net' : 'a.tbcdn.cn';
            urlConfig = S.unparam(location.search.substring(1));
            siteNavElem = doc.getElementById('site-nav');

            // minicart ���ر�־
            this._OFF = !!!siteNavElem;
            this.config = cfg;
            if (cfg && cfg.mc && cfg.mc === -1)  this._OFF = true;

            // ҳ�汻Ƕ��ʱ, ����Ҫ���г�ʼ��
            if (window.top !== window.self) {
                S.log(['in frame, exit']);
                this._OFF = true;
            }

            for (var k in runItems) {
                runItems[k]();
            }
        },
        
        /**
         * ��¼��Ϣ
         * config: {memberServer:'', loginServer:'', redirectUrl:'', loginUrl:'', logoutUrl:'', forumServer:''}
         * ע��config �ĸ���ǿ�ѡ��
         */
        writeLoginInfo: function(config) {
            config = config || {};

            var self = this,
                nick = getCookie('_nk_') || getCookie('tracknick'), // �û��ǳƣ�Session ����Ч
                ucMap = unparam(getCookie('uc1')),// user cookie �û���������Ϣ
                msgCount = parseInt(ucMap['_msg_']) || 0, // վ����δ������
                timeStamp = S.now(), // ʱ���

                memberServer = config['memberServer'] || 'http://member1.taobao.com',
                loginServer = config['loginServer'] || 'https://login.taobao.com',
                loginUrl = config['loginUrl'] || loginServer + '/member/login.jhtml?f=top', // ���ڲ�Ʊ��Ӧ�ã�ֱ�Ӵ���loginUrl

                defaultRedirectUrl = location.href,
                redirectUrl, logoutUrl, regUrl, pMsgUrl, spaceUrl, output = EMPTY;

            // ���ڵ�¼ҳ�棬��¼��Ĭ����ת���ҵ��Ա�������ҳ����ص�ǰҳ��
            if (/^http.*(\/member\/login\.jhtml)$/i.test(defaultRedirectUrl)) {
                // Ϊ��ʱ����˻�Ĭ����ת���ҵ��Ա�
                defaultRedirectUrl = EMPTY;
            }

            redirectUrl = config['redirectUrl'] || defaultRedirectUrl;
            if (redirectUrl) loginUrl += '&redirectURL=' + encodeURIComponent(redirectUrl);

            logoutUrl = config['logoutUrl'] || loginServer + '/member/logout.jhtml?f=top'; // ע��url
            regUrl = memberServer + '/member/newbie.htm'; // ע��url
            pMsgUrl = memberServer + '/message/list_private_msg.htm?t=' + timeStamp;
            spaceUrl = 'http://jianghu.taobao.com/admin/home.htm?t=' + timeStamp;

            if (self.isLogin()) { // �ѵ�¼����ʾ����ã�XXX��[�˳�] վ����(n)
                output = '��ã�<a class="user-nick" href="' + spaceUrl + '" target="_top">'
                    + escapeHTML(unescape(nick.replace(/\\u/g, '%u'))) + '</a>��'
                    + self.showVIP()
                    + '<a id="J_Logout" href="' + logoutUrl + '" target="_top">�˳�</a>'
                    + '<a href="' + pMsgUrl + '" target="_top">վ����';
                if (msgCount) {
                    output += '(' + msgCount + ')';
                }
                output += '</a>';
            } else { // δ��¼����ʾ����ã���ӭ���Ա���[���¼] [���ע��]
                output = '��ã���ӭ���Ա���<a href="' + loginUrl + '" target="_top">���¼</a>';
                output += '<a href="' + regUrl + '" target="_top">���ע��</a>';
            }

            doc.write(output);
        },

        /**
         * ��¼�û���ʾVIP ͼ��
         * 0����ͨ��Ա����չʾ
         * 1��VIP�ƽ��Ա
         * 2��VIP�׽��Ա
         * 3��VIP��ʯ��Ա
         * -100����������Ļ�Ա
         */
        showVIP: function() {
            var tag = parseInt(unparam(getCookie('uc1'))['tag']) || 0,
                ret = EMPTY,
                vip_host = 'http://vip' + HOSTNAME;
            S.log(['vip', tag]);
            if (S.indexOf(tag, [1, 2, 3]) > -1) {
                ret = '<span class="menu"><a href="'+vip_host+'" rel="nofollow" target="_top"  class="user-vip vip-icon'+tag+'" title="'+(tag===1? '�ƽ�': (tag === 2? '�׽�':'��ʯ'))+'��Ա"> </a></span>';
            } else if (tag === -100) {
                ret = '<span class="menu">'
                    + '<span class="vip-ovl menu-bd">���Ѿ߱�VIP�ʸ�<a href="'+vip_host+'/apply_vip.htm" rel="nofollow" target="_top" >����VIPͼ��</a></span>'
                    + '<a class="vip-icon0 menu-hd" rel="nofollow" target="_top" href="'+vip_host+'"> <b></b></a>'
                    + '</span>';
            }
            return ret;
        },
        /**
         * �ж��Ƿ��ǵ�¼�û�
         * �û��Ƿ��Ѿ���¼��ע�⣺����ͬʱ�ж� nick ֵ����Ϊ _nk_ �� _l_g_ ��ʱ��ͬ��
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
         * �ж��Ƿ��ǻҶ��û�
         */
        isGreyUser: function() {
            var uc2 = unparam(getCookie('uc2')),
                ab, tmp;

            tmp = !!(uc2 && (ab = uc2.ab) && ab.length > 0 && ab.substring(0, 1) === 'J');
            S.log(['isGreyUser', tmp]);
            return tmp;
        },

        /**
         * �Ƿ����б���
         */
        isInList: function() {
            // ����(3), detail(1), �ҵĹ��ﳵ(19), 3C list(8), spu detail(7), �Ա���ҳ(6), Ь��(17), ����ҳ��(15)
            // ��list(18), ����(2), �ղؼ�(5), ��Ʊ��Ʊ(10), �ۻ���(9)
            var tmp = (S.indexOf(APPID, [2, 5, 6, 3, 1, 15, 19, 7, 8, 9, 17, 18, 10]) > -1 || IS_TMALL || domain.indexOf('tmall.net') > -1);
            // ���̲���ʾ
            /*if (S.indexOf(APPID, [2]) > -1) {
                tmp = false;
            }*/
            S.log(['isInList', tmp]);
            return tmp;
        },
        /**
        * �����Ƿ���й��ﳵԪ��
        */
        getCartElem: function() {
            return siteNavElem  && getElementsByClassName('cart', 'li', siteNavElem)[0];
        },
        /**
         * ��ʼ�� mini ���ﳵ
         */
        initMiniCart: function() {
            // ���� Ҫ��֤�� cookie or userCookie ֵ
            var self= this,
                CARTNUM_API = 'http://buy' + HOSTNAME
                            + '/auction/cart/top_cart_quantity.htm?',
                request = function() {
                    // �����ﳵ����
                    S.getScript(CARTNUM_API + 'callback=TB.Global.setCartNum' + '&t=' + S.now() + (APPID ? '&appid=' + APPID : EMPTY));
                };
            // ���б�������̳�ҳ��, ���ǻҶ��û�
            //if (!(SHOW_MC = (!!self.getCartElem()) && self.isInList() && self.isGreyUser())) return;
            if (self._OFF = (self._OFF || !!!self.getCartElem())) return;
            S.log(['off', self._OFF]);

            var mt = unparam(getCookie('mt')), ci, cp;

            // ��ȡ cookie �ɹ�
            if (mt && (ci = mt.ci)) {
                ci = ci.split('_');
                cp = parseInt(ci[1]);
                ci = parseInt(ci[0]);
                //  �Ƿ�ص�, true Ϊ �ص�, false/undefined Ϊ ����
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
         * ���� mini ���ﳵ������
         */
        setCartNum: function(num) {
            //  ����this, ���� TB.Global ����Ϊ detail ��, ���� setCartNum ʱ this Ϊ window ��
            if (!S.isNumber(num) || TB.Global._OFF) return;

            var trigger = TB.Global.getCartElem();

            if (!trigger) return;

            var elem = trigger.getElementsByTagName('a')[0],
                title = '<b class="mini-cart-line"></b><s></s>' +'���ﳵ',
                // �ڹ��ﳵҳ��, ����ʾ����
                showLayer = APPID !== 19;

            // ����С�� 0 ʱ
            if (num<0) {
                // ֻҪ�� -1 �ͱ�ʾ�ر�
                TB.Global._OFF = num === -1;

                elem.innerHTML = title;
                removeClass(trigger, MINICART_CLS);

                win.MiniCart && win.MiniCart.hide();
                return;
            }

            elem.innerHTML = title + '<b' + (num<10?' class="mc-pt3"':EMPTY) + '>' + num + '</b>' + '��' + (showLayer?'<i></i>':EMPTY);
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
                        // minicart.js ������ ks-core, �ӳ�+���S.DOM�Ƿ�ok
                        if (S.DOM) {
                            win.MiniCart.init(num, showLayer);
                        } else {
                            S.log('minicart: try ' + times);
                            if (times < 10) {
                                setTimeout(arguments.callee, 1000);
                                times++;
                            }
                            // ���ʵ��û�� ks-core
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
         * �� tmall ��������Щ������ cookie �Ĺ���, �� mini���ﳵ, Tlabs
         * @param cfg
         */
        run: function(cfg) {
            var self = this;

            self.initMiniCart();
            runItems.tLabs();


            // ��ʾ vip icon
            if (self.isLogin()) {
                var times = 0;

                // �ȴ� login-api, ���� DOM ��, �ټ��� VIP ��־, ��Ȼ�Ļ�����û�еǳ�Ԫ�ص�
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
     * ��ȡ Cookie
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
     * ���� HTML (from prototype framework 1.4)
     */
    function escapeHTML(str) {
        var div = doc.createElement('div'),
            text = doc.createTextNode(str);
        div.appendChild(text);
        return div.innerHTML;
    }

    /**
     * ͨ�� ClassName ��ȡԪ��
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
     * ����¼�
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
     * ɾ���¼�
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
     * ���װ�����/ɾ��Ԫ�ص� class
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

