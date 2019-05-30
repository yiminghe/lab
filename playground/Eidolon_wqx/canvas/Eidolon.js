import Creature from './Creature.js';
import { equalPos, DIRECTIONS } from "./utils.js";

/*
精灵
*/
class Eidolon extends Creature {
  constructor(values) {
    super(values);
    /*
位置属性改变处理
*/
    this.after("posChange", this._posChange, this);
  }

  _posChange(e) {
    var oldPos = e.prevVal;
    var newPos = e.newVal;
    if (equalPos(oldPos, newPos)) return;
    var game = this.get("game");
    this.unDrawAtPos(oldPos);
    this.draw();
    if (!this.get("direction")) return;
    var heart = this.get("game").get("heart");
    var hpos = heart.get("pos");
    if (hpos.x === newPos.x && hpos.y === newPos.y) {
      heart.eaten();
      game.eat();
    }
  }

  drawAtPos(pos) {
    this.get("game").get("ctx").drawEidolon(pos.x, pos.y);
  }

  /*
      根据当前方移动
  */
  move() {
    var edirection = this.get("direction");
    var pos = this.get("pos");
    var ex = pos.x,
      ey = pos.y;
    if (edirection) {
      var nx = ex,
        ny = ey;
      if (edirection === DIRECTIONS.UP) {
        ny -= 1;
      } else if (edirection === DIRECTIONS.DOWN) {
        ny += 1;
      } else if (edirection === DIRECTIONS.LEFT) {
        nx -= 1
      } else if (edirection === DIRECTIONS.RIGHT) {
        nx += 1;
      }
      if (nx > 0 && nx < 16 && ny > 0 && ny < 10) {
        var game = this.get("game");
        if (game.isLevelMapEmpty(nx, ny)) {
          if (pos.x === nx && pos.y === ny) {
            return;
          }
          this.set("pos", {
            x: nx,
            y: ny
          });
          return true;
        }
      }
    }
  }
}


Eidolon.NAME = "Eidolon";

export default Eidolon;
