import Creature from './Creature.js';
import { equalPos, DIRECTIONS,randInt } from "./utils.js";

/*
恶魔
*/

class Devil extends Creature {
  constructor(values) {
    super(values);
    /*
   位置属性改变处理函数
   */
    this.after("posChange", this._posChange, this);
  }

  _posChange(e) {
    var oldPos = e.prevVal;
    var newPos = e.newVal;
    if (equalPos(oldPos, newPos)) return;
    if (this.get("direction")) {
      var game = this.get("game");
      var eidolon = game.get("eidolon");
      var ePos = eidolon.get("pos");
      if (ePos.x === oldPos.x && ePos.y === oldPos.y) {
        game.die();
        return;
      }
    }
    this.unDrawAtPos(oldPos);
    if (this.get("direction")) {
      var heart = game.get("heart");
      var hpos = heart.get("pos");
      if (hpos.x === oldPos.x && hpos.y === oldPos.y) {
        heart.draw();
      }
    }
    this.draw();
    if (this.get("direction")) {
      if (newPos.x === ePos.x && newPos.y === ePos.y) {
        game.die();
        return;
      }
      if (game.isLevelThinkPoint(newPos.x, newPos.y)) this.think();
    }
  }

  /*
  撞墙或者到了思考点，就思考下
  */
  think() {
    var game = this.get("game");
    var god = (Math.random() > 0.5);
    var pos = this.get("pos");
    var eidolon = game.get("eidolon");
    var ePos = eidolon.get("pos");
    let ddirection;
    var ex = ePos.x,
      ey = ePos.y,
      dx = pos.x,
      dy = pos.y;
    if (ex > dx && (ey === dy || god) && game.isLevelMapEmpty(dx + 1, dy)) {
      ddirection = DIRECTIONS.RIGHT;
    } else if (ex < dx && (ey === dy || god) && game.isLevelMapEmpty(dx - 1, dy)) {
      ddirection = DIRECTIONS.LEFT;
    } else if (ey > dy && game.isLevelMapEmpty(dx, dy + 1)) {
      ddirection = DIRECTIONS.DOWN;
    } else if (ey < dy && game.isLevelMapEmpty(dx, dy - 1)) {
      ddirection = DIRECTIONS.UP;
    } else {
      ddirection = DIRECTIONS.LEFT + randInt(0, 4);
    }
    this.set("direction", ddirection);
  }

  drawAtPos(pos) {
    this.get("game").get("ctx").drawDevil(pos.x, pos.y);
  }

  /*
      AI 移动
  */
  move() {
    var game = this.get("game");
    var direction = this.get("direction");
    var pos = this.get("pos");
    var dx = pos.x,
      dy = pos.y;
    if (direction) {
      var nx = dx,
        ny = dy;
      if (direction === DIRECTIONS.UP) {
        ny -= 1;
      } else if (direction === DIRECTIONS.DOWN) {
        ny += 1;
      } else if (direction === DIRECTIONS.LEFT) {
        nx -= 1
      } else if (direction === DIRECTIONS.RIGHT) {
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

export default Devil;
