/*
    底层图形引擎，绑定canvas，多块游戏的话要多个实例
*/
function Canvas2d() {
}

Canvas2d.prototype = {
  /*
      缩放倍数
  */
  ZOOM: 3,
  constructor: 2,
  initCanvas(id) {
    var canvas = document.getElementById(id);
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      this.ctx = ctx;
      return true;
    }
    return false;
  },
  getCanvas() {
    return this.ctx;
  },
  setZoom(z) {
    this.ZOOM = z;
  },
  start() {
  },
  tick() {
  },
  unDraw(XX, YY, l) {
    var ZOOM = this.ZOOM;
    var ctx = this.ctx;
    l = l || 8;
    XX *= ZOOM * 8;
    YY *= ZOOM * 8;
    ctx.clearRect(XX, YY, l * ZOOM, l * ZOOM);
  },
  drawEidolon(XX, YY) {
    var ZOOM = this.ZOOM;
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
  drawDevil(XX, YY) {
    var ZOOM = this.ZOOM;
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
  drawBrick(XX, YY) {
    var ZOOM = this.ZOOM;
    var ctx = this.ctx;
    XX *= ZOOM * 8;
    YY *= ZOOM * 8;
    ctx.fillRect(XX, YY + 1 * ZOOM, 8 * ZOOM, 7 * ZOOM)
    ctx.clearRect(XX, YY + 4 * ZOOM, 4 * ZOOM, 1 * ZOOM)
    ctx.clearRect(XX + 4 * ZOOM, YY + 4 * ZOOM, 4 * ZOOM, 1 * ZOOM)
    ctx.clearRect(XX + 3.5 * ZOOM, YY + 4 * ZOOM, 1 * ZOOM, 4 * ZOOM)
  },
  drawStroke(XX, YY) {
    var ZOOM = this.ZOOM;
    var ctx = this.ctx;
    XX *= ZOOM * 8;
    YY *= ZOOM * 8;
    ctx.strokeRect(XX, YY, 8 * ZOOM, 8 * ZOOM)
  },
  drawPlate(XX, YY) {
    var ZOOM = this.ZOOM;
    var ctx = this.ctx;
    XX *= ZOOM * 8;
    YY *= ZOOM * 8;
    ctx.fillRect(XX, YY, 8 * ZOOM, 8 * ZOOM);
    ctx.clearRect(XX + 2 * ZOOM, YY + 2 * ZOOM, 3 * ZOOM, 1 * ZOOM)
    ctx.clearRect(XX + 2 * ZOOM, YY + 2 * ZOOM, 1 * ZOOM, 3 * ZOOM)
    ctx.clearRect(XX + 6 * ZOOM, YY + 1 * ZOOM, 1 * ZOOM, 6 * ZOOM)
    ctx.clearRect(XX + 1 * ZOOM, YY + 6 * ZOOM, 6 * ZOOM, 1 * ZOOM)
  },
  drawHeart(XX, YY) {
    var ZOOM = this.ZOOM;
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
  drawWait(XX, YY) {
    var ZOOM = this.ZOOM;
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
  drawProgress(XX, YY, perc) {
    var ZOOM = this.ZOOM;
    var ctx = this.ctx;
    XX *= ZOOM * 8;
    YY *= ZOOM * 8;
    ctx.clearRect(XX + 2, YY + 2, 21 * ZOOM, 5 * ZOOM);
    ctx.strokeRect(XX + 2, YY + 2, 21 * ZOOM, 5 * ZOOM);
    var prog = perc * 21 / 100;
    if (prog * ZOOM > 4) ctx.fillRect(XX + 4, YY + 4, prog * ZOOM - 4, 5 * ZOOM - 4);
  }
};

export default Canvas2d;
