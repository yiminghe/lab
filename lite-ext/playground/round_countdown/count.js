function RoundCountDown(cfg) {

    var duration = (cfg.duration || 8) / 8,
        c = cfg.container,
        Node = KISSY.Node,
        $ = Node.all,
        UA=KISSY.UA,
        width = c.innerWidth(),
        height = c.innerHeight(),
        left = width / 2,
        top = height / 2,
        masks = [],
        maskStyle = [
            {
                "border-left-width":0,
                "border-left-color":UA.ie?"red":"transparent",
                left:left,
                top:-top
            },
            {
                "border-top-width":0,
                "border-top-color":UA.ie?"red":"transparent",
                left:left,
                top:top
            },
            {
                "border-right-width":0,
                "border-right-color":UA.ie?"red":"transparent",
                width:left,
                left:-left,
                top:top
            },
            {
                "border-bottom-width":0,
                "border-bottom-color":UA.ie?"red":"transparent",
                height:top,
                left:-left,
                top:-top
            }
        ],
        animStyle = [
            [
                {
                    "border-left-width":left
                },
                {
                    "border-bottom-width":0,
                    height:top
                }
            ],
            [
                {
                    "border-top-width":top
                },
                {
                    "border-left-width":0,
                    width:left
                }
            ],
            [
                {
                    "border-right-width":left,
                    width:0
                },
                {
                    "border-top-width":0,
                    height:top
                }
            ],
            [
                {
                    "border-bottom-width":top,
                    height:0
                },
                {
                    "border-right-width":0,
                    width:left
                }
            ]
        ];

    for (var i = 0; i < 4; i++) {
        masks[i] = $("<div class='progress'>").appendTo(c);
    }

    this.maskStyle = maskStyle;
    this.animStyle = animStyle;
    this.left = left;
    this.top = top;
    this.queue = [];
    this.mask = null;
    this.masks = masks;
    this.duration = duration;

}

KISSY.augment(RoundCountDown, KISSY.EventTarget, {
    prepare:function () {
        var masks = this.masks;
        for (var i = 0; i < 4; i++) {
            masks[i].css({
                "border-left-width":this.left,
                "border-right-width":this.left,
                "border-top-width":this.top,
                "border-bottom-width":this.top,
                "border-color":"",
                width:0,
                height:0
            });
            masks[i].css(this.maskStyle[i]);
            masks[i].show();
        }
    },
    stop:function (finish) {
        if (this.mask) {
            this.mask.stop(0, 1);
        }
        if (finish) {
            for (var i = 0; i < 4; i++) {
                this.masks[i].hide();
            }
        }
    },

    start:function () {

        var self = this;

        function genCfg(style, mask, cfg) {
            cfg = cfg || {};
            cfg.duration = self.duration;
            var withHeight,
                withWidth;
            if ((withWidth = (style.width !== undefined)) ||
                (withHeight = (style.height !== undefined))) {
                delete style.width;
                delete style.height;
                cfg.frame = function (fx, stopped) {
                    var end = fx.frame(),
                        v = Math.floor(fx.cur());
                    mask.css(fx.prop, v);
                    if (stopped) {
                        //alert(1);
                    }
                    if (withWidth) {
                        mask.css("width", self.left - v);
                    } else if (withHeight) {
                        mask.css("height", self.top - v);
                    }
                    return end;
                };
            }
            return cfg;
        }


        self.queue = [];
        self.prepare();

        for (var i = 0; i < 4; i++) {
            (function (index) {
                self.queue.push(function () {
                    var mask = self.mask = self.masks[index],
                        style1 = KISSY.merge(self.animStyle[index][0]),
                        style2 = KISSY.merge(self.animStyle[index][1]);
                    mask.animate(style1, genCfg(style1, mask))
                        .animate(style2, genCfg(style2, mask, {
                        complete:function () {
                            self.queue.shift()();
                        }
                    }));
                });
            })(i);
        }
        self.queue.push(function () {
            for (var i = 0; i < 4; i++) {
                self.masks[i].hide();
            }
            self.fire("complete");
        });
        self.queue.shift()();
    }
});