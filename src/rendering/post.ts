import { PAL, parseHex } from "../art/palette";

const VERT = `attribute vec2 a_pos; varying vec2 v_uv; void main(){ v_uv = a_pos*0.5+0.5; v_uv.y = 1.0-v_uv.y; gl_Position = vec4(a_pos,0.0,1.0); }`;

const EXTRACT = `precision mediump float;
uniform sampler2D u_tex;
varying vec2 v_uv;
void main(){
  vec3 c = texture2D(u_tex, v_uv).rgb;
  float l = dot(c, vec3(0.30, 0.50, 0.20));
  float m = smoothstep(0.58, 0.86, l);
  gl_FragColor = vec4(c * m, 1.0);
}`;

const BLUR = `precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_dir;
varying vec2 v_uv;
void main(){
  vec2 d = u_dir;
  vec3 c = texture2D(u_tex, v_uv).rgb * 0.227027;
  c += texture2D(u_tex, v_uv + d * 1.384615).rgb * 0.316216;
  c += texture2D(u_tex, v_uv - d * 1.384615).rgb * 0.316216;
  c += texture2D(u_tex, v_uv + d * 3.230769).rgb * 0.070270;
  c += texture2D(u_tex, v_uv - d * 3.230769).rgb * 0.070270;
  gl_FragColor = vec4(c, 1.0);
}`;

const COMPOSITE = `precision mediump float;
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform vec2 u_res;
uniform float u_bloomAmt;
uniform float u_crt;
uniform vec3 u_void;
varying vec2 v_uv;
void main(){
  vec2 uv = v_uv;
  vec2 c = uv * 2.0 - 1.0;
  c *= 1.0 + u_crt * 0.032 * dot(c, c);
  uv = c * 0.5 + 0.5;
  if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0){
    gl_FragColor = vec4(u_void, 1.0);
    return;
  }
  vec3 col = texture2D(u_scene, uv).rgb;
  vec3 bloom = texture2D(u_bloom, uv).rgb;
  col += bloom * u_bloomAmt;
  float scan = 1.0 - u_crt * 0.045 * sin(uv.y * u_res.y * 3.14159);
  col *= scan;
  col *= 0.86 + 0.14 * smoothstep(1.08, 0.22, length(c));
  gl_FragColor = vec4(col, 1.0);
}`;

interface Target {
  tex: WebGLTexture;
  fb: WebGLFramebuffer;
  w: number;
  h: number;
}

/**
 * Real 4-pass bloom: bright extract → H blur → V blur → composite + restrained CRT.
 * UI lives in #ui-root and is never fed into this pipeline.
 * apply() returns false so the renderer can blit Canvas2D.
 */
