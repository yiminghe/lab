import { DIRECTIONS } from './utils.js';
import Base from './Base.js';

/**
 生物，恶魔，精灵公共父类
 **/

class Creature extends Base {
  /*
  渲染生物
  */
  draw() {
    var pos = this.get("pos");
    this.drawAtPos(pos);
  }

  /*
  搽除
  */
  unDraw() {
    var pos = this.get("pos");
    this.get("game").get("ctx").unDraw(pos.x, pos.y);
  }

  unDrawAtPos(pos) {
    this.get("game").get("ctx").unDraw(pos.x, pos.y);
  }
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

export default Creature;
