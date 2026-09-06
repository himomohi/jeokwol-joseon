import { PAL, parseHex } from "../art/palette";

const VERT = `attribute vec2 a_pos; varying vec2 v_uv; void main(){ v_uv = a_pos*0.5+0.5; v_uv.y = 1.0-v_uv.y; gl_Position = vec4(a_pos,0.0,1.0); }`;

const FRAG = `precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_bloom;
uniform float u_crt;
uniform vec3 u_void;
varying vec2 v_uv;
vec3 sampleB(vec2 uv){ return texture2D(u_tex, uv).rgb; }
void main(){
  vec2 uv = v_uv;
  vec2 c = uv*2.0-1.0;
  c *= 1.0 + u_crt * 0.06 * dot(c,c);
  uv = c*0.5+0.5;
  if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){ gl_FragColor = vec4(u_void,1.0); return; }
  vec3 col = sampleB(uv);
  vec2 px = 1.0/u_res;
  vec3 blur = vec3(0.0);
  blur += sampleB(uv+vec2(px.x*2.0,0.0));
  blur += sampleB(uv-vec2(px.x*2.0,0.0));
  blur += sampleB(uv+vec2(0.0,px.y*2.0));
  blur += sampleB(uv-vec2(0.0,px.y*2.0));
  blur += sampleB(uv+px*2.0);
  blur += sampleB(uv-px*2.0);
  blur *= 0.166;
  float lum = dot(col, vec3(0.3,0.5,0.2));
  col += blur * u_bloom * smoothstep(0.45, 0.9, lum);
  float scan = 1.0 - u_crt * 0.08 * sin(uv.y * u_res.y * 3.14159);
  col *= scan;
  col *= 0.78 + 0.22 * smoothstep(0.95, 0.2, length(c));
  gl_FragColor = vec4(col, 1.0);
}`;

export class PostFx {
  gl: WebGLRenderingContext | null = null;
  lost = false;
  private tex: WebGLTexture | null = null;
  private prog: WebGLProgram | null = null;
  private buf: WebGLBuffer | null = null;
  private uRes: WebGLUniformLocation | null = null;
  private uBloom: WebGLUniformLocation | null = null;
  private uCrt: WebGLUniformLocation | null = null;
  private uVoid: WebGLUniformLocation | null = null;
  canvas: HTMLCanvasElement;

  constructor(private dest: HTMLCanvasElement) {
    this.canvas = dest;
    this.init();
  }

  private init(): void {
    const gl = this.dest.getContext("webgl", { alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
    this.gl = gl;
    if (!gl) return;
    this.dest.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.lost = true;
    });
    this.dest.addEventListener("webglcontextrestored", () => {
      this.lost = false;
      this.init();
    });
    const vs = this.shader(gl, gl.VERTEX_SHADER, VERT);
    const fs = this.shader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    this.prog = p;
    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.uRes = gl.getUniformLocation(p, "u_res");
    this.uBloom = gl.getUniformLocation(p, "u_bloom");
    this.uCrt = gl.getUniformLocation(p, "u_crt");
    this.uVoid = gl.getUniformLocation(p, "u_void");
  }

  private shader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  apply(src: HTMLCanvasElement, bloom = 0.55, crt = 0.45): boolean {
    const gl = this.gl;
    if (!gl || this.lost || !this.prog || !this.tex) return false;
    const w = this.dest.width;
    const h = this.dest.height;
    gl.viewport(0, 0, w, h);
    gl.useProgram(this.prog);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    } catch {
      return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    const loc = gl.getAttribLocation(this.prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(this.uRes, w, h);
    gl.uniform1f(this.uBloom, bloom);
    gl.uniform1f(this.uCrt, crt);
    const v = parseHex(PAL.bg_void);
    gl.uniform3f(this.uVoid, v.r / 255, v.g / 255, v.b / 255);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }
}
