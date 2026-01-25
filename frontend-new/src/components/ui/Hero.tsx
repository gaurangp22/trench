import React, { useRef, useEffect } from 'react';

// Types
interface HeroProps {
    headline: {
        eyebrow?: string;
        main: string;
        highlight: string;
    };
    subtitle: string;
    primaryCTA: {
        text: string;
        onClick?: () => void;
    };
    secondaryCTA?: {
        text: string;
        onClick?: () => void;
    };
    audienceToggle?: {
        audienceType: 'client' | 'freelancer';
        setAudienceType: (type: 'client' | 'freelancer') => void;
    };
    className?: string;
}

// Premium Dark Shader - Dynamic Swirling Cosmic Effect (indigo/blue theme)
const shaderSource = `#version 300 es
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

    // Offset the effect to the RIGHT side and UP
    uv.x -= 0.5; // Push visual center to the right
    uv.y -= 0.12; // Push visual center upward (negative = up in this coord system)
    st.x -= 0.3;

    vec3 col=vec3(0);
    float bg=clouds(vec2(st.x+T*.4,-st.y));
    uv*=1.-.3*(sin(T*.15)*.5+.5);

    for (float i=1.; i<12.; i++) {
        uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.4+.1*uv.x);
        vec2 p=uv;
        float d=length(p);
        // Indigo/Purple/Blue color scheme
        col+=.00125/d*(cos(sin(i)*vec3(0.5, 1.5, 3.0))+1.);
        float b=noise(i+p+bg*1.731);
        col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
        // Deep indigo-purple tint
        col=mix(col,vec3(bg*.08, bg*.05, bg*.18),d);
    }

    // Subtle vignette
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv));
    col *= 0.8 + 0.2 * vignette;

    O=vec4(col,1);
}`;

// WebGL Renderer with visibility-based pausing
class ShaderRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram | null = null;
    private animationId: number = 0;
    private startTime: number = 0;
    private pausedTime: number = 0;
    private isRunning: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2')!;
        this.startTime = performance.now();
        this.init();
    }

    private init() {
        const gl = this.gl;

        // Vertex shader
        const vs = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vs, `#version 300 es
            in vec4 position;
            void main() { gl_Position = position; }`);
        gl.compileShader(vs);

        // Fragment shader
        const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fs, shaderSource);
        gl.compileShader(fs);

        // Program
        this.program = gl.createProgram()!;
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        // Geometry
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);

        const position = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    render = () => {
        if (!this.isRunning) return;

        const gl = this.gl;
        const program = this.program!;

        gl.useProgram(program);
        gl.uniform2f(gl.getUniformLocation(program, 'resolution'), this.canvas.width, this.canvas.height);
        gl.uniform1f(gl.getUniformLocation(program, 'time'), (performance.now() - this.startTime - this.pausedTime) * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.animationId = requestAnimationFrame(this.render);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.render();
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    }

    destroy() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    }
}

// Hook with visibility-based pausing
const useShader = (sectionRef: React.RefObject<HTMLElement | null>) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<ShaderRenderer | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const renderer = new ShaderRenderer(canvasRef.current);
        rendererRef.current = renderer;

        const handleResize = () => renderer.resize();
        handleResize();

        // Use IntersectionObserver to pause shader when not visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        renderer.start();
                    } else {
                        renderer.pause();
                    }
                });
            },
            { threshold: 0 } // Trigger as soon as any part is visible/hidden
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        // Start initially if visible
        renderer.start();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
            renderer.destroy();
        };
    }, [sectionRef]);

    return canvasRef;
};

// HERO COMPONENT - Premium Asymmetric Design
const Hero: React.FC<HeroProps> = ({
    headline,
    subtitle,
    primaryCTA,
    secondaryCTA,
    audienceToggle,
    className = ""
}) => {
    const sectionRef = useRef<HTMLElement>(null);
    const canvasRef = useShader(sectionRef);

    return (
        <section ref={sectionRef} className={`relative min-h-screen overflow-hidden bg-[#020204] ${className}`}>
            {/* Shader Background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ background: '#020204' }}
            />

            {/* Content Layer */}
            <div className="relative z-10 min-h-screen">
                {/* Main Hero Content - Left Aligned for Impact */}
                <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 sm:pt-40 lg:pt-48 pb-32">

                    {/* Audience Toggle */}
                    {audienceToggle && (
                        <div className="mb-8 animate-[fadeIn_0.6s_ease-out]">
                            <style>{`
                                .toggle-btn-filled .gradient-fill {
                                    transform: translateX(0) !important;
                                }
                            `}</style>
                            <div className="inline-flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                                {/* Client Button */}
                                <button
                                    onClick={() => audienceToggle.setAudienceType('client')}
                                    className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 bg-white/10 border border-white/20 hover:border-white/40 hover:shadow-lg cursor-pointer ${
                                        audienceToggle.audienceType === 'client' ? 'toggle-btn-filled' : ''
                                    }`}
                                >
                                    <span
                                        className={`gradient-fill absolute inset-0 transition-transform duration-500 ease-out ${
                                            audienceToggle.audienceType === 'client'
                                                ? 'translate-x-0'
                                                : '-translate-x-full group-hover:translate-x-0'
                                        }`}
                                        style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                                    />
                                    <span className="relative z-10 text-white">I'm a Client</span>
                                </button>

                                {/* Freelancer Button */}
                                <button
                                    onClick={() => audienceToggle.setAudienceType('freelancer')}
                                    className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 bg-white/10 border border-white/20 hover:border-white/40 hover:shadow-lg cursor-pointer ${
                                        audienceToggle.audienceType === 'freelancer' ? 'toggle-btn-filled' : ''
                                    }`}
                                >
                                    <span
                                        className={`gradient-fill absolute inset-0 transition-transform duration-500 ease-out ${
                                            audienceToggle.audienceType === 'freelancer'
                                                ? 'translate-x-0'
                                                : '-translate-x-full group-hover:translate-x-0'
                                        }`}
                                        style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                                    />
                                    <span className="relative z-10 text-white">I'm a Freelancer</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Eyebrow */}
                    {headline.eyebrow && (
                        <div className="mb-6 animate-[fadeIn_0.6s_ease-out]">
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 tracking-wide">
                                <span className="w-8 h-px bg-gradient-to-r from-indigo-500 to-transparent"></span>
                                {headline.eyebrow}
                            </span>
                        </div>
                    )}

                    {/* Main Headline - Dramatic Typography */}
                    <div className="max-w-4xl">
                        <h1 className="text-[clamp(3rem,8vw,6rem)] font-heading font-semibold text-white leading-[0.95] tracking-[-0.03em] animate-[fadeInUp_0.8s_ease-out_0.1s_both]">
                            {headline.main}
                        </h1>
                        <h1 className="text-[clamp(3rem,8vw,6rem)] font-editorial italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 leading-[0.95] tracking-[-0.02em] animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
                            {headline.highlight}
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <div className="mt-8 max-w-xl animate-[fadeInUp_0.8s_ease-out_0.35s_both]">
                        <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-wrap items-center gap-4 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
                        <button
                            onClick={primaryCTA.onClick}
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-heading font-semibold text-base transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                {primaryCTA.text}
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        </button>

                        {secondaryCTA && (
                            <button
                                onClick={secondaryCTA.onClick}
                                className="px-6 py-4 text-zinc-400 hover:text-white font-medium text-base transition-colors duration-300 cursor-pointer"
                            >
                                {secondaryCTA.text}
                            </button>
                        )}
                    </div>


                </div>

                {/* Decorative: Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            </div>
        </section>
    );
};

export default Hero;
export { Hero };
export type { HeroProps };
