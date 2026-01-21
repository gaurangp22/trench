import { Link } from "react-router-dom";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Monitor, Palette, PenTool, Megaphone, Code2, Cpu, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
    {
        name: "Blockchain & Web3",
        filter: "Blockchain",
        icon: Code2,
        description: "Smart contracts, DeFi, dApps",
        className: "md:col-span-2 md:row-span-2",
        gradient: "from-blue-600 via-indigo-600 to-blue-600",
        beamColor: "#2563eb" // Blue-600
    },
    {
        name: "Design & Creative",
        filter: "Design",
        icon: Palette,
        description: "UI/UX, Brand Identity, Motion",
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-orange-500 via-amber-500 to-orange-500",
        beamColor: "#f97316" // Orange-500
    },
    {
        name: "Development",
        filter: "Development",
        icon: Monitor,
        description: "Full Stack, Frontend, Backend",
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-cyan-500 via-blue-500 to-cyan-500",
        beamColor: "#06b6d4" // Cyan-500
    },
    {
        name: "AI & ML",
        filter: "Data",
        icon: Cpu,
        description: "Models, Training, Analysis",
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-emerald-500 via-teal-500 to-emerald-500",
        beamColor: "#10b981" // Emerald-500
    },
    {
        name: "Marketing",
        filter: "Marketing",
        icon: Megaphone,
        description: "Growth, SEO, Social",
        className: "md:col-span-1 md:row-span-2",
        gradient: "from-red-500 via-rose-500 to-red-500",
        beamColor: "#ef4444" // Red-500
    },
    {
        name: "Writing",
        filter: "Writing",
        icon: PenTool,
        description: "Copy, Technical, Content",
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-slate-500 via-zinc-500 to-slate-500",
        beamColor: "#64748b" // Slate-500
    },
];

export function PremiumCategories() {
    return (
        <section className="py-24 sm:py-32 bg-[#020204] relative">
            <div className="container max-w-7xl mx-auto px-6">
                <div className="mb-16 md:text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-heading font-semibold text-white mb-6">
                        Find talent in <span className="text-zinc-500">every field.</span>
                    </h2>
                    <p className="text-lg text-zinc-400">
                        From smart contract engineers to creative directors, find the experts you need to build the future.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-4">
                    {categories.map((category, i) => (
                        <BentoCard key={i} category={category} />
                    ))}

                    <Link
                        to="/jobs"
                        className="group relative md:col-span-1 md:row-span-1 bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center hover:border-white/10 transition-colors"
                    >
                        <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors" />
                        {/* Subtle Beam for "View All" */}
                        <BorderBeam duration={8} size={200} className="from-transparent via-white/20 to-transparent" />
                        <div className="text-center">
                            <span className="text-zinc-400 text-sm font-medium group-hover:text-white transition-colors">View All Categories</span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}

function BentoCard({ category }: { category: typeof categories[0] }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <Link
            to={`/jobs?filter=${category.filter}`}
            className={cn(
                "group relative border border-white/10 bg-[#0a0a0c] rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                category.className
            )}
            onMouseMove={handleMouseMove}
        >
            {/* Mouse follower gradient */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.06),
              transparent 80%
            )
          `,
                }}
            />

            {/* Electric Border Beam */}
            <BorderBeam
                duration={10}
                size={300}
                color={category.beamColor}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />

            <div className="relative h-full p-6 flex flex-col">
                {/* Icon Background Glow */}
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-auto text-white relative overflow-hidden",
                    "bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110",
                    category.gradient
                )}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    <category.icon className="w-6 h-6 relative z-10" />
                </div>

                <div className="mt-4 relative z-10">
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">
                        {category.name}
                    </h3>
                    <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        {category.description}
                    </p>
                </div>

                {/* Arrow hint often found in bento grids */}
                <div className="absolute top-6 right-6 opacity-0 -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <Globe className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
            </div>
        </Link>
    );
}

interface BorderBeamProps {
    className?: string;
    size?: number;
    duration?: number;
    borderWidth?: number;
    anchor?: number;
    color?: string;
    delay?: number;
}

function BorderBeam({
    className,
    size = 200,
    duration = 15,
    anchor = 90,
    borderWidth = 1.5,
    color = "#ffffff", // Default white if not specified
    delay = 0,
}: BorderBeamProps) {
    return (
        <div
            style={
                {
                    "--size": size,
                    "--duration": duration,
                    "--anchor": anchor,
                    "--border-width": borderWidth,
                    "--color-from": "transparent",
                    "--color-to": color,
                    "--delay": `-${delay}s`,
                } as React.CSSProperties
            }
            className={cn(
                "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
                // Mask styles
                "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
                // Layer styles
                "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-to),var(--color-from),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
                className
            )}
        />
    );
}
