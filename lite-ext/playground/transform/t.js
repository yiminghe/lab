KISSY.FpTransform = function (line, toy, deta, range, container, callback) {
    var S = KISSY, ua = KISSY.UA, DOM = S.DOM, Event = S.Event;

    var doc = document;

    var prefix = ["Ms", "Webkit", "Moz", "O", ""];

    var d = DOM.get(line);
    container = DOM.get(container);

    var rotate = KISSY.FpTransform.rotate;

    var deg = 0,
        dragging = 0,
        t2 = DOM.get(toy),
        stop = 0;

    S.each(prefix, function (p) {
        S.one(d).css(p + "TransformOrigin", "50% 0");
    });

    var anim = setInterval(function () {
        if (stop) {
            return;
        }
        if (deg > range) {
            deta = -1;
        }
        else if (deg < -range) {
            deta = 1;
        }
        deg += deta;
        rotate(d, deg);
    }, 30);


    Event.on(t2, "mouseenter", function () {
        stop = 1;
    });

    Event.on(t2, "mouseleave", function () {
        if (dragging) {
            stop = 1;
        } else {
            stop = 0;
        }
    });

    Event.on(t2, "mousedown", function (e) {
        DOM.css(doc.body, {
            cursor:"move"
        });
        dragging = 1;
        e.preventDefault();
    });

    function getRegion(t) {
        var xy = DOM.offset(t);
        xy.bottom = xy.top + t.offsetHeight;
        xy.right = xy.left + t.offsetWidth;
        return xy;
    }

    function inRegion(t2, container) {
        var r2 = getRegion(t2),
            c = getRegion(container);
        if (r2.left >= c.left && r2.right <= c.right && r2.bottom <= c.bottom && r2.top >= c.top) {
            return 1;
        }
        return 0;
    }

    var onMouseMove, onMouseUp;

    Event.on(doc, "mousemove", onMouseMove = function (e) {
        if (dragging) {
            if (t2.parentNode !== doc.body) {
                doc.body.appendChild(t2);
            }
            DOM.offset(t2, {
                left:e.pageX,
                top:e.pageY
            });
        }
    });

    Event.on(doc, "mouseup", onMouseUp = function (e) {
        dragging = 0;
        doc.body.style.cursor = "";
        if (inRegion(t2, container)) {
            container.appendChild(t2);
            t2.style.position = "static";
            t2.style.cursor = "";
            clearInterval(anim);
            Event.remove(t2);
            Event.remove(doc, 'mouseup', onMouseUp);
            Event.remove(doc, 'mousemove', onMouseMove);
            if (callback) {
                callback();
            }
        } else {
            DOM.get("#t").appendChild(t2);
            DOM.css(t2, "bottom", "0");
            DOM.css(t2, "left", "");
            DOM.css(t2, "top", "");
            stop = 0;
        }
    });
};

KISSY.FpTransform.rotate = function () {

    var S = KISSY, ua = KISSY.UA, DOM = S.DOM;

    var prefix = ["Ms", "Webkit", "Moz", "O", ""];

    function generateMatrix(angle) {
        var rad = angle * (Math.PI / 180),
            m11 = Math.cos(rad),
            m12 = -1 * Math.sin(rad),
            m21 = Math.sin(rad);
        return [
            [m11, m12],
            [m21, m11]
        ];
    }


    function rotate(d, angle) {
        if (!d.orig) {
            d.orig = {
                height:d.offsetHeight,
                width:d.offsetWidth,
                marginTop:parseInt(DOM.css(d, "marginTop")),
                marginLeft:parseInt(DOM.css(d, "marginLeft"))
            };
        }
        var style = d.style;
        var matrix = generateMatrix(angle);
        if (ua.ie && ua.ie < 9) {
            style.filter = 'progid:DXImageTransform.Microsoft.Matrix(M11=' + matrix[0][0] + ',M12=' + matrix[0][1] + ',M21='
                + matrix[1][0] + ',M22=' + matrix[1][1] + ',SizingMethod="auto expand")';
            //style.marginTop = (orig.height-d.offsetHeight) /2;
            //style.marginLeft = (orig.width-d.offsetWidth) /2;
            setXy(0.5, 0, matrix, d);
        } else {
            S.each(prefix, function (p) {
                style[p + "Transform"] = "rotate(" + angle + "deg)";
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

    function setXy(px, py, m, d) {
        var orig = d.orig;
        var centerX = orig.width / 2,
            centerY = orig.height / 2;

        var originX = px * orig.width,
            originY = py * orig.height;

        var diffX = centerX - originX,
            diffY = centerY - originY;

        var transformed = multiple(m, [
            [diffX],
            [diffY]
        ]),
            transformedX = transformed[0][0] + originX,
            transformedY = transformed[1][0] + originY;

        var diff = [transformedX - d.offsetWidth / 2, transformedY - d.offsetHeight / 2];

        DOM.css(d, {
            marginTop:orig.marginTop + diff[1],
            marginLeft:orig.marginTop + diff[0]
        });
    }

    return rotate;
}();