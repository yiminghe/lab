/**
 * modified from ckeditor,common utils for kissy editor
 * @modifier: <yiminghe@gmail.com>
 */
KISSY.Editor.add("utils", function(KE) {

    var S = KISSY,Node = S.Node,DOM = S.DOM,debug = S.Config.debug,UA = S.UA;
    KE.Utils = {

        debugUrl:function (url) {
            if (!debug) return url.replace(/\.(js|css)/i, "-min.$1");
            if (debug === "dev") {
                return  "../src/" + url;
            }
            return  url;
        }
        ,
        /**
         * 懒惰一下
         * @param obj
         * @param before
         * @param after
         */
        lazyRun:function(obj, before, after) {
            var b = obj[before],a = obj[after];
            obj[before] = function() {
                b.apply(this, arguments);
                obj[before] = obj[after];
                return a.apply(this, arguments);
            };
        }
        ,

        getXY:function(x, y, srcDoc, destDoc) {
            var currentWindow = srcDoc.defaultView || srcDoc.parentWindow;

            //x,y相对于当前iframe文档,防止当前iframe有滚动条
            x -= DOM.scrollLeft(currentWindow);
            y -= DOM.scrollTop(currentWindow);
            if (destDoc) {
                var refWindow = destDoc.defaultView || destDoc.parentWindow;
                if (currentWindow != refWindow && currentWindow.frameElement) {
                    //note:when iframe is static ,still some mistake
                    var iframePosition = DOM._4e_getOffset(currentWindow.frameElement, destDoc);
                    x += iframePosition.left;
                    y += iframePosition.top;
                }
            }
            return {left:x,top:y};
        }
        ,

        tryThese : function() {

            var returnValue;
            for (var i = 0, length = arguments.length; i < length; i++) {
                var lambda = arguments[i];
                try {
                    returnValue = lambda();
                    break;
                }
                catch (e) {
                }
            }
            return returnValue;
        }
        ,
        arrayCompare: function(arrayA, arrayB) {
            if (!arrayA && !arrayB)
                return true;

            if (!arrayA || !arrayB || arrayA.length != arrayB.length)
                return false;

            for (var i = 0; i < arrayA.length; i++) {
                if (arrayA[ i ] !== arrayB[ i ])
                    return false;
            }

            return true;
        }
        ,
        getByAddress : function(doc, address, normalized) {
            var $ = doc.documentElement;

            for (var i = 0; $ && i < address.length; i++) {
                var target = address[ i ];

                if (!normalized) {
                    $ = $.childNodes[ target ];
                    continue;
                }

                var currentIndex = -1;

                for (var j = 0; j < $.childNodes.length; j++) {
                    var candidate = $.childNodes[ j ];

                    if (normalized === true &&
                        candidate.nodeType == 3 &&
                        candidate.previousSibling &&
                        candidate.previousSibling.nodeType == 3) {
                        continue;
                    }

                    currentIndex++;

                    if (currentIndex == target) {
                        $ = candidate;
                        break;
                    }
                }
            }

            return $ ? new Node($) : null;
        }
        ,

        clearAllMarkers:function(database) {
            for (var i in database)
                database[i]._4e_clearMarkers(database, true);
        }
        ,
        htmlEncodeAttr : function(text) {
            return text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/, '&gt;');
        }
        ,
        ltrim:function(str) {
            return str.replace(/^\s+/, "");
        }
        ,

        rtrim:function(str) {
            return str.replace(/\s+$/, "");
        }
        ,
        trim:function(str) {
            return this.ltrim(this.rtrim(str));
        }
        ,
        mix:function() {
            var r = {};
            for (var i = 0; i < arguments.length; i++) {
                var ob = arguments[i];
                r = S.mix(r, ob);
            }
            return r;
        }
        ,
        isCustomDomain : function() {
            if (!UA.ie)
                return false;

            var domain = document.domain,
                hostname = window.location.hostname;

            return domain != hostname &&
                domain != ( '[' + hostname + ']' );	// IPv6 IP support (#5434)
        },

        addSeparator:function(bar) {
            new S.Node('<span class="ke-toolbar-separator">&nbsp;</span>').appendTo(bar);
        },
        duplicateStr:function(str, loop) {
            return new Array(loop + 1).join(str);
        },
        /**
         * Throttles a call to a method based on the time between calls.
         * @method throttle
         * @for YUI
         * @param fn {function} The function call to throttle.
         * @param ms {int} The number of milliseconds to throttle the method call. Defaults to 150
         * @return {function} Returns a wrapped function that calls fn throttled.
         * @since 3.1.0
         */

        /*! Based on work by Simon Willison: http://gist.github.com/292562 */

        throttle : function(fn, scope, ms) {
            ms = ms || 150;

            if (ms === -1) {
                return (function() {
                    fn.apply(scope, arguments);
                });
            }

            var last = (new Date()).getTime();

            return (function() {
                var now = (new Date()).getTime();
                if (now - last > ms) {
                    last = now;
                    fn.apply(scope, arguments);
                }
            });
        },
        buffer : function(fn, scope, ms) {
            ms = ms || 0;
            var timer = null;
            return (function() {
                timer && clearTimeout(timer);
                var args = arguments;
                timer = setTimeout(function() {
                    return fn.apply(scope, args);
                }, ms);
            });
        },
        isNumber:function(n) {
            return /^\d+(.\d+)?$/.test(S.trim(n));
        },
        verifyInputs:function(inputs, warn) {
            for (var i = 0; i < inputs.length; i++) {
                var input = DOM._4e_wrap(inputs[i]),
                    v = S.trim(input.val()),
                    verify = input.attr("data-verify"),
                    warning = input.attr("data-warning");
                if (verify &&
                    !new RegExp(verify).test(v)) {
                    alert(warning);
                    return;
                }
            }
            return true;
        },
        sourceDisable:function(editor, plugin) {
            editor.on("sourcemode", plugin.disable, plugin);
            editor.on("wysiwygmode", plugin.enable, plugin);
        },
        resetInput:function(inp) {
            var placeholder = inp.attr("placeholder");
            if (placeholder && !UA.webkit) {
                inp.val(placeholder);
                inp.addClass(".ke-input-tip");
            }
        },
        placeholder:function(inp, tip) {
            inp.attr("placeholder", tip);
            if (UA.webkit) {
                return;
            }
            inp.on("blur", function() {
                if (!S.trim(inp.val())) {
                    inp.val(tip);
                    inp.addClass(".ke-input-tip");
                }
            });
            inp.on("focus", function() {
                if (S.trim(inp.val()) == tip) {
                    inp.val("");
                }
                inp.removeClass(".ke-input-tip");
            });
        }
    }
});
