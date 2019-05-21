import Base from './Base.js';
import {randInt} from "./utils.js";

/*
心
*/

class Heart extends Base {
  unDraw() {
    var pos = this.get("pos");
    if (pos.x != -1) this.get("game").get("ctx").unDraw(pos.x, pos.y);
  }

  /*
      随机位置显示
  */
  show() {
    var game = this.get("game");
    var eidolonPos = game.get("eidolon").get("pos");
    var devilPos = game.get("devil").get("pos");
    this.unDraw();
    var hx,
      hy;
    while (true) {
      hx = randInt(1, 16);
      hy = randInt(1, 10);
      if (hx === eidolonPos.x && hy === eidolonPos.y) {
      } else if (hx === devilPos.x && hy === devilPos.y) {
      } else if (game.isLevelMapEmpty(hx, hy)) {
        break;
      }
    }
    //console.log(hx, hy);
    this.set("pos", {
      x: hx,
      y: hy
    });
    this.draw();
  }

  eaten() {
    this.set("pos", {
      x: -1,
      y: -1
    })
  }

  draw() {
    var pos = this.get("pos");
    this.get("game").get("ctx").drawHeart(pos.x, pos.y);
  }
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

export default Heart;
