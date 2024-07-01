(function () {
  if (!google.nocsixjs && google.timers && google.timers.load.t)
    google.timers.load.t.xjses = new Date().getTime();
})();
(function () {
  var e = {},
    f = google.j && google.j.b,
    g = function (a) {
      if (google.mc) {
        if (f) {
          f = false;
          return g('bookmarkInit');
        }
        for (var b = 0, h = google.mc.length; b < h; b++) {
          var c = a == 'dispose' ? h - b - 1 : b;
          try {
            var d = e[google.mc[c][0]];
            d && d[a] && d[a](google.mc[c][1]);
          } catch (i) {
            google.ml(i, false, {
              cause: 'm' + a,
              index: c,
              mid: google.mc[c] && google.mc[c][0],
            });
          }
        }
        if (a == 'dispose') google.mc = null;
      }
    };
  google.med = g;
  google.register = function (a, b) {
    e[a] = b;
  };
})();
(function () {
  var g = true,
    h = false;
  google.browser = {};
  google.browser.engine = { IE: h, GECKO: h, WEBKIT: h, OPERA: h };
  google.browser.product = {
    IE: h,
    FIREFOX: h,
    SAFARI: h,
    IPAD: h,
    CHROME: h,
    OPERA: h,
  };
  google.browser.engine.version = '';
  google.browser.product.version = '';
  google.browser.init = function (a) {
    var b = null,
      c = null;
    if (window.opera) {
      google.browser.engine.OPERA = g;
      google.browser.product.OPERA = g;
      b = c = /Opera\/(\S+)/;
    } else if (a.indexOf('MSIE') != -1) {
      google.browser.engine.IE = g;
      google.browser.product.IE = g;
      b = c = /MSIE\s+([^\);]+)(\)|;)/;
    } else if (a.indexOf('WebKit') != -1) {
      google.browser.engine.WEBKIT = g;
      if (a.indexOf('Chrome') != -1) {
        google.browser.product.CHROME = g;
        c = /Chrome\/(\S+)/;
      } else if (a.indexOf('iPad') != -1) {
        google.browser.product.IPAD = g;
        c = /Version\/(\S+)/;
      } else if (a.indexOf('Safari') != -1) {
        google.browser.product.SAFARI = g;
        c = /Version\/(\S+)/;
      }
      b = /WebKit\/(\S+)/;
    } else if (a.indexOf('Gecko') != -1) {
      google.browser.engine.GECKO = g;
      if (a.indexOf('Firefox') != -1) {
        google.browser.product.FIREFOX = g;
        c = /Firefox\/(\S+)/;
      }
      b = /rv\:([^\);]+)(\)|;)/;
    }
    if (b) {
      b = b.exec(a);
      google.browser.engine.version = b ? b[1] : '';
    }
    if (c) {
      b = c.exec(a);
      google.browser.product.version = b ? b[1] : '';
    }
  };
  google.browser.init(window.navigator.userAgent);
  google.browser.compareVersions = function (a, b) {
    function c(q, r) {
      if (q < r) return -1;
      else if (q > r) return 1;
      return 0;
    }
    for (
      var d = 0,
        e = a.replace(/^\s+|\s+$/g, '').split('.'),
        f = b.replace(/^\s+|\s+$/g, '').split('.'),
        j = Math.max(e.length, f.length),
        i = 0;
      d == 0 && i < j;
      i++
    ) {
      var o = e[i] || '',
        k = f[i] || '',
        p = RegExp('(\\d*)(\\D*)', 'g'),
        s = RegExp('(\\d*)(\\D*)', 'g');
      do {
        var m = p.exec(o) || ['', '', ''],
          n = s.exec(k) || ['', '', ''];
        if (m[0].length == 0 && n[0].length == 0) break;
        d = m[1].length == 0 ? 0 : parseInt(m[1], 10);
        var t = n[1].length == 0 ? 0 : parseInt(n[1], 10);
        d = c(d, t) || c(m[2].length == 0, n[2].length == 0) || c(m[2], n[2]);
      } while (d == 0);
    }
    return d;
  };
  google.browser.isEngineVersion = function (a) {
    return (
      google.browser.compareVersions(google.browser.engine.version, a) >= 0
    );
  };
  google.browser.isProductVersion = function (a) {
    return (
      google.browser.compareVersions(google.browser.product.version, a) >= 0
    );
  };
  google.style = google.style || {};
  google.style.hasClass = function (a, b) {
    if (!a || !b) return h;
    return RegExp('(^|\\s)' + b + '($|\\s)').test(a.className);
  };
  google.style.addClass = function (a, b) {
    if (a && b && !google.style.hasClass(a, b)) {
      var c = a.className == '' ? [] : a.className.split(/\s/);
      c.push(b);
      a.className = c.join(' ');
    }
  };
  google.style.removeClass = function (a, b) {
    if (google.style.hasClass(a, b)) {
      for (var c = a.className.split(/\s/), d = c.length - 1; d >= 0; d--)
        c[d] == b && c.splice(d, 1);
      a.className = c.join(' ');
    }
  };
  google.dom = {};
  google.dom.g = /^(\w+)?(?:\.(.+))?$/;
  google.dom.h = /^#([\w-]+)$/;
  google.dom.append = function (a) {
    return (document.getElementById('xjsc') || document.body).appendChild(a);
  };
  google.dom.create = function (a, b) {
    var c = a.match(google.dom.g),
      d = document.createElement(c[1]);
    if (c[2]) d.className = c[2];
    if (b) d.innerHTML = b;
    return d;
  };
  google.dom.get = function (a, b, c) {
    var d;
    if ((d = a.match(google.dom.h))) {
      a = document.getElementById(d[1]);
      return c ? (a ? [a] : []) : a;
    } else {
      d = a.match(google.dom.g);
      a = d[2] && RegExp('\\b' + d[2]);
      b = (b || document).getElementsByTagName(d[1] || '*');
      if (a) {
        d = b;
        b = [];
        for (var e = 0, f; (f = d[e++]); ) a.test(f.className) && b.push(f);
      }
    }
    return b.length > 1 || c ? b : b[0];
  };
  google.dom.insert = function (a, b, c) {
    return b.parentNode.insertBefore(a, c ? b.nextSibling : b);
  };
  google.dom.remove = function (a) {
    return a && a.parentNode && a.parentNode.removeChild(a);
  };
  google.dom.set = function (a) {
    for (var b = 1; b < arguments.length; b += 2) {
      var c = arguments[b],
        d = arguments[b + 1],
        e = a.style;
      if (e && c in e) e[c] = d;
      else if (c in a) a[c] = d;
      else if (google.browser.engine.IE && e && c == 'opacity') {
        a.zoom = 1;
        e.filter =
          (e.filter || '').replace(/alpha\([^)]*\)/, '') +
          'alpha(opacity=' +
          d * 100 +
          ')';
      }
    }
    return a;
  };
  google.listen = function (a, b, c) {
    a.addEventListener
      ? a.addEventListener(b, c, h)
      : a.attachEvent('on' + b, c);
  };
  google.unlisten = function (a, b, c) {
    a.removeEventListener
      ? a.removeEventListener(b, c, h)
      : a.detachEvent('on' + b, c);
  };
  google.msg = {};
  google.msg.b = {};
  google.msg.listen = function () {
    for (var a = 0; a < arguments.length - 1; a += 2) {
      var b = arguments[a];
      google.msg.b[b] || (google.msg.b[b] = []);
      google.msg.b[b].push(arguments[a + 1]);
    }
  };
  google.msg.unlisten = function () {
    for (var a = 0; a < arguments.length - 1; a += 2) {
      var b = arguments[a];
      if ((b = google.msg.b[b]))
        for (var c = arguments[a + 1], d = 0; d < b.length; ++d)
          if (b[d] == c) {
            b.splice(d, 1);
            break;
          }
    }
  };
  google.msg.send = function (a, b, c, d) {
    var e = c === undefined ? g : c,
      f = c === h,
      j = b && b[0] === c;
    if (a in google.msg.b) {
      if (d === undefined) d = h;
      var i;
      i =
        typeof d == 'function'
          ? d
          : function (p) {
              return p === d;
            };
      for (var o = 0, k; (k = google.msg.b[a][o++]); ) {
        k = k.apply(this, b || []);
        if (f) e = e || k;
        else {
          if (j) b[0] = k;
          e = k;
          if (i(e)) return e;
        }
      }
    }
    if (typeof d == 'function') return c;
    return e;
  };
  google.nav = function (a, b) {
    google.nav.e(a, b);
  };
  google.nav.a = function () {
    return window.location;
  };
  google.nav.j = location.protocol + '//' + location.host;
  google.nav.go = function (a, b) {
    google.nav.e(a, b);
  };
  google.nav.e = function (a, b) {
    try {
      if (RegExp('^(' + google.nav.j + ')?/(url|aclk)\\?.*&rct=j(&|$)').test(a))
        if (b) {
          google.r = 1;
          b.location.replace(a);
        } else {
          if (!google.nav.c) {
            google.nav.c = document.createElement('iframe');
            google.nav.c.style.display = 'none';
            google.dom.append(google.nav.c);
          }
          google.r = 1;
          google.nav.c.src = a;
        }
      else google.nav.a().href = a;
    } catch (c) {
      google.nav.a().href = a;
    }
  };
  google.nav.search = function (a) {
    var b = google.nav.a().search.match(/[?&][\w\.\-~]+=([^&]*)/g),
      c = {};
    if (b)
      for (var d = 0, e; (e = b[d++]); ) {
        var f = e.match(/([\w\.\-~]+?)=(.*)/);
        e = f[1];
        f = f[2];
        c[e] = f;
      }
    for (e in a) if (a.hasOwnProperty(e)) c[e] = a[e];
    a = ['/search?'];
    b = g;
    for (e in c)
      if (c.hasOwnProperty(e)) {
        a.push((b ? '' : '&') + e + '=' + c[e]);
        b = h;
      }
    google.nav.go(a.join(''));
  };
  google.nav.getLocation = function () {
    return google.nav.a().pathname + google.nav.a().search;
  };
  google.nav.getLocationHash = function () {
    var a = google.nav.a();
    return a.hash ? a.href.substr(a.href.indexOf('#')) : '';
  };
  google.nav.getParam = function (a) {
    var b = google.nav.getLocationHash().match('[#?&]' + a + '=([^&]*)');
    if (b) return b[1];
    if ((b = google.nav.a().search.match('[?&]' + a + '=([^&]*)'))) return b[1];
    return null;
  };
  google.nav.getQuery = function () {
    return google.nav.getParam('q');
  };
  google.util = {};
  var l = [
    '&',
    '&amp;',
    '<',
    '&lt;',
    '>',
    '&gt;',
    '"',
    '&quot;',
    "'",
    '&#39;',
    '{',
    '&#123;',
  ];
  google.util.escape = function (a) {
    for (var b = 0; b < l.length; b += 2)
      a = a.replace(RegExp(l[b], 'g'), l[b + 1]);
    return a;
  };
  google.util.unescape = function (a) {
    for (var b = 0; b < l.length; b += 2)
      a = a.replace(RegExp(l[b + 1], 'g'), l[b]);
    return a;
  };
  google.util.eventTarget = function (a) {
    return google.browser.engine.IE ? window.event.srcElement : a.target;
  };
  google.util.stopPropagation = function (a) {
    if (a) a.stopPropagation && a.stopPropagation();
    else window.event.cancelBubble = g;
  };
  google.util.getSelection = function () {
    return (
      (window.getSelection && window.getSelection().toString()) ||
      (document.selection &&
        document.selection.createRange &&
        document.selection.createRange().text)
    );
  };
  google.srp = {};
  google.srp.d = function (a, b, c) {
    var d = RegExp('([?&])' + b + '=.*?(&|$)');
    a = a.replace(/^(.*)(#|$)/, function (e, f) {
      return f;
    });
    if (!a.match(d) && c != '') return a + '&' + b + '=' + c;
    return a.replace(d, function (e, f, j) {
      return c ? f + b + '=' + c + j : j ? f : '';
    });
  };
  google.srp.isSerpLink = function (a) {
    return /(search|images)/.test(a.href);
  };
  google.srp.isSerpForm = function (a) {
    return /\/search$/.test(a.action);
  };
  google.srp.updateLinksWithParam = function (a, b, c, d) {
    var e = document.getElementsByTagName('A');
    google.base_href = google.srp.d(google.base_href, a, b);
    for (var f = 0, j; (j = e[f++]); )
      if (c(j)) {
        var i = google.browser.engine.IE ? j.innerHTML : undefined;
        j.href = google.srp.d(j.href, a, b);
        if (i != undefined) j.innerHTML = i;
      }
    for (f = 0; (c = document.forms[f++]); )
      if (d(c)) {
        for (j = e = 0; (i = c.elements[j++]); )
          if (i.name == a) {
            e = 1;
            if (b != '') i.value = b;
            else i.parentNode.removeChild(i);
          }
        if (!e && b != '') {
          e = document.createElement('input');
          e.type = 'hidden';
          e.value = b;
          e.name = a;
          c.appendChild(e);
        }
      }
  };
  google.srp.qs = function (a) {
    if ((a = google.util.eventTarget(a))) {
      for (; !google.style.hasClass(a, 'qs'); ) {
        a = a.parentNode;
        if (!a || a == document.body) return;
      }
      var b = document.getElementsByName('q'),
        c = b && b[0];
      b = document.getElementById('tsf-oq');
      if (c && b && window.encodeURIComponent) {
        c = c.value;
        b = google.browser.engine.GECKO ? b.textContent : b.innerText;
        if (c && c != b) {
          b = google.srp.d(a.href, 'q', encodeURIComponent(c));
          a.href = google.srp.d(b, 'prmd', '');
        }
      }
    }
  };
  google.style = google.style || {};
  google.style.i = 0;
  google.style.getComputedStyle = function (a, b, c) {
    var d = c ? '' : 0;
    var e =
      document.defaultView && document.defaultView.getComputedStyle(a, '');
    try {
      d = e.getPropertyValue(b);
      d = c ? d : parseInt(d, 10);
    } catch (f) {}
    return d;
  };
  google.style.getHeight = function (a) {
    var b = google.style.getComputedStyle(a, 'height');
    return isNaN(b) ? 0 : b;
  };
  google.style.getWidth = function (a) {
    var b = google.style.getComputedStyle(a, 'width');
    return isNaN(b) ? 0 : b;
  };
  google.style.getPageOffsetTop = function (a) {
    return (
      a.offsetTop +
      (a.offsetParent ? google.style.getPageOffsetTop(a.offsetParent) : 0)
    );
  };
  google.style.getPageOffsetLeft = function (a) {
    return (
      a.offsetLeft +
      (a.offsetParent ? google.style.getPageOffsetLeft(a.offsetParent) : 0)
    );
  };
  google.style.getPageOffsetStart = function (a) {
    return google.style.getPageOffsetLeft(a) + google.style.i
      ? google.style.getWidth(a)
      : 0;
  };
  google.style.getColor = function (a) {
    return google.style.getComputedStyle(a, 'color', g);
  };
  google.xhr = function () {
    var a = null;
    if (window.XMLHttpRequest)
      try {
        a = new XMLHttpRequest();
      } catch (b) {}
    if (!a)
      for (
        var c = [
            'MSXML2.XMLHTTP.6.0',
            'MSXML2.XMLHTTP.3.0',
            'MSXML2.XMLHTTP',
            'Microsoft.XMLHTTP',
          ],
          d = 0,
          e;
        (e = c[d++]);

      )
        try {
          a = new ActiveXObject(e);
          break;
        } catch (f) {}
    return a;
  };
  google.xhr.z = '';
  google.isOpera = h;
  google.isIE = h;
  google.isSafari = h;
  google.getHeight = function (a) {
    return google.style.getHeight(a);
  };
  google.getWidth = function (a) {
    return google.style.getWidth(a);
  };
  google.getComputedStyle = function (a, b, c) {
    return google.style.getComputedStyle(a, b, c);
  };
  google.getPageOffsetTop = function (a) {
    return google.style.getPageOffsetTop(a);
  };
  google.getPageOffsetLeft = function (a) {
    return google.style.getPageOffsetLeft(a);
  };
  google.getPageOffsetStart = function (a) {
    return google.style.getPageOffsetStart(a);
  };
  google.hasClass = function (a, b) {
    return google.style.hasClass(a, b);
  };
  google.getColor = function (a) {
    return google.style.getColor(a);
  };
  google.append = function (a) {
    return google.dom.append(a);
  };
  google.rhs = function () {};
  google.eventTarget = function (a) {
    return a.target;
  };
  google.bind = function (a, b, c) {
    google.listen(a, b, c);
  };
  google.unbind = function (a, b, c) {
    google.unlisten(a, b, c);
  };
  google.getURIPath = function () {
    return google.nav.getLocation();
  };
})();
(function () {
  var c = window,
    f = Object,
    h = google,
    i = 'push',
    j = 'length',
    k = 'propertyIsEnumerable',
    l = 'prototype',
    m = 'call';
  function n(a) {
    var b = typeof a;
    if (b == 'object')
      if (a) {
        if (
          a instanceof Array ||
          (!(a instanceof f) && f[l].toString[m](a) == '[object Array]') ||
          (typeof a[j] == 'number' &&
            typeof a.splice != 'undefined' &&
            typeof a[k] != 'undefined' &&
            !a[k]('splice'))
        )
          return 'array';
        if (
          !(a instanceof f) &&
          (f[l].toString[m](a) == '[object Function]' ||
            (typeof a[m] != 'undefined' &&
              typeof a[k] != 'undefined' &&
              !a[k]('call')))
        )
          return 'function';
      } else return 'null';
    else if (b == 'function' && typeof a[m] == 'undefined') return 'object';
    return b;
  }
  function o(a) {
    return new p().serialize(a);
  }
  function p() {}
  p[l].serialize = function (a) {
    var b = [];
    this.a(a, b);
    return b.join('');
  };
  p[l].a = function (a, b) {
    switch (typeof a) {
      case 'string':
        this.b(a, b);
        break;
      case 'number':
        this.d(a, b);
        break;
      case 'boolean':
        b[i](a);
        break;
      case 'undefined':
        b[i]('null');
        break;
      case 'object':
        if (a == null) {
          b[i]('null');
          break;
        }
        if (n(a) == 'array') {
          this.c(a, b);
          break;
        }
        this.e(a, b);
        break;
      case 'function':
        break;
      default:
        throw Error('Unknown type: ' + typeof a);
    }
  };
  var q = {
      '"': '\\"',
      '\\': '\\\\',
      '/': '\\/',
      '\u0008': '\\b',
      '\u000c': '\\f',
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t',
      '\u000b': '\\u000b',
    },
    r = /\uffff/.test('\uffff')
      ? /[\\\"\x00-\x1f\x7f-\uffff]/g
      : /[\\\"\x00-\x1f\x7f-\xff]/g;
  p[l].b = function (a, b) {
    b[i](
      '"',
      a.replace(r, function (g) {
        if (g in q) return q[g];
        var d = g.charCodeAt(0),
          e = '\\u';
        if (d < 16) e += '000';
        else if (d < 256) e += '00';
        else if (d < 4096) e += '0';
        return (q[g] = e + d.toString(16));
      }),
      '"',
    );
  };
  p[l].d = function (a, b) {
    b[i](isFinite(a) && !isNaN(a) ? a : 'null');
  };
  p[l].c = function (a, b) {
    var g = a[j];
    b[i]('[');
    for (var d = '', e = 0; e < g; e++) {
      b[i](d);
      this.a(a[e], b);
      d = ',';
    }
    b[i](']');
  };
  p[l].e = function (a, b) {
    b[i]('{');
    var g = '';
    for (var d in a)
      if (a.hasOwnProperty(d)) {
        var e = a[d];
        if (typeof e != 'function') {
          b[i](g);
          this.b(d, b);
          b[i](':');
          this.a(e, b);
          g = ',';
        }
      }
    b[i]('}');
  };
  c.google.stringify = o;
  if (c.JSON && c.JSON.stringify && navigator.userAgent.indexOf('Chrome') == -1)
    c.google.stringify = c.JSON.stringify;
  h.History = {};
  var s = [],
    t = '/';
  h.History.client = function (a) {
    s[i](a);
    return s[j] - 1;
  };
  var u, v;
  function w() {
    var a = u.value;
    v = a ? eval('(' + a + ')') : {};
  }
  function x(a, b) {
    w();
    v[t] || (v[t] = {});
    v[t][a] = b;
    u.value = h.stringify(v);
  }
  var y = [];
  function z() {
    for (var a = 0, b; (b = y[a++]); ) b();
    y = [];
  }
  h.History.addPostInitCallback = function (a) {
    y[i](a);
  };
  h.History.save = function (a, b) {
    u && x(a, b);
  };
  h.History.initialize = function (a) {
    t = a;
    v = null;
    if ((u = document.getElementById('hcache'))) {
      w();
      for (a = 0; a < s[j]; ++a) v && v[t] && v[t][a] && s[a][m](null, v[t][a]);
      z();
    }
  };
})();
(function () {
  var a, b;
  google.rhs = function () {
    if (!google.drhs)
      if (document.getElementById('mbEnd') && (a || b)) {
        var d = google.getHeight(document.getElementById('rhsline')),
          c = a ? google.getHeight(a) : 0;
        if (b) c += google.getHeight(b) + 18;
        document.getElementById('rhspad').style.height =
          c > d ? Math.min(9999, c - d) + 'px' : google.isIE ? '' : 0;
      }
  };
  function e() {
    a = document.getElementById('tads');
    b = document.getElementById('3po');
    google.rhs();
  }
  e();
  google.bind(window, 'resize', google.rhs);
  google.rein.push(e);
})();
(function () {
  var d = 0,
    e = [];
  function i(b) {
    return b;
  }
  function j() {
    for (var b = 0, c; (c = e[b++]); ) {
      c = c;
      var g = google.time() - c.d;
      if (g >= c.b) {
        for (var f = 0, a = void 0; (a = c.c[f++]); )
          google.dom.set(a[0], a[1], a[3] + a[5]);
        c.a && c.a();
        c = 0;
      } else {
        for (f = 0; (a = c.c[f++]); ) {
          var h = a[2] + (a[3] - a[2]) * a[4](g / c.b);
          if (a[5] == 'px') h = Math.round(h);
          google.dom.set(a[0], a[1], h + a[5]);
        }
        c = 1;
      }
      c || e.splice(--b, 1);
    }
    if (!e.length) {
      window.clearInterval(d);
      d = 0;
    }
  }
  google.dstr.push(function () {
    window.clearInterval(d);
    d = 0;
    e = [];
  });
  google.fx = {};
  google.fx.linear = i;
  google.fx.easeOut = function (b) {
    return 1 - Math.pow(1 - b, 3);
  };
  google.fx.easeInAndOut = function (b) {
    return (3 - 2 * b) * b * b;
  };
  google.fx.animate = function (b, c, g) {
    for (var f = 0, a; (a = c[f++]); ) {
      a[5] = a[5] == null ? 'px' : a[5];
      a[4] = a[4] || i;
      google.dom.set(a[0], a[1], a[2] + a[5]);
    }
    e.push({ b: b, a: g, d: google.time(), c: c });
    d = d || window.setInterval(j, 15);
  };
  google.fx.wrap = function (b) {
    var c = document.createElement('div');
    b.parentNode.replaceChild(c, b);
    c.appendChild(b);
    return c;
  };
  google.fx.unwrap = function (b) {
    b.parentNode.parentNode.replaceChild(b, b.parentNode);
  };
})();
(function () {
  google.event = google.event || {};
  google.event.back = {};
  var c = [],
    f = [],
    g = { a: false, kEI: -1 };
  function h() {
    google.History.save(i, g);
  }
  function k() {
    for (var b = [], d = 0, a = c.length; d < a; d++) {
      var e = c[d](g[f[d]]);
      if (e) {
        b.length > 0 && b.push(',');
        b.push(e);
      }
    }
    b.push('&ei=', google.kEI);
    window.google.log('backbutton', b.join(''));
  }
  function l(b, d) {
    return function (a) {
      a = a || window.event;
      for (a = a.target || a.srcElement; a.parentNode && a.tagName != 'A'; )
        a = a.parentNode;
      b(a, d ? g[d] : null);
      d && h();
    };
  }
  function m() {
    if (!g.a) {
      g.a = true;
      g.kEI = google.kEI;
      h();
      if (window.addEventListener) {
        window.addEventListener('pageshow', n, false);
        o = false;
      }
    }
  }
  var p = google.j && google.j.en,
    o;
  function n(b) {
    if ((b.a || o) && !p) k();
    o = true;
  }
  var i = google.History.client(function (b) {
    g = b;
    g.a && google.kEI == g.kEI && k();
  });
  function q() {
    c.length = 0;
    f.length = 0;
  }
  google.dstr && google.dstr.push(q);
  google.event.back.register = function (b, d, a, e) {
    if (e) g[e] = {};
    for (var r = document.getElementsByTagName('a'), s = 0, j; (j = r[s++]); )
      b(j) && google.listen(j, 'click', l(d, e));
    c.push(a);
    f.push(e);
  };
  google.event.back.init = function () {
    g = { a: false, kEI: -1 };
    google.History.addPostInitCallback(m);
  };
  google.event.back.saveHistory = h;
})();
(function () {
  var g = true,
    h = null,
    j = false,
    l;
  window.google || (window.google = {});
  var m = 0,
    n = 0;
  if (google.browser.engine.IE)
    n = document.documentMode
      ? document.documentMode
      : parseInt(google.browser.engine.version.split('.')[0], 10);
  var r = {
      0: google.browser.engine.WEBKIT,
      1: !google.browser.engine.IE,
      2: g,
      3: g,
      4: !google.browser.engine.GECKO,
      5: g,
    },
    v = { 0: g, 1: g, 2: j, 3: g, 4: j, 5: g },
    w = [0, 1, 2, 3, 4, 5],
    x = {},
    y = {},
    z = {},
    A = {},
    B = function (a, b, c) {
      this.Da = a;
      this.k = b;
      this.Ca = c;
    },
    C = {},
    D = function (a) {
      this.Ua = a;
      this.D = {};
      this.R = {};
    };
  D.prototype.Ga = function (a, b, c) {
    this.D[a] = c;
    if (typeof this.R[b] == 'number') this.R[b]++;
    else this.R[b] = 1;
  };
  D.prototype.xa = function (a, b) {
    a && delete this.D[a];
    b && this.R[b]--;
  };
  D.prototype.pa = function (a) {
    return this.D[a];
  };
  D.prototype.Ma = function (a, b) {
    if (this.R[a] > 0)
      for (var c in this.D) {
        var d = this.D[c].k;
        if (d && d.length > 1) if (a == b(d[0].u, this.Ua)) return this.D[c];
      }
    return h;
  };
  var E = {},
    aa = /[&\?]ech=([0-9]+)/,
    ba = /[\?&#](tch|ech|psi|wrapid)=[^&]*/g,
    ca = function (a, b, c, d, e, f) {
      this[5] = a;
      this[2] = b;
      this[4] = c;
      this[3] = d;
      this[0] = e;
      this[1] = f;
    },
    da = function (a, b, c, d) {
      this.noWrapper = a;
      this.name = b;
      this.avgTimingThresholds = c;
      this.maxTimingThresholds = d;
    };
  window.google.gtr = function (a, b) {
    var c;
    c = a;
    var d = [];
    if (c)
      for (f = 0; f < c.length; f++) {
        var e = c[f];
        i = e[5];
        if (typeof i != 'undefined' && r[i]) if (i != 0 || e[4]) d.push(e);
      }
    else
      for (var f = 0; f < w.length; ++f) {
        var i = w[f];
        r[i] && i != 0 && d.push(new ca(i, g));
      }
    c = d;
    if (!c.length) return h;
    d = b || new da();
    return new F(c, d);
  };
  var ea = function (a) {
      return a
        .substring(a.indexOf('?') + 1)
        .split('&')
        .sort()
        .join('&');
    },
    fa = function (a) {
      if (a.indexOf('http://') == 0) {
        var b = a.indexOf('/', 7);
        a = a.substring(b);
      }
      b = a.indexOf('?');
      return b == -1 ? a : a.substring(0, b);
    },
    ga = function (a) {
      if (!a) return a;
      return a.replace(ba, '');
    },
    I = function (a, b, c) {
      try {
        return google.browser.engine.IE
          ? eval('(' + a + ')')
          : new Function('return ' + a)();
      } catch (d) {
        G(1, 9, b, d, c);
      }
      return a;
    },
    J = function (a, b) {
      a.t = b[4];
      a.ta = !b[2];
      a.i = b[3];
      a.ka = b[5];
      a.K = b[0];
      a.Q = b[1];
    },
    F = function (a, b) {
      J(this, a[0]);
      this.g = b.noWrapper;
      this.Oa = b.name;
      this.L = function () {};
      this._ckf(ea);
      this.V = {};
      this.ea = fa;
      this.oa = 59;
      this.Sa = a.splice(1, a.length - 1);
      this.p = [];
      this.M = {};
      this.B = g;
      this.fa = {};
      this.U = [0, 0, 0];
      this.Y = [0, 0, 0];
      this.P = j;
      this.ya = {};
      this.s = new K();
      this.Ta = google.kEI + google.time();
      this.Aa = 0;
      this._stt(b.avgTimingThresholds, b.maxTimingThresholds);
    },
    L = function (a, b, c, d, e, f) {
      if (a == 0 || a == 1) {
        e = e;
        d = { _svty: a, _err: b, _type: d && d.A(), _noWrap: d && d.g };
        if (f) d._data = encodeURIComponent('' + f);
        try {
          d._wl = encodeURIComponent(google.nav.getLocation());
        } catch (i) {}
        google.ml(e || Error('comm'), j, d);
      }
      for (d = 0; (e = c[d++]); ) e.ma(a, b, f);
    };
  F.prototype._o = function () {
    if (!this.a) {
      switch (this.ka) {
        case 0:
          if (this.ta && x[this.t] && !this.g) {
            this.a = x[this.t];
            this.a.w(this);
            this.a.ha++;
            this.B = j;
            return g;
          } else this.a = new O(this.t, this.g);
          break;
        case 1:
          this.a = new P(g, this.g, this.K, this.Q);
          break;
        case 2:
          this.a = new P(j, this.g, this.K, this.Q);
          break;
        case 3:
          this.a = new Q(this.Oa, this.g, this.i);
          break;
        case 4:
          this.a = new R(this.g, this.K, this.Q);
          break;
        case 5:
          this.a = new S(this.g, this.i);
          break;
        default:
          L(0, 18, this.p, this.a);
          return j;
      }
      var a = !this.a;
      if (this.a) {
        this.a.w(this);
        a = !this.a.open();
      }
      if (a) {
        this.a = h;
        a = this.Sa.shift();
        if (!a) return j;
        J(this, a);
        return this._o();
      } else if (this.ta) if (this.ka == 0) x[this.t] = this.a;
    }
    this.B = j;
    return g;
  };
  var T = function (a) {
      if (a.k && a.k.length > 0) {
        var b = google.time();
        if (a.Da + a.Ca * 1e3 < b) a.k = [];
      }
    },
    ha = function (a, b, c, d, e) {
      this.d = a;
      this.e = b;
      this.u = c;
      this.c = d;
      this.ct = e;
    };
  F.prototype._d = function (a, b, c, d) {
    if (!this.B) {
      if (typeof a == 'string') a = new ha(a);
      var e = a.c && a.c == 1;
      if (typeof c != 'undefined' && this.g) e = c;
      var f = a.u ? this.ea(a.u) : '',
        i = a.e,
        k = E[f],
        p = C[f],
        t = ga(a.u) || '';
      if (typeof a.d != 'undefined' && a.d != h) {
        c = this.M[f] || this.M.unknown || [];
        var o = a.u ? a.u.match(aa) : 0;
        if (o) {
          var q = this.fa[o[1]];
          if (q) {
            c.unshift(q);
            if (!a.c || a.c == 0) delete this.fa[o[1]];
          }
          if (!d)
            if ((q = this.ya[o[1]])) {
              q = google.time() - q;
              e ? this.s.Wa(o[1], q) : this.s.Xa(o[1], q);
            }
        }
        if (!c.length) {
          L(1, 10, this.p, this.a, h, f);
          return;
        }
        var H = this;
        q = google.time();
        for (var s = 0; s < c.length; ++s)
          c[s].ma(
            a.d,
            function () {
              var M = [],
                u = k && k.pa(i);
              if (!u) {
                u = H.L(t, f);
                u = p && p[u];
              }
              if (f && u) for (var N = 0; N < u.k.length; ++N) M.push(u.k[N].d);
              M.push(a.d);
              return M.join('');
            },
            t,
            e,
            d,
          );
        if (!d && o) {
          this.s.Va(o[1], google.time() - q);
          if (!e && this.P)
            (d = this.s.Ja(this.U, this.Y)) &&
              L(2, 15, this.p, this.a, h, d.join(','));
        }
      }
      if (a.u && !b) {
        b = this.L(t, f);
        if (!C[f]) {
          E[f] = k = new D(f);
          C[f] = {};
        }
        p = C[f];
        if (a.c == -1) {
          k && k.xa(i, b);
          delete p[b];
        } else if (typeof a.d != 'undefined' && a.d != h) {
          d = k && k.pa(i);
          c = j;
          if (d) T(d);
          else {
            c = g;
            d = new B(0, [], 0);
          }
          o = google.time();
          d.Da = o;
          o = a.ct || this.oa;
          d.Ca = o;
          d.k.push(a);
          if (e)
            if (i) c && k && k.Ga(i, b, d);
            else L(1, 8, this.p, this.a);
          else {
            p[b] = d;
            k && k.xa(i, b);
          }
        }
      }
    }
  };
  var U = h,
    ia = function (a) {
      if (window.postMessage) {
        if (!U) {
          U = [];
          var b = function (c) {
            if (c && c.source == window && c.data == 'com.brb') {
              U.length && U.shift()();
              U.length && window.postMessage('com.brb', window.location.href);
            }
          };
          google.listen(window, 'message', b);
        }
        U.push(a);
        window.postMessage('com.brb', window.location.href);
      } else window.setTimeout(a, 0);
    };
  F.prototype._s = function (a, b, c) {
    if (this.B) {
      L(0, 14, this.p, this.a);
      return j;
    }
    if (!b) {
      var d = this.qa(a);
      if (d && d.k.length > 0) {
        var e = this;
        for (b = 0; b < d.k.length; ++b)
          (function (f, i) {
            ia(function () {
              e._d(f, g, i, g);
            });
          })(d.k[b], b < d.k.length - 1);
        return g;
      }
    }
    d = a.indexOf('?') == -1 ? '?' : '&';
    a = [a, d];
    if (!this.g) {
      a.push('tch=');
      a.push(this._t());
    }
    if (!this.a.Ba) this.a.Ba = 1;
    d = this.a.Ba++;
    a.push('&ech=', d);
    a.push('&psi=', this.Ta + this.Aa);
    if (c) this.fa[d] = c;
    a = a.join('');
    this.ya[d] = google.time();
    this.a.T(a, b);
    return g;
  };
  F.prototype._ckf = function (a, b) {
    if (b) {
      this.V[b] && L(2, 4, this.p, this.a, h, b);
      this.V[b] = a;
    } else {
      var c = this;
      this.L = function (d, e) {
        return c.V[e] ? c.V[e](d) : a(d);
      };
    }
  };
  F.prototype._dtf = function (a) {
    this.ea = a;
  };
  F.prototype._sct = function (a) {
    this.oa = a;
  };
  F.prototype._stt = function (a, b) {
    this.U = a || [0, 0, 0];
    this.Y = b || [0, 0, 0];
    this.P = j;
    for (var c = 0; c < this.U.length; ++c)
      if (this.U[c] > 0) {
        this.P = g;
        break;
      }
    if (!this.P)
      for (c = 0; c < this.Y.length; ++c)
        if (this.Y[c] > 0) {
          this.P = g;
          break;
        }
  };
  F.prototype._gts = function () {
    this.s.na();
    var a = this.s.m,
      b = this.s.max,
      c = this.s.C.length;
    return [
      [c, a.l, a.n, a.j],
      [c, b.l, b.n, b.j],
    ];
  };
  var V = function (a, b, c) {
    b = { ma: b, wa: c || 0 };
    a.push(b);
    a.sort(function (d, e) {
      return e.wa - d.wa;
    });
  };
  F.prototype._rce = function (a, b) {
    V(this.p, a, b);
  };
  F.prototype._rd = function (a, b, c) {
    b = b || '';
    this.M[b] || (this.M[b] = []);
    V(this.M[b], a, c);
  };
  F.prototype._t = function () {
    return this.ka;
  };
  F.prototype._rt = function () {
    return this.a.O();
  };
  F.prototype._p = function () {
    return v[this.a.A()];
  };
  F.prototype._i = function (a) {
    return !!this.qa(a);
  };
  F.prototype.qa = function (a) {
    var b = this.ea(a);
    a = this.L(a, b);
    var c = C[b],
      d = E[b],
      e = h;
    if (a && b) e = c && c[a] ? c[a] : d && d.Ma(a, this.L);
    if (e) {
      T(e);
      if (e.k.length) return e;
    }
    return h;
  };
  F.prototype._c = function () {
    if (this.B) L(1, 3, this.p, this.a);
    else {
      this.B = g;
      this.a.close();
      this.a.S(this);
      this.a = h;
    }
  };
  F.prototype._ns = function () {
    this.Aa++;
  };
  var W = function (a) {
    this.ra = a;
    this.j = this.n = this.l = h;
  };
  W.prototype.za = function () {
    this.j = this.n = this.l = 0;
  };
  var K = function () {
    this.ca = {};
    this.C = [];
    this.X = 0;
    this.m = new W('');
    this.max = new W('');
  };
  l = K.prototype;
  l.Ha = function (a) {
    var b = this.C[this.X];
    b && delete this.ca[b];
    this.ca[a.ra] = a;
    this.C[this.X] = a.ra;
    this.X = (this.X + 1) % 10;
  };
  l.la = function (a, b, c, d) {
    var e = this.ca[a];
    if (!e) {
      e = new W(a);
      this.Ha(e);
    }
    if (b != h && e.l == h) e.l = b;
    if (c != h) e.n = c;
    if (d != h) e.j = (e.j || 0) + d;
  };
  l.Wa = function (a, b) {
    this.la(a, b, h, h);
  };
  l.Xa = function (a, b) {
    this.la(a, h, b, h);
  };
  l.Va = function (a, b) {
    this.la(a, h, h, b);
  };
  l.na = function () {
    this.m.za();
    this.max.za();
    var a = this.C.length;
    if (a) {
      for (var b = 0; b < a; b++) {
        var c = this.ca[this.C[b]],
          d = c.l || 0,
          e = c.n || 0;
        c = c.j || 0;
        this.m.l += d;
        this.m.n += e;
        this.m.j += c;
        this.max.l = Math.max(d, this.max.l);
        this.max.n = Math.max(e, this.max.n);
        this.max.j = Math.max(c, this.max.j);
      }
      this.m.l /= a;
      this.m.n /= a;
      this.m.j /= a;
    }
  };
  l.Ja = function (a, b) {
    this.na();
    var c = j,
      d = [this.m.l, this.m.n, this.m.j];
    if (this.C.length == 10)
      for (var e = 0; e < d.length; ++e)
        if (a[e] > 0 && d[e] > a[e]) {
          c = g;
          break;
        }
    var f = [this.max.l, this.max.n, this.max.j];
    if (!c)
      for (e = 0; e < f.length; ++e)
        if (b[e] > 0 && f[e] > b[e]) {
          c = g;
          break;
        }
    return c ? d.concat(f) : h;
  };
  var G = function (a, b, c, d, e) {
      for (var f = c.b, i = 0; f && i < f.length; ++i) L(a, b, f[i].p, c, d, e);
    },
    X = function (a, b, c, d) {
      for (var e = 0; e < b.length; ++e) b[e]._d(a, c, d);
    },
    Y = function (a, b) {
      for (var c = 0; c < b.length; c++)
        if (b[c] == a) {
          b.splice(c, 1);
          break;
        }
    };
  window.google.td = function (a, b, c, d) {
    var e = {};
    if (b == 3) e = y;
    else if (b == 4) e = z;
    else if (b == 5) e = A;
    for (var f in e) {
      b = e[f];
      b.da(a, c, d);
    }
  };
  var O = function (a, b) {
    this.b = [];
    this.g = !!b;
    this.Z = [];
    this.ha = 1;
    this.t = a;
    this.I = 1;
  };
  l = O.prototype;
  l.w = function (a) {
    this.b.push(a);
  };
  l.S = function (a) {
    Y(a, this.b);
  };
  l.open = function () {
    try {
      var a = window.WebSocket;
      this.v = new a(this.t);
      this.I = 2;
    } catch (b) {
      G(0, 6, this, b);
      return j;
    }
    var c = this;
    this.v.Ya = function () {
      c.I = 3;
      for (var d = 0; d < c.Z.length; ++d) c.v.send(c.Z[d]);
      c.Z = [];
    };
    this.v.onmessage = function (d) {
      var e = d.data;
      c.g || (e = I(d.data, c));
      e && X(e, c.b);
    };
    this.v.onclose = function () {
      c.I != 4 && G(0, 16, c);
      c.I = 1;
    };
    return g;
  };
  l.close = function () {
    this.ha--;
    if (this.ha == 0) {
      this.I = 4;
      this.v.close();
      delete x[this.t];
    }
  };
  l.T = function (a) {
    switch (this.I) {
      case 3:
        this.v.send(a);
        break;
      case 1:
      case 4:
        G(1, 11, this);
        break;
      case 2:
        this.Z.push(a);
        break;
      default:
        G(1, 17, this);
    }
  };
  l.O = function () {
    return this.v;
  };
  l.A = function () {
    return 0;
  };
  var Q = function (a, b, c) {
      this.h = a || 'tlif' + google.time() + m++;
      this.g = !!b;
      this.ja = g;
      this.b = [];
      this.i = c || 1;
      this.z = 0;
      this.J = [];
      this.ia = [];
    },
    Z = n && n <= 7 ? 1 : 0;
  l = Q.prototype;
  l.w = function (a) {
    this.b.push(a);
  };
  l.S = function (a) {
    Y(a, this.b);
  };
  l.da = function (a, b) {
    if (
      a &&
      ((this.i == 1 && a == this.h) ||
        (this.i > 1 && a.match('^' + this.h + '[0-9]+$')))
    )
      X(b, this.b);
  };
  l.open = function () {
    var a = document;
    if (google.browser.engine.IE)
      try {
        var b = (window.google.ihtmlfile = new ActiveXObject('htmlfile'));
        b.open();
        b.close();
        b.parentWindow.google = window.google;
        a = b;
      } catch (c) {
        G(1, 2, this, c);
        return j;
      }
    for (b = 0; b < this.i; ++b) {
      var d = this.h + (this.i > 1 ? b : '');
      if (!this.J[b])
        try {
          var e = a.createElement('IFRAME');
          e.name = d;
          e.style.display = 'none';
          e.src = 'about:blank';
          a.body.appendChild(e);
          this.J[b] = e.contentWindow;
        } catch (f) {
          G(1, 5, this, f);
          return j;
        }
      var i = this.J[b];
      if (!i) return j;
      (function (k, p, t, o) {
        var q = function () {
          k.Qa(p, o);
        };
        t = document.getElementsByName(t);
        for (var H = 0, s; (s = t[H]); ++H)
          if (s.tagName == 'IFRAME') {
            google.listen(s, 'load', q);
            k.Pa(s);
          }
        k.Ia(p, o);
      })(this, i, d, b);
    }
    y[this.h] = this;
    return g;
  };
  l.Qa = function (a, b) {
    try {
      var c = a.location.href,
        d = n <= 7 || a.document.readyState == 'complete';
    } catch (e) {
      G(1, 13, this, e);
      return;
    }
    try {
      if (
        !(/\/blank\.html$/.test(c) || /about:blank$/.test(c)) &&
        !(a.Na && a.Na.loc) &&
        d &&
        c.indexOf(this.ia[b]) < 0
      )
        G(1, 19, this);
    } catch (f) {
      G(1, 7, this, f);
    }
    this.Ra(a);
  };
  l.Ra = function (a) {
    if (Z == 0 && a) a.src = 'about:blank';
  };
  l.Pa = function (a) {
    if (Z == 0 && n >= 8) {
      var b = document.createElement('div');
      b.style.display = 'none';
      google.dom.insert(b, a);
    }
  };
  l.Ia = function (a, b) {
    if (Z == 1 && !this.ia[b])
      try {
        a.document.title = document.title;
      } catch (c) {}
  };
  l.close = function () {
    if (this.i == 1) {
      delete y[this.h];
      var a = window.frames[this.h];
      a.parent.removeChild(a);
    } else
      for (var b = 0; b < this.i; b++) {
        a = this.h + b;
        delete y[a];
        a = window.frames[a];
        a.parent.removeChild(a);
      }
  };
  l.T = function (a, b) {
    this.z = (this.z + 1) % this.i;
    var c = this.h + (this.i == 1 ? '' : this.z);
    a += '&wrapid=' + encodeURIComponent(c);
    c = this.J[this.z];
    if (Z == 1) c.location.href = a;
    else c.location.replace(a);
    this.ia[this.z] = a;
    this.ja = !b;
  };
  l.O = function () {
    return this.i == 1 ? this.J[this.z] : this.J;
  };
  l.A = function () {
    return 3;
  };
  var R = function (a, b, c) {
    this.h = 'tljp' + google.time() + m++;
    this.Ka = 0;
    this.g = !!a;
    this.ja = g;
    this.b = [];
    this.H = {};
    this.G = [];
    this.K = !!b;
    this.Q = c || 5;
  };
  l = R.prototype;
  l.w = function (a) {
    this.b.push(a);
  };
  l.S = function (a) {
    Y(a, this.b);
  };
  l.open = function () {
    z[this.h] = this;
    return g;
  };
  l.close = function () {
    z && z[this.h] && delete z[this.h];
    for (var a in this.H) this.W(a);
  };
  l.W = function (a) {
    var b = this.H[a];
    if (b) {
      delete this.H[a];
      for (var c = 0; c < this.G.length; ++c)
        if (this.G[c] == a) {
          this.G.splice(c, 1);
          break;
        }
      window.setTimeout(function () {
        try {
          google.dom.remove(b);
          b.src = 'about:blank';
        } catch (d) {}
      }, 0);
    }
  };
  l.da = function (a, b) {
    this.H[a] && X(b, this.b);
  };
  l.T = function (a, b) {
    var c = document.createElement('script'),
      d = this.h + this.Ka++;
    c.src = a + '&wrapid=' + d;
    c.id = d;
    this.H[d] = c;
    this.G.push(d);
    var e = this;
    if (google.browser.product.IE)
      c.onreadystatechange = function () {
        var f = c.readyState;
        if (f == 'loaded' || f == 'complete') e.W(d);
      };
    else
      c.onload = function () {
        e.W(d);
      };
    document.body.appendChild(c);
    this.ja = !b;
    this.K && this.G.length > this.Q && this.W(this.G[0]);
  };
  l.O = function () {
    return this.H;
  };
  l.A = function () {
    return 4;
  };
  var P = function (a, b, c, d) {
    this.ga = !!a;
    this.g = !!b;
    this.Ea = !!c;
    this.sa = d || 5;
    this.$ = [];
    this.o = [];
    this.ua = 0;
    this.b = [];
  };
  l = P.prototype;
  l.w = function (a) {
    this.b.push(a);
  };
  l.S = function (a) {
    Y(a, this.b);
  };
  l.open = function () {
    var a = google.xhr();
    return !!a;
  };
  l.close = function () {
    this.$ = [];
    for (var a = 0; a < this.o.length; ++a) {
      var b = this.o[a];
      if (b) b.onreadystatechange = function () {};
      b && b.readyState != 0 && b.readyState != 4 && b.abort();
    }
    this.o = [];
  };
  l.T = function (a, b) {
    var c = google.xhr();
    c.open('GET', a);
    if (c) {
      var d = this,
        e = function (i, k, p) {
          X(i, d.b, k, p);
        },
        f = 0;
      c.onreadystatechange = function () {
        try {
          if (c.readyState == 4 && c.status == 0) {
            G(1, 21, d, h, a);
            d.aa(c);
            d.ba();
            return;
          }
        } catch (i) {
          G(1, 21, d, h, a);
          d.aa(c);
          d.ba();
          return;
        }
        var k = c.getResponseHeader('Content-Type') || '';
        if (
          (c.readyState == 3 || c.readyState == 4) &&
          c.status == 200 &&
          !d.g &&
          k.indexOf('application/json') == -1
        ) {
          G(1, 12, d, h, a);
          d.aa(c);
          d.ba();
        } else if (c.readyState == 3 && d.ga)
          if (d.g) e(c.responseText, g, g);
          else f = $(c.responseText, f, e, d, a);
        else if (c.readyState == 4) {
          if (c.status == 200 && (!d.g || !d.ga || f == 0))
            d.g
              ? e(c.responseText, b, j)
              : $(
                  c.responseText,
                  f,
                  function (p) {
                    e(p, b);
                  },
                  d,
                  a,
                  g,
                );
          else if (c.status >= 400 && c.status < 500) G(1, 0, d, h, a);
          else c.status >= 500 && c.status < 600 && G(1, 1, d, h, a);
          d.aa(c);
          d.ba();
        }
      };
      this.Fa(c);
    }
  };
  l.Fa = function (a) {
    if (this.o.length < this.sa) {
      a.send(h);
      this.o.push(a);
    } else if (this.Ea) {
      var b = this.o.shift();
      b.onreadystatechange = function () {};
      b.abort();
      G(2, 20, this);
      a.send(h);
    } else this.$.push(a);
  };
  l.ba = function () {
    for (; this.ua < this.sa && this.$.length > 0; ) {
      var a = this.$.shift();
      if (a) {
        a.send(h);
        this.ua++;
        this.o.push(a);
      }
    }
  };
  l.aa = function (a) {
    for (var b = 0; b < this.o.length; ++b) {
      var c = this.o[b];
      if (a == c) {
        this.o.splice(b, 1);
        break;
      }
    }
  };
  var $ = function (a, b, c, d, e, f) {
    var i = a.split('/*""*/'),
      k = -1;
    f && k++;
    for (f = b; f < i.length + k; ++f) {
      b++;
      if (i[f]) {
        a = I(i[f], d, e);
        c(a);
      }
    }
    return b;
  };
  P.prototype.O = function () {
    return window.google.xhr();
  };
  P.prototype.A = function () {
    return this.ga ? 1 : 2;
  };
  var S = function (a, b) {
    this.h = 'tlfl' + google.time() + m++;
    this.g = !!a;
    this.b = [];
    this.r = h;
    this.i = b || 5;
    this.N = {};
    this.F = [];
  };
  l = S.prototype;
  l.w = function (a) {
    this.b.push(a);
  };
  l.S = function (a) {
    Y(a, this.b);
  };
  l.da = function (a, b, c) {
    var d = this.N[a];
    if (d != h) {
      d.data += b;
      var e = this;
      b = function (f, i, k) {
        X(f, e.b, i, k);
      };
      d.va = $(d.data, d.va, b, this, a, !!c);
      if (c) delete this.N[a];
      else this.N[a] = d;
    }
  };
  l.open = function () {
    if ((this.r = document.commtransport)) {
      if (google.browser.product.IE) {
        var a;
        try {
          a = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.9');
        } catch (b) {}
        if (!a) return j;
      } else if (!navigator.plugins || !navigator.plugins['Shockwave Flash'])
        return j;
      A[this.h] = this;
      return g;
    }
    return j;
  };
  l.close = function () {
    this.r = h;
    this.N = {};
    this.F = [];
  };
  window.google.ts = function () {
    for (var a in A) {
      var b = A[a];
      b.La();
    }
  };
  S.prototype.La = function () {
    this.r.configure(this.i, '/*""*/');
    for (var a = 0; a < this.F.length; ++a) this.r.sendUrl(this.F[a]);
    this.F = [];
  };
  S.prototype.T = function (a) {
    if (this.r) {
      if (typeof this.r.sendUrl == 'function') this.r.sendUrl(a);
      else this.F.length < this.i && this.F.push(a);
      this.N[a] = { data: '', va: 0 };
    }
  };
  S.prototype.O = function () {
    return this.r;
  };
  S.prototype.A = function () {
    return 5;
  };
})();
(function () {
  var f = true,
    i = null,
    j = false;
  var l = (window.google.ac = {}),
    ba = j,
    ca,
    da,
    ea,
    fa,
    ga,
    ha,
    ia,
    ja,
    ka,
    m,
    n,
    o,
    p,
    r = '',
    la = i,
    s = i,
    t = i,
    u = -1,
    v,
    w,
    x,
    y,
    z,
    A,
    ma,
    B,
    D,
    E,
    na,
    oa,
    pa,
    F,
    G,
    qa = {},
    ra,
    H = 0,
    I = 0,
    sa = j,
    J = i,
    K = 0,
    ta,
    va;
  var L;
  var R,
    xa = 0,
    ya = j,
    S = {
      addPbx: j,
      allowHideSuggestions: f,
      allowPSuggest: f,
      executeQueryOnEsc: j,
      fullWidth: j,
      maxShownSuggestions: -1,
      showSearchButton: f,
      useKeyDown: j,
    };
  function za(a) {
    for (var b in a) S[b] = a[b];
  }
  function Ca(a) {
    return (a = a && a.match(/\D+$/)) ? a[0] : i;
  }
  var Da = 'hp',
    Ea = 'serp',
    Fa = 'img',
    Ga = { 0: Da, 1: Ea, 2: Fa },
    T;
  function Ha(a) {
    return (
      document.getElementById('gac_scont') ||
      document.getElementById('main') ||
      document.getElementById('xjsc') ||
      document.body
    ).appendChild(a);
  }
  function Ia() {
    if (google.msg.send(8)) {
      Ja();
      U();
      if (v) {
        E.value = na.value = oa.value = F.value = pa.value = '';
        window.clearTimeout(la);
        r = va = ra = '';
        la = s = t = i;
        u = -1;
        T = H = I = K = 0;
        qa = {};
        L = 0;
        xa = 0;
      }
    }
  }
  var Ka = { hl: 1, client: 1, expIds: 1, tok: 1, xhr: 1, q: 1, cp: 1 },
    La = function (a) {
      a = a.substring(a.indexOf('?') + 1);
      a = a.split('&');
      for (var b = [], d = {}, c = 0, e; (e = a[c++]); ) {
        var g = e.split('=');
        if (g.length == 2) {
          g = g[0];
          if (Ka[g] && !d[g]) {
            b.push(g == 'q' ? e.toLowerCase().replace(/\+/g, ' ') : e);
            d[g] = f;
          }
        }
      }
      b.sort();
      return decodeURIComponent(b.join('&'));
    };
  function Ma(a, b, d) {
    google.msg.send(17, [a, b, d], j) && Na();
  }
  function Oa(a) {
    if (a) {
      R && R._c();
      R = a;
      R._rce(Ma, 10);
      R._ckf(La, '/complete/search');
      a = '/s';
      R._ckf(La, a);
      var b = function (d, c, e, g, h, k) {
        if (h) return f;
        if (e) d = e();
        try {
          if (typeof d == 'string') d = eval('(' + d + ')');
          c(d, k);
        } catch (q) {}
        return f;
      };
      R._rd(function (d, c, e, g, h) {
        b(d, Pa, c, e, g, h);
      }, '/complete/search');
      R._t() != 4
        ? R._rd(function (d, c, e, g, h) {
            b(d, Pa, c, e, g, h);
          }, a)
        : R._rd(function () {}, a);
      R._rd(function (d, c, e, g, h) {
        b(d, Qa, c, e, g, h);
      }, '/complete/deleteitems');
    }
  }
  function Ra(a, b) {
    T = 0;
    if (a == 'i') T = 2;
    else if (b && b != '') T = 1;
  }
  function Sa() {
    if (S.addPbx && !ya) {
      V('pbx', '1');
      ya = f;
    }
  }
  function Ta(a, b, d, c, e, g) {
    if (!b) {
      a = document.f || document.gs;
      b = a.q;
    }
    if (!(!google.msg.send(13, [b]) && w)) {
      Ra(d, c);
      Ua();
      g && Va(g);
      Wa();
      v = a;
      w = b;
      o = p = n = w.value;
      if (!b.init) {
        ta = document.getElementsByTagName('head')[0];
        google.bind(v, 'submit', Xa);
        google.bind(w, 'paste', function (h) {
          return Ya(h);
        });
        google.bind(w, 'cut', function (h) {
          return Ya(h);
        });
        w.setAttribute('autocomplete', 'off');
        if (S.allowHideSuggestions) {
          google.bind(w, 'blur', U);
        }
        w.onkeypress = Za;
        google.bind(w, 'keyup', $a);
        E = V('aq', 'f');
        na = V('aqi', '');
        oa = V('aql', '');
        F = V('oq', o);
        pa = V('gs_rfai', '');
        ya = j;
        Sa();
        B = A = document.createElement('table');
        A.cellSpacing = A.cellPadding = '0';
        D = ma = A.style;
        A.className = 'gac_m';
        if (m) {
          B = y = document.createElement('div');
          y.className = 'gac_od';
          D = y.style;
          Ha(y);
          if (T == 1) {
            a = document.createElement('div');
            a.className = 'gac_wd';
            y.appendChild(a);
          }
          z = document.createElement('div');
          z.cellSpacing = y.cellPadding = '0';
          z.className = 'gac_id';
          y.appendChild(z);
          z.appendChild(A);
        } else v.appendChild(A);
      }
      b.init = f;
      U();
      W();
      if (!ba) {
        ab();
        ba = f;
      }
      b = Ga[T];
      b = '&client=' + b;
      d = d ? '&ds=' + d : '';
      a = S.allowPSuggest && e ? '&tok=' + encodeURIComponent(e) : '';
      c = [
        '?hl=',
        google.kHL,
        b,
        bb(),
        d,
        '&sugexp=ldymls',
        c ? '&pq=' + encodeURIComponent(c) : '',
        a,
      ].join('');
      ra = '/complete/search' + c;
      va = '/complete/deleteitems' + c;
      L = cb();
      google.bind(window, 'pageshow', function (h) {
        if (h.persisted) {
          E.value = 'f';
          F.value = w.value;
        }
      });
      eb();
      e = ja || (e && e.length) || 'https:' == document.location.protocol;
      ka = ['http', e ? 's' : '', '://'].join('');
      if (R && R._t() == 4)
        new Image().src = ka + 'clients1.google.com/generate_204';
    }
  }
  function Ya(a) {
    if (!fb(a, -1)) return j;
    window.setTimeout(function () {
      o = w.value;
      L = cb();
    }, 0);
    return f;
  }
  function fb(a, b) {
    if (!google.msg.send(14, [b, a])) {
      a.cancelBubble = f;
      return (a.returnValue = j);
    }
    return f;
  }
  function ab() {
    function a(c, e) {
      b.push(c, '{', e, '}');
    }
    var b = [];
    if (m) {
      var d = 'background:white;margin:0;z-index:100;';
      a(
        '.gac_od',
        d +
          'border-top:0;border-left:0;border-right:1px solid #e7e7e7;border-bottom:1px solid #e7e7e7;margin-top:1px;padding:0!important;position:absolute',
      );
      a(
        '.gac_id',
        d +
          'border-top:1px solid #a2bff0;border-left:1px solid #a2bff0;border-right:1px solid #558be3;border-bottom:1px solid #558be3;display:block;position:relative',
      );
      a(
        '.gac_m',
        d +
          'border:0;cursor:default;display:block;font-size:17px;line-height:117%;padding:0;position:relative',
      );
      if (!document.body.dir || document.body.dir == 'ltr')
        a(
          '.gac_wd',
          'background:#999;height:1px;position:absolute;right:-1px;top:0;width:1px;z-index:100',
        );
    } else
      a(
        '.gac_m',
        'background:white;border:1px solid #666;cursor:default;font-size:17px;line-height:117%;margin:0;position:absolute;z-index:99',
      );
    a('.gac_m td', 'line-height:22px');
    a('.gac_n', 'padding-top:1px;padding-bottom:1px');
    a('.gac_b td.gac_c', 'background:#d5e2ff');
    a('.gac_b', 'background:#d5e2ff');
    a('.gac_k', 'display:none');
    a('.gac_b td.gac_k', 'display:block');
    a('.gac_a td.gac_f', 'background:#fff8dd');
    a('.gac_p', 'padding:1px 4px 2px 3px');
    a('.gac_u', 'padding:0 0 1px 0;line-height:117%;text-align:left');
    a('.gac_t', 'width:100%;text-align:left;font-size:17px');
    a(
      '.gac_za',
      'position:absolute;bottom:0;right:0;text-align:right;font-size:12px;padding-right:5px',
    );
    a(
      '.gac_bt',
      'width:' +
        (w.offsetWidth - 2) +
        'px;text-align:center;padding:8px 0 7px;position:relative',
    );
    a('.gac_sb', 'font-size:15px;height:28px;margin:0.2em');
    a('.gac_z', 'white-space:nowrap;color:#c00');
    a('.gac_s', 'height:3px;font-size:1px');
    d = m ? 7 : 3;
    d =
      'white-space:nowrap;overflow:hidden;text-align:left;padding-left:' +
      d +
      'px;padding-right:3px';
    a('.gac_c', d);
    a('.gac_e', 'text-align:right;padding:0 3px 0 5px;white-space:nowrap');
    a('.gac_d', 'font-size:13px');
    a('.gac_h', 'color:green');
    a('.gac_j', 'display:block');
    a('.gac_l', 'line-height:18px');
    a('.gac_x', 'display:block;line-height:16px');
    a('.gac_i', 'color:#666');
    a('.gac_w img', 'width:40px;height:40px');
    a('.gac_w', 'width:1px');
    a('.gac_r', 'color:red');
    a('.gac_v', 'padding-bottom:5px');
    d = document.createElement('style');
    d.setAttribute('type', 'text/css');
    ta.appendChild(d);
    b = b.join('');
    d.appendChild(document.createTextNode(b));
  }
  function W() {
    if (B && w.parentNode) {
      var a = gb(w);
      D.left = a.C + 'px';
      a = a.F + w.offsetHeight - 1;
      m && T == 1 && a++;
      D.top = a + 'px';
      a = google.style.getWidth(w);
      if (S.fullWidth)
        if ((a = document.getElementById('sftab'))) a = a.offsetWidth - 3;
        else {
          if (!x) for (x = w; (x = x.parentNode) && x.nodeName != 'TABLE'; );
          a = x.offsetWidth - 3;
        }
      if (a >= 0) {
        if (m) D.minWidth = a + 'px';
        else D.width = a + 'px';
        if (s) {
          var b = X(0);
          if (b) b.firstChild.style.width = a + 'px';
        }
      }
    }
  }
  function gb(a) {
    for (var b = 0, d = 0; a; ) {
      b += a.offsetTop;
      d += a.offsetLeft;
      a = a.offsetParent;
    }
    return { F: b, C: d };
  }
  function V(a, b) {
    var d = document.createElement('input');
    d.type = 'hidden';
    d.name = a;
    d.value = b;
    return v.appendChild(d);
  }
  function Za(a) {
    var b = a.keyCode;
    if (!fb(a, b)) return j;
    if (b == 27 && hb()) return ib(a, f);
    if (b == 13) return ib(a);
    if (Y(b, a)) {
      I++;
      I % 3 == 1 && db(b, a);
      return j;
    }
    S.useKeyDown &&
      window.setTimeout(function () {
        db(b, a);
      }, 0);
  }
  function jb() {
    return !!t && !!sa;
  }
  function ib(a, b) {
    if (!b || S.executeQueryOnEsc) lb(j);
    b && U();
    a.cancelBubble = f;
    return (a.returnValue = j);
  }
  function lb(a) {
    if (!a && G) {
      v.removeChild(G);
      G = i;
    }
    if (t && u != -1 && sa && !(a && t.B)) t.onclick(i);
    else if (w.value == '') U();
    else {
      if (a) {
        G = V('btnI', '1');
        if (t) w.value = t.e;
      }
      mb();
    }
  }
  function mb() {
    Xa();
    (v.onsubmit && v.onsubmit() == j) || v.submit();
  }
  function $a(a) {
    var b = a.keyCode;
    !S.useKeyDown && !I && db(b, a);
    I = 0;
  }
  function db(a, b) {
    if (w.value != n) {
      if (S.useKeyDown) p = o;
      o = w.value;
      L = cb();
      F.value = o;
    }
    if (Y(a, b)) {
      nb(a == 40);
      sa = hb();
    }
    W();
    if (r != o && !J && S.allowHideSuggestions) J = window.setTimeout(U, 500);
    n = w.value;
  }
  function Y(a, b) {
    if (a == 38 || a == 40)
      return !b || !(b.ctrlKey || b.altKey || b.shiftKey || b.metaKey);
    return j;
  }
  function ob() {
    if (t) {
      t.className = 'gac_a';
      t = i;
      u = -1;
    }
  }
  function pb() {
    sa = j;
    if (!K) {
      if (t) t.className = 'gac_a';
      t = this;
      for (var a = 0, b; (b = X(a)); a++) b == t && (u = a);
      t.className = 'gac_b';
    }
  }
  function qb(a, b) {
    return function (d) {
      rb(sb(a), b);
      tb(d);
      return j;
    };
  }
  function sb(a) {
    return [
      a,
      '&aq=',
      t.m,
      '&oq=',
      F.value,
      Z('aqi', na),
      Z('aql', oa),
      Z('gs_rfai', pa),
    ].join('');
  }
  function Z(a, b) {
    if (b && b.value.length && a.length) return ['&', a, '=', b.value].join('');
    return '';
  }
  function rb(a, b) {
    var d = window.frames.wgjf;
    if (d && !b) {
      google.r = 1;
      d.location.replace(a);
    } else window.location = a;
  }
  function ub() {
    if (google.msg.send(23, [this.e, o])) {
      vb(this.e);
      mb();
    }
  }
  function nb(a) {
    if (!(o != r || !s || !s.length))
      if (hb()) {
        if (t) t.className = 'gac_a';
        for (
          var b = t,
            d = u,
            c = s.length,
            e = ((u + 1 + (a ? 1 : c)) % (c + 1)) - 1;
          e != -1 && X(e).v;

        )
          e = ((e + 1 + (a ? 1 : c)) % (c + 1)) - 1;
        u = e;
        if (u == -1) {
          wb();
          google.msg.send(12, [d, b, (b && b.e) || '', u, i, o]);
        } else {
          t = X(e);
          t.className = 'gac_b';
          vb(t.e);
          E.value = t.m;
          google.msg.send(12, [d, b, (b && b.e) || '', u, t, t.e]);
        }
      } else xb();
  }
  function wb() {
    w.focus();
    vb(o);
    t = i;
    E.value = 'f';
  }
  function U() {
    if (google.msg.send(11)) {
      if (J) {
        window.clearTimeout(J);
        J = i;
      }
      D && (D.visibility = 'hidden');
    }
  }
  function xb() {
    if (google.msg.send(22)) {
      D && (D.visibility = 'visible');
      W();
      K = 1;
    }
  }
  function hb() {
    return !!D && D.visibility == 'visible';
  }
  function Ja() {
    if (A) {
      A.innerHTML = '';
    }
  }
  function yb(a, b, d) {
    a.onclick = b ? qb(b, d) : ub;
    a.B = !b;
    a.onmousedown = zb;
    a.onmouseout = ob;
    a.onmouseover = pb;
    a.onmousemove = function () {
      if (K) {
        K = 0;
        pb.call(this);
      }
    };
  }
  function Ab(a, b) {
    tb(a);
    for (var d = 0, c; (c = X(d++)); )
      if (c.m == b) {
        Bb(va, 'delq', c.e);
        break;
      }
    return j;
  }
  function Qa(a) {
    for (var b = 0, d; (d = X(b++)); )
      if (Ca(d.m) == 'p' && d.e == a[0]) {
        d.v = 1;
        d.onclick = d.onmouseover = i;
        if (d == t) {
          d.className = 'gac_a';
          u = -1;
          wb();
        }
        d.w.className = 'gac_c gac_i fl';
        d.w.innerHTML =
          'This search was removed from your \x3ca href\x3d\x22/history\x22\x3eWeb History\x3c/a\x3e';
      }
  }
  function Cb(a) {
    return a.toLowerCase().replace(/\s+/g, ' ').replace(/^ /, '');
  }
  function Db(a) {
    var b = Cb(o);
    if (b.indexOf(Cb(a)) == 0) {
      if (b.indexOf(Cb(r)) == 0) return a.length >= r.length;
      return f;
    }
    return j;
  }
  function Pa(a, b) {
    function d(Pb, kb) {
      var $ = kb ? Ca(kb[2]) : i;
      $ = Pb + ($ ? '-' + $ : '');
      if ($ != aa) {
        if (ua) M += aa + ua;
        ua = 0;
        aa = $;
      }
      ua++;
    }
    var c = a[0];
    H > 0 && H--;
    if (A) {
      var e = a[1],
        g = o.toLowerCase(),
        h = e[0],
        k = a[0],
        q = f;
      if ((c.toLowerCase() != g && (!h || !g || !Eb(g, h))) || !Db(k)) q = j;
      if (google.msg.send(9, [o, q ? e : i, A, b, !!a[6], q]) && q) {
        if (J) {
          window.clearTimeout(J);
          J = i;
        }
        r = k;
        ob();
        Ja();
        var M = '',
          aa,
          ua = 0;
        c = e.length - 1;
        g = S.maxShownSuggestions;
        if (g != -1) c = Math.min(c, g - 1);
        g = 0;
        for (var N, O, C; g <= c; ++g)
          if ((C = e[g]))
            if ((k = qa[C[1]])) {
              k.z && k.z(g, c) && Fb();
              N = C[2];
              h = C[3];
              O = k.k ? k.k(C, h) : i;
              q = A.insertRow(-1);
              yb(q, O, k.A);
              q.m = N;
              q.className = 'gac_a';
              O = q.w = document.createElement('td');
              O.className = 'gac_c';
              k.g(O, N, C, h);
              N = k.t;
              q.e = N ? N(C, h, r) : C[0];
              q.appendChild(O);
              d(k.b, C);
              g < c && k.D && Fb();
            }
        oa.value = a[3] || '';
        pa.value = a[4] || '';
        if ((s = A.rows) && s.length > 0) {
          if (T == 0) Hb();
          else if (T == 1 && ia) {
            e = Fb();
            c = e.style;
            c.textAlign = 'right';
            c.fontSize = '12px';
            c.paddingRight = '5px';
            e.innerHTML = Ib();
          }
          xb();
        } else U();
        d('');
        na.value = M;
        u = -1;
      }
    }
  }
  function Eb(a, b) {
    var d = b[0];
    if (!d || a.length > 2 * d.length) return j;
    a = a.replace(/[^\s0-9a-z+_\-.]/g, '');
    return (a = Cb(a)) ? Jb(d).indexOf(a) == 0 : j;
  }
  function X(a) {
    b = s.item(a);
    return b;
  }
  function Kb(a) {
    var b = a ? 'I\x26#39;m Feeling Lucky' : 'Google Search',
      d = 'gac_sb',
      c = '',
      e = '';
    if (m) {
      d = 'lsb';
      c = '<span class=ds><span class=lsbb>';
      e = '</span></span>';
    }
    return [
      c,
      '<input type=button value="',
      b,
      '" class=',
      d,
      ' onclick="google.ac.rd(',
      a,
      ')">',
      e,
    ].join('');
  }
  function Hb() {
    if (S.showSearchButton) {
      var a = A.insertRow(-1);
      a.v = 1;
      a.onmousedown = zb;
      var b = '';
      if (ia) b = '<div class=gac_za>' + Ib() + '</div>';
      a = a.insertCell(0);
      a.innerHTML = [
        '<div style="position:relative"><div class=gac_bt>',
        Kb(j),
        Kb(f),
        '</div>',
        b,
        '</div>',
      ].join('');
    }
  }
  function Ib() {
    return '<a href="http://www.google.com/support/websearch/bin/answer.py?hl=fr&answer=106230">En savoir plus</a>';
  }
  function Jb(a) {
    return a.replace(/<\/?[b|em]>/gi, '');
  }
  function Lb(a, b) {
    return [
      'href="',
      a,
      '" onmousedown="google.ac.r(event, this, \'',
      b,
      '\')" onclick="return google.ac.c(event)"',
    ].join('');
  }
  function Mb(a, b, d) {
    ca = j;
    if (a.which) ca = a.which == 2;
    else if (a.button) ca = a.button == 4;
    b.href = sb(d);
  }
  function Nb(a) {
    if (ca) {
      tb(a);
      return f;
    }
    return j;
  }
  function tb(a) {
    if (a) {
      a.stopPropagation();
      a.cancelBubble = a.cancel = a.returnValue = f;
    }
  }
  function Fb() {
    var a = A.insertRow(-1);
    a.v = 1;
    a.onmousedown = zb;
    a = a.insertCell(0);
    a.className = 'gac_s';
    return a;
  }
  function Xa() {
    var a = o;
    if (s) {
      var b = X(u);
      if (b) a = b.e;
    }
    b = !!G;
    if (google.msg.send(15, [a, b])) {
      U();
      if (s && X(u) && F.value != w.value) E.value = X(u).m;
      else {
        F.value = '';
        E.value = 'f';
        if (H >= 10 || xa >= 3) E.value = 'o';
      }
      Qb(f);
    }
  }
  function Rb() {
    if (!(xa >= 3)) {
      if (p != o)
        if (google.msg.send(10, [o]) && o) {
          Bb(ra, 'q', o) && H++;
          w.focus();
        }
      p = o;
    }
  }
  function Qb(a) {
    n = o = w.value;
    if (a) p = o;
    return Sb(ra, 'q', o);
  }
  function eb() {
    Rb();
    for (var a = 100, b = 1; b <= (H - 2) / 2; ++b) a *= 2;
    a += 50;
    la = window.setTimeout(eb, a);
  }
  function Sb(a, b, d) {
    return [
      a,
      R._t() != 4 ? '&xhr=t' : '',
      '&',
      b,
      '=',
      encodeURIComponent(d),
      '&cp=' + L,
    ].join('');
  }
  function Bb(a, b, d) {
    a = Sb(a, b, d);
    a = google.msg.send(16, [a], a);
    if (!a) return j;
    if (R._t() == 4) a = ka + 'clients1.google.com' + a;
    R._s(a);
    return f;
  }
  function vb(a) {
    if (w) w.value = n = a;
  }
  function Gb(a, b) {
    a.appendChild(document.createTextNode(b));
  }
  function zb(a) {
    a.stopPropagation();
    return j;
  }
  function cb() {
    if (document.selection) {
      var a = document.selection.createRange();
      return Math.abs(a.moveStart('character', -w.value.length));
    }
    try {
      a = w.selectionStart;
      return typeof a == 'undefined' ? 0 : a;
    } catch (b) {
      return 0;
    }
  }
  function Ua() {
    da = f;
    ea = j;
    fa = f;
    ga = j;
    ha = f;
    m = ia = ja = j;
  }
  function Va(a) {
    if ('a' in a) da = a.a;
    if ('f' in a) ia = a.f;
    if ('l' in a) ea = a.l;
    if ('n' in a) fa = a.n;
    if ('o' in a) ga = a.o;
    if (!S.allowPSuggest || T == 2) ha = j;
    else if ('p' in a) ha = a.p;
    if ('s' in a) ja = a.s;
    if ('sw' in a) m = a.sw;
  }
  function Wa() {
    var a = [Tb];
    da && a.push(Ub);
    ea && a.push(Vb);
    fa && a.push(Wb);
    ga && a.push(Xb, Yb, Zb, $b, ac, bc, cc, dc, ec, fc);
    gc(a);
  }
  function gc(a) {
    for (var b = 0, d; (d = a[b++]); ) qa[d.j] = d;
  }
  var Ub = {
      j: 8,
      b: 'a',
      D: f,
      t: function (a, b, d) {
        return d;
      },
      k: function (a, b) {
        return b[1] + bb();
      },
      z: function (a, b) {
        return a == b;
      },
      g: function (a, b, d, c) {
        b = c[0];
        var e = c[1] + bb();
        d = c[2];
        var g = c[3];
        c = c[4];
        a.className = 'gac_f gac_p';
        var h = Jb(b);
        e = Lb('http://' + h, e);
        a.innerHTML = [
          '<table cellpadding=0 cellspacing=0 border=0 class=gac_t><tr><td><table cellpadding=0 cellspacing=0 border=0 class=gac_t><tr><td style="line-height:117%;vertical-align:bottom"><a class=q ',
          e,
          '>',
          d,
          '</a><td class="gac_e gac_d gac_i">Sponsored Link</table><tr><td class="gac_d gac_u gac_x" style="line-height:16px;padding-bottom:8px"><span class=gac_h',
          '>',
          b,
          '</span>&nbsp; &nbsp;',
          g,
          c ? ' ' + c : '',
          '</table>',
        ].join('');
      },
    },
    bc = {
      j: 11,
      b: 'b',
      A: f,
      k: function (a, b) {
        return b[0];
      },
      g: function (a, b, d, c) {
        b = c[0];
        d = c[1];
        var e = c[2],
          g = c[3],
          h = c[4],
          k = c[5],
          q = c[6];
        c = c[7];
        var M = b.match(/^([^&]*)/)[1];
        a.innerHTML = [
          '<span class="gac_j gac_l"><a class=q ',
          Lb(M, b),
          '><b>',
          d,
          '</b> - ',
          e,
          ' (',
          g,
          ')</a><br><b>',
          h,
          '</b> <span class=gac_d><span class=gac_',
          k >= 0 ? 'h' : 'r',
          '>',
          k,
          ' (',
          q,
          '%)</span> ',
          c,
          ' - </span><a href=/help/stock_disclaimer.html class="gac_d fl" onclick="google.ac.p(event);return true">Disclaimer</a></span>',
        ].join('');
      },
    },
    cc = {
      j: 12,
      b: 'c',
      k: function (a, b) {
        return b[0];
      },
      g: function (a, b, d, c) {
        b = c[0];
        d = c[1];
        c = c[2];
        for (var e = '', g = c.length - 1, h = 0, k; h < g; h++) {
          k = c[h];
          e += [k[0], '<div class="gac_v">', k[1], '</div>'].join('');
        }
        k = c[g];
        e += [k[0], '<br>', k[1]].join('');
        hc(1, a, d, b, 'www.flightstats.com', e);
      },
    },
    dc = {
      j: 15,
      b: 'd',
      g: function (a, b, d, c) {
        b = c[0];
        d = c[1];
        var e = c[2];
        c = c[3];
        a.innerHTML = [
          '<b>',
          b,
          '</b> ',
          e,
          ' (',
          d,
          ') in <b>',
          c,
          '</b>',
        ].join('');
      },
    },
    ec = {
      j: 13,
      b: 'e',
      k: function (a, b) {
        return b[0];
      },
      g: function (a, b, d, c) {
        b = c[0];
        d = c[1];
        c = c[2];
        hc(1, a, d, b, c);
      },
    },
    Yb = {
      j: 14,
      b: 'f',
      k: function (a, b) {
        return b[0];
      },
      g: function (a, b, d, c) {
        b = c[0];
        d = c[1];
        var e = c[2];
        c = c[3];
        hc(1, a, d, b, c, e);
      },
    },
    Tb = {
      j: 0,
      b: 'g',
      t: function (a) {
        return a.e;
      },
      g: function (a, b, d) {
        var c = d[0];
        a.innerHTML = c;
        d.e = ic(a);
        d = ha && Ca(b) == 'p';
        c = [
          '<table cellpadding=0 cellspacing=0 border=0 class=gac_t>',
          '<tr>',
          '<td class=gac_c style="width:100%">',
          c,
        ];
        !S.showSearchButton &&
          !/[?&#]tbs=\S/.test(window.location.href) &&
          c.push(
            '<td class="gac_d gac_e gac_k"><a href=#ifl class=fl onclick="google.ac.rd(true);return false">I\x26#39;m Feeling Lucky &raquo;</a>',
          );
        d &&
          c.push(
            '<td class="gac_d gac_e">',
            '<a href=#ps class=fl onclick="return google.ac.dc(event,\'',
            b,
            '\')">',
            'Remove',
            '</a>',
          );
        c.push('</table>');
        a.className = '';
        a.innerHTML = c.join('');
      },
    },
    Zb = {
      j: 19,
      b: 'h',
      g: function (a, b, d, c) {
        b = c[0];
        c = c[1];
        a.innerHTML = ['<b>', b, ' = ', c, '</b>'].join('');
      },
    },
    Xb = {
      j: 17,
      b: 'i',
      k: function (a, b) {
        return b[3];
      },
      g: function (a, b, d, c) {
        b = c[0];
        d = c[1];
        var e = c[2];
        c = c[3];
        var g = c.match(/url=([^&]*)/)[1];
        a.innerHTML = [
          '<span class="gac_j gac_l"><a ',
          Lb(g, c),
          '>',
          b,
          ' &#151; ',
          d,
          ': ',
          e,
          '</a><span class=gac_d style="line-height:16px"><br>According to <span class=gac_h>',
          g,
          '</span></span></span>',
        ].join('');
      },
    },
    fc = {
      j: 10,
      b: 'j',
      g: function (a, b, d, c) {
        b = c[0];
        d = c[1];
        var e = c[4];
        c = c[5];
        var g = function (h) {
          var k = h[0],
            q = h[1],
            M = h[2],
            aa = h[3];
          h = h[4];
          return [
            '<td class=gac_w><img src="',
            k,
            '" alt="',
            q,
            '" title="',
            q,
            '"><td class="gac_c" style="line-height:112%;vertical-align:top">',
            h,
            '<br>',
            M,
            '&deg; | ',
            aa,
            '&deg;',
          ].join('');
        };
        a.innerHTML = [
          '<b>Weather:</b> ',
          e,
          '&deg;',
          d,
          ' in ',
          b,
          '<br><table class=gac_t><tr>',
          g(c[0]),
          g(c[1]),
          g(c[2]),
          g(c[3]),
          '</table>',
        ].join('');
      },
    },
    $b = {
      j: 20,
      b: 'k',
      g: function (a, b, d, c) {
        b = c[0];
        c = c[1];
        a.innerHTML = [
          '<b>',
          b,
          ' = ',
          c,
          '</b> - <a href=/intl/en/help/currency_disclaimer.html class="gac_d fl" onclick="google.ac.p(event);return true">Disclaimer</a>',
        ].join('');
      },
    },
    ac = {
      j: 16,
      b: 'l',
      t: function (a, b) {
        return 'define: ' + b[0];
      },
      g: function (a, b, d, c) {
        b = c[0];
        d = c[1];
        c = c[2];
        hc(
          1,
          a,
          'Web definitions for <b>' + b + '</b>',
          '/search?q=define:' + b.replace(' ', '+'),
          'www.google.com',
          [d, ' - <span class=gac_i>', c, '</span>'].join(''),
        );
      },
    },
    Vb = {
      j: 30,
      b: 'm',
      t: function (a) {
        return a.e;
      },
      g: function (a, b, d) {
        b = d[0];
        var c = document.createElement('div');
        c.innerHTML = b;
        d.e = ic(c);
        a.innerHTML = ['<span class=gac_z>Did you mean: </span>', b].join('');
      },
    };
  function ic(a) {
    var b;
    b = a.textContent;
    return b;
  }
  var Wb = {
    j: 5,
    b: 'n',
    t: function (a, b, d) {
      return d;
    },
    k: function (a, b) {
      return b[0];
    },
    g: function (a, b, d, c) {
      b = c[0];
      c = c[1];
      a.className = 'gac_c gac_n';
      a.style.lineHeight = '117%';
      var e = d[0];
      d = e.replace(/HTTPS?:\/\//gi, '');
      e = Jb(e);
      /^HTTPS?:\/\//i.test(e) ||
        (e = (b.indexOf('/url?url=https:') > 0 ? 'https' : 'http') + '://' + e);
      b = Lb(e, b);
      a.innerHTML = [
        '<span class=gac_x><a ',
        b,
        '>',
        c,
        '</a><br><span class="gac_d gac_h"',
        '>',
        d,
        '</span></span>',
      ].join('');
    },
  };
  function hc(a, b, d, c, e, g, h) {
    var k = c.indexOf('/url') ? c : c.match(/url=([^&]*)/)[1];
    b.style.lineHeight = '112%';
    b.innerHTML = [
      '<a class=q ',
      Lb(k, c),
      '>',
      d,
      '</a><span class="gac_d' + (a ? ' gac_x' : '') + '">',
      g ? g + '<br>' : '',
      h ? h + '<br>' : '',
      e ? '<span class=gac_h>' + e + '</span></span>' : '',
    ].join('');
  }
  function bb() {
    if (google.kEXPI) return '&expIds=' + google.kEXPI;
    return '';
  }
  l.c = Nb;
  l.cp = cb;
  l.ct = Ja;
  l.d = Qa;
  l.dc = Ab;
  l.h = Pa;
  l.hs = U;
  l.i = Ta;
  l.p = tb;
  l.ps = W;
  l.r = Mb;
  l.rd = lb;
  l.sa = jb;
  l.sr = Rb;
  l.st = Oa;
  l.sv = za;
  l.ui = Qb;
  l.uhi = Sa;
  l.u = vb;
  function Na() {
    var a = [{}, {}, {}];
    a[0][5] = 4;
    a[1][5] = 2;
    a[2][5] = 1;
    a = window.google.gtr(a, { noWrapper: f });
    a._o();
    Oa(a);
  }
  Na();
  google.bind(window, 'resize', W);
  google.dstr && google.dstr.push && google.dstr.push(Ia);
})();
(function () {
  window.ManyBox = {};
  var d,
    g,
    h = 1,
    k = google.History.client(i),
    m = [];
  ManyBox.delayedRegister = function (a) {
    m.push(a);
  };
  function n(a) {
    for (var b in d) if (d[b].b && a(d[b])) return;
  }
  function o(a, b, c, e, f) {
    this.b = a;
    this.k = b;
    this.C = e;
    this.p = f;
    this.r =
      '/mbd?' +
      (b ? 'docid=' + b : '') +
      '&resnum=' +
      a.replace(/[^0-9]/, '') +
      '&mbtype=' +
      e +
      '&usg=' +
      c +
      '&hl=' +
      (google.kHL || '');
    this.e = {};
    this.n = '';
    g[a] = { s: 0, F: this.e, k: this.k, j: 0 };
    this.o = 0;
  }
  o.prototype.append = function (a) {
    this.n += '&' + a.join('&');
  };
  function p(a, b) {
    a.h.style.paddingTop = b + 'px';
    a.h.style.display = a.h.innerHTML ? '' : 'none';
    if (b > a.o) a.o = b;
    a.i.style.fontSize = b + 'px';
    a.i.style.fontSize = null;
  }
  function r(a) {
    if (!a.B) {
      a.B = 1;
      a.d = document.getElementById('mbb' + a.b);
      if (a.d) {
        a.l = 0;
        a.a = document.getElementById('mbl' + a.b);
        if (a.a) {
          a.i = a.a.getElementsByTagName('DIV')[0];
          a.q = a.a.getElementsByTagName('A')[0];
          a.A = a.q.innerHTML;
          a.p = a.p || a.A;
          a.i.title = 'Click for more information';
          a.a.G = function (b, c) {
            var e = google.style.getPageOffsetStart(a.a),
              f = google.style.getPageOffsetTop(a.a);
            return (
              b > e - 5 &&
              b < e + google.style.getWidth(a.a) + 5 &&
              c > f - 5 &&
              c < f + google.style.getHeight(a.a) + 5
            );
          };
          a.h = document.getElementById('mbf' + a.b);
          p(a, 0);
          a.a.onmousedown = s(a);
          a.a.onclick = t(a);
          a.a.go = function () {
            a.a.onmousedown();
            a.a.onclick();
          };
        } else delete d[a.b];
      } else delete d[a.b];
    }
  }
  function u(a) {
    google.log(
      'manybox',
      [
        a.l ? 'close' : 'open',
        '&id=',
        a.b,
        '&docid=',
        a.k,
        '&mbtype=',
        a.C,
        a.n,
      ].join(''),
    );
  }
  function s(a) {
    return function () {
      if (g[a.b].j) a.J++ < 3 && u(a);
      else {
        if (a.e.m) u(a);
        else {
          var b = google.xhr();
          if (b) {
            b.open('GET', a.r + a.n + '&zx=' + google.time());
            a.u = 0;
            b.onreadystatechange = function () {
              if (b.readyState == 4) {
                var c = 0;
                if (b.status == 200)
                  try {
                    eval(b.responseText);
                    c = 1;
                  } catch (e) {}
                if (!c && !a.D) {
                  g[a.b].j = 0;
                  a.D = 1;
                  a.r += '&cad=retry';
                  a.a.onmousedown();
                } else {
                  a.v && v(a);
                  a.u = 0;
                }
              }
            };
            a.u = 1;
            b.send(null);
          }
        }
        g[a.b].j = a.J = 1;
      }
    };
  }
  function t(a) {
    return function () {
      g[a.b].j || a.a.onmousedown();
      (a.v = a.u) || v(a);
    };
  }
  function w(a) {
    if (!a.e.m) {
      a.e.m =
        '\x3cfont color\x3dred\x3eError:\x3c/font\x3e The server could not complete your request.  Try again in 30 seconds.';
      a.H = a.a.onclick;
      a.a.onclick = function () {
        h = 0;
        v(a);
        h = 1;
        a.c.parentNode.removeChild(a.c);
        g[a.b].j = a.e.m = a.w = 0;
        a.a.onclick = a.H;
      };
    }
    if (!a.w) {
      a.w = 1;
      var b = document.getElementById('res');
      a.I =
        b &&
        google.style.getPageOffsetStart(a.d) >
          google.style.getPageOffsetStart(b) + google.style.getWidth(b);
      a.c = document.createElement('div');
      p(a, 0);
      a.c.style.position = 'absolute';
      a.c.style.paddingTop = a.c.style.paddingBottom = '6px';
      a.c.style.display = 'none';
      a.c.className = 'med';
      b = document.createElement('div');
      a.c.appendChild(b);
      b.className = 'std';
      b.innerHTML = a.e.m;
      a.h.parentNode.insertBefore(a.c, a.h);
    }
  }
  function i(a) {
    h = 0;
    ManyBox.init();
    n(function (b) {
      if (b.k == a[b.b].k) {
        b.e = a[b.b].F;
        a[b.b].s != b.l && v(b);
      } else a[b.b].j = 0;
    });
    g = a;
    h = 1;
    google.History.save(k, g);
  }
  ManyBox.create = function (a, b, c, e, f) {
    return new o(a, b, c, e, f);
  };
  ManyBox.register = function (a, b, c, e, f) {
    return (d[a] = ManyBox.create(a, b, c, e, f));
  };
  google.listen(document, 'click', function (a) {
    a = a || window.event;
    for (var b = a.target || a.srcElement; b.parentNode; ) {
      if (b.tagName == 'A' || b.onclick) return;
      b = b.parentNode;
    }
    n(function (c) {
      if (c.a.G(a.clientX, a.clientY)) {
        c.a.go();
        return 1;
      }
    });
  });
  function x() {
    d = {};
    g = {};
    m = [];
    history.navigationMode = history.navigationMode && 'fast';
  }
  x();
  ManyBox.init = function () {
    for (var a = 0; a < m.length; a++)
      try {
        m[a].func();
      } catch (b) {
        delete d[m[a].id];
      }
    m = [];
    n(r);
  };
  function y(a, b) {
    a.c.style.clip =
      'rect(0px,' + (a.d.width || '34em') + ',' + (b || 1) + 'px,0px)';
  }
  o.prototype.insert = function (a) {
    this.e.m = a;
  };
  function z(a) {
    a.g = document.getElementById('mbcb' + a.b);
    var b = a.g && a.g.getAttribute('mbopen');
    if (b) {
      eval(b);
      a.onopen(a.g);
    }
  }
  function A(a) {
    a.c.style.display = 'none';
    a.i.style.backgroundPosition = '-153px -70px';
    a.q.innerHTML = a.A;
    a.l = g[a.b].s = 0;
    google.History.save(k, g);
  }
  function B(a, b, c, e, f) {
    var l = c > 0 ? 150 : 75,
      j = google.time() - f;
    l = j < l && h ? (j / l) * c : e > 1 ? c - 10 : c;
    j = Math.max(a.t, b + l);
    var q = j - a.t;
    y(a, q);
    a.d.style.height = j < 0 ? 0 : q ? j + 'px' : '';
    p(a, Math.max(0, q - 5));
    google.rhs();
    Math.abs(l) < Math.abs(c)
      ? window.setTimeout(function () {
          B(a, b, c, e - 1, f);
        }, 30)
      : window.setTimeout(function () {
          c < 0 ? A(a) : z(a);
          if (!google.browser.engine.IE && a.I) a.c.style.width = '100px';
          a.c.style.position = a.d.style.height = '';
          p(a, 0);
          google.rhs();
          a.d.z = 0;
        }, 0);
  }
  function v(a) {
    a.v = 0;
    if (!a.d.z) {
      a.d.z = 1;
      var b;
      if (a.l) {
        if ((b = a.g && a.g.getAttribute('mbclose'))) {
          eval(b);
          a.onclose(a.g);
        }
        b = a.t - google.style.getHeight(a.d);
        a.h.style.display = 'none';
        p(a, a.o);
        a.c.style.position = 'absolute';
      } else {
        a.t = google.style.getHeight(a.d);
        w(a);
        p(a, 0);
        a.o = 0;
        n(function (c) {
          c.i.title = '';
        });
        a.i.style.backgroundPosition = '-153px -84px';
        a.q.innerHTML = a.p;
        y(a, 1);
        a.c.style.position = 'absolute';
        a.c.style.display = '';
        a.l = g[a.b].s = 1;
        google.History.save(k, g);
        b = a.c.offsetHeight;
      }
      B(
        a,
        google.style.getHeight(a.d),
        b,
        google.browser.product.SAFARI ? 2 : 1,
        google.time(),
      );
    }
  }
  google.dstr && google.dstr.push(x);
})();
(function () {
  var j, k;
  function o() {
    j = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(j);
    k = j.sheet;
  }
  google.addCSSRule = function (a, b) {
    j || o();
    c = a + '{' + b + '}';
    k.insertRule(c, k.cssRules.length);
  };
  google.acrs = function (a) {
    a = a.split(/{|}/);
    for (var b = 1; b < a.length; b += 2) google.addCSSRule(a[b - 1], a[b]);
  };
  google.Toolbelt.ascrs = function () {};
  var p, q;
  function r() {
    google.nav(document.getElementById('tbpi').href);
  }
  function t(a) {
    google.srp.updateLinksWithParam(
      'tbo',
      a ? '1' : '',
      google.srp.isSerpLink,
      google.srp.isSerpForm,
    );
  }
  function u() {
    mbtb1.insert = function (b) {
      try {
        v(eval(b));
      } catch (c) {
        r();
      }
    };
    var a = google.xhr();
    if (a) {
      a.open(
        'GET',
        [
          google.base_href.indexOf('/images?') == 0
            ? google.base_href.replace(/^\/images\?/, '/mbd?')
            : google.base_href.replace(/^\/search\?/, '/mbd?'),
          '&mbtype=29&resnum=1&tbo=1',
          mbtb1.tbs ? '&tbs=' + mbtb1.tbs : '',
          '&docid=',
          mbtb1.docid,
          '&usg=',
          mbtb1.usg,
          '&zx=',
          google.time(),
        ].join(''),
        true,
      );
      a.onreadystatechange = function () {
        if (a.readyState == 4)
          if (a.status == 200)
            try {
              eval(a.responseText);
            } catch (b) {
              r();
            }
          else r();
      };
      a.send(null);
    }
  }
  function v(a) {
    for (var b = 0, c = 0, d, e; (d = a[b]) && (e = q[c]); b++, c++)
      if (google.Toolbelt.pti[c]) e.id != d[0] && b--;
      else {
        if (d[2]) {
          e.className = 'tbos';
          google.listen(e, 'click', google.Toolbelt.tbosClk);
        } else e.className = 'tbou';
        e.id = d[0];
        e.innerHTML = d[1];
      }
  }
  function x(a) {
    for (var b = 0, c; (c = google.Toolbelt.pbt[b++]); )
      if (c[0] == a) return true;
    return false;
  }
  google.Toolbelt.initializeToolElements = function () {
    p = [];
    q = [];
    var a = document.getElementById('tbd');
    if (a) {
      for (var b = a.getElementsByTagName('ul'), c = 0, d; (d = b[c++]); ) {
        p.push(d);
        d = d.getElementsByTagName('li');
        for (var e = 0, f; (f = d[e++]); ) q.push(f);
      }
    }
  };
  function y() {
    var a = document.getElementById('tbd');
    if (!a.getAttribute('data-loaded')) {
      a.setAttribute('data-loaded', 1);
      var b = [],
        c = 0;
      var d = '<li style="opacity:0">';
      for (var e = 0, f = google.Toolbelt.atg.length; e < f; ++e) {
        var h = google.Toolbelt.atg[e],
          g = google.style.hasClass(p[e], 'tbpd');
        b.push('<li><ul class="tbt' + (g ? ' tbpd' : '') + '">');
        for (var n; (n = google.Toolbelt.pbt[c]) && n[0] == e; c++) {
          for (g = 0; g++ < n[1]; ) b.push(d);
          b.push(
            '<li class="' +
              q[c].className +
              '" id=' +
              q[c].id +
              '>' +
              q[c].innerHTML,
          );
        }
        for (g = 0; g++ < h; ) b.push(d);
        b.push('</ul>');
      }
      a.innerHTML = b.join('');
      google.Toolbelt.initializeToolElements();
      u();
    }
  }
  function z(a) {
    for (
      var b = [], c = [], d = a ? 0 : 1, e = a ? 1 : 0, f = null, h = 0, g;
      (g = p[h]);
      h++
    ) {
      google.style.hasClass(g, 'tbpd') ||
        b.push([g, 'marginBottom', d * 8, e * 8]);
      if (x(h)) f = g;
    }
    google.style.hasClass(f, 'tbpd') &&
      b.push([f, 'marginBottom', d * 8, e * 8]);
    for (h = 0; (f = q[h]); h++)
      if (!google.Toolbelt.pti[h]) {
        b.push([f, 'height', d * 1.2, e * 1.2, 0, 'em']);
        b.push([f, 'paddingBottom', d * 3, e * 3]);
        c.push([f, 'opacity', d, e, 0, '']);
        f.style.overflow = 'hidden';
      }
    d = a ? b : c;
    var C = a ? c : b;
    google.fx.animate(300, d, function () {
      document.body.className =
        document.body.className.replace(/\btbo\b/, '') + (a ? ' tbo' : '');
      google.fx.animate(200, C, function () {
        var s = a ? '' : 'none';
        for (m = 0; (i = q[m]); m++) {
          if (a) {
            i.style.height = '';
            i.style.overflow = 'visible';
            i.style.opacity = '';
          }
        }
      });
    });
  }
  google.Toolbelt.togglePromotedTools = function () {
    var a = !google.style.hasClass(document.body, 'tbo');
    a && y();
    t(a);
    z(a);
    google.log('toolbelt', (a ? '0' : '1') + '&ei=' + google.kEI);
    return false;
  };
  google.rein.push(google.Toolbelt.initializeToolElements);
  function A(a) {
    for (; a && !google.hasClass(a, 'tbt'); ) a = a.parentNode;
    return a;
  }
  google.Toolbelt.ctlClk = function (a, b, c) {
    a = a || 'cdr_opt';
    if (a == 'cdr_opt') {
      c && c.stopPropagation();
    }
    google.Toolbelt.maybeLoadCal && google.Toolbelt.maybeLoadCal();
    b = b || 'cdr_min';
    if ((a = document.getElementById(a))) {
      a.className = 'tbots';
      if ((a = A(a))) {
        c = 0;
        for (var d; (d = a.childNodes[c++]); )
          if (d.className == 'tbos') d.className = 'tbotu';
        (b = document.getElementById(b)) && b.focus();
      }
    }
    return false;
  };
  google.Toolbelt.cdrClk = google.Toolbelt.ctlClk;
  function B(a) {
    return a.replace(/_/g, '_1').replace(/,/g, '_2').replace(/:/g, '_3');
  }
  google.Toolbelt.cdrSbt = function () {
    return D('ctbs', { cdr_min: 'cd_min', cdr_max: 'cd_max' });
  };
  google.Toolbelt.clSbt = function () {
    return D('ltbs', { l_in: 'cl_loc' });
  };
  google.Toolbelt.prcSbt = function () {
    D('prcbs', { prc_min: 'pr_min', prc_max: 'pr_max' });
    var a = document.getElementById('prc_frm');
    if (a) {
      var b = document.getElementById('tsf');
      if (b) a.elements.q.value = b.elements.q.value;
    }
  };
  function D(a, b) {
    var c = document.getElementById(a);
    if (c)
      for (var d in b) {
        var e = B(document.getElementById(d).value),
          f = new RegExp('(' + b[d] + ':)([^,]*)');
        c.value = c.value.replace(f, '$1' + e);
      }
    return true;
  }
  google.Toolbelt.tbosClk = function (a) {
    a = a || window.event;
    if ((a = a.target || a.srcElement) && a.className == 'tbotu') {
      a.className = 'tbos';
      if ((a = A(a)))
        for (var b = 0, c; (c = a.childNodes[b++]); )
          if (c.className == 'tbots') c.className = 'tbou';
    }
  };
})();
if (!window.gbar || !gbar.close) {
  window.gbar = {};
  (function () {
    var e = window.gbar,
      i,
      k,
      l;
    function m(a) {
      var b = window.encodeURIComponent && (document.forms[0].q || '').value;
      if (b)
        a.href = a.href.replace(/([?&])q=[^&]*|$/, function (d, c) {
          return (c || '&') + 'q=' + encodeURIComponent(b);
        });
    }
    e.qs = m;
    function n(a, b, d, c, f, g) {
      var h = document.getElementById(a);
      if (h) {
        var j = h.style;
        j.left = c ? 'auto' : b + 'px';
        j.right = c ? b + 'px' : 'auto';
        j.top = d + 'px';
        j.visibility = k ? 'hidden' : 'visible';
        if (f && g) {
          j.width = f + 'px';
          j.height = g + 'px';
        } else {
          n(i, b, d, c, h.offsetWidth, h.offsetHeight);
          k = k ? '' : a;
        }
      }
    }
    e.tg = function (a) {
      a = a || window.event;
      var b,
        d = a.target || a.srcElement;
      a.cancelBubble = true;
      if (i != null) o(d);
      else {
        b = document.createElement(
          Array.every || window.createPopup ? 'iframe' : 'div',
        );
        b.frameBorder = '0';
        i = b.id = 'gbs';
        b.src = '#';
        document.body.appendChild(b);
        document.onclick = e.close;
        o(d);
        e.alld &&
          e.alld(function () {
            var c = document.getElementById('gbli');
            if (c) {
              var f = c.parentNode;
              p(f, c);
              var g = c.prevSibling;
              f.removeChild(c);
              e.removeExtraDelimiters(f, g);
              b.style.height = f.offsetHeight + 'px';
            }
          });
      }
    };
    function q(a) {
      var b,
        d = document.defaultView;
      if (d && d.getComputedStyle) {
        if ((a = d.getComputedStyle(a, ''))) b = a.direction;
      } else b = a.currentStyle ? a.currentStyle.direction : a.style.direction;
      return b == 'rtl';
    }
    function o(a) {
      var b = 0;
      if (a.className != 'gb3') a = a.parentNode;
      var d = a.getAttribute('aria-owns') || 'gbi',
        c = a.offsetWidth,
        f = a.offsetTop > 20 ? 46 : 24;
      if (document.getElementById('tphdr')) f -= 3;
      var g = false;
      do b += a.offsetLeft || 0;
      while ((a = a.offsetParent));
      a =
        (document.documentElement.clientWidth || document.body.clientWidth) -
        b -
        c;
      c = q(document.body);
      if (d == 'gbi') {
        var h = document.getElementById('gbi');
        p(h, document.getElementById('gbli') || h.firstChild);
        if (c) {
          b = a;
          g = true;
        }
      } else if (!c) {
        b = a;
        g = true;
      }
      k != d && e.close();
      n(d, b, f, g);
    }
    e.close = function () {
      k && n(k, 0, 0);
    };
    function r(a, b, d) {
      if (!l) {
        l = 'gb2';
        if (e.alld) {
          var c = e.findClassName(a);
          if (c) l = c;
        }
      }
      a.insertBefore(b, d).className = l;
    }
    function p(a, b) {
      for (var d, c = window.navExtra; c && (d = c.pop()); ) r(a, d, b);
    }
  })();
}
if (!window.google) window.google = {};
window.google.crm = {};
window.google.cri = 0;
window.clk = function (e, f, g, k, l, b, m) {
  if (document.images) {
    var a = encodeURIComponent || escape,
      c = new Image(),
      h = window.google.cri++;
    window.google.crm[h] = c;
    c.onerror =
      c.onload =
      c.onabort =
        function () {
          delete window.google.crm[h];
        };
    var d, i, j;
    if (google.v6) {
      d = google.v6.src;
      i = google.v6.complete || google.v6s ? 2 : 1;
      j = new Date().getTime() - google.v6t;
      delete google.v6;
    }
    if (b && b.substring(0, 6) != '&sig2=') b = '&sig2=' + b;
    c.src = [
      '/url?sa=T',
      '&source=' + google.sn,
      '&cd=',
      a(l),
      google.j && google.j.pf ? '&sqi=2' : '',
      '&ved=',
      a(m),
      e ? '&url=' + a(e.replace(/#.*/, '')).replace(/\+/g, '%2B') : '',
      '&ei=',
      google.kEI,
      d ? '&v6u=' + a(d) + '&v6s=' + i + '&v6t=' + j : '',
      b,
    ].join('');
  }
  return true;
};
window.rwt = function (a, f, g, k, l, h, c, m) {
  try {
    if (a === window)
      for (a = window.event.srcElement; a; ) {
        if (a.href) break;
        a = a.parentNode;
      }
    var b = encodeURIComponent || escape,
      d;
    d = a.getAttribute('href');
    var e, i, j;
    if (google.v6) {
      e = google.v6.src;
      i = google.v6.complete || google.v6s ? 2 : 1;
      j = new Date().getTime() - google.v6t;
      delete google.v6;
    }
    if (c && c.substring(0, 6) != '&sig2=') c = '&sig2=' + c;
    var n = [
      '/url?sa=t',
      '&source=' + google.sn,
      '&cd=',
      b(l),
      google.j && google.j.pf ? '&sqi=2' : '',
      '&ved=',
      b(m),
      '&url=',
      b(d).replace(/\+/g, '%2B'),
      '&ei=',
      google.kEI,
      e ? '&v6u=' + b(e) + '&v6s=' + i + '&v6t=' + j : '',
      h ? '&usg=' + h : '',
      c,
    ].join('');
    a.href = n;
    a.onmousedown = '';
  } catch (o) {}
  return true;
};
(function () {
  var b,
    f = function () {
      document.getElementById('ss-box').style.visibility = 'hidden';
      document.body.removeEventListener
        ? document.body.removeEventListener(
            'click',
            google.safeSearchBar.toggle,
            false,
          )
        : document.body.detachEvent('onclick', google.safeSearchBar.toggle);
      if (b) b.style.visibility = 'hidden';
    },
    g = function () {
      var a = document.getElementById('ss-box'),
        d = document.getElementById('ss-status');
      if (!b) {
        b = document.createElement(
          Array.every || window.createPopup ? 'iframe' : 'div',
        );
        b.frameBorder = '0';
        b.src = '#';
        a.parentNode.appendChild(b).id = 'ss-barframe';
        var c = a.offsetWidth - 2;
        document.getElementById('ss-off').style.width = c + 'px';
        document.getElementById('ss-moderate').style.width = c + 'px';
        document.getElementById('ss-strict').style.width = c + 'px';
      }
      c = 0;
      do c += d.offsetLeft;
      while ((d = d.offsetParent));
      a.style.visibility = 'visible';
      b.style.visibility = 'visible';
      b.style.width = a.offsetWidth + 'px';
      b.style.height = a.offsetHeight + 'px';
      b.style.position = 'absolute';
      b.style.top = a.offsetTop + 'px';
      google.bind(document.body, 'click', google.safeSearchBar.toggle);
    },
    h = function (a, d, c) {
      return [
        a
          .replace(new RegExp('([?&])' + d + '=([^&]*)&?', 'i'), '$1')
          .replace(/&$/i, ''),
        '&',
        d,
        '=',
        c,
      ].join('');
    };
  google.safeSearchBar = {
    toggle: function (a) {
      if (!google.nossbar) {
        a = a || window.event;
        a.cancelBubble = true;
        a.stopPropagation && a.stopPropagation();
        a = document.getElementById('ss-box');
        a.style.visibility == 'visible' ? f() : g();
      }
    },
    updateLinkUrl: function (a) {
      for (
        var d = ['ss-off', 'ss-moderate', 'ss-strict'], c = 0, e;
        (e = d[c++]);

      )
        if ((e = document.getElementById(e)))
          e.href = h(e.href, 'prev', encodeURIComponent(a));
    },
  };
})();
(function () {
  var f = true,
    g = false;
  window.google.rt = {};
  var h = [],
    i,
    j,
    k,
    l,
    m,
    o,
    p,
    q,
    r,
    s,
    t,
    u,
    aa,
    ba,
    ca,
    da,
    v;
  function ea() {
    i = 30;
    j = [];
    l = k = g;
    m = '';
    p = 0;
    q = g;
    r = new Date().getTime();
    s = 100;
    t = 0;
    u = g;
    v = [];
  }
  google.rt.init = function (a, c, b) {
    ea();
    if ((o = document.getElementById(a))) {
      if (b) if (b.maxResults) s = b.maxResults;
      b = function () {
        q = f;
      };
      google.listen(document, 'keydown', b);
      google.listen(document, 'mousemove', b);
      c && fa(c);
      t += o.getElementsByTagName('li').length;
      j.length == 0 && window.setTimeout(w, 3e3);
      ga();
      ha(o, v);
      ia(o, v);
      x(w, i);
      if (ja('sbu', 'sbd', 'sbb', a)) {
        y.push(function () {
          l = f;
        });
        z.push(function () {
          l = g;
        });
        A(0, f);
      }
      ka(la, 3e3, 6e3);
    }
  };
  google.rt.pause = function () {
    ma();
    B();
    var a = document.getElementById('rth');
    a = a.getElementsByTagName('span');
    C(a[0]);
    D(a[1]);
    da = new Date().getTime();
  };
  google.rt.resume = function () {
    var a = (new Date().getTime() - da) / 1e3;
    if (a > 10) j = [];
    w();
    x(w, i);
    ka(la, 2e3, 6e3);
    a = document.getElementById('rth');
    a = a.getElementsByTagName('span');
    C(a[1]);
    D(a[0]);
  };
  function C(a) {
    a.style.display = 'none';
  }
  function D(a) {
    a.style.display = '';
  }
  function na(a) {
    a = Math.pow(2, a) * 5;
    a = (Math.random() + 0.5) * a;
    return Math.min(7200, a);
  }
  function x(a, c) {
    var b = c;
    if (p) b = na(p);
    ca = window.setTimeout(function () {
      a();
      x(a, c);
    }, b * 1e3);
  }
  function ma() {
    window.clearTimeout(ca);
  }
  function ka(a, c, b) {
    aa = window.setTimeout(function () {
      a();
      ba = window.setInterval(a, b);
    }, c);
  }
  function B() {
    window.clearTimeout(aa);
    window.clearInterval(ba);
  }
  function la() {
    if (!j.length || l) {
      if (u) {
        B();
        var a = document.getElementById('rth');
        a = a.getElementsByTagName('span');
        if (a.length > 2) {
          C(a[0]);
          C(a[1]);
          D(a[2]);
        }
      }
    } else {
      var c = j.shift();
      a = c.e;
      var b = a.getElementsByTagName('li')[0];
      o.insertBefore(a, o.firstChild);
      c.updateDate();
      google.History.save(oa, { r: o.innerHTML, u: m, n: t, s: v, t: E() });
      var d =
        -google.getComputedStyle(b, 'height') -
        google.getComputedStyle(b, 'margin-bottom');
      c = o.scrollTop;
      if (c < 20) {
        A(c);
        a = [[a, 'marginTop', d, 0, google.fx.easeInAndOut]];
        google.fx.animate(1200, a);
      } else A(c - d);
    }
  }
  function fa(a) {
    if (a.results) {
      var c = a.results.length;
      t += c;
      for (var b = 0; b < h.length; ++b) h[b](a.results);
      for (b = c; (c = a.results[--b]); ) j.push(pa(c));
    }
    if (a.nextRequest) m = a.nextRequest;
    if (a.pollSeconds) i = a.pollSeconds;
  }
  google.rt.pushRealtimeResultsCallback = function (a) {
    h.push(a);
  };
  window.mbrt0 = window.mb0rt = {
    insert: function (a) {
      a = eval('(' + a + ')');
      'numUpdates' in a ? qa(a) : fa(a);
    },
  };
  function w() {
    if (q) {
      q = g;
      r = new Date().getTime();
    } else if (new Date().getTime() - r > 24e4) return;
    u = t + 5 > s;
    if (!(k || u || !m)) {
      var a = google.xhr();
      a.open('GET', m);
      a.onreadystatechange = function () {
        if (a.readyState == 4) {
          if (a.status == 200) {
            eval(a.responseText);
            p = 0;
          } else p++;
          k = g;
        }
      };
      k = f;
      a.send(null);
    }
  }
  function pa(a) {
    var c = document.createElement('div');
    c.innerHTML = a.html;
    return { e: c, updateDate: ra(c, v) };
  }
  var oa = google.History.client(function (a) {
    o.innerHTML = a.r;
    m = a.u;
    t = a.n;
    v = a.s;
    F(o, v, a.t);
    A(0, f);
    j = [];
    w();
  });
  google.dstr.push(function () {
    B();
    ma();
  });
  var G,
    H,
    I,
    J,
    K,
    L,
    M,
    y,
    z,
    N,
    O,
    P = g;
  function Q(a) {
    var c = google.getComputedStyle(a, 'height');
    return c;
  }
  function R(a) {
    a = a.offsetTop;
    a -= J.offsetTop;
    return a;
  }
  function S(a) {
    if (a) for (var c = 0, b; (b = y[c++]); ) b();
    else if (M) for (c = 0; (b = z[c++]); ) b();
    M = a;
  }
  function T(a) {
    var c = sa(a);
    if (c) {
      var b = R(c);
      a || (b += Q(c) - O);
      ta(b, f, 300, function () {
        ua(a);
      });
    }
  }
  function ta(a, c, b, d) {
    var e = J.scrollHeight - O;
    e = e == 0 ? 0 : va((a * (N - Math.max((O / J.scrollHeight) * N, 20))) / e);
    e = [
      [
        I,
        'marginTop',
        google.getComputedStyle(I, 'margin-top'),
        e,
        google.fx.easeInAndOut,
      ],
    ];
    if (c) e.push([J, 'scrollTop', J.scrollTop, a, google.fx.easeInAndOut, '']);
    else J.scrollTop = a;
    google.fx.animate(b, e, d);
  }
  function ua(a) {
    setTimeout(function () {
      M && T(a);
    }, 200);
  }
  function sa(a) {
    var c = J.childNodes;
    if (a)
      for (a = c.length - 1; a >= 0; --a) {
        var b = c[a],
          d = R(b);
        if (b.nodeType == 1 && d < J.scrollTop) return b;
      }
    else
      for (a = 0; (b = c[a++]); ) {
        d = R(b);
        if (b.nodeType == 1 && d + Q(b) > J.scrollTop + O) return b;
      }
  }
  function wa(a) {
    var c = a.clientY - K;
    c = va(google.getComputedStyle(I, 'margin-top') + c);
    I.style.marginTop = c + 'px';
    J.scrollTop = (c * (J.scrollHeight - O)) / (N - Q(I));
    K = a.clientY;
  }
  function va(a) {
    return Math.max(0, Math.min(N - Q(I), a));
  }
  function A(a, c) {
    if (P) {
      var b = Q(I),
        d = Math.max((O / J.scrollHeight) * N, 20),
        e = document.getElementById('sbbb');
      b = [
        [I, 'height', b, d],
        [e, 'marginTop', b - 7, d - 7],
      ];
      if (!L) {
        e = d = 0;
        for (var n; (n = J.childNodes[e++]); ) if (n.nodeType == 1) d += Q(n);
        if (d > O) {
          b.push([
            document.getElementById('sb'),
            'opacity',
            0,
            1,
            google.fx.linear,
            '',
          ]);
          L = f;
        }
      }
      d = c ? 0 : 1200;
      ta(a, g, d);
      google.fx.animate(d, b, function () {
        if (L) I.style.position = 'absolute';
      });
    }
  }
  function U(a, c) {
    if (a.parentNode == I) a = I;
    var b = 70 * (c ? 1 : -1);
    xa(a, b);
    for (var d = 0, e; (e = a.childNodes[d++]); ) e.nodeType == 1 && xa(e, b);
  }
  function xa(a, c) {
    var b = a.style.backgroundPosition.match(/^-?\d+/),
      d = a.style.backgroundPosition.match(/\s+.*$/);
    a.style.backgroundPosition = parseInt(b, 10) + c + 'px ' + (d ? d : '');
  }
  function ja(a, c, b, d) {
    G = document.getElementById(a);
    H = document.getElementById(c);
    I = document.getElementById(b);
    J = document.getElementById(d);
    if (!(G && H && I && J)) return (P = g);
    M = L = g;
    y = [];
    z = [];
    N = google.getComputedStyle(document.getElementById('sbc'), 'height') - 1;
    O = google.getComputedStyle(J, 'height');
    a = [G, H, I];
    for (c = 0; (b = a[c++]); ) {
      google.bind(b, 'mouseover', function (e) {
        U(e.target);
      });
      google.bind(b, 'mouseout', function (e) {
        U(e.target, f);
      });
      b.onmousedown = function () {
        return g;
      };
    }
    google.bind(G, 'mousedown', function () {
      S(f);
      T(f);
    });
    google.bind(H, 'mousedown', function () {
      S(f);
      T();
    });
    google.bind(I, 'mousedown', function (e) {
      S(f);
      K = e.clientY;
      google.bind(document, 'mousemove', wa);
    });
    return (P = f);
  }
  google.bind(document, 'mouseup', function () {
    document.removeEventListener('mousemove', wa, g);
    S(g);
  });
  google.dstr.push(function () {
    y = z = [];
    P = g;
  });
  window.google.rt || (window.google.rt = {});
  var ya = -1;
  google.rt.timestampToString = null;
  function za(a, c) {
    for (var b = a.getElementsByTagName('div'), d = 0, e; (e = b[d++]); )
      if (e.className == 'rtdelta') {
        b = parseInt(e.innerHTML, 10);
        return c - b;
      }
    return g;
  }
  function E() {
    return Math.round(new Date().getTime() / 1e3);
  }
  function Aa(a, c) {
    var b = c - a;
    if (b < 86400)
      if (b < 45) return 'seconds ago';
      else if (b < 105) return '1 minute ago';
      else if (b < 3345) {
        b = Math.floor(b / 60) + (b % 60 >= 45 ? 1 : 0);
        return '1 minutes ago'.replace('1', b + '');
      } else if (b < 6600) return '1 hour ago';
      else {
        b = Math.floor(b / 3600) + (b % 3600 >= 3e3 ? 1 : 0);
        return '1 hours ago'.replace('1', b + '');
      }
    return g;
  }
  function Ba(a, c, b, d) {
    if (c) if ((c = d(c, b))) a.innerHTML = c;
  }
  function Ca(a) {
    var c = [];
    a = a.getElementsByTagName('span');
    for (var b = 0, d; (d = a[b++]); ) d.className.match('rtd') && c.push(d);
    return c;
  }
  function Da(a) {
    a = Ca(a);
    if (a.length > 0) return a[0];
    return g;
  }
  function F(a, c, b) {
    a = Ca(a);
    b = b || E();
    for (var d = 0, e; (e = a[d]); d++)
      Ba(e, c[d], b, google.rt.timestampToString);
  }
  function ra(a, c, b) {
    var d = b || E();
    return function () {
      var e = Da(a);
      if (e) {
        var n = za(e, d);
        if (n) {
          Ba(e, n, E(), google.rt.timestampToString);
          c.unshift(n);
        }
      }
    };
  }
  function ha(a, c, b) {
    a = Ca(a);
    b = b || E();
    for (var d = 0, e; (e = a[d++]); ) (e = za(e, b)) && c.push(e);
  }
  function ia(a, c) {
    ya = window.setInterval(function () {
      F(a, c);
    }, 6e4);
    google.dstr.push(function () {
      window.clearInterval(ya);
    });
  }
  function ga() {
    google.rt.timestampToString = Aa;
  }
  google.rt.replayCallbacks = [];
  google.rt.pushReplayCallback = function (a) {
    google.rt.replayCallbacks.push(a);
  };
  function Ea() {
    google.rt.timestampToString = function (a) {
      return google.rt.formatTime(a, 'FullDate');
    };
  }
  google.rt.replayinit = function (a) {
    o = document.getElementById(a);
    v = [];
    Ea();
    if (o) {
      google.rt.pushReplayCallback(function () {
        ha(o, v, null);
        F(o, v);
      });
      google.History.save(oa, { r: o.innerHTML, s: v, t: E() });
    }
  };
  window.google.rtc = {};
  var V, Fa, W, X, Ga, Ha, Y, Ia, Ja, Z, $;
  function Ka(a) {
    V = document.getElementById(a);
    if (!V) return g;
    Fa = parseInt(V.innerHTML, 10);
    W = 0;
    Ha = '';
    Y = g;
    Ia = new Date().getTime();
    Z = Ja = 0;
    $ = g;
    Ga = X = 0;
    return f;
  }
  google.rtc.init = function (a, c) {
    if (c && Ka(a)) {
      qa(c);
      var b = function () {
        Y = f;
      };
      google.listen(document, 'keydown', b);
      google.listen(document, 'mousemove', b);
      La(Ma, 1);
    }
  };
  function La(a, c) {
    if (Y) {
      Y = g;
      Ia = new Date().getTime();
    }
    if (!(Ja > 200 || Z > 3 || new Date().getTime() > Ia + 24e4)) {
      Na();
      var b = c;
      if (Z) b = na(Z);
      var d;
      if ($ || W != 0)
        d = function () {
          La(a, c);
        };
      else {
        X = 0;
        d = function () {
          a();
          La(a, c);
        };
      }
      window.setTimeout(d, b * 1e3);
    }
  }
  function Ma() {
    var a = google.xhr();
    a.open('GET', Ha);
    a.onreadystatechange = function () {
      if (a.readyState == 4)
        if (a.status == 200) {
          eval(a.responseText);
          Z = 0;
        } else Z++;
      $ = g;
    };
    $ = f;
    a.send(null);
  }
  function qa(a) {
    if (a.numUpdates) X = a.numUpdates;
    if (a.nextRequest) Ha = a.nextRequest;
  }
  function Na() {
    if (!$) {
      Ja++;
      W++;
      if (W >= 30) W -= 30;
      var a = Ga + X / 30,
        c = Math.round(a);
      Ga = a - c;
      Fa += c;
      V.innerHTML = Fa;
    }
  }
})();
(function () {
  var e = false;
  function h(a) {
    google.srp.updateLinksWithParam(
      'prmdo',
      a ? '1' : '',
      google.srp.isSerpLink,
      google.srp.isSerpForm,
    );
  }
  function i(a, c, b) {
    return [
      [c, 'height', a ? b : 0, a ? 0 : b],
      [c, 'opacity', a ? 1 : 0, a ? 0 : 1, null, ''],
    ];
  }
  function j(a) {
    if (!a) return null;
    var c = a.offsetHeight,
      b = google.style.getComputedStyle(a, 'overflow', 1);
    a.style.overflow = 'hidden';
    return { height: c, overflow: b };
  }
  function l(a, c, b) {
    if (c) a.style.height = b.height + 'px';
    else a.style.removeAttribute && a.style.removeAttribute('filter');
    a.style.overflow = b.overflow;
  }
  google.srp.toggleModes = function () {
    if (!e) {
      e = true;
      var a = document.getElementById('ms'),
        c = document.getElementById('hidden_modes'),
        b = document.getElementById('hmp'),
        d = google.style.hasClass(a, 'open');
      a.className = 'open';
      var k = j(c),
        f = j(b),
        g = i(d, c, k.height);
      if (f) g = g.concat(i(d, b, f.height));
      h(!d);
      google.fx.animate(227, g, function () {
        if (d) a.className = '';
        l(c, d, k);
        b && l(b, d, f);
        e = false;
      });
    }
  };
})();
(function () {
  google.tbpr = {};
  var d = {},
    g = /\bl\b/,
    h = function (a) {
      return g.test(a.className);
    },
    j = function () {
      for (
        var a = document.getElementsByTagName('h3'), b = 0, c;
        (c = a[b++]);

      )
        if (c.className == 'tbpr') {
          var e = Number(c.id.substr(5));
          d[e] = c;
          i(c, e);
        }
    },
    i = function (a, b) {
      for (; a && a.nodeName != 'LI'; ) a = a.parentNode;
      if (a)
        for (var c = a.getElementsByTagName('a'), e = 0, f; (f = c[e++]); )
          if (h(f)) {
            f.resultIndex = b;
            return;
          }
    },
    k = function () {
      for (var a in d) d[a].style.display = 'none';
    },
    l = function (a) {
      if (d[a]) d[a].style.display = 'block';
    },
    m = function (a) {
      var b = '';
      k();
      if (a.lastClicked >= 0) {
        l(a.lastClicked);
        b = 'tbpr:idx=' + a.lastClicked;
      }
      return b;
    },
    n = function (a, b) {
      b.lastClicked = a.resultIndex || -1;
    };
  google.tbpr.init = function () {
    j();
    google.event.back.init();
    google.event.back.register(h, n, m, 'tbpr');
  };
})();
(function () {
  if (!google.nolujs) {
    google.LU = {};
    var c,
      d = [],
      e,
      h,
      k,
      l,
      m,
      n,
      o,
      p,
      q,
      r;
    google.LU.featureMap = function (a) {
      if ((d = a) && d.length > 0) s();
      else d = [];
    };
    var t = function (a) {
        for (var b = 0, g; b < d.length; ++b)
          if ((g = d[b].features))
            for (var f = 0, i; (i = g[f]); ++f) if (!a(i)) return;
      },
      u = function () {
        q = e.offsetWidth;
        r = e.offsetHeight;
      },
      s = function () {
        google.listen(e, 'mousemove', v);
        var a = d[0].rectangle;
        if (a && a.length == 4) {
          n = a[2] - a[0];
          o = a[3] - a[1];
        }
        p =
          e.style.background.indexOf('center') != -1 ||
          e.style.background.indexOf('50% 50%') != -1;
        google.log('lu_featuremap', google.time() - c + '');
      },
      w = function (a) {
        var b = o / r;
        a = { x: a.x * b, y: a.y * b };
        if (p) a.x += (n - q * b) / 2;
        return a;
      },
      x = 0,
      v = function (a) {
        var b = google.time();
        if (!(b - x < 100)) {
          x = b;
          u();
          a = {
            x:
              (a || window.event).clientX +
              document.body.scrollLeft +
              document.documentElement.scrollLeft -
              google.style.getPageOffsetLeft(e),
            y:
              (a || window.event).clientY +
              document.body.scrollTop +
              document.documentElement.scrollTop -
              google.style.getPageOffsetTop(e),
          };
          a = w(a);
          a = y(a.x, a.y);
          h.href = l;
          if (a) {
            a = a.id;
            h.style.cursor = 'pointer';
            if (!m && a != '0') h.href += '&iwloc=' + a;
          } else h.style.cursor = 'default';
        }
      },
      y = function (a, b) {
        if (d.length == 0) return null;
        var g = null;
        t(function (f) {
          var i = a - f.a[0],
            j = b - f.a[1];
          if (i >= f.bb[0] && j >= f.bb[1] && i <= f.bb[2] && j <= f.bb[3]) {
            g = f;
            return false;
          }
          return true;
        });
        return g;
      };
    google.LU.init = function (a) {
      if ((e = document.getElementById('lu_map'))) {
        for (h = e; h && h.tagName != 'A'; ) h = h.parentNode;
        for (k = h; k && (k.tagName != 'LI' || google.style.hasClass('g')); )
          k = k.parentNode;
        if (h && k) {
          l = h.href;
          m = l.indexOf('&iwloc=') != -1 || l.indexOf('&cid=0,0,') != -1;
          var b;
          if (e.tagName == 'IMG') b = e.src;
          else {
            b = /url\(([\'\"]?)(.*)\1\)/.exec(e.style.background);
            if (!b || b.size < 3) return;
            b = b[2];
          }
          var g = /\/vt\/data=[^,]+,[^,]+$/;
          if (g.test(b)) {
            g = b.indexOf('data=');
            var f = b.indexOf(','),
              i =
                b.substring(0, g + 5) +
                a +
                b.substr(f) +
                '&callback=google.LU.featureMap';
            k.fetchOnce = true;
            k.fetch = function () {
              if (k.fetchOnce) {
                k.fetchOnce = false;
                c = google.time();
                google.unlisten(k, 'mouseover', k.fetch);
                var j = document.createElement('SCRIPT');
                j.src = i;
                google.append(j);
              }
            };
            google.listen(k, 'mouseover', k.fetch);
          }
        }
      }
    };
    var z = function () {
      e && google.unlisten(e, 'mousemove', v);
      d.length = 0;
    };
    google.dstr && google.dstr.push(z);
  }
})();
(function ggxjs29sk() {
  var g = true,
    h = null,
    i = false;
  if (!google.j) window.google.j = {};
  var k = window.google.j,
    aa = k.en == 2,
    ba = !aa,
    ca = i;
  function da(a) {
    a = sessionStorage.getItem('web-' + a);
    if (typeof a == 'undefined' || a === h) return a;
    if (typeof a.value == 'string') return a.value;
    return a;
  }
  var l = i;
  try {
    if (ba && window.sessionStorage && !sessionStorage.readonly) {
      var n = google.time().toString(),
        ea = 'web-s' + n;
      sessionStorage[ea] = n;
      l = da('s' + n) === n;
      sessionStorage.removeItem(ea);
      if (l)
        if (k.bv) {
          var fa = sessionStorage['web-v'];
          if (fa != k.bv) {
            var o,
              ga,
              ha = p('s');
            for (o = 0; (ga = ha[o++]); )
              sessionStorage.removeItem('web-s' + ga);
            sessionStorage.removeItem('web-s');
            ha = p('c');
            for (o = 0; (ga = ha[o++]); )
              sessionStorage.removeItem('web-c' + ga);
            sessionStorage.removeItem('web-c');
            sessionStorage['web-v'] = k.bv;
          }
        }
    }
  } catch (ia) {}
  var q,
    r = i,
    ja,
    ka = google.j.mc || 4e5,
    u = 0;
  if (google.browser.product.IE)
    if (document.documentMode) u = document.documentMode;
    else {
      u = parseInt(google.browser.product.version, 10);
      if (isNaN(u)) u = 0;
    }
  var w = u && u <= 7 ? 1 : 0,
    x = window.frames.wgjf,
    y,
    z,
    la = { sendSlowCSI: i, shouldBlur: g };
  function ma(a) {
    for (var b in a) la[b] = a[b];
  }
  k.sjcv = ma;
  var A = {},
    na = {},
    oa = {},
    pa,
    B;
  k.ss = 1;
  var C = i,
    qa = i,
    ra,
    D = '1',
    sa = '1',
    E = { c: { 1: google.j[1] }, s: {} },
    F = { c: {}, s: {} },
    G,
    ta,
    ua,
    va,
    wa,
    xa,
    ya = i,
    H,
    za,
    I = 0,
    J = [];
  function K(a, b, c) {
    b._sn = a;
    b._t = 'jesr';
    b._ls = B;
    b._fr = !!x;
    b._ph = I;
    if (k.m != k.ss) b._ss = k.ss + ',' + k.m;
    try {
      b._wlt = typeof window.location.href;
      b._flt = typeof x.location.href;
      b._wl = encodeURIComponent(window.location.href);
      b._fl = encodeURIComponent(x.location.href);
    } catch (d) {}
    google.ml(c || Error('jesr'), i, b);
  }
  var L,
    M,
    Aa = 0,
    Ba = function (a, b) {
      if (a.removeEventListener) {
        a.removeEventListener('load', b, i);
        a.removeEventListener('error', b, i);
      } else {
        a.detachEvent('onload', b);
        a.detachEvent('onerror', b);
      }
    },
    N = function (a, b) {
      if (b || (k.ss == k.m && ++M == L))
        if (google.timers && google.timers.load.t && google.timers.load.e) {
          google.timers.load.t.iml = google.time();
          google.timers.load.e.imn = L;
          if (Aa > 1) google.timers.load.e.alm = Aa - 1;
          google.report &&
            google.report(google.timers.load, google.timers.load.e);
          google.dph && google.dph();
          Aa = 0;
        }
      if (!b) {
        a = a || window.event;
        var c = a.target || a.srcElement;
        Ba(c, N);
      }
    },
    Ea = function () {
      try {
        ++Aa;
        var a = document.getElementsByTagName('img');
        L = a.length;
        for (var b = (M = 0), c; b < L; ++b) {
          c = a[b];
          Ba(c, N);
          if (c.complete || typeof c.src != 'string' || !c.src) ++M;
          else if (c.addEventListener) {
            c.addEventListener('load', N, i);
            c.addEventListener('error', N, i);
          } else {
            c.attachEvent('onload', N);
            c.attachEvent('onerror', N);
          }
        }
        google.timers.load.e = {
          ei: google.kEI,
          e: google.kEXPI,
          cp: Ca,
          imp: L - M,
        };
        if (Da) google.timers.load.e.pf = 1;
        var d = y._gts();
        if (d) {
          a = function (f) {
            return (
              'n.' +
              f[0] +
              ',ttfc.' +
              Math.round(f[1]) +
              ',ttlc.' +
              Math.round(f[2]) +
              ',cbt.' +
              Math.round(f[3]) +
              (la.sendSlowCSI ? ',slow.1' : '')
            );
          };
          google.timers.load.e.pfa = a(d[0]);
          google.timers.load.e.pfm = a(d[1]);
        }
        M == L && N(h, g);
      } catch (e) {
        K(
          'SCSI',
          {
            n: L,
            i: b,
            s: c ? (typeof c.src == 'string' ? c.src.substr(0, 40) : 1) : 0,
            c: c ? c.complete : 0,
          },
          e,
        );
      }
    };
  function O(a, b, c) {
    try {
      c ? a.replace(b) : (a.href = b);
    } catch (d) {
      K('SL', { v: b, r: c }, d);
    }
  }
  k.sl = O;
  function Fa(a, b) {
    a.hash = b;
  }
  k.slh = Fa;
  var P = i,
    Q = i,
    Ga = i,
    Ca = i,
    Ha = '',
    Da = i,
    Ia = '';
  function Ja(a, b, c) {
    if (a[b]) {
      if (!a.__handler) {
        a.__handler = a[b];
        a[b] = function (d) {
          return this.__handler(d) != i && c.call(this, d);
        };
      }
    } else
      a.__handler = a[b] = function (d) {
        return c.call(this, d);
      };
  }
  function _trap() {
    for (
      var a = document.getElementsByTagName('form'), b = 0, c;
      (c = a[b++]);

    )
      G.test(c.action) &&
        !/\bnj\b/.test(c.className) &&
        Ja(c, 'onsubmit', function (d) {
          return Ka(this, i, d);
        });
  }
  k.trap = _trap;
  function R(a, b) {
    if (E[a][b] === 1) E[a][b] = eval(da(a + b));
    return E[a][b];
  }
  function La(a, b) {
    delete E[a][b];
    if (l) {
      for (var c = a + b, d = p(a), e = -1, f = 0, j; (j = d[f++]); )
        if (j == c) {
          e = f - 1;
          break;
        }
      if (e >= 0) {
        d.splice(e, 1);
        try {
          Ma(a, d);
          sessionStorage.removeItem('web-' + c);
        } catch (m) {
          K(
            'RCI',
            {
              k: d ? d.length : -1,
              s:
                typeof sessionStorage.remainingSpace == 'number'
                  ? sessionStorage.remainingSpace
                  : -1,
            },
            m,
          );
        }
      }
    }
  }
  function p(a) {
    return (a = da(a)) ? eval(a) : [];
  }
  function Ma(a, b) {
    for (var c = {}, d = [], e = b.length - 1; e >= 0; e--)
      if (!c[b[e]]) {
        c[b[e]] = 1;
        d.push(b[e]);
      }
    d.reverse();
    sessionStorage['web-' + a] = '(' + google.stringify(d) + ')';
  }
  function T() {
    return U > k.ss ? U : k.ss + 1;
  }
  function V(a) {
    if (!a) return a === 0;
    return a == k.ss && k.ss > k.m;
  }
  function Na(a) {
    function b(c, d) {
      var e = document.createElement('script');
      e.text = d;
      google.dom.append(e);
    }
    a.replace(/\x3cscript[\s\S]*?\x3e([\s\S]*?)\x3c\/script/gi, b);
  }
  function _bc(a, b) {
    try {
      b || W('bc', [a]);
      document.body.className = a || '';
    } catch (c) {
      K('BC', { name: a }, c);
    }
  }
  k.bc = _bc;
  function _p(a, b, c, d, e) {
    if (w == 1 || V(d)) {
      if (!google.msg.send(6, [b, a])) return i;
      try {
        e || W('p', [b, c, 0]);
        if ((b == 'sdb' || b == 'taw') && P) {
          document.body.style.height = document.body.offsetHeight + 4 + 'px';
          X(D);
          window.scroll(0, 0);
          P = i;
        }
        var f = document.getElementById(b);
        try {
          f.innerHTML = c;
          Na(c);
        } catch (j) {
          var m = f.cloneNode(i);
          m.innerHTML = c;
          f.parentNode.replaceChild(m, f);
        }
        if (b == 'main') {
          var t = Y('q') || Y('as_q');
          t = google.msg.send(4, [t, g], t, h);
          if (t != h) {
            a = 0;
            for (var s; (s = ['gs', 'bgs', 'f'][a++]); )
              if (document[s] && document[s].q.value != t)
                document[s].q.value = t;
          }
        }
        document.getElementById(b).style.visibility = 'visible';
      } catch (v) {
        K('P', { id: b }, v);
      }
      I = 21;
      if (!google.msg.send(18, [b])) return i;
    }
  }
  k.p = _p;
  function _ph(a, b, c) {
    if (w == 1 || V(c)) {
      var d, e;
      try {
        W('ph', [b, 0]);
        for (d in b) {
          e = b[d];
          document.getElementById(d).href = e;
        }
      } catch (f) {
        K('PH', { id: d, href: e }, f);
      }
    }
  }
  k.ph = _ph;
  function _pah(a, b, c) {
    if (w == 1 || V(c)) {
      var d, e;
      try {
        W('pah', [b, 0]);
        for (d in b) {
          e = b[d];
          var f = document.getElementById(d);
          if (f) {
            if (!f.orighref) {
              var j = f.href.indexOf('?');
              f.orighref = j >= 0 ? f.href.substr(0, j + 1) : f.href;
            }
            f.href = f.orighref + e;
          }
        }
      } catch (m) {
        K('PAH', { id: d, suffix: e }, m);
      }
    }
  }
  k.pah = _pah;
  function _pa(a, b, c, d) {
    if (w == 1 || V(d)) {
      try {
        W('pa', [b, c, 0]);
        var e = document.getElementById(b),
          f = document.createElement('div');
        f.innerHTML = c;
        for (var j; (j = f.firstChild); ) e.appendChild(j);
        if (google.browser.product.IE || google.browser.engine.WEBKIT) Na(c);
      } catch (m) {
        K('PA', { id: b }, m);
      }
      I = 22;
    }
  }
  k.pa = _pa;
  function Oa(a, b) {
    for (var c in b) {
      var d = b[c];
      if (d && typeof d == 'object') {
        if (!a[c] || typeof a[c] != 'object') a[c] = {};
        Oa(a[c], d);
      } else a[c] = d;
    }
  }
  function _sa(a, b, c, d) {
    if (w == 1 || V(d))
      try {
        W('sa', [b, c, 0]);
        var e = document.getElementById(b);
        Oa(e, c);
      } catch (f) {
        K('SA', { id: b, elt: e, attbs: google.stringify(c) }, f);
      }
  }
  k.sa = _sa;
  var Z = 1,
    Pa = ['wgjc'],
    U,
    Qa = 1;
  function Ra() {
    return /#.+/.test(Sa())
      ? Sa()
      : window.location.href
          .substr(window.location.href.indexOf('?'))
          .replace(/#.*/, '');
  }
  function Y(a, b) {
    try {
      var c = b || Ra(),
        d = c.match('[?&#]' + a + '=(.*?)([&#]|$)');
      if (d)
        return decodeURIComponent(
          d[1].replace(/\+/g, ' ').replace(/[\n\r]+/g, ' '),
        );
    } catch (e) {
      K('GQC', { c: a }, e);
    }
    return '';
  }
  var Ta = google.j.b;
  function _ad(a, b, c, d, e, f, j) {
    b = Ia || b;
    var m = i;
    C = i;
    if (!j && w == 1) {
      B = a;
      k.ss = T();
      O(window.location, B);
    }
    if (w == 1 || V(e)) {
      J = [];
      W('ad', [b, c, d, 0, 0, 1]);
      j || Ua();
      if (google.med)
        if (Ta) Ta = i;
        else google.med('dispose');
      ya && Va();
      b = google.msg.send(21, [b], b, '');
      try {
        if (b) {
          x.document.title = document.title = b;
          google.browser.engine.WEBKIT &&
            google.msg.send(24, [B]) &&
            Fa(window.location, B);
        }
      } catch (t) {}
      google.kEI = c;
      if (f) {
        google.kCSI = f;
        google.kEXPI = f.expi;
      }
      m = D != d ? Wa(d, a) : g;
      ra = Y('q', a) || ra;
      k.bc('', g);
      google.j.spf(a, Da);
      I = 20;
    }
    return m;
  }
  k.ad = _ad;
  function _spf(a, b) {
    W('spf', [b]);
    google.j.pf = b;
  }
  k.spf = _spf;
  function _xx(a, b, c) {
    if (w == 1 || V(c))
      try {
        C = g;
        X(D);
        k.p(B, 'sdb', '', k.ss);
        k.p(B, 'search', b, k.ss);
      } catch (d) {
        K('_xx', {}, d);
      }
  }
  k.xx = _xx;
  function _zd(a, b, c) {
    var d = b,
      e = c;
    if (typeof e == 'number') {
      e = { s: b, e: c, n: arguments[3], h: arguments[4] };
      d = arguments[5];
    }
    if (w == 1 || V(d)) {
      W('zd', [0, e]);
      za = e.s;
      xa = e.e;
      H = e.n;
      wa = e.h;
      document.body.style.height = '';
    }
  }
  k.zd = _zd;
  function _zz(a, b, c, d) {
    if (w == 1 || V(b)) {
      W('zz', [0, 1, C]);
      if (!c)
        google.timers &&
          google.timers.load.t &&
          (google.timers.load.t.prt = google.time());
      a = google.msg.send(19, [B], B);
      !C && !d && R('c', D).nb && Xa(a);
      Ya();
      if (!c)
        google.timers &&
          google.timers.load.t &&
          (google.timers.load.t.pprt = google.time());
      !c && w == 0 && Za(a);
      Z = 1;
      k.m = k.ss;
      if (!C && !c && google.timers && google.timers.load.t) {
        google.timers.load.t.ol = google.time();
        google.timers.load.t.jsrt = U;
        Q && Ea();
      }
      if (!c && w == 0) x.src = 'about:blank';
    }
    Q = C = i;
    I = 0;
  }
  k.zz = _zz;
  function $a() {
    google.pageState = B;
    for (var a = 0, b; (b = google.rein[a++]); )
      try {
        b(B == '#', Ga);
      } catch (c) {
        K('INJS', { i: a }, c);
      }
    ya = g;
  }
  function Va() {
    if (google.y.x) google.x = google.y.x;
    for (var a = 0, b; (b = google.dstr[a++]); )
      try {
        b();
      } catch (c) {
        K('DEJS', { i: a }, c);
      }
  }
  var ab = 4;
  function bb() {
    try {
      if (!google.browser.product.CHROME) return i;
      if (!x || !x.document) return i;
      var a = x.document.getElementsByTagName('meta'),
        b = x.document.getElementsByTagName('div');
      if (
        a.length == 1 &&
        a[0].getAttribute('HTTP-EQUIV') === 'Refresh' &&
        b.length == 1 &&
        b[0].getAttribute('style') ===
          'position:fixed;top:0;left:0;width:100%;border-width:thin;border-color:black;border-style:solid;text-align:left;font-family:arial;font-size:10pt;foreground-color:black;background-color:white'
      )
        return g;
    } catch (c) {
      return i;
    }
    return i;
  }
  function _l() {
    google.fl = g;
    if (r) {
      try {
        if (ja) {
          var a = ja;
          ja = '';
          if (google.browser.product.IE) {
            window.history.back();
            O(window.location, a);
          } else O(window.location, a, 1);
          return;
        }
        a = x.location.href;
        if (google.browser.product.CHROME && !a) {
          $(B, { _c: 'l0' });
          return;
        }
        var b = u <= 7 || x.document.readyState == 'complete';
      } catch (c) {
        $(B, { _c: 'l1' });
        return;
      }
      try {
        if (
          !(/\/blank\.html$/.test(a) || /about:blank$/.test(a)) &&
          !(x.google && x.google.loc) &&
          b
        )
          if (G.test(a))
            bb() && --ab >= 0
              ? K('SDCH', { retries: ab })
              : $(Ra(), { _c: 'l2' });
          else O(window.location, a, 1);
      } catch (d) {
        K('_l', {}, d);
      }
    }
  }
  k.l = _l;
  function _bvch(a) {
    if (google.msg.send(26)) {
      var b = a.indexOf('?') + 1;
      if (b >= 1)
        a =
          a.substr(0, b) +
          a.substr(b).replace(/(^|&)fp\=[^&]*/g, '') +
          '&cad=cbv';
      if (w == 0) {
        k.ss = T();
        k.m = k.ss;
        ja = a;
        x.location.replace('about:blank');
      } else O(window.location, a);
    } else {
      k.ss = T();
      k.m = k.ss;
    }
  }
  k.bvch = _bvch;
  function $(a, b, c) {
    a =
      '/search?' +
      a
        .substr(1)
        .replace(/(^|&)fp\=[^&]*/g, '')
        .replace(/(^|&)tch\=[^&]*/g, '') +
      '&emsg=NCSR&ei=' +
      window.google.kEI;
    var d, e, f;
    d = e = f = '(none)';
    try {
      if (x && x.document && x.location) {
        d = x.google;
        e = x.location.href;
        f = x.document.title;
      }
    } catch (j) {}
    try {
      var m = {
        _sn: 'NCSR',
        _t: 'jesr',
        _g: !!d,
        _lg: U ? google.time() - U : 'NA',
        _sl: Qa,
        _wl: window.location.href,
        _fl: e,
        _it: f.substr(0, 100),
      };
      if (b) for (var t in b) if (b.hasOwnProperty(t)) m[t] = b[t];
      google.ml(Error('jesr'), i, m);
    } catch (s) {}
    if (c)
      if (google.browser.product.IE) {
        window.history.back();
        O(window.location, a);
      } else O(window.location, a, 1);
    else if (!document.getElementById('bberror')) {
      b = document.createElement('center');
      b.id = 'bberror';
      b.style.position = 'absolute';
      b.style.width = '100%';
      b.style.zIndex = '2';
      b.innerHTML =
        '<span style="background:#ff9;padding:5px;font-size:small">' +
        'The page load didn\x27t work. \x3ca class\x3dnj href\x3d\x22%1$s\x22\x3eClick here\x3c/a\x3e to try again.'.replace(
          '%1$s',
          a,
        ) +
        '</span>';
      (a = window.parent.document.getElementById('main')) &&
        a.insertBefore(b, a.firstChild);
    }
  }
  function _e(a) {
    google.fl = g;
    K('IFE', {}, a || window.event);
  }
  k.e = _e;
  function Ka(a, b, c, d) {
    if (!q || ca) return g;
    c = '#';
    try {
      if (b) c += a.match(/\?(.*)/)[1].replace(/#.*/, '');
      else {
        b = [];
        d || (a.q && a.q.blur());
        for (var e = 0, f; (f = a.elements[e++]); )
          if (!((f.type == 'radio' || f.type == 'submit') && !f.checked)) {
            if (f.name == 'btnI') return g;
            f.name && b.push(f.name + '=' + encodeURIComponent(f.value));
          }
        c += b.join('&').replace(/\%20/g, '+');
      }
      c = c.replace(/\'/g, '%27');
      var j = Y('q', c);
      if (!j && !d) return i;
      if (
        /(^| )(r?phonebook|define|cache):/.test(j) ||
        /(\?|&)pb=(r|f)/.test(c) ||
        /(\?|&)swm=2/.test(c)
      )
        return g;
    } catch (m) {
      K('HSA', { t: a.tagName }, m);
      return g;
    }
    c += '&fp=' + (D == '1' ? sa : D);
    w == 0 &&
      !d &&
      !google.browser.engine.WEBKIT &&
      google.msg.send(24, [c]) &&
      O(window.location, c);
    if (d) window.google.jesrstate = c;
    else {
      Q = g;
      La('s', c);
      window.google._bfr = undefined;
      document.getElementById('csi').value = '';
      cb(c);
    }
    w == 1 && !d && O(window.location, c);
    return i;
  }
  k.hsa = Ka;
  function db(a, b) {
    var c = Sa(a);
    if (!qa && c != '#' && !/[&#]q=/.test(c)) {
      K('BF', { o: a, f: b, s: c });
      qa = g;
    }
    if (Z && c != B && ta.test(window.location.href)) {
      Q = !(c in E.s);
      if (la.shouldBlur) {
        document.gs && document.gs.q.blur();
        document.bgs && document.bgs.q.blur();
        document.f && document.f.q.blur();
      }
      if (w == 0 || a || c == '#') {
        try {
          if (a && c != '#')
            if ((w == 1 && B == '#') || (w == 0 && b)) {
              c = eb(c, 'fp', '1');
              if (c.indexOf('&fp=') == -1) c += '&fp=1';
              if (c.indexOf('&cad=') == -1) c += '&cad=b';
              La('s', c);
              w == 0 && O(window.location, c, 1);
            }
        } catch (d) {}
        if (!google.msg.send(7, [c])) {
          B = c;
          return;
        }
        cb(c, a);
      }
      w == 1 && O(window.location, c);
    }
  }
  function fb(a, b) {
    db(a, b);
    window.setTimeout(fb, 100);
  }
  function cb(a, b) {
    U = google.time();
    Ca = Ga = P = i;
    ab = 4;
    if (google.timers) {
      google.timers.load.t = h;
      google.timers.load.e = h;
    }
    if (a != '#' && a.indexOf('&fp=') == -1) {
      a += '&fp=' + D;
      O(window.location, a, 1);
    }
    B = a;
    if (w == 0) k.ss = T();
    Qa = 0;
    try {
      Z = 0;
      var c = a.substr(1);
      if (w == 1 && a == '#') a in E.s && gb(a);
      else if (w == 1 && !b) {
        r = P = g;
        O(x.location, '/search?' + c);
      } else if (w == 0 && a in E.s) gb(a);
      else if (a != '#') {
        var d = '/search?' + c;
        if ((d = google.msg.send(5, [d], d))) {
          r = P = g;
          hb(d);
          pa = '#' + c;
        } else Z = 1;
      }
    } catch (e) {
      Qa = 1;
      K('GO', { o: b, s: a }, e);
    }
    window.setTimeout(function () {
      Qa = 1;
    }, 50);
  }
  k.go = cb;
  function hb(a) {
    if (!y._i(a)) {
      y._c();
      y._o();
      y._ns();
      if (!y._p() && z) {
        z._s(a);
        return;
      }
    }
    y._s(a);
  }
  function X(a) {
    try {
      for (var b = R('c', a), c = 0, d; (d = b.cc[c++]); )
        document.getElementById(d).style.visibility = 'hidden';
    } catch (e) {
      K('C', { fp: a, c: d }, e);
    }
  }
  k.clr = function () {
    X(D);
  };
  function ib() {
    var a = '#';
    try {
      J = [];
      W('ad', [document.title, window.google.kEI, D, 0, 0, 1]);
      for (var b = R('c', D), c = 0, d; (d = b.co[c++]); )
        W('p', [d, document.getElementById(d).innerHTML, 0]);
      W('zz', [0, 1]);
      Za(a, g, g);
    } catch (e) {
      K('IS', {}, e);
    }
  }
  function Za(a, b, c) {
    if (b || !R('s', a)) {
      if (!b && /[&#]deb=/.test(a)) {
        J = [];
        return;
      }
      E.s[a] = J;
      J = [];
    }
    c || jb(D, a);
  }
  function W(a, b) {
    J.push({ n: a, a: b });
  }
  function kb(a, b) {
    if (b.d) {
      b.n = b.g;
      b.a = b.d;
    } else if (b.h) {
      b.n = b.h;
      b.a = b.g;
    }
    var c;
    c = b.n != 'bc' ? [a].concat(b.a) : b.a;
    try {
      k[b.n].apply(h, c);
    } catch (d) {
      K('ECF', { n: b.n, a: b.a, s: a }, d);
    }
  }
  function jb(a, b) {
    if (l) {
      F.c[a] = 1;
      if (b) F.s[b] = 1;
    }
    F.stale = 1;
    setTimeout(lb, 0);
  }
  function mb(a) {
    var b = [];
    for (var c in F[a]) {
      sessionStorage['web-' + a + c] = '(' + google.stringify(R(a, c)) + ')';
      b.push(c);
    }
    if (b.length > 0) {
      c = p(a);
      c = c.concat(b);
      Ma(a, c);
    }
  }
  function nb(a) {
    try {
      mb(a);
    } catch (b) {
      var c = p('s'),
        d = Math.floor(c.length * google.j.sc);
      d = c.splice(1, d);
      Ma('s', c);
      c = 0;
      for (var e; (e = d[c++]); ) {
        delete E.s[e];
        sessionStorage.removeItem('web-s' + e);
      }
      try {
        mb(a);
      } catch (f) {
        K('SCSTSSAC', { p: a }, f);
        throw f;
      }
    }
  }
  function lb() {
    if (F.stale)
      try {
        if (l) {
          nb('c');
          nb('s');
        } else {
          var a = google.stringify(E);
          if (a.length > ka) {
            ca = g;
            try {
              var b = 0,
                c = 0;
              for (var d in E.s) b++;
              for (d in E.c) c++;
              google.ml(Error('jesr'), i, {
                _sn: 'JMCSE',
                _t: 'jesr',
                _s: b,
                _c: c,
                _l: a.length,
              });
            } catch (e) {}
          }
          document.getElementById('wgjc').value = '(' + a + ')';
        }
      } catch (f) {
        document.getElementById('wgjc').value = '({})';
        K('SE', { ss: !!window.sessionStorage }, f);
      } finally {
        F = { c: {}, s: {} };
      }
  }
  function ob() {
    var a = i;
    try {
      if (l) {
        E = { s: {}, c: { 1: k[1] } };
        for (var b = p('s'), c = p('c'), d = 0, e; (e = b[d++]); ) E.s[e] = 1;
        e = 0;
        for (var f; (f = c[e++]); ) (f == '1' && E.c[1]) || (E.c[f] = 1);
        a = b.length > 0 || c.length > 0;
      } else {
        d = document.getElementById('wgjc').value;
        if (d.length > ka) ca = g;
        a = d != '';
        E = eval(d);
      }
    } catch (j) {
      K('RC', {}, j);
    }
    E || (E = { s: {}, c: { 1: k[1] } });
    return a;
  }
  function Ua() {
    pb();
    if (google.timers && !google.timers.load.t) {
      google.rph && google.rph();
      google.timers.load.t = { start: google.time() };
    }
  }
  function pb() {
    if (!Ha) Ha = google.sn;
    google.sn = B == '#' ? Ha : 'web';
  }
  function _ac(a, b, c, d, e, f) {
    if (D != b && (w == 1 || V(f))) {
      if (!d) {
        E.c[b] = {};
        for (var j in a) E.c[b][j] = a[j];
      }
      if (c) {
        Ca = Ga = g;
        Ua();
        a = R('c', b).css;
        b = document.getElementById('gstyle');
        if (google.browser.product.IE)
          if (b && b.styleSheet) b.styleSheet.cssText = a;
          else document.styleSheets[0].cssText = a;
        else (b || document.getElementsByTagName('style')[0]).textContent = a;
      }
      I = 10;
    }
  }
  k.ac = _ac;
  function _pc(a, b, c, d, e, f, j) {
    if (D != c && (w == 1 || V(j))) {
      try {
        e || (R('c', c)[a] = b);
        if (d) {
          k.p(B, a, b, j, g);
          document.body.style.visibility = '';
        }
      } catch (m) {
        K('PC', { c: a, f: c }, m);
      }
      I = 11;
    }
  }
  k.pc = _pc;
  function _zc(a, b, c, d, e, f) {
    if (D != b && (w == 1 || V(f))) {
      if (!d) {
        d = R('c', b);
        for (var j in a) d[j] = a[j];
        w == 1 && jb(b);
      }
      if (c) D = b;
      else sa = b;
      I = 12;
    }
  }
  k.zc = _zc;
  function Wa(a, b) {
    if (R('c', a)) {
      k.ac({}, a, g, g, B, 0);
      Ca = i;
      k.pc('main', R('c', a).main, a, g, g, B, 0);
      k.zc({}, a, g, g, B, 0);
    } else {
      var c = Y('fp', b) || '1';
      K('CM', { fp: c });
      c != '1' ? cb(eb(b, 'fp', '1')) : $(b, { _c: 'rc' });
      return i;
    }
    return g;
  }
  function gb(a) {
    if (google.msg.send(3, [a])) {
      X(D);
      try {
        for (var b = R('s', a), c = 0, d; (d = b[c++]); ) kb(a, d);
        if (google.browser.product.IE) {
          b = ['pmocntr', 'pmocntr2'];
          c = 0;
          for (var e; (e = b[c++]); ) {
            var f = document.getElementById(e);
            if (f) f.style.display = 'none';
          }
        }
      } catch (j) {
        K('DPFC', { s: a }, j);
      }
    } else Z = 1;
  }
  function _xi() {
    if (google.y.first) {
      for (var a = 0, b; (b = google.y.first[a]); ++a) b();
      google.y.first = [];
    }
    google.x = function (c, d) {
      d && d.apply(c);
      return i;
    };
    $a();
  }
  k.xi = _xi;
  function qb() {
    try {
      var a = x.location.href,
        b = a.indexOf('?');
      return b >= 0 ? '#' + a.substr(b + 1) : '#';
    } catch (c) {
      K('FQS', {}, c);
      return B || '#';
    }
  }
  function Sa(a) {
    return !a && w == 1
      ? qb()
      : window.location.hash
      ? window.location.href.substr(window.location.href.indexOf('#'))
      : '#';
  }
  function eb(a, b, c) {
    b = RegExp('([?&]' + b + '=).*?([&#]|$)');
    return a.replace(
      b,
      '$1' + encodeURIComponent(c).replace(/\%20/g, '+') + '$2',
    );
  }
  function Ya() {
    try {
      var a = Y('q') || Y('as_q') || ra;
      a = google.msg.send(4, [a], a, h);
      if (a == h) return;
      for (var b = 0, c; (c = ['gs', 'bgs', 'f'][b++]); )
        if (document[c] && document[c].q.value != a) document[c].q.value = a;
    } catch (d) {
      K('PQ', {}, d);
    }
    k.trap();
  }
  var rb = [24, 0, 53, 74, 96, 96],
    sb = [28, 53, 20, 20, 71, 45];
  function tb(a, b, c, d) {
    a = {
      a: a.getElementsByTagName('a')[0],
      e: a,
      s: a.getElementsByTagName('span')[0],
      l: a.getElementsByTagName('span')[1],
    };
    a.a.href = wa.replace(/start=\d*/, 'start=' + b);
    a.s.style.backgroundPosition = -rb[c] + 'px 0';
    a.s.style.width = sb[c] + 'px';
    a.s.className = c == 2 ? 'csb' : 'csb ch';
    a.l.style.display = d;
    return a;
  }
  function Xa(a) {
    try {
      var b = Y('start', a) || 0;
      if (xa < b) b = xa;
      var c = document.getElementById('nav'),
        d = document.getElementById('foot');
      if (c) {
        var e = c.getElementsByTagName('td'),
          f = Math.floor(za / H) + 1,
          j = Math.floor(b / H) + 1,
          m = Math.ceil(xa / H);
        a = b < H;
        b = j >= m;
        if (f < m) {
          c.style.display = '';
          var t = e[1],
            s = e[e.length - 1];
          tb(e[0], Math.max((j - 2) * H, 0), a ? 0 : 1, a ? 'none' : 'block');
          tb(s, j * H, b ? 5 : 4, b ? 'none' : 'block');
          c = 1;
          for (var v = e.length - 1; c < v; c++) s.parentNode.removeChild(e[1]);
          for (c = f; c <= m; c++) {
            e = c == j;
            var S = tb(t.cloneNode(g), (c - 1) * H, e ? 2 : 3, '');
            S.e.className = e ? 'cur' : '';
            S.a.style.textDecoration = e ? 'none' : '';
            S.l.innerHTML = c;
            s.parentNode.insertBefore(S.e, s);
          }
        } else c.style.display = 'none';
      }
      d.style.visibility = 'visible';
    } catch (zb) {
      K('RNB', {}, zb);
    }
  }
  function ub(a) {
    ta = RegExp('^' + a);
    G = RegExp('(^' + a + '|^)/search(\\?|$)');
    ua = RegExp('(^' + a + '|^)/aclk\\?');
    va = RegExp('(^' + a + '|^)/url\\?(.*&)?sa=(X|t|U)');
  }
  function vb() {
    if (window.event && typeof window.event.button == 'number')
      wb = window.event.button;
  }
  var wb;
  function xb(a) {
    if (!q) return g;
    a = a || window.event;
    if (!google.msg.send(2, [a])) {
      a.preventDefault && a.preventDefault();
      a.cancelBubble = g;
      return i;
    }
    for (
      var b = a.target || a.srcElement, c;
      b && b.nodeName.toLowerCase() != 'body';

    ) {
      if (b.nodeName.toLowerCase() == 'a') {
        c = b;
        break;
      }
      b = b.parentNode;
    }
    if (!c) return g;
    b = i;
    if (!google.njr) {
      var d = '';
      if (
        va.test(c.href) ||
        (ua.test(c.href) &&
          /(\\?|&)adurl=/.test(c.href) &&
          !/(\\?|&)q=/.test(c.href))
      ) {
        /(\\?|&)rct=j/.test(c.href) || (d += '&rct=j');
        if (!/(\\?|&)q=/.test(c.href)) {
          d += '&q=' + encodeURIComponent(Y('q') || Y('as_q') || ra);
          d = d.substring(0, 1948 - c.href.length);
        }
        b = g;
      }
      if (d) {
        var e = c.href.indexOf('&ei=');
        if (e >= 0)
          c.href = [c.href.substr(0, e), d, c.href.substr(e)].join('');
        else c.href += d;
      }
    }
    if (
      a.altKey ||
      a.ctrlKey ||
      a.shiftKey ||
      a.metaKey ||
      (a.button && a.button != 0) ||
      wb > 1
    ) {
      if (b && !/(\\?|&)cad=/.test(c.href)) c.href += '&cad=rja';
      return g;
    }
    if (c.target) {
      if (b && !/(\\?|&)cad=/.test(c.href)) c.href += '&cad=rjt';
      return g;
    }
    if (
      G.test(c.href) &&
      c.getAttribute('href') != '#' &&
      !/\bnj\b/.test(c.className)
    ) {
      c = Ka(c.href, g);
      if (c === i) {
        a.preventDefault && a.preventDefault();
        a.cancelBubble = g;
      }
      return c;
    } else if (/&rct=j/.test(c.href))
      try {
        r = g;
        k.oldNav(c.href, w == 0 ? x : undefined);
        a.preventDefault && a.preventDefault();
        a.cancelBubble = g;
        return i;
      } catch (f) {
        return g;
      }
  }
  function yb() {
    if (w == 0 && u >= 8)
      for (
        var a = document.getElementsByTagName('iframe'), b = 0, c = a.length;
        b < c;
        b++
      )
        if (a[b].contentWindow == x) {
          c = document.createElement('div');
          c.style.display = 'none';
          a[b].parentNode.insertBefore(c, a[b]);
          return;
        }
  }
  var Ab = {
    aq: 1,
    aqi: 1,
    aql: 1,
    btnG: 1,
    client: 1,
    cp: 1,
    ech: 1,
    expIds: 1,
    gs_rfai: 1,
    hs: 1,
    oq: 1,
    p_deb: 1,
    pbx: 1,
    pdl: 1,
    pf: 1,
    pnp: 1,
    pq: 1,
    prmdo: 1,
    psi: 1,
    sclient: 1,
    site: 1,
    source: 1,
    sugexp: 1,
    tbo: 1,
    tch: 1,
    tok: 1,
    wrapid: 1,
    xhr: 1,
  };
  function Bb(a, b) {
    if (!a) return a;
    var c = a.substring(a.indexOf('?') + 1);
    c = c.split('&');
    for (var d = [], e = {}, f = 0; f < c.length; ++f) {
      var j = c[f],
        m = j.split('=');
      if (m.length == 2 && !Ab[m[0]] && (!b || !b[m[0]]) && !e[m[0]]) {
        m[0] == 'q' ? d.push(j.toLowerCase().replace(/\+/g, ' ')) : d.push(j);
        e[m[0]] = g;
      }
    }
    d.sort();
    return decodeURIComponent(d.join('&'));
  }
  k.ckc = Bb;
  function Cb() {
    return y;
  }
  k.gt = Cb;
  function Db(a, b, c) {
    var d = function (f) {
      return f != 1;
    };
    d = google.msg.send(25, Array.prototype.slice.call(arguments), 1, d);
    if (d != 1) {
      var e = typeof c == 'string' ? c.replace(/^\/search\?/, '#') : B;
      $(e, { _c: b }, d == 2);
    }
  }
  function Eb(a) {
    for (
      var b = '<script>',
        c = '</script>',
        d = a.indexOf(b),
        e = a.indexOf(c),
        f = [];
      d != -1 && e != -1;

    ) {
      d = a.substring(d + 8, e);
      d.length > 0 && f.push(d);
      e += 9;
      d = a.indexOf(b, e);
      e = a.indexOf(c, e + 8);
    }
    return f;
  }
  function Fb(a) {
    var b = '';
    if (a)
      if ((a = a.match(/<title>(.*?)<\/title>/)) && a[1]) {
        b = document.createElement('div');
        b.innerHTML = a[1];
        b = b.textContent ? b.textContent : b.innerText;
      }
    return b;
  }
  function Gb() {
    var a = g;
    try {
      var b = [{}, {}, {}, {}];
      b[0][5] = 1;
      b[0][0] = g;
      b[1][5] = 4;
      b[1][0] = g;
      b[2][5] = 3;
      b[2][3] = 5;
      b[3][5] = 2;
      b[3][0] = g;
      y = window.google.gtr(b);
      y._rce(Db);
      a = y._o();
      Hb(y);
    } catch (c) {
      return i;
    }
    try {
      if (!y._p()) {
        b = [{}, {}];
        b[0][5] = 1;
        b[0][0] = g;
        b[1][5] = 3;
        b[1][3] = 1;
        if ((z = window.google.gtr(b))) {
          z._rce(Db);
          z._o() && Hb(z);
        }
      }
    } catch (d) {
      z = h;
    }
    return a;
  }
  function Hb(a) {
    function b(c, d, e, f, j) {
      r = g;
      if (!google.msg.send(1, [e, f, j])) {
        if (f && A[e]) A[e] = (typeof A[e] == 'string' ? A[e] : '') + c;
        else f || delete A[e];
        Z = 1;
        return g;
      }
      j || (Q = g);
      if (f && !A[e]) {
        A[e] = g;
        k.ss = T();
        if (d) c = d();
        na[e] = i;
      } else if (!f && !A[e]) {
        k.ss = T();
        if (d) c = d();
        na[e] = i;
      } else if (!f && A[e]) {
        if (typeof A[e] == 'string') c = A[e] + c;
        delete A[e];
      } else if (typeof A[e] == 'string') {
        c = A[e] + c;
        A[e] = g;
      }
      var m;
      try {
        if (x.window.document) m = x.window;
      } catch (t) {
        $(B, { _c: 'st' });
        return i;
      }
      Da = e.indexOf('&pf=') > 0;
      Ia = '';
      d = Eb(c);
      for (var s = 0; s < d.length; ++s) {
        var v = d[s];
        if (!na[e]) {
          na[e] = g;
          oa[e] = i;
          Ia || (Ia = Fb(c));
          v = v.replace(/location.href/gi, '"' + e + '"');
        }
        if (!oa[e] && /var je=parent.google.j;/.test(v)) oa[e] = g;
        Ib(m, v, B);
      }
      if (f) {
        f = c.lastIndexOf('</script>');
        if (f == -1) f = 0;
        else f += 9;
        if (f < c.length) {
          c = c.substr(f);
          A[e] = c;
        }
      } else {
        if (!oa[e]) {
          google.msg.send(20, [e]) && $(B, { _c: 'ir' }, g);
          return i;
        }
        google.j.l();
        window.setTimeout(function () {
          Jb(m);
        }, 0);
        if (!google.msg.send(0, [e, j])) return g;
      }
      return g;
    }
    a._rd(b, '/search');
    a._ckf(Bb, '/search');
  }
  function Ib(a, b, c) {
    try {
      var d = a.document.createElement('script');
      d.text = b;
      a.jesrScriptTags = a.jesrScriptTags || [];
      a.jesrScriptTags.push(d);
      a.document.body.appendChild(d);
    } catch (e) {
      c ? $(c, { _c: 'aist' }, g) : K('NSAIST', {}, e);
    }
  }
  function Jb(a) {
    var b = 'gcscript';
    a[b] ||
      (a[b] = function () {
        if (a.jesrScriptTags)
          for (; a.jesrScriptTags.length; )
            google.dom.remove(a.jesrScriptTags.shift());
      });
    b = 'try{window.' + b + '()}catch(e){}';
    Ib(a, b);
  }
  function Kb() {
    k.init = i;
    try {
      if (google.browser.engine.WEBKIT && x) {
        var a = document.querySelector('iframe[name="wgjf"]');
        if (a && a.src == '/blank.html' && !google.fl) {
          a.onload = function () {
            try {
              google.fl = g;
              a.onload = k.l;
              Kb();
            } catch (v) {
              K('INIT3', {}, v);
              q = i;
              window._gjp && window._gjuc && window._gjp();
            }
          };
          return;
        }
      }
    } catch (b) {
      K('INIT4', {}, b);
      q = i;
      window._gjp && window._gjuc && window._gjp();
      return;
    }
    if (
      (q =
        k.en &&
        k[1] &&
        encodeURIComponent &&
        x &&
        google.rein &&
        google.dstr &&
        (w == 0 || aa))
    )
      q = Gb();
    if (q)
      for (var c = Pa.concat(R('c', '1').co), d = 0; d < c.length; d++)
        q &= !!document.getElementById(c[d]);
    try {
      if (q) {
        B = w == 0 ? '#' : Sa();
        U = google.time();
        k.ss = k.m = T();
        var e = window.location.href.match(/.*?:\/\/[^\/]*/)[0];
        ub(e);
        k.trap();
        google.listen(document, 'click', xb);
        google.browser.product.IE && google.listen(document, 'mousedown', vb);
        window.location.hash && window.location.hash != '#' && X(D);
        var f = !ob();
        ib();
        window.wgjp && window.wgjp();
        if (w == 1) {
          c = 0;
          for (var j; (j = k.pl[c++]); ) {
            var m = k[j[0]].apply(h, j[1]);
            if (j[0] == 'ad' && !m) k.pl = [];
          }
        }
        if (w == 1 && B == '#')
          try {
            x.document.title = document.title;
          } catch (t) {}
        k.oldNav = google.nav.go;
        google.nav.go = function (v, S) {
          if (!G.test(v) || Ka(v, g)) k.oldNav(v, S);
        };
        google.getURIPath = function () {
          return wa;
        };
        if (
          u >= 8 ||
          (google.browser.engine.WEBKIT &&
            typeof window.onhashchange != 'undefined')
        ) {
          db(1, f);
          window.onhashchange = db;
        } else fb(1, f);
        if (B == '#') {
          document.body.style.visibility = '';
          ya = g;
        }
        yb();
        k.init = g;
        google.med && google.med('jesrLoaded');
      } else {
        google.j.en != 0 && w == 0 && K('INIT1', {});
        window._gjp && window._gjuc && window._gjp();
      }
    } catch (s) {
      K('INIT2', {}, s);
      q = i;
      window._gjp && window._gjuc && window._gjp();
    }
  }
  Kb();
})();
(function () {
  var d = true,
    e = false;
  var f,
    g = window.google.j,
    h = ['vid', 'isch', 'nws', 'bks', 'blg', 'mbl', 'dsc'],
    j = e,
    l = d,
    m = 0,
    n = { _s: {}, _stt: {}, _t: {} },
    o = function (a) {
      return (f = a);
    },
    p = function (a, c) {
      var b = c.match('[&?#]' + a + '=([^&]*)');
      return b ? b[1] || '' : null;
    },
    q = function (a) {
      if ((a = p('tbs', a)))
        for (var c = 0; c < h.length; ++c) if (a.indexOf(h[c]) != -1) return e;
      return d;
    },
    s = function (a, c, b) {
      b || (m = 0);
      if (f && a.indexOf('&fp=') == -1) {
        c || (f = undefined);
        return d;
      }
      b = g && g.ckc;
      if (!b) return d;
      a = b(a, { safe: 1, fp: 1 });
      b = b(f, { safe: 1, fp: 1 });
      if (a == b && !c) f = undefined;
      return a == b;
    },
    t = function (a) {
      a.indexOf('&pf=') != -1 &&
        google.log('1', ['1&sqi=3&ei=', google.kEI, '&q=', p('q', a)].join(''));
      return d;
    },
    u = function (a) {
      if (!l) return a;
      var c = a;
      g && g.hsa(document.gs || document.f, e, e, d);
      var b = google.jesrstate;
      if (!b) return a;
      if (!q(b)) return a;
      a = a.replace('/complete/search', '/s');
      a = a.replace(/([&\?])client=([^&]*)/, '$1sclient=$2');
      b = b.substring(1);
      var r = [a, 'pf=i'];
      b = b.split('&');
      for (var i = 0; i < b.length; ++i) {
        var k = b[i].split('=');
        k = a.search('[&^]' + k[0] + '=');
        k == -1 && r.push(b[i]);
      }
      a = r.join('&');
      if (n._t() == 4) {
        n._s(a);
        return c;
      } else return a;
    },
    v = function (a) {
      if (l) {
        l = e;
        a = ['1&dpf=', a, '&ei=', google.kEI, '&expid=', google.kEXPI].join('');
        google.log('1', a);
        g && g.sjcv && g.sjcv({ sendSlowCSI: d });
      }
    },
    w = function (a, c) {
      if (a == 2 && c == 15) v('s');
      else a == 1 && ++m >= 3 && v('e');
      return e;
    },
    x = function (a, c, b) {
      if (typeof b == 'string') {
        a = g.ckc;
        b = a(b, { safe: 1, fp: 1 });
        a = a(f, { safe: 1, fp: 1 });
        if (b != a) return 1;
        if (c == 21 || c == 0 || c == 1 || c == 12 || c == 9) return 2;
      }
      return 1;
    },
    y = function (a) {
      a = a || window.event;
      a.cancelBubble = d;
      a.stopPropagation && a.stopPropagation();
      a = google.dom.get('#po-box').style;
      if (a.display == 'none') {
        a.display = '';
        google.listen(document.body, 'click', y);
      } else {
        a.display = 'none';
        google.unlisten(document.body, 'click', y);
      }
    },
    z = function (a) {
      if (!j) {
        google.psy = { t: y };
        if (g && g.init) {
          google.msg.listen(0, t, 1, s, 5, o, 25, x, 16, u, 17, w);
          var c = window.google.ac;
          c && c.sv && c.sv({ allowPSuggest: e, addPbx: d });
          c && c.uhi && c.uhi();
          var b = window.location.href.indexOf('#');
          if (b != -1) f = '/search?' + window.location.href.substring(b + 1);
          if (g && g.gt) {
            (n = g.gt()) && c && c.st && c.st(n);
            if (n && n._stt && a)
              typeof a.slowXfer == 'number'
                ? n._stt([0, 0, 0], [a.slowXfer, 0, 0])
                : n._stt(
                    [a.avgTtfc || 0, a.avgTtlc || 0, a.avgCbt || 0],
                    [a.maxTtfc || 0, a.maxTtlc || 0, a.maxCbt || 0],
                  );
          }
          j = d;
        }
      }
    };
  google.register(92, { init: z, bookmarkInit: z, jesrLoaded: z });
})();
if (google.y.first) {
  for (var a = 0, b; (b = google.y.first[a]); ++a) b();
  delete google.y.first;
}
for (a in google.y)
  google.y[a][1] ? google.y[a][1].apply(google.y[a][0]) : google.y[a][0].go();
google.y.x = google.x;
google.x = function (d, c) {
  c && c.apply(d);
  return false;
};
google.y.first = [];
(function () {
  if (window.google) {
    window.google.a = {};
    window.google.c = 1;
    var j = function (a, b, e) {
        b = a.t[b];
        a = a.t.start;
        if (b && (a || e)) {
          if (e != undefined) a = e;
          return b > a ? b - a : a - b;
        }
      },
      k = function (a, b, e) {
        var d = '';
        if (window.google.pt) {
          d += '&srt=' + window.google.pt;
          delete window.google.pt;
        }
        var c = document.getElementById('csi');
        if (c) {
          var f;
          if (window.google._bfr != undefined) f = window.google._bfr;
          else {
            f = c.value;
            window.google._bfr = f;
            c.value = 1;
          }
          if (f) return '';
        }
        if ((c = window.chrome))
          if ((c = c.loadTimes)) {
            if (c().wasFetchedViaSpdy) d += '&p=s';
            if (c().wasNpnNegotiated) d += '&npn=1';
            if (c().wasAlternateProtocolAvailable) d += '&apa=1';
          }
        if (a.b) d += '&' + a.b;
        if (window.parent != window) d += '&wif=1';
        c = a.t;
        f = c.start;
        var g = [];
        for (var h in c) h != 'start' && f && g.push(h + '.' + j(a, h));
        delete c.start;
        if (b) for (var i in b) d += '&' + i + '=' + b[i];
        return (a = [
          e ? e : '/csi',
          '?v=3',
          '&s=' + (window.google.sn || 'GWS') + '&action=',
          a.name,
          '',
          d,
          '&rt=',
          g.join(','),
        ].join(''));
      };
    window.google.report = function (a, b, e) {
      a = k(a, b, e);
      if (!a) return '';
      b = new Image();
      var d = window.google.c++;
      window.google.a[d] = b;
      b.onload = b.onerror = function () {
        delete window.google.a[d];
      };
      b.src = a;
      b = null;
      return a;
    };
  }
  function l() {
    function a(c) {
      try {
        var f = window.external[c];
        if (f != undefined) {
          google.kCSI[c] = f;
          return true;
        }
      } catch (g) {}
      return false;
    }
    for (
      var b = [
          'ist_rc',
          'ist_rn',
          'ist_nr',
          'ist_cdts',
          'ist_dp',
          'ist_rrx',
          'ist_rxr',
          'ist_rs',
          'ist_sr',
        ],
        e = 0,
        d;
      (d = b[e++]);

    )
      if (a(d) === false) break;
  }
  if (google.timers && google.timers.load.t) {
    if (!google.nocsixjs) google.timers.load.t.xjsee = google.time();
    window.setTimeout(function () {
      if (google.timers.load.t) {
        google.timers.load.t.xjs = google.time();
        l();
        google.timers.load.t.ol &&
          google.report(google.timers.load, google.kCSI);
      }
    }, 0);
  }
})();
