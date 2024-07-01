KISSY.FpTransform = function (line, deta, range, interval) {
  var S = KISSY,
    ua = KISSY.UA,
    UA = ua,
    DOM = S.DOM,
    STYLE = 'style',
    Event = S.Event;

  var doc = document;

  var ieVersion = doc.documentMode || ua.ie;

  var prefix = ['ms', 'Webkit', 'Moz', 'O', ''];

  var d = DOM.get(line);

  var rotate = KISSY.FpTransform.rotate;

  var deg = 0,
    stop = 0;

  S.each(prefix, function (p) {
    S.one(d).css(p + 'TransformOrigin', '50% 0');
  });

  var anim = setInterval(function () {
    if (stop) {
      return;
    }
    if (deg > range) {
      deta = -1;
    } else if (deg < -range) {
      deta = 1;
    }
    deg += deta;
    rotate(d, deg);
  }, interval);
};

KISSY.FpTransform.rotate = (function () {
  var S = KISSY,
    ua = KISSY.UA,
    DOM = S.DOM;

  var prefix = ['ms', 'Webkit', 'Moz', 'O', ''];

  var ieVersion = document.documentMode || ua.ie;

  function generateMatrix(angle, w, h) {
    var rad = angle * (Math.PI / 180),
      c = Math.cos(rad),
      s = 1 * Math.sin(rad);
    var matrix = multiple(
      [
        [1, 0, w],
        [0, 1, h],
        [0, 0, 1],
      ],
      multiple(
        [
          [c, -s, 0],
          [s, c, 0],
          [0, 0, 1],
        ],
        [
          [1, 0, -w],
          [0, 1, -h],
          [0, 0, 1],
        ],
      ),
    );

    if (Math.abs(matrix[0][2] - (-w * c + h * s + w)) > 0.1) {
      alert(1);
    }
    return matrix;
  }

  function rotate(d, angle) {
    if (!d.orig) {
      d.orig = {
        height: d.offsetHeight,
        width: d.offsetWidth,
      };
    }
    var style = d.style;

    if (ieVersion && ieVersion < 9) {
      var matrix = generateMatrix(angle, 0.5 * d.orig.width, 0 * d.orig.height);

      style.filter =
        'progid:DXImageTransform.Microsoft.Matrix(' +
        'Dx=' +
        matrix[0][2] +
        ',Dy=' +
        matrix[1][2] +
        ',' +
        'M11=' +
        matrix[0][0] +
        ',M12=' +
        matrix[0][1] +
        ',M21=' +
        matrix[1][0] +
        ',M22=' +
        matrix[1][1] +
        //',SizingMethod="auto expand"'+

        ')';
    } else {
      S.each(prefix, function (p) {
        style[p + 'Transform'] = 'rotate(' + angle + 'deg)';
      });
    }
  }

  function multiple(m1, m2) {
    var m = [];

    function set(x, y, v) {
      if (!m[x]) {
        m[x] = [];
      }
      m[x][y] = v;
    }

    var r1 = m1.length,
      r2 = m2.length,
      c2 = m2[0].length;

    for (var i = 0; i < r1; i++) {
      for (var k = 0; k < c2; k++) {
        var sum = 0;
        for (var j = 0; j < r2; j++) {
          sum += m1[i][j] * m2[j][k];
        }

        set(i, k, sum);
      }
    }

    return m;
  }

  return rotate;
})();
