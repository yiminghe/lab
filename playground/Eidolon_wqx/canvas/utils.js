export function randInt(l, u) {
  return l + Math.floor(Math.random() * (u - l));
}

export var DIRECTIONS = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  UNSET: 0,
  PAUSE: 80
};

export var DIRECTIONS_MAP = {};

for (const v of Object.values(DIRECTIONS)) {
  DIRECTIONS_MAP[v] = 1;
}

export function equalPos(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}
