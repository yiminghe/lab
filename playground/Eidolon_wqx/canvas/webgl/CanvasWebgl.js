import * as webglUtils from './webgl-utils.js';
import m3 from './m3.js';

const vertexShader = `
attribute vec2 a_position;

uniform mat3 u_matrix;

void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
`;

const fragmentShader = `
precision mediump float;

uniform vec4 u_color;

void main() {
   gl_FragColor = u_color;
  // gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
`;

function makeRect(size) {
  return new Float32Array([
    0, 0,
    size, 0,
    0, size,
    0, size,
    size, 0,
    size, size
  ]);
}

function makeRect2(width, height) {
  return new Float32Array([
    0, 0,
    width, 0,
    0, height,
    0, height,
    width, 0,
    width, height
  ]);
}

function getColor(r, g, b) {
  return new Float32Array([r / 255, g / 255, b / 255, 1]);
}

const barColor = getColor(0, 0, 0);
const bar = makeRect2(100, 30);

const brickSize = 30;
const brickColor = getColor(13, 1, 13);
const brick = makeRect(brickSize);

const devilSize = 20;
const devilColor = getColor(143, 0, 255);
const devil = makeRect(devilSize);

const eidolonSize = 20;
const eidolonkColor = getColor(26, 215, 40);
const eidolon = makeRect(eidolonSize);

const heartSize = 20;
const heartColor = getColor(255, 0, 0);
const heart = makeRect(heartSize);

function makeBuffer(gl, data) {
  // Create a buffer to put positions in
  const brickBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, brickBuffer);
  // Put geometry data into buffer
  gl.bufferData(
    gl.ARRAY_BUFFER,
    data,
    gl.STATIC_DRAW);
  return brickBuffer;
}

function CanvasWebgl() {
}

CanvasWebgl.prototype = {
  constructor: CanvasWebgl,

  initCanvas(id) {
    var canvas = document.getElementById(id);
    this.canvas = canvas;
    if (canvas.getContext) {
      var gl = canvas.getContext('webgl');
      this.gl = gl;
      var shaders = [];
      shaders.push(webglUtils.loadShader(gl, vertexShader, gl.VERTEX_SHADER));
      shaders.push(webglUtils.loadShader(gl, fragmentShader, gl.FRAGMENT_SHADER));
      const program = this.program = webglUtils.createProgram(gl, shaders);
      // look up where the vertex data needs to go.
      this.positionLocation = gl.getAttribLocation(program, "a_position");
      // lookup uniforms
      this.colorLocation = gl.getUniformLocation(program, "u_color");
      this.matrixLocation = gl.getUniformLocation(program, "u_matrix");
      this.brickBuffer = makeBuffer(gl, brick);
      this.devilBuffer = makeBuffer(gl, devil);
      this.eidolonBuffer = makeBuffer(gl, eidolon);
      this.heartBuffer = makeBuffer(gl, heart);
      this.barBuffer = makeBuffer(gl, bar);
      webglUtils.resizeCanvasToDisplaySize(canvas);
      return true;
    }
    return false;
  },

  setZoom() {
    webglUtils.resizeCanvasToDisplaySize(this.canvas);
  },

  start() {
    const { gl } = this;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(this.program);
  },

  tick(fn) {
    fn();
  },

  draw(buffer, color, XX, YY, scaleX) {
    XX *= brickSize;
    YY *= brickSize;
    const { gl } = this;
    // Turn on the attribute
    gl.enableVertexAttribArray(this.positionLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      this.positionLocation, size, type, normalize, stride, offset);
    // set the color
    gl.uniform4fv(this.colorLocation, color);
    // Compute the matrices
    var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    matrix = m3.translate(matrix, XX, YY);

    if (scaleX !== undefined) {
      matrix = m3.scale(matrix, scaleX, 1);
    }
    // Set the matrix.
    gl.uniformMatrix3fv(this.matrixLocation, false, matrix);
    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    offset = 0;
    var count = 6;  // 6 triangles in the 'F', 3 points per triangle
    gl.drawArrays(primitiveType, offset, count);
  },

  unDraw(XX, YY, l) {
  },

  drawEidolon(XX, YY) {
    this.draw(this.eidolonBuffer, eidolonkColor, XX, YY);
  },

  drawDevil(XX, YY) {
    this.draw(this.devilBuffer, devilColor, XX, YY);
  },

  drawBrick(XX, YY) {
    this.draw(this.brickBuffer, brickColor, XX, YY);
  },

  drawStroke(XX, YY) {
    this.drawBrick(XX, YY);
  },

  drawPlate(XX, YY) {
    this.drawBrick(XX, YY);
  },

  drawHeart(XX, YY) {
    this.draw(this.heartBuffer, heartColor, XX, YY);
  },

  drawWait(XX, YY) {
  },

  drawProgress(XX, YY, perc) {
    this.draw(this.barBuffer, barColor, XX, YY,perc/100);
  },
};

export default CanvasWebgl;
