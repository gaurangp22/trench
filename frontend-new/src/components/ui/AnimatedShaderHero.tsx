import React, { useRef, useEffect } from 'react';
import { GradientSlideButton } from './GradientSlideButton';

// Types for component props
interface HeroProps {
    trustBadge?: {
        text: string;
        icon?: React.ReactNode;
    };
    headline: {
        line1: string;
        line2: string;
    };
    subtitle: string;
    buttons?: {
        primary?: {
            text: string;
            onClick?: () => void;
            icon?: React.ReactNode;
        };
        secondary?: {
            text: string;
            onClick?: () => void;
        };
    };
    stats?: Array<{
        value: string;
        label: string;
    }>;
    className?: string;
}

// Dark/Purple themed shader with cosmic nebula effect
// Deep Cosmic Blue/Indigo theme - ORIGINAL QUALITY restored
const darkShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}

float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}

void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.3,-st.y));
  uv*=1.-.3*(sin(T*.15)*.5+.5);

  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.4+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(0.5, 0.8, 3.0))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.02,bg*.02,bg*.1),d);
  }

  col += vec3(0.01, 0.02, 0.05) * (1.0 - length(uv) * 0.5);

  O=vec4(col,1);
}`;

// ... WebGL Classes remain the same ...
// WebGL Renderer class
class WebGLRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram | null = null;
    private vs: WebGLShader | null = null;
    private fs: WebGLShader | null = null;
    private buffer: WebGLBuffer | null = null;
    private shaderSource: string;
    private mouseMove: [number, number] = [0, 0];
    private mouseCoords: [number, number] = [0, 0];
    private pointerCoords: number[] = [0, 0];
    private nbrOfPointers = 0;

    private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

    private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

    constructor(canvas: HTMLCanvasElement, scale: number) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2')!;
        this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
        this.shaderSource = darkShaderSource;
    }

    updateShader(source: string) {
        this.reset();
        this.shaderSource = source;
        this.setup();
        this.init();
    }

    updateMove(deltas: [number, number]) {
        this.mouseMove = deltas;
    }

    updateMouse(coords: [number, number]) {
        this.mouseCoords = coords;
    }

    updatePointerCoords(coords: number[]) {
        this.pointerCoords = coords;
    }

    updatePointerCount(nbr: number) {
        this.nbrOfPointers = nbr;
    }

    updateScale(scale: number) {
        this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }

    compile(shader: WebGLShader, source: string) {
        const gl = this.gl;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            console.error('Shader compilation error:', error);
        }
    }

    test(source: string) {
        let result = null;
        const gl = this.gl;
        const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            result = gl.getShaderInfoLog(shader);
        }
        gl.deleteShader(shader);
        return result;
    }

    reset() {
        const gl = this.gl;
        if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
            if (this.vs) {
                gl.detachShader(this.program, this.vs);
                gl.deleteShader(this.vs);
            }
            if (this.fs) {
                gl.detachShader(this.program, this.fs);
                gl.deleteShader(this.fs);
            }
            gl.deleteProgram(this.program);
        }
    }

    setup() {
        const gl = this.gl;
        this.vs = gl.createShader(gl.VERTEX_SHADER)!;
        this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        this.compile(this.vs, this.vertexSrc);
        this.compile(this.fs, this.shaderSource);
        this.program = gl.createProgram()!;
        gl.attachShader(this.program, this.vs);
        gl.attachShader(this.program, this.fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(this.program));
        }
    }

    init() {
        const gl = this.gl;
        const program = this.program!;

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        (program as any).resolution = gl.getUniformLocation(program, 'resolution');
        (program as any).time = gl.getUniformLocation(program, 'time');
        (program as any).move = gl.getUniformLocation(program, 'move');
        (program as any).touch = gl.getUniformLocation(program, 'touch');
        (program as any).pointerCount = gl.getUniformLocation(program, 'pointerCount');
        (program as any).pointers = gl.getUniformLocation(program, 'pointers');
    }

    render(now = 0) {
        const gl = this.gl;
        const program = this.program;

        if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        gl.uniform2f((program as any).resolution, this.canvas.width, this.canvas.height);
        gl.uniform1f((program as any).time, now * 1e-3);
        gl.uniform2f((program as any).move, this.mouseMove[0], this.mouseMove[1]);
        gl.uniform2f((program as any).touch, this.mouseCoords[0], this.mouseCoords[1]);
        gl.uniform1i((program as any).pointerCount, this.nbrOfPointers);
        gl.uniform2fv((program as any).pointers, this.pointerCoords);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

// Pointer Handler class remain same
class PointerHandler {
    private scale: number;
    private active = false;
    private pointers = new Map<number, [number, number]>();
    private lastCoords: [number, number] = [0, 0];
    private moves: [number, number] = [0, 0];

    constructor(element: HTMLCanvasElement, scale: number) {
        this.scale = scale;

        const mapCoords = (element: HTMLCanvasElement, scale: number, x: number, y: number): [number, number] =>
            [x * scale, element.height - y * scale];

        element.addEventListener('pointerdown', (e) => {
            this.active = true;
            this.pointers.set(e.pointerId, mapCoords(element, this.getScale(), e.clientX, e.clientY));
        });

        element.addEventListener('pointerup', (e) => {
            if (this.count === 1) {
                this.lastCoords = this.first;
            }
            this.pointers.delete(e.pointerId);
            this.active = this.pointers.size > 0;
        });

        element.addEventListener('pointerleave', (e) => {
            if (this.count === 1) {
                this.lastCoords = this.first;
            }
            this.pointers.delete(e.pointerId);
            this.active = this.pointers.size > 0;
        });

        element.addEventListener('pointermove', (e) => {
            if (!this.active) return;
            this.lastCoords = [e.clientX, e.clientY];
            this.pointers.set(e.pointerId, mapCoords(element, this.getScale(), e.clientX, e.clientY));
            this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
        });
    }

    getScale() {
        return this.scale;
    }

    updateScale(scale: number) {
        this.scale = scale;
    }

    get count() {
        return this.pointers.size;
    }

    get move(): [number, number] {
        return this.moves;
    }

    get coords() {
        return this.pointers.size > 0
            ? Array.from(this.pointers.values()).flat()
            : [0, 0];
    }

    get first(): [number, number] {
        const val = this.pointers.values().next().value;
        return val !== undefined ? val : this.lastCoords;
    }
}

// Reusable Shader Background Hook
const useShaderBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const pointersRef = useRef<PointerHandler | null>(null);

    const resize = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;

        if (rendererRef.current) {
            rendererRef.current.updateScale(dpr);
        }
    };

    const loop = (now: number) => {
        if (!rendererRef.current || !pointersRef.current) return;

        rendererRef.current.updateMouse(pointersRef.current.first);
        rendererRef.current.updatePointerCount(pointersRef.current.count);
        rendererRef.current.updatePointerCoords(pointersRef.current.coords);
        rendererRef.current.updateMove(pointersRef.current.move);
        rendererRef.current.render(now);
        animationFrameRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

        rendererRef.current = new WebGLRenderer(canvas, dpr);
        pointersRef.current = new PointerHandler(canvas, dpr);

        rendererRef.current.setup();
        rendererRef.current.init();

        resize();

        if (rendererRef.current.test(darkShaderSource) === null) {
            rendererRef.current.updateShader(darkShaderSource);
        }

        loop(0);

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.reset();
            }
        };
    }, []);

    return canvasRef;
};

// Main Hero Component - Premium Editorial Design
const AnimatedShaderHero: React.FC<HeroProps> = ({
    trustBadge,
    headline,
    subtitle,
    buttons,
    stats,
    className = ""
}) => {
    const canvasRef = useShaderBackground();

    return (
        <div className={`relative w-full min-h-screen overflow-hidden bg-[#030305] ${className}`}>
            {/* WebGL Canvas Background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-contain touch-none opacity-70"
                style={{ background: '#030305' }}
            />

            {/* Gradient Overlays for Premium Depth */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
            <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#030305_70%)] pointer-events-none" />

            {/* Hero Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24">

                {/* Trust Badge - Elegant & Subtle */}
                {trustBadge && (
                    <div className="mb-10 animate-[fadeInDown_0.6s_ease-out]">
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-full">
                            {trustBadge.icon && (
                                <span className="text-indigo-400">{trustBadge.icon}</span>
                            )}
                            <span className="text-[13px] text-zinc-400 font-medium tracking-wide">{trustBadge.text}</span>
                        </div>
                    </div>
                )}

                {/* Main Content Container */}
                <div className="text-center max-w-5xl mx-auto space-y-8">

                    {/* Headline - Mixed Typography */}
                    <div className="space-y-3">
                        {/* Line 1 - Clean Sans */}
                        <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl font-heading font-medium text-white/80 tracking-tight leading-[1.1] animate-[fadeInUp_0.7s_ease-out_0.1s_both]">
                            {headline.line1}
                        </h1>

                        {/* Line 2 - Editorial Serif Italic */}
                        <h1 className="text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[7rem] font-editorial italic text-white tracking-[-0.02em] leading-[1] animate-[fadeInUp_0.7s_ease-out_0.25s_both]">
                            {headline.line2}
                        </h1>
                    </div>

                    {/* Subtitle - Clean & Readable */}
                    <div className="max-w-lg mx-auto animate-[fadeInUp_0.7s_ease-out_0.4s_both]">
                        <p className="text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    {/* CTA Buttons - Premium */}
                    {buttons && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-[fadeInUp_0.7s_ease-out_0.55s_both]">
                            {buttons.primary && (
                                <GradientSlideButton
                                    onClick={buttons.primary.onClick}
                                    className="rounded-full px-7 py-3.5 font-heading font-semibold text-[15px] tracking-wide hover:scale-[1.03]"
                                    colorFrom="#8B5CF6"
                                    colorTo="#EC4899"
                                >
                                    {buttons.primary.text}
                                    {buttons.primary.icon}
                                </GradientSlideButton>
                            )}
                            {buttons.secondary && (
                                <button
                                    onClick={buttons.secondary.onClick}
                                    className="inline-flex items-center gap-2 px-7 py-3.5 text-zinc-400 hover:text-white font-heading font-medium text-[15px] tracking-wide transition-colors duration-300"
                                >
                                    {buttons.secondary.text}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats Bar - Anchored to Bottom */}
                {stats && stats.length > 0 && (
                    <div className="absolute bottom-8 sm:bottom-10 left-0 right-0 flex justify-center animate-[fadeInUp_0.7s_ease-out_0.7s_both]">
                        <div className="flex items-center divide-x divide-white/10">
                            {stats.map((stat, index) => (
                                <div key={index} className="px-6 sm:px-8 text-center">
                                    <div className="text-xl sm:text-2xl font-heading font-semibold text-white tracking-tight">{stat.value}</div>
                                    <div className="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-[0.15em] mt-0.5">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimatedShaderHero;
export { AnimatedShaderHero };
export type { HeroProps };