export class PostFx {
  gl: WebGLRenderingContext | null = null;
  lost = false;
  canvas: HTMLCanvasElement;
  private sceneTex: WebGLTexture | null = null;
  private extractProg: WebGLProgram | null = null;
  private blurProg: WebGLProgram | null = null;
  private compProg: WebGLProgram | null = null;
  private buf: WebGLBuffer | null = null;
  private bloomA: Target | null = null;
  private bloomB: Target | null = null;
  private tw = 0;
  private th = 0;
  private uBlurDir: WebGLUniformLocation | null = null;
  private uBloomAmt: WebGLUniformLocation | null = null;
  private uCrt: WebGLUniformLocation | null = null;
  private uRes: WebGLUniformLocation | null = null;
  private uVoid: WebGLUniformLocation | null = null;
  private uScene: WebGLUniformLocation | null = null;
  private uBloomTex: WebGLUniformLocation | null = null;

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
      this.bloomA = null;
      this.bloomB = null;
      this.init();
    });
    this.extractProg = this.link(gl, EXTRACT);
    this.blurProg = this.link(gl, BLUR);
    this.compProg = this.link(gl, COMPOSITE);
    if (!this.extractProg || !this.blurProg || !this.compProg) return;
    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    this.sceneTex = this.makeTex(gl);
    this.uBlurDir = gl.getUniformLocation(this.blurProg, "u_dir");
    this.uBloomAmt = gl.getUniformLocation(this.compProg, "u_bloomAmt");
    this.uCrt = gl.getUniformLocation(this.compProg, "u_crt");
    this.uRes = gl.getUniformLocation(this.compProg, "u_res");
    this.uVoid = gl.getUniformLocation(this.compProg, "u_void");
    this.uScene = gl.getUniformLocation(this.compProg, "u_scene");
    this.uBloomTex = gl.getUniformLocation(this.compProg, "u_bloom");
  }

  private makeTex(gl: WebGLRenderingContext): WebGLTexture {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  private makeTarget(gl: WebGLRenderingContext, w: number, h: number): Target | null {
    const tex = this.makeTex(gl);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fb = gl.createFramebuffer();
    if (!fb) return null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!ok) return null;
    return { tex, fb, w, h };
  }

  private ensureTargets(gl: WebGLRenderingContext, w: number, h: number): boolean {
    const bw = Math.max(1, w >> 1);
    const bh = Math.max(1, h >> 1);
    if (this.bloomA && this.bloomB && this.tw === bw && this.th === bh) return true;
    this.bloomA = this.makeTarget(gl, bw, bh);
    this.bloomB = this.makeTarget(gl, bw, bh);
    this.tw = bw;
    this.th = bh;
    return !!(this.bloomA && this.bloomB);
  }

  private link(gl: WebGLRenderingContext, frag: string): WebGLProgram | null {
    const vs = this.shader(gl, gl.VERTEX_SHADER, VERT);
    const fs = this.shader(gl, gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return null;
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(p));
      return null;
    }
    return p;
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

  private bindQuad(gl: WebGLRenderingContext, prog: WebGLProgram): void {
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  apply(src: HTMLCanvasElement, bloom = 0.42, crt = 0.28): boolean {
    const gl = this.gl;
    if (!gl || this.lost || !this.extractProg || !this.blurProg || !this.compProg || !this.sceneTex) return false;
    const w = this.dest.width;
    const h = this.dest.height;
    if (w < 2 || h < 2) return false;
    if (!this.ensureTargets(gl, w, h) || !this.bloomA || !this.bloomB) return false;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTex);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    } catch {
      return false;
    }

    // 1) bright extract → bloomA
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomA.fb);
    gl.viewport(0, 0, this.bloomA.w, this.bloomA.h);
    this.bindQuad(gl, this.extractProg);
    gl.uniform1i(gl.getUniformLocation(this.extractProg, "u_tex"), 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 2) H blur bloomA → bloomB
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomB.fb);
    gl.viewport(0, 0, this.bloomB.w, this.bloomB.h);
    this.bindQuad(gl, this.blurProg);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomA.tex);
    gl.uniform1i(gl.getUniformLocation(this.blurProg, "u_tex"), 0);
    gl.uniform2f(this.uBlurDir, 1 / this.bloomB.w, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 3) V blur bloomB → bloomA
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomA.fb);
    gl.viewport(0, 0, this.bloomA.w, this.bloomA.h);
    this.bindQuad(gl, this.blurProg);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomB.tex);
    gl.uniform1i(gl.getUniformLocation(this.blurProg, "u_tex"), 0);
    gl.uniform2f(this.uBlurDir, 0, 1 / this.bloomA.h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 4) composite scene + bloom + CRT → canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    this.bindQuad(gl, this.compProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomA.tex);
    gl.uniform1i(this.uScene, 0);
    gl.uniform1i(this.uBloomTex, 1);
    gl.uniform2f(this.uRes, w, h);
    gl.uniform1f(this.uBloomAmt, bloom);
    gl.uniform1f(this.uCrt, crt);
    const v = parseHex(PAL.bg_void);
    gl.uniform3f(this.uVoid, v.r / 255, v.g / 255, v.b / 255);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }
}
