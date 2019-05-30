import Base from './Base.js';
import Canvas2d from './Canvas2d.js';
import MapConfig from './MapConfig.js';
import Eidolon from './Eidolon.js';
import { DIRECTIONS, DIRECTIONS_MAP } from "./utils.js";
import Devil from './Devil.js';
import Heart from './Heart.js';
import CanvasWebgl from './webgl/CanvasWebgl.js';

/*
  游戏引擎
*/
class Game extends Base {
  constructor(values) {
    super(values);
    this.lastFps = 60;
    this.tick = this.tick.bind(this);
    this.drawStaticScene = this.drawStaticScene.bind(this);
    /*
    对应属性变化处理
    */
    this.after("waitFlagChange", this._waitFlagChange, this);
    this.after("lifeChange", this._lifeChange, this);
    this.after("eatsChange", this._eatsChange, this);
    this.after("levelChange", this._levelChange, this);
    this.after("zoomChange", this._afterZoomChange, this);
    /*
    键盘操作初始化
    */
    document.addEventListener("keydown", (e) => this._keyDown(e));
    this.start();
  }

  /*
      游戏缩放
  */
  _afterZoomChange(e) {
    this.get("ctx").unDraw(0, 0, 2000, 2000);
    this.start();
  }

  _keyDown(e) {
    const { keyCode } = e;
    if (DIRECTIONS_MAP[keyCode]) {
      if (keyCode === DIRECTIONS.PAUSE) {
        this.pause();
      }
      if (this.get("waitFlag")) {
        return;
      }
      this.get("eidolon").set("direction", keyCode);
    }
  }

  _onLifeChange(e) {
    console.log("on life change");
  }

  _lifeChange(e) {
    console.log("after life change");
    var life = e.newVal;
    this.updateLife(life);
  }

  _onLevelChange(e) {
    console.log("on level change");
  }

  _levelChange(e) {
    console.log("after level change");
    var level = e.newVal;
    this.get("map").drawMap(e.newVal);
  }

  _onEatsChange(e) {
    var eats = e.newVal;
    console.log("eats:" + eats);
  }

  _eatsChange(e) {
    this.updateEats(e.newVal);
    this.get("heart").show();
  }

  _waitFlagChange(e) {
    var w = e.newVal;
    this.clearLoop();
    if (w) {
      this.get("ctx").drawWait(18, 1);
    } else {
      this.get("ctx").unDraw(18, 1);
      this.lastTime = 0;
      this.loopRun = requestAnimationFrame(this.tick);
    }
  }

  pause(a) {
    if (typeof a !== "undefined")
      this.set("waitFlag", a);
    else
      this.set("waitFlag", !this.get("waitFlag"));
  }

  getLevelMap() {
    return this.get("map").getLevel(this.get("level"));
  }

  isLevelMapEmpty(x, y) {
    return this.get("map").isMapEmpty(this.get("level"), x, y);
  }

  isLevelThinkPoint(x, y) {
    return this.get("map").isThinkPoint(this.get("level"), x, y);
  }

  /*
  开始游戏
  */
  start() {
    this.startLife();
  }

  /*
  死了？继续游戏
  */
  startLife() {
    this.pause(true);
    this.drawStaticScene(true);
    var eidolon = this.get("eidolon");
    var devil = this.get("devil");
    devil.reset("direction");
    eidolon.reset("direction");
    devil.reset("pos");
    eidolon.reset("pos");
    eidolon.draw();
    devil.draw();
  }

  updateEats(eats) {
    this.get("ctx").drawProgress(17, 8, 100 * eats / this.get("max_eat"));
  }

  updateLife(life) {
    this.get("ctx").drawProgress(17, 4, life * 100 / this.get("max_life"));
  }

  /*
  恶魔回调，吃精灵
  */
  die() {
    this.startLife();
    //全部死光，才reset eats
    if (this.get("life") - 1 === 0) {
      alert("Game over!");
      this.reset("level");
      this.reset("eats");
      this.reset('life');
    } else {
      this.set("life", this.get("life") - 1);
    }
  }

  /*
  精灵回调，收集心
  */
  eat() {
    if (this.get("eats") + 1 === this.get("max_eat")) {
      this.set("level", this.get("level") + 1);
      alert("next level : " + (this.get("level") + 1));
      this.startLife();
      this.set("eats", 0);
    } else {
      this.set("eats", this.get("eats") + 1);
    }
  }

  clearLoop() {
    this.timeout && clearTimeout(this.timeout);
    this.loopRun && cancelAnimationFrame(this.loopRun);
    this.loopRun = null;
    this.timeout = null;
  }

  drawStaticScene(init) {
    const ctx = this.get('ctx');
    ctx.start();
    this.get("map").drawMap(this.get("level"));
    const heart = this.get("heart");
    const eidolon = this.get("eidolon");
    const devil = this.get("devil");
    if (init) {
      heart.show();
    } else {
      heart.draw();
    }
    ctx.drawEidolon(18, 3);
    ctx.drawHeart(18, 7);
    this.updateEats(this.get('eats'));
    this.updateLife(this.get('life'));
  }

  process() {
    const ctx = this.get('ctx');
    ctx.tick(this.drawStaticScene);
    const eidolon = this.get("eidolon");
    const devil = this.get("devil");
    if(!devil.move()){
      ctx.tick(()=>devil.draw());
    }
    if(!eidolon.move()){
      ctx.tick(()=>eidolon.draw());
    }
  }

  /*
  模拟时钟
  */
  tick() {
    this.clearLoop();
    const now = Date.now();
    const m = (now - this.lastTime);
    if (m > interval) {
      this.lastTime = now;
      const fps = Math.floor(1000 / m);
      if (Math.abs(this.lastFps - fps) > 1) {
        fpsNode.innerText = fps;
        this.lastFps = fps;
      }
      this.process();
      if (this.get('waitFlag')) {
        return;
      }
      this.timeout = setTimeout(() => {
        this.loopRun = requestAnimationFrame(this.tick);
      }, interval);
    } else {
      this.timeout = setTimeout(() => {
        this.loopRun = requestAnimationFrame(this.tick);
      }, interval - m);
    }
  }
}

const interval = 1000 / 5;

Game.NAME = "Game";
Game.ATTRS = {
  //图形引擎，和canvas绑定
  ctx: {},
  zoom: {
    getter() {
      return this.get("ctx").ZOOM;
    },
    setter(z) {
      this.get("ctx").setZoom(z);
    }
  },
  //地图
  map: {
    valueFn() {
      return MapConfig(this.get("ctx"));
    }
  },
  //当前关
  level: {
    value: 0,
    setter(e) {
      console.log("level setter", e, this.get("map").getLevels())
      if (e >= this.get("map").getLevels()) {
        e = 0;
        return e;
      }
    }
  },
  //当前精灵
  eidolon: {
    valueFn() {
      return new Eidolon({
        game: this
      });
    }
  },
  //当前恶魔
  devil: {
    valueFn() {
      return new Devil({
        game: this
      });
    }
  },
  //精灵生命
  life: {
    value: 3,
    setter(e) {
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
    setter(e) {
      if (e === this.get("max_eat")) {
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
    valueFn() {
      return new Heart({
        game: this
      });
    }
  }
};

function EidolonGame(id, cfg, webgl = false) {
  var ctx = webgl ? new CanvasWebgl() : new Canvas2d();
  if (ctx.initCanvas(id)) {
    cfg = cfg || {};
    cfg.ctx = ctx;
    return new Game(cfg);
  } else {
    alert("Browser too old,do not use ie.");
  }
}

export default EidolonGame;
