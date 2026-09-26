import { ShaderConfig } from '../types/pipeline';

const SHADER_SOURCE = {
  vertex: `
    attribute vec2 a_position;
    varying vec2 v_uv;

    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `,
  fragment: `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_curvature;
    uniform float u_chroma;
    uniform float u_scanlines;
    uniform float u_sweep;

    vec2 distort(vec2 uv, float intensity) {
      vec2 centered = uv - 0.5;
      float dist = dot(centered, centered);
      return uv + centered * dist * intensity;
    }

    void main() {
      vec2 uv = distort(v_uv, u_curvature);
      vec2 tc = clamp(uv, 0.0, 1.0);

      vec2 center = tc - 0.5;
      float dist = length(center);
      float offset = u_chroma * dist;

      vec2 redUv = tc + normalize(center + 0.0001) * offset * 0.15;
      vec2 blueUv = tc - normalize(center + 0.0001) * offset * 0.15;

      float r = texture2D(u_texture, clamp(redUv, 0.0, 1.0)).r;
      float g = texture2D(u_texture, clamp(tc, 0.0, 1.0)).g;
      float b = texture2D(u_texture, clamp(blueUv, 0.0, 1.0)).b;

      float scan = 1.0 - u_scanlines * (0.5 + 0.5 * sin(tc.y * u_resolution.y * 2.0 + u_time * 12.0));
      float sweep = 1.0 - u_sweep * (0.5 + 0.5 * sin((tc.x * 0.8 + u_time * 0.2) * 30.0));

      vec3 color = vec3(r, g, b) * scan * sweep;
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

export class ShaderPipeline {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null;
  private program: WebGLProgram | null;
  private texture: WebGLTexture | null;
  private buffer: WebGLBuffer | null;
  private animationStart = performance.now();

  constructor(targetCanvas: HTMLCanvasElement) {
    this.canvas = targetCanvas;
    this.gl = this.canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
    this.program = null;
    this.texture = null;
    this.buffer = null;

    if (!this.gl) {
      return;
    }

    this.program = this.createProgram();
    if (!this.program) {
      this.dispose();
      return;
    }

    this.buffer = this.gl.createBuffer();
    if (this.buffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
          -1, -1,
           1, -1,
          -1,  1,
          -1,  1,
           1, -1,
           1,  1
        ]),
        this.gl.STATIC_DRAW
      );
    }

    this.texture = this.gl.createTexture();
    if (this.texture) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }
  }

  public render(source: HTMLCanvasElement, config: ShaderConfig): void {
    if (!this.gl || !this.program || !this.buffer || !this.texture) return;

    const gl = this.gl;
    const width = source.width;
    const height = source.height;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const loc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    const uResolution = gl.getUniformLocation(this.program, 'u_resolution');
    const uTime = gl.getUniformLocation(this.program, 'u_time');
    const uCurvature = gl.getUniformLocation(this.program, 'u_curvature');
    const uChroma = gl.getUniformLocation(this.program, 'u_chroma');
    const uScanlines = gl.getUniformLocation(this.program, 'u_scanlines');
    const uSweep = gl.getUniformLocation(this.program, 'u_sweep');

    gl.uniform2f(uResolution, width, height);
    gl.uniform1f(uTime, (performance.now() - this.animationStart) / 1000);
    gl.uniform1f(uCurvature, config.curvature);
    gl.uniform1f(uChroma, config.chromaticAberration);
    gl.uniform1f(uScanlines, config.scanlines);
    gl.uniform1f(uSweep, config.sweep);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  public dispose(): void {
    if (!this.gl) return;

    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }

    if (this.texture) {
      this.gl.deleteTexture(this.texture);
      this.texture = null;
    }

    if (this.buffer) {
      this.gl.deleteBuffer(this.buffer);
      this.buffer = null;
    }

    this.gl = null;
  }

  private createProgram(): WebGLProgram | null {
    if (!this.gl) return null;

    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, SHADER_SOURCE.vertex);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, SHADER_SOURCE.fragment);
    if (!vertexShader || !fragmentShader) return null;

    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.warn('ShaderPipeline: falha ao linkar programa WebGL.', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);
    return program;
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.warn('ShaderPipeline: erro ao compilar shader.', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
}
