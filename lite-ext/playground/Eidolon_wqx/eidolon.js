/**
  @author:yiminghe.javaeye.com
  @date:2010-05-26
  @contact:yiminghe@gmail.com
**/
YUI.add('EidolonGame',
function(Y) {
    if (!window.console) {
        window.console = {};
        window.console.log = function() {};
    }
    function randInt(l, u) {
        return l + Math.floor(Math.random() * (u - l));
    }
    
    /*
        底层图形引擎，绑定canvas，多块游戏的话要多个实例
    */
    function GraphicUtils(){}
    
    GraphicUtils.prototype={
        /*
            缩放倍数
        */
        ZOOM:3,
        constructor:GraphicUtils,
        initCanvas: function(id) {
            var canvas = document.getElementById(id);
            if (canvas.getContext) {
                var ctx = canvas.getContext('2d');
                this.ctx = ctx;
                return true;
            }
            return false;
        },
        getCanvas:function(){
            return this.ctx;
        },
        unDraw: function(XX, YY, l) {
            var ZOOM=this.ZOOM;
            var ctx = this.ctx;
            l = l || 8;
            XX *= ZOOM * 8;
            YY *= ZOOM * 8;
            ctx.clearRect(XX, YY, l * ZOOM, l * ZOOM);
        },
        drawEidolon: function(XX, YY) {
            var ZOOM=this.ZOOM;
            var ctx = this.ctx;
            XX *= ZOOM * 8;
            YY *= ZOOM * 8;
            ctx.fillRect(XX, YY, 7 * ZOOM, 5 * ZOOM);
            ctx.clearRect(XX, YY, 1 * ZOOM, 1 * ZOOM);
            ctx.clearRect(XX + 6 * ZOOM, YY, 1 * ZOOM, 2 * ZOOM);
            ctx.clearRect(XX + 2 * ZOOM, YY + 2 * ZOOM, 1 * ZOOM, 2 * ZOOM);
            ctx.clearRect(XX + 5 * ZOOM, YY + 2 * ZOOM, 1 * ZOOM, 2 * ZOOM);
            ctx.fillRect(XX + 1 * ZOOM, YY + 7 * ZOOM, 5 * ZOOM, 1 * ZOOM);
        },
        drawDevil: function(XX, YY) {
            var ZOOM=this.ZOOM;
            var ctx = this.ctx;
            XX *= ZOOM * 8;
            YY *= ZOOM * 8;
            ctx.fillRect(XX + 1 * ZOOM, YY, 6 * ZOOM, 1 * ZOOM)
            ctx.fillRect(XX, YY + 1 * ZOOM, 8 * ZOOM, 7 * ZOOM)
            ctx.clearRect(XX + 1 * ZOOM, YY + 2 * ZOOM, 1 * ZOOM, 2 * ZOOM)
            ctx.clearRect(XX + 1 * ZOOM, YY + 3 * ZOOM, 2 * ZOOM, 1 * ZOOM)
            ctx.clearRect(XX + 6 * ZOOM, YY + 2 * ZOOM, 1 * ZOOM, 2 * ZOOM)
            ctx.clearRect(XX + 5 * ZOOM, YY + 3 * ZOOM, 2 * ZOOM, 1 * ZOOM)
            ctx.clearRect(XX + 2 * ZOOM, YY + 5 * ZOOM, 3 * ZOOM, 1 * ZOOM)
            ctx.clearRect(XX + 1 * ZOOM, YY + 7 * ZOOM, 1 * ZOOM, 1 * ZOOM)
            ctx.clearRect(XX + 6 * ZOOM, YY + 7 * ZOOM, 1 * ZOOM, 1 * ZOOM)
        },
        drawBrick: function(XX, YY) {
            var ZOOM=this.ZOOM;
            var ctx = this.ctx;
            XX *= ZOOM * 8;
            YY *= ZOOM * 8;
            ctx.fillRect(XX, YY + 1 * ZOOM, 8 * ZOOM, 7 * ZOOM)
            ctx.clearRect(XX, YY + 4 * ZOOM, 4 * ZOOM, 1 * ZOOM)
            ctx.clearRect(XX + 4 * ZOOM, YY + 4 * ZOOM, 4 * ZOOM, 1 * ZOOM)
            ctx.clearRect(XX + 3.5 * ZOOM, YY + 4 * ZOOM, 1 * ZOOM, 4 * ZOOM)
        },
        drawStroke: function(XX, YY) {
            var ZOOM=this.ZOOM;
            var ctx = this.ctx;
            XX *= ZOOM * 8;
            YY *= ZOOM * 8;
            ctx.strokeRect(XX, YY, 8 * ZOOM, 8 * ZOOM)
        },
        drawPlate: function(XX, YY) {
            var ZOOM=this.ZOOM;
            var ctx = this.ctx;
            XX *= ZOOM * 8;
            YY *= ZOOM * 8;
            ctx.fillRect(XX, YY, 8 * ZOOM, 8 * ZOOM);
            ctx.clearRect(XX + 2 * ZOOM, YY + 2 * ZOOM, 3 * ZOOM, 1 * ZOOM)
            ctx.clearRect(XX + 2 * ZOOM, YY + 2 * ZOOM, 1 * ZOOM, 3 * ZOOM)
            ctx.clearRect(XX + 6 * ZOOM, YY + 1 * ZOOM, 1 * ZOOM, 6 * ZOOM)
            ctx.clearRect(XX + 1 * ZOOM, YY + 6 * ZOOM, 6 * ZOOM, 1 * ZOOM)
        },
        drawHeart: function(XX, YY) {
            var ZOOM=this.ZOOM;
            var ctx = this.ctx;
            XX *= ZOOM * 8;
            YY *= ZOOM * 8;
            ctx.fillStyle = "red";
            ctx.fillRect(XX + 1 * ZOOM, YY + 1 * ZOOM, 6 * ZOOM, 2 * ZOOM);
            //ctx.clearRect(XX+3*ZOOM,YY+3*ZOOM,2*ZOOM,2*ZOOM)
            ctx.fillRect(XX, YY + 2 * ZOOM, 8 * ZOOM, 2 * ZOOM);
            ctx.fillRect(XX + 1 * ZOOM, YY + 3 * ZOOM, 6 * ZOOM, 2 * ZOOM);
            ctx.fillRect(XX + 2 * ZOOM, YY + 4 * ZOOM, 4 * ZOOM, 2 * ZOOM);
            ctx.fillRect(XX + 3 * ZOOM, YY + 5 * ZOOM, 2 * ZOOM, 2 * ZOOM);
            ctx.fillStyle = "black";
        },
        drawWait: function(XX, YY) {
            var ZOOM=this.ZOOM;
            var ctx = this.ctx;
            XX *= ZOOM * 8;
            YY *= ZOOM * 8;
            ctx.strokeRect(XX + 1, YY + 1, 6 * ZOOM, 6 * ZOOM)
            ctx.beginPath();
            ctx.moveTo(XX + 1, YY + 1);
            ctx.lineTo(XX + 6 * ZOOM, YY + 6 * ZOOM);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(XX + 6 * ZOOM, YY + 1);
            ctx.lineTo(XX + 1, YY + 6 * ZOOM);
            ctx.closePath();
            ctx.stroke();
        },
        drawProgress: function(XX, YY, perc) {
            var ZOOM=this.ZOOM;
            var ctx = this.ctx;
            XX *= ZOOM * 8;
            YY *= ZOOM * 8;
            ctx.clearRect(XX + 2, YY + 2, 21 * ZOOM, 5 * ZOOM);
            ctx.strokeRect(XX + 2, YY + 2, 21 * ZOOM, 5 * ZOOM);
            var prog = perc * 21 / 100;
            if (prog * ZOOM > 4) ctx.fillRect(XX + 4, YY + 4, prog * ZOOM - 4, 5 * ZOOM - 4);
        }
    };
    /*
        地图字典
    */
    function MapConfig(GraphicUtils) {
        var MAPS = [
        //关数
        ["BBBBBBBBBBBBBBBBB***", "B******A*B**A***B***", "B*BBBBBB*B*B*BB*B***", "BA*******B*B*BB*B***", "B*BBBBBB*BA****AB***", "BA******AB*BBBB*B***", "B*BBBBBB**A*****B***", "BA******ABBBBB**B***", "B*************A*B***", "BBBBBBBBBBBBBBBBB***"],
        ["DDDDDDDDDDDDDDDDD***", "D*******A*******D***", "D*DDDDDD*DDDDDD*D***", "DA*****AAA*****AD***", "D*DDDDD*D*DDDDD*D***", "DA****D*D*D****AD***", "D*DDD*D*D*D*DDD*D***", "D***D*D*D*D*D***D***", "D****A*A*A*A**A*D***", "DDDDDDDDDDDDDDDDD***"],
        ["CCCCCCCCCCCCCCCCC***", "C*A*****A*****A*C***", "C**BBBBB*BBBBB**C***", "CAA*A***A***A*AAC***", "C**B*CCCCCCC*B**C***", "C**B*CCCCCCC*B**C***", "CAA*A***A***A*AAC***", "C**BBBBB*BBBBB**C***", "C*A*****A*****A*C***", "CCCCCCCCCCCCCCCCC***"],
        ["BBBBBBBBBBBBBBBBB***", "B**A****A****A**B***", "B*C*CCC***CCC*C*B***", "B*C*****B*****C*B***", "B*C**BBBBBBB**C*B***", "B*C*****B*****C*B***", "BA*A****B***A**AB***", "B*CCCCC*C*CCCCC*B***", "B******A*A******B***", "BBBBBBBBBBBBBBBBB***"],
        ["DDDDDDDDDDDDDDDDD***", "C***A*******A***C***", "C**B*********B**C***", "C**B*DDDDDDD*B**C***", "CA**A**A*A**A**AC***", "C*A****A*A****A*C***", "C*BBBBB*B*BBBBB*C***", "CA*****A*A*****AC***", "C**BBB*****BBB**C***", "DDDDDDDDDDDDDDDDD***"],
        ["BBBBBBBBBBBBBBBBB***", "B***A*A**C***B**B***", "B*B**B*B*C***B**B***", "B*B**B*B*C*****AB***", "B*B**B*B*C*BBBB*B***", "BA**A*AB*CA****AB***", "B*DDDD*B*C**BB**B***", "B*DDDD*B****BB**B***", "B*****A*A*A***A*B***", "BBBBBBBBBBBBBBBBB***"],
        ["CCCCCCCCCCCCCCCCC***", "C**E****A****E**C***", "C**E*EEE*EEE*E**C***", "C**EA**AAA**AE**C***", "C**E*EE***EE*E**C***", "CAA*AEE*E*EEA*AAC***", "C**E*EE*E*EE*E**C***", "C**EA**A*A**AE**C***", "C*A*AEE***EEA*A*C***", "CCCCCCCCCCCCCCCCC***"],
        ["CCCCCCCCCCCCCCCCC***", "D***A*A***A*A***D***", "D*BB*B*EEE*B*BB*D***", "D*BB*B*EEE*B*BB*D***", "DA**A*AA*AA*A**AD***", "D***BBB*D*BBB***D***", "D***BBB*D*BBB***D***", "D*CA***A*A***AC*D***", "D**A***BBB***A**D***", "CCCCCCCCCCCCCCCCC***"],
        ["BCCCCCCCCCCCCCCCC***", "B***A**A*****A**E***", "B*E****ACCCCCA**E***", "B*EEEEE*C*A*C*D*E***", "BA*A**E*C***C*D*E***", "BA*AB*E*C*B*C*D*E***", "B*E*B*****B*C*D*E***", "B*E*BBBBBBBA*A*AE***", "B**A*********A**E***", "DDDDDDDDDDDDDDDDE***"],
        ["CCCCCCCCCCCCCCCCC***", "C**A******A**A**C***", "CA**BBBBBBBBB**AC***", "C**A*********A**C***", "C*B**BBBBBBB**B*C***", "C*BA*********AB*C***", "C*B*BBBBBBBBB*B*C***", "C***************C***", "C**A****A****A**C***", "CCCCCCCCCCCCCCCCC***"],
        ["BBBBBBBBBBBBBBBBB***", "B*****A*A*A*****B***", "B*CCCC*C*C*CCCC*B***", "BA****AC*CA*A**AB***", "B*CCCC*C*C*C**C*B***", "B*CCCC*C*C*C**C*B***", "BA****AC*CA**A*AB***", "B*CCCC*C*C*CCCC*B***", "B*****A*A*A*****B***", "BBBBBBBBBBBBBBBBB***"],
        ["DDDDDDDDDDDDDDDDD***", "E****A**A*A*A*A*E***", "E*BBB**E*****B**E***", "EA*****E*****B**E***", "E*BBB**AAAEEA*A*E***", "EA*A*A*AAA******E***", "E*B**EE**E**BBB*E***", "E*B******E*****AE***", "E***A***A**A*A**E***", "BBBBBBBBBBBBBBBBB***"],
        ["BBBBBBBBBBBBBBBBB***", "D***A**A*A******B***", "D**B*B**B*BBBBB*B***", "D*BB*BB*BA**A**AB***", "DA**A**AB**B*B**B***", "DA**A**AB*BB*BB*B***", "D*BB*BB*BAA*A***B***", "D**B*B**B**BBB**B***", "D***A**A*A******B***", "CCCCCCCCCCCCCCCCC***"],
        ["CCCCCCCCCCCCCCCCC***", "C**A**A***A**A**C***", "C***B***B***B***C***", "CA**A***A***A**AC***", "C*BAAABAAABAAAB*C***", "CA**A*A*A*A*A**AC***", "C***BAAABAAAB***C***", "C*****C***C*****C***", "C**A*A*****A*A**C***", "CCCCCCCCCCCCCCCCC***"],
        ["BBBBBBBBBBBBBBBBB***", "B**A*A*A*A*A*A**B***", "B*E*E*E*E*E*E*E*B***", "BA*A*********A*AB***", "B*E*E*E*E*E*E*E*B***", "BA*A***A*A***A*AB***", "B*E*E*E*E*E*E*E*B***", "BA*A*A*A*A*A*A*AB***", "B**A***A****A***B***", "BBBBBBBBBBBBBBBBB***"]

        ];
        var mapGen = {
            'B': Y.bind(GraphicUtils.drawBrick, GraphicUtils),
            'C': Y.bind(GraphicUtils.drawStroke, GraphicUtils),
            'D': Y.bind(GraphicUtils.drawPlate, GraphicUtils),
            '*': function() {},
            'A': function() {}
            //,'A':drawPlate
        }
        return {
            /**
             插入关卡
             @map:关
             **/
            insertMap: function(map) {
                MAPS[MAPS.length] = map;
            },
            /**
             @gen{Function} 对应关标志处理函数
             **/
            insertGens: function(gen) {
                Y.mix(mapGen, gen);
            },
            getLevel: function(level) {
                return MAPS[level];
            },
            isMapEmpty: function(level, x, y) {
                var rows = MAPS[level];
                return rows[y][x] == "*" || rows[y][x] == "A";
            },
            isThinkPoint: function(level, x, y) {
                var rows = MAPS[level];
                return rows[y][x] == "A";
            },
            getLevels: function() {
                return MAPS.length;
            },
            /**
             选择制定关卡
             **/
            drawMap: function(level) {
                var cx = 0;
                var cy = 0;
                GraphicUtils.unDraw(cx, cy, 8 * 17);
                var rows = MAPS[level];
                for (cx = 0; cx < rows.length; cx++) {
                    var row = rows[cx];
                    for (cy = 0; cy < row.length; cy++) {
                        var cell = row.charAt(cy);
                        var p = mapGen[cell] || mapGen['B'];
                        p(cy, cx);
                    }
                }
            }
        };
    }
    var DIRECTIONS = {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        UNSET: 0
    };
    /**
     生物，恶魔，精灵公共父类
     **/

    function Creature(config) {
        Creature.superclass.constructor.apply(this, arguments);
    }
    Creature.NAME = "Creature";
    Creature.ATTRS = {
        /*
        位置属性
        */
        pos: {
            value: {
                x: 1,
                y: 1
            }
        },
        /*
        所在游戏
        */
        game: {},
        /*
        当前移动方位
        */
        direction: {
            value: DIRECTIONS.UNSET
        }
    };
    Y.extend(Creature, Y.Base, {
        /*
        渲染生物
        */
        draw: function() {
            var pos = this.get("pos");
            this.drawAtPos(pos);
        },
        /*
        搽除
        */
        unDraw: function() {
            var pos = this.get("pos");
            this.get("game").get("ctx").unDraw(pos.x, pos.y);
        },
        unDrawAtPos: function(pos) {
            this.get("game").get("ctx").unDraw(pos.x, pos.y);
        }
    });
    function equalPos(p1, p2) {
        return p1.x == p2.x && p1.y == p2.y;
    }
    /*
    精灵
    */

    function Eidolon(config) {
        Eidolon.superclass.constructor.apply(this, arguments);
    }
    Eidolon.NAME = "Eidolon";
    Y.extend(Eidolon, Creature, {
        initializer: function(cfg) {
            /*
          位置属性改变处理
          */
            this.after("posChange", this._posChange, this);
        },
        _posChange: function(e) {
            var oldPos = e.prevVal;
            var newPos = e.newVal;
            if (equalPos(oldPos, newPos)) return;
            var game = this.get("game");
            this.unDrawAtPos(oldPos);
            this.draw();
            if (!this.get("direction")) return;
            var heart = this.get("game").get("heart");
            var hpos = heart.get("pos");
            if (hpos.x == newPos.x && hpos.y == newPos.y) {
                heart.eaten();
                game.eat();
            }
        },
        drawAtPos: function(pos) {
            this.get("game").get("ctx").drawEidolon(pos.x, pos.y);
        },
        /*
            根据当前方移动
        */
        move: function() {
            var edirection = this.get("direction");
            var pos = this.get("pos");
            var ex = pos.x,
            ey = pos.y;
            if (edirection) {
                var nx = ex,
                ny = ey;
                if (edirection == DIRECTIONS.UP) {
                    ny -= 1;
                } else if (edirection == DIRECTIONS.DOWN) {
                    ny += 1;
                } else if (edirection == DIRECTIONS.LEFT) {
                    nx -= 1
                } else if (edirection == DIRECTIONS.RIGHT) {
                    nx += 1;
                }
                if (nx > 0 && nx < 16 && ny > 0 && ny < 10) {
                    var game = this.get("game");
                    if (game.isLevelMapEmpty(nx, ny)) {
                        this.set("pos", {
                            x: nx,
                            y: ny
                        });
                    }
                }
            }
        }
    });
    /*
    恶魔
    */

    function Devil(config) {
        Devil.superclass.constructor.apply(this, arguments);
    }
    Devil.NAME = "Eidolon";
    Devil.ATTRS = {
        /*
        默认位置右上方
        */
        pos: {
            value: {
                x: 15,
                y: 1
            }
        }
    };
    Y.extend(Devil, Creature, {
        initializer: function(cfg) {
            /*
            位置属性改变处理函数
            */
            this.after("posChange", this._posChange, this);
        },
        _posChange: function(e) {
            var oldPos = e.prevVal;
            var newPos = e.newVal;
            if (equalPos(oldPos, newPos)) return;
            if (this.get("direction")) {
                var game = this.get("game");
                var eidolon = game.get("eidolon");
                var ePos = eidolon.get("pos");
                if (ePos.x == oldPos.x && ePos.y == oldPos.y) {
                    game.die();
                    return;
                }
            }
            this.unDrawAtPos(oldPos);
            if (this.get("direction")) {
                var heart = game.get("heart");
                var hpos = heart.get("pos");
                if (hpos.x == oldPos.x && hpos.y == oldPos.y) {
                    heart.draw();
                }
            }
            this.draw();
            if (this.get("direction")) {
                if (newPos.x == ePos.x && newPos.y == ePos.y) {
                    game.die();
                    return;
                }
                if (game.isLevelThinkPoint(newPos.x, newPos.y)) this.think();
            }
        },
        /*
        撞墙或者到了思考点，就思考下
        */
        think: function() {
            var game = this.get("game");
            var god = (Math.random() > 0.5);
            var pos = this.get("pos");
            var eidolon = game.get("eidolon");
            var ePos = eidolon.get("pos");
            var ex = ePos.x,
            ey = ePos.y,
            dx = pos.x,
            dy = pos.y;
            if (ex > dx && (ey == dy || god) && game.isLevelMapEmpty(dx + 1, dy)) {
                ddirection = DIRECTIONS.RIGHT;
            } else if (ex < dx && (ey == dy || god) && game.isLevelMapEmpty(dx - 1, dy)) {
                ddirection = DIRECTIONS.LEFT;
            } else if (ey > dy && game.isLevelMapEmpty(dx, dy + 1)) {
                ddirection = DIRECTIONS.DOWN;
            } else if (ey < dy && game.isLevelMapEmpty(dx, dy - 1)) {
                ddirection = DIRECTIONS.UP;
            } else {
                ddirection = DIRECTIONS.LEFT + randInt(0, 4);
            }
            this.set("direction", ddirection);
        },
        drawAtPos: function(pos) {
            this.get("game").get("ctx").drawDevil(pos.x, pos.y);
        },
        /*
            AI 移动
        */
        move: function() {
            var game = this.get("game");
            var ddirection = this.get("direction");
            var pos = this.get("pos");
            var dx = pos.x,
            dy = pos.y;
            if (ddirection) {
                var nx = dx,
                ny = dy;
                if (ddirection == DIRECTIONS.UP) {
                    ny -= 1;
                } else if (ddirection == DIRECTIONS.DOWN) {
                    ny += 1;
                } else if (ddirection == DIRECTIONS.LEFT) {
                    nx -= 1
                } else if (ddirection == DIRECTIONS.RIGHT) {
                    nx += 1;
                }
                if (nx > 0 && nx < 16 && ny > 0 && ny < 10) {
                    if (game.isLevelMapEmpty(nx, ny)) {
                        this.set("pos", {
                            x: nx,
                            y: ny
                        })
                    } else {
                        this.think();
                    }
                } else {
                    this.think();
                }
            } else {
                this.think();
            }
        }
    });
    /*
    心
    */

    function Heart(config) {
        Heart.superclass.constructor.apply(this, arguments);
    }
    Heart.NAME = "Heart";
    Heart.ATTRS = {
        pos: {
            value: {
                x: -1,
                y: -1
            }
        },
        game: {}
    };
    Y.extend(Heart, Y.Base, {
        unDraw: function() {
            var pos = this.get("pos");
            if (pos.x != -1) this.get("game").get("ctx").unDraw(pos.x, pos.y);
        },
        /*
            随机位置显示
        */
        show: function() {
            var game = this.get("game");
            var eidolonPos = game.get("eidolon").get("pos");
            var devilPos = game.get("devil").get("pos");
            this.unDraw();
            var hx,
            hy;
            while (true) {
                hx = randInt(1, 16);
                hy = randInt(1, 10);
                if (hx == eidolonPos.x && hy == eidolonPos.y) {} else if (hx == devilPos.x && hy == devilPos.y) {} else if (game.isLevelMapEmpty(hx, hy)) {
                    break;
                }
            }
            //console.log(hx, hy);
            this.set("pos", {
                x: hx,
                y: hy
            });
            this.draw();
        },
        eaten: function() {
            this.set("pos", {
                x: -1,
                y: -1
            })
        },
        draw: function() {
            var pos = this.get("pos");
            this.get("game").get("ctx").drawHeart(pos.x, pos.y);
        }
    });
    /*
        游戏引擎
    */

    function Game(config) {
        Game.superclass.constructor.apply(this, arguments);
    }
    Game.NAME = "Game";
    Game.ATTRS = {
        //图形引擎，和canvas绑定
        ctx:{},
        //地图
        map: {
            valueFn:function(){
                return MapConfig(this.get("ctx"));
            } 
        },
        //当前关
        level: {
            value: 0,
            setter: function(e) {
                console.log("level setter", e, this.get("map").getLevels())
                if (e >= this.get("map").getLevels()) {
                    e = 0;
                    return e;
                }
            }
        },
        //当前精灵
        eidolon: {
            valueFn: function() {
                return new Eidolon({
                    game: this
                });
            }
        },
        //当前恶魔
        devil: {
            valueFn: function() {
                return new Devil({
                    game: this
                });
            }
        },
        //精灵生命
        life: {
            value: 3,
            setter: function(e) {
                if (e <= 0) {
                    return this.get("max_life");
                }
            }
        },
        //最多生命数
        max_life: {
            value: 3
        },
        //收集心数
        eats: {
            value: 0,
            setter: function(e) {
                if (e == this.get("max_eat")) {
                    return 0;
                }
            }
        },
        //过关收集心上限
        max_eat: {
            value: 10
        },
        //是否暂停
        waitFlag: {
            value: false
        },
        //心产生器
        heart: {
            valueFn: function() {
                return new Heart({
                    game: this
                });
            }
        }
    };
    Y.extend(Game, Y.Base, {
        /*
            游戏缩放
        */
        zoomAdjust: function(z) {
            this.get("ctx").unDraw(0, 0, 2000, 2000);
            this.get("ctx").ZOOM = z;
            this.start();
        },
        initializer: function() {
            /*
            对应属性变化处理
            */
            this.after("waitFlagChange", this._waitFlagChange, this);
            this.after("lifeChange", this._lifeChange, this);
            this.after("eatsChange", this._eatsChange, this);
            this.on("eatsChange", this._onEatsChange, this);
            this.after("levelChange", this._levelChange, this);
            this.on("levelChange", this._onLevelChange, this);
            this.on("lifeChange", this._onLifeChange, this);
            /*
            键盘操作初始化
            */
            Y.one(document).on("keydown",
            function(e) {
                if (e.keyCode == 80) {
                    this.pause();
                }
                if (this.get("waitFlag")) return;
                if (e.keyCode == DIRECTIONS.UP || e.keyCode == DIRECTIONS.DOWN || e.keyCode == DIRECTIONS.LEFT || e.keyCode == DIRECTIONS.RIGHT) {
                    this.get("eidolon").set("direction", e.keyCode);
                }
            },
            this);
            this.start();
        },
        _onLifeChange: function(e) {
            console.log("on life change");
        },
        _lifeChange: function(e) {
            console.log("after life change");
            var life = e.newVal;
            console.log(life)
            this.updateLife(life);
        },
        _onLevelChange: function(e) {
            console.log("on level change");
        },
        _levelChange: function(e) {
            console.log("after level change");
            var level = e.newVal;
            this.get("map").drawMap(e.newVal);
        },
        _onEatsChange: function(e) {
            var eats = e.newVal;
            console.log("eats:" + eats);
        },
        _eatsChange: function(e) {
            this.updateEats(e.newVal);
            this.get("heart").show();
        },
        _waitFlagChange: function(e) {
            var w = e.newVal;
            if (w) {
                this.get("ctx").drawWait(18, 1);
                this.loopRun && this.loopRun.cancel();
                this.loopRun = null;
            } else {
                this.get("ctx").unDraw(18, 1);
                this.loopRun = Y.later(200, this, this.tick, true, true);
            }
        },
        pause: function(a) {
            if (typeof a !== "undefined")
            this.set("waitFlag", a);
            else
            this.set("waitFlag", !this.get("waitFlag"));
        },
        getLevelMap: function() {
            return this.get("map").getLevel(this.get("level"));
        },
        isLevelMapEmpty: function(x, y) {
            return this.get("map").isMapEmpty(this.get("level"), x, y);
        },
        isLevelThinkPoint: function(x, y) {
            return this.get("map").isThinkPoint(this.get("level"), x, y);
        },
        /*
        开始游戏
        */
        start: function() {
            this.get("map").drawMap(this.get("level"));
            var eidolon = this.get("eidolon");
            var devil = this.get("devil");
            eidolon.draw();
            devil.draw();
            eidolon.drawAtPos({
                x: 18,
                y: 3
            });
            this.updateLife(this.get("max_life"));
            this.get("ctx").drawHeart(18, 7);
            this.updateEats(0);
            this.get("heart").show();
            this.startLife();
        },
        /*
        死了？继续游戏
        */
        startLife: function() {
            this.pause(true);
            var eidolon = this.get("eidolon");
            var devil = this.get("devil");
            devil.reset("direction");
            eidolon.reset("direction");
            devil.reset("pos");
            eidolon.reset("pos");
            //强制重绘，防止开始地死亡不出发posChange
            eidolon.draw();
            devil.draw();
        },
        updateEats: function(eats) {
            this.get("ctx").drawProgress(17, 8, 100 * eats / this.get("max_eat"));
        },
        updateLife: function(life) {
            this.get("ctx").drawProgress(17, 4, life * 100 / this.get("max_life"));
        },
        /*
        恶魔回调，吃精灵
        */
        die: function() {
            //全部死光，才reset eats
            if (this.get("life") - 1 == 0) {
                alert("Game over!");
                this.reset("level");
                this.reset("eats");
            }
            this.set("life", this.get("life") - 1);
            this.startLife();
        },
        /*
        精灵回调，收集心
        */
        eat: function() {
            if (this.get("eats") + 1 == this.get("max_eat")) {
                
                this.set("level", this.get("level") + 1);
                alert("next level : "+(this.get("level")+1));
                this.startLife();
            }
            this.set("eats", this.get("eats") + 1);
        },
        /*
        模拟时钟
        */
        tick: function() {
            var eidolon = this.get("eidolon");
            var devil = this.get("devil");
            devil.move();
            eidolon.move();
        }
    });
    Y.EidolonGame = function(id, cfg) {
        var ctx=new GraphicUtils();
        if (ctx.initCanvas(id)) {
            cfg=cfg||{};
            Y.mix(cfg,{
                ctx:ctx
            });
            return new Game(cfg);
        } else {
            alert("Browser too old,do not use ie.");
        }
    };

    /*
    issue@ie:
    <!--[if IE]>
    <script type="text/javascript" src="excanvas.compiled.js"></script>
    <![endif]-->
    */
});