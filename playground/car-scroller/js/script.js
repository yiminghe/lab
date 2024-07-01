(function () {
  KISSY.ready(function (S) {
    var car = {};

    /**
     * 版本
     * @type {String}
     */
    car.version = '1.0';

    /**
     * 数据
     * @type {Object}
     */
    car._data = {
      jid: {
        main: 'J_main',
        dummy: 'J_dummy',
        inner: 'J_inner',
        header: 'J_header',
        btn01: 'J_btn01',
        btn02: 'J_btn02',
      },

      cid: {
        frame: '.J_frame',
      },

      step: 120,
    };

    /**
     * 工具
     * @type {Object}
     */
    car._util = {};

    /**
     * 函数
     * @type {Object}
     */
    car._fn = {};

    (function (data, util) {
      var UA = S.UA;

      /**
       * 通过 ID 生成 KISSY Node
       * @param  {String} jid
       * @return {Object}
       */
      util.$ = function (jid) {
        return S.one('#' + jid);
      };

      /**
       * 设置滚动步长
       * @param  {String} step
       */
      util.setStep = function (step) {
        data.step = parseInt(step);
      };
    })(car._data, car._util);

    (function (data, util, fn) {
      var jid = data.jid,
        cid = data.cid;

      var $main = util.$(jid.main),
        $frames = $main.children(cid.frame),
        $header = util.$(jid.header),
        $dummy = util.$(jid.dummy);

      /**
       * 设置虚拟滚动窗高度
       */
      fn.setInnerHeight = function () {
        var $inner = util.$(jid.inner),
          innerH = 0;

        S.each($frames, function (item) {
          var $frame = S.one(item),
            frameH = $frame.height();

          innerH += frameH;
        });

        $inner.css('height', innerH);
      };

      /**
       * 重置当前帧信息
       * @param  {Number} dummyTop
       * @return {Object}
       */
      fn.resetFrameInfo = function (dummyTop) {
        var current = {};

        S.each($frames, function (item) {
          var $frame = S.one(item),
            frameTop = parseInt($frame.css('top'));

          if (dummyTop > frameTop) {
            util.setStep($frame.attr('data-step'));
            current.frame = $frame;
            current.top = frameTop;
          }
        });

        return current;
      };

      /**
       * 绑定虚拟窗口滚动事件
       */
      fn.bindDummyScroll = function () {
        var headerTop = $header.height(),
          dummyTop;

        $dummy.on('scroll', function () {
          (dummyTop = $dummy.scrollTop()),
            (current = fn.resetFrameInfo(dummyTop)),
            (currentTop = current.top);

          $main.css(
            'top',
            -currentTop +
              parseInt((dummyTop - currentTop) / data.step) * -data.step +
              headerTop,
          );
        });
      };

      /**
       * 绑定导航按钮触发事件
       */
      fn.bindNavBtnEvent = function () {
        var $btn01 = util.$(jid.btn01),
          $btn02 = util.$(jid.btn02);

        $btn01.on('click', function () {
          KISSY.Anim($dummy, { scrollTop: 0 }, 10).run();
        });

        $btn02.on('click', function () {
          KISSY.Anim($dummy, { scrollTop: 32280 }, 10).run();
        });
      };

      /**
       * 初始化
       */
      fn.init = function () {
        fn.setInnerHeight();
        fn.bindDummyScroll();
        fn.bindNavBtnEvent();
      };

      fn.init();
    })(car._data, car._util, car._fn);
  });
})();
