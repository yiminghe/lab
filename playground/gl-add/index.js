(function () {
  var halfFloatExt;

  function getWebGLErrorMessage(
    gl, status) {
    switch (status) {
      case gl.NO_ERROR:
        return 'NO_ERROR';
      case gl.INVALID_ENUM:
        return 'INVALID_ENUM';
      case gl.INVALID_VALUE:
        return 'INVALID_VALUE';
      case gl.INVALID_OPERATION:
        return 'INVALID_OPERATION';
      case gl.INVALID_FRAMEBUFFER_OPERATION:
        return 'INVALID_FRAMEBUFFER_OPERATION';
      case gl.OUT_OF_MEMORY:
        return 'OUT_OF_MEMORY';
      case gl.CONTEXT_LOST_WEBGL:
        return 'CONTEXT_LOST_WEBGL';
      default:
        return `Unknown error code ${status}`;
    }
  }

  function callAndCheck(gl, func) {
    const returnValue = func();
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      throw new Error('WebGL Error: ' + getWebGLErrorMessage(gl, error));
    }
    return returnValue;
  }

  const vertexArray = new Float32Array(
    [
      -1, 1, 0, 0, 1,
      -1, -1, 0, 0, 0,
      1, 1, 0, 1, 1,
      1, -1, 0, 1, 0
    ]
  );

  const triangleVertexIndices = new Uint16Array([
    0, 1, 2,
     2, 1, 3
  ]);

  function init() {
    const canvas = document.createElement('canvas');
    const WEBGL_ATTRIBUTES = {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      depth: false,
      stencil: false,
      failIfMajorPerformanceCaveat: true
    };
    const gl = canvas.getContext('webgl', WEBGL_ATTRIBUTES);
    gl.getExtension('OES_texture_float');
    gl.getExtension('WEBGL_color_buffer_float');
    halfFloatExt = gl.getExtension('OES_texture_half_float');
    console.log('=======', halfFloatExt);
    gl.getExtension('EXT_color_buffer_half_float');
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
    const buffer2 = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer2)

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleVertexIndices, gl.STATIC_DRAW)
    const framebuffer = gl.createFramebuffer()
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.STENCIL_TEST)
    gl.disable(gl.BLEND)
    gl.disable(gl.DITHER)
    gl.disable(gl.POLYGON_OFFSET_FILL)
    gl.disable(gl.SAMPLE_COVERAGE)
    gl.enable(gl.SCISSOR_TEST)
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)
    return [gl, framebuffer, buffer];
  }

  function add(gl, framebuffer, buffer,o1,o2) {
    const texture1 = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture1)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.FLOAT, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindTexture(gl.TEXTURE_2D, texture1)
    const input1 = new Float32Array(4)
    input1[0] = o1
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 1, 1, gl.RGBA, gl.FLOAT, input1)
    gl.bindTexture(gl.TEXTURE_2D, null)
    const texture2 = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture2)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.FLOAT, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindTexture(gl.TEXTURE_2D, texture2)
    const input2 = new Float32Array(4)
    input2[0] = o2
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 1, 1, gl.RGBA, gl.FLOAT, input2)
    gl.bindTexture(gl.TEXTURE_2D, null)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, halfFloatExt.HALF_FLOAT_OES, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    const shader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(shader,
      `precision highp float;
  precision highp int;
  varying vec2 resultUV;


  float sampleTexture(sampler2D textureSampler, vec2 uv) {
    return texture2D(textureSampler, uv).r;
  }


  void setOutput(float val) {
    gl_FragColor = vec4(val, 0, 0, 0);
  }

uniform sampler2D A;
uniform sampler2D B;


      float getAAtOutCoords() {
        return sampleTexture(A, resultUV);
      }
    
  
      float getBAtOutCoords() {
        return sampleTexture(B, resultUV);
      }

      float binaryOperation(float a, float b) {
        return a + b;
      }

      void main() {
        float a = getAAtOutCoords();
        float b = getBAtOutCoords();
        setOutput(binaryOperation(a, b));
      }`
    )
    gl.compileShader(shader)
    console.log(gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    const shader2 = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(shader2,
      `precision highp float;
    attribute vec3 clipSpacePos;
    attribute vec2 uv;
    varying vec2 resultUV;

    void main() {
      gl_Position = vec4(clipSpacePos, 1);
      resultUV = uv;
    }`)
    gl.compileShader(shader2)
    console.log(gl.getShaderParameter(shader2, gl.COMPILE_STATUS));
    const program = gl.createProgram()
    gl.attachShader(program, shader2)
    gl.attachShader(program, shader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      var info = gl.getProgramInfoLog(program);
      throw new Error('Could not compile WebGL program. \n\n' + info);
    }

    const clipSpacePosPosition = gl.getAttribLocation(program, 'clipSpacePos');
    console.log('clipSpacePosPosition:', clipSpacePosPosition);
    gl.enableVertexAttribArray(clipSpacePosPosition)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(clipSpacePosPosition, 3, gl.FLOAT, false, 20, 0)

    const uvPosition = gl.getAttribLocation(program, 'uv')
    console.log('uvPosition:', uvPosition);
    gl.enableVertexAttribArray(uvPosition)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(uvPosition, 2, gl.FLOAT, false, 20, 12)

    const ulocation = gl.getUniformLocation(program, 'A')
    const ulocation1 = gl.getUniformLocation(program, 'B')
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.log('texture failed to attach to framebuffer')
    }
    gl.viewport(0, 0, 1, 1)
    gl.scissor(0, 0, 1, 1)
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture1)
    gl.uniform1i(ulocation, 0)
    gl.activeTexture(gl.TEXTURE0 + 1)
    gl.bindTexture(gl.TEXTURE_2D, texture2)
    gl.uniform1i(ulocation1, 1)
    gl.drawElements(gl.TRIANGLES, triangleVertexIndices.length, gl.UNSIGNED_SHORT, 0)
    return texture;
  }

  function decodeOutput(gl, framebuffer, vertexbuffer, texture) {
    const texture1 = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture1)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    const shader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(shader,
      `precision highp float;
      precision highp int;
      varying vec2 resultUV;

    float sampleTexture(sampler2D textureSampler, vec2 uv) {
      return texture2D(textureSampler, uv).r;
    }


    void setOutput(float val) {
      gl_FragColor = vec4(val, 0, 0, 0);
    }

    uniform sampler2D A;

      float getAAtOutCoords() {
        return sampleTexture(A, resultUV);
      }
    
      bool isNaN(float val) {
        return (val < 1.0 || 0.0 < val || val == 0.0) ? false : true;
      }

      const float FLOAT_MAX = 1.70141184e38;
      const float FLOAT_MIN = 1.17549435e-38;

      lowp vec4 encode_float(highp float v) {
        if (isNaN(v)) {
          return vec4(255, 255, 255, 255);
        }

        highp float av = abs(v);

        if(av < FLOAT_MIN) {
          return vec4(0.0, 0.0, 0.0, 0.0);
        } else if(v > FLOAT_MAX) {
          return vec4(0.0, 0.0, 128.0, 127.0) / 255.0;
        } else if(v < -FLOAT_MAX) {
          return vec4(0.0, 0.0,  128.0, 255.0) / 255.0;
        }

        highp vec4 c = vec4(0,0,0,0);

        highp float e = floor(log2(av));
        highp float m = exp2(fract(log2(av))) - 1.0;

        c[2] = floor(128.0 * m);
        m -= c[2] / 128.0;
        c[1] = floor(32768.0 * m);
        m -= c[1] / 32768.0;
        c[0] = floor(8388608.0 * m);

        highp float ebias = e + 127.0;
        c[3] = floor(ebias / 2.0);
        ebias -= c[3] * 2.0;
        c[2] += floor(ebias) * 128.0;

        c[3] += 128.0 * step(0.0, -v);

        return c / 255.0;
      }

      void main() {
        float x = getAAtOutCoords();
        gl_FragColor = encode_float(x);
      }`
    )
    gl.compileShader(shader)
    console.log(gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    const shader2 = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(shader2,
      `precision highp float;
    attribute vec3 clipSpacePos;
    attribute vec2 uv;
    varying vec2 resultUV;

    void main() {
      gl_Position = vec4(clipSpacePos, 1);
      resultUV = uv;
    }`)
    gl.compileShader(shader2)
    console.log(gl.getShaderParameter(shader2, gl.COMPILE_STATUS))
    const program = gl.createProgram()
    gl.attachShader(program, shader2)
    gl.attachShader(program, shader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      var info = gl.getProgramInfoLog(program);
      throw new Error('Could not compile WebGL program. \n\n' + info);
    }
    const ulocation = gl.getUniformLocation(program, 'A')
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0)
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.log('texture failed to attach to framebuffer')
    }
    gl.viewport(0, 0, 1, 1)
    gl.scissor(0, 0, 1, 1)
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(ulocation, 0)
    gl.drawElements(gl.TRIANGLES, triangleVertexIndices.length, gl.UNSIGNED_SHORT, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0)
    const output = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, output)
    //gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    return new Float32Array(output.buffer)
  }

  const [gl, framebuffer, vertexBuffer] = init();

  document.getElementById('add').onclick=()=>{
    const o1=parseInt(document.getElementById('o1').value.trim());
    const o2=parseInt(document.getElementById('o2').value.trim());

    const texture = add(gl, framebuffer, vertexBuffer,o1,o2)
    const output = decodeOutput(gl, framebuffer, vertexBuffer, texture)
    console.log('output length:',output.length);
    const element = document.getElementById('output')
    element.textContent = output[0]

  };

})();
