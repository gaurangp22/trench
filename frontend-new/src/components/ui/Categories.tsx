import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code, Desktop, PaintBrush, Brain, Megaphone, PencilLine, ArrowUpRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const categories = [
    {
        name: "Blockchain & Web3",
        filter: "Blockchain",
        Icon: Code,
        description: "Smart contracts, DeFi protocols, NFT infrastructure",
        offers: "2.4k+ offers",
        gradient: "from-violet-600 via-purple-600 to-indigo-600",
        accentColor: "violet",
    },
    {
        name: "Development",
        filter: "Development",
        Icon: Desktop,
        description: "Full-stack applications, APIs, system architecture",
        offers: "1.8k+ offers",
        gradient: "from-cyan-500 via-blue-500 to-indigo-500",
        accentColor: "cyan",
    },
    {
        name: "Design & Creative",
        filter: "Design",
        Icon: PaintBrush,
        description: "Brand identity, UI/UX, motion graphics",
        offers: "900+ offers",
        gradient: "from-orange-500 via-amber-500 to-yellow-500",
        accentColor: "amber",
    },
    {
        name: "AI & Machine Learning",
        filter: "Data",
        Icon: Brain,
        description: "Model training, data pipelines, AI integration",
        offers: "650+ offers",
        gradient: "from-emerald-500 via-teal-500 to-cyan-500",
        accentColor: "emerald",
    },
    {
        name: "Marketing & Growth",
        filter: "Marketing",
        Icon: Megaphone,
        description: "Community building, SEO, social campaigns",
        offers: "500+ offers",
        gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
        accentColor: "rose",
    },
    {
        name: "Writing & Content",
        filter: "Writing",
        Icon: PencilLine,
        description: "Technical docs, copywriting, whitepapers",
        offers: "400+ offers",
        gradient: "from-slate-400 via-zinc-400 to-neutral-400",
        accentColor: "slate",
    },
];

export function Categories() {
    return (
        <section className="py-32 bg-[#020204] relative overflow-hidden">
            {/* Ambient background - removed blur for performance */}

            <div className="container max-w-7xl mx-auto px-6 relative z-10">
                {/* Header - Left aligned for asymmetry */}
                <div className="max-w-2xl mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-sm font-mono text-emerald-400 tracking-wider uppercase mb-4 block">
                            Explore Talent
                        </span>
                        <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-[1.1]">
                            Every skill you need,
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                                one platform.
                            </span>
                        </h2>
                        <p className="text-xl text-zinc-400 leading-relaxed">
                            Browse thousands of verified professionals across every Web3 discipline.
                        </p>
                    </motion.div>
                </div>

                {/* Featured Category - Large Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-6"
                >
                    <Link
                        to={`/offers?filter=${categories[0].filter}`}
                        className="group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0c0c10] to-[#0a0a0c]"
                    >
                        {/* Large gradient background on hover */}
                        <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                            `bg-gradient-to-br ${categories[0].gradient}`
                        )} style={{ opacity: 0.08 }} />


                        <div className="relative p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center",
                                        "bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30",
                                        "group-hover:scale-110 group-hover:border-violet-400/50 transition-all duration-500"
                                    )}>
                                        <Code size={32} weight="duotone" className="text-violet-400" />
                                    </div>
                                    <div className="px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                                        <span className="text-violet-400 text-sm font-medium">{categories[0].offers}</span>
                                    </div>
                                </div>

                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-violet-50 transition-colors">
                                    {categories[0].name}
                                </h3>
                                <p className="text-lg text-zinc-400 max-w-lg group-hover:text-zinc-300 transition-colors">
                                    {categories[0].description}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 text-white/60 group-hover:text-white transition-colors">
                                <span className="text-sm font-medium">Explore category</span>
                                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                                    <ArrowUpRight size={20} weight="bold" className=" group-hover:text-black transition-colors" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Secondary Categories - Asymmetric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.slice(1).map((category, i) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Link
                                to={`/offers?filter=${category.filter}`}
                                className="group relative block h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0c] hover:border-white/15 transition-all duration-500"
                            >
                                {/* Subtle hover gradient */}
                                <div className={cn(
                                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                    `bg-gradient-to-br ${category.gradient}`
                                )} style={{ opacity: 0.05 }} />

                                <div className="relative p-7">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center",
                                            `bg-${category.accentColor}-500/10 border border-${category.accentColor}-500/20`,
                                            "group-hover:scale-110 transition-transform duration-500"
                                        )}
                                        style={{
                                            background: `linear-gradient(135deg, ${getAccentColor(category.accentColor)}15, ${getAccentColor(category.accentColor)}08)`,
                                            borderColor: `${getAccentColor(category.accentColor)}30`
                                        }}
                                        >
                                            <category.Icon
                                                size={24}
                                                weight="duotone"
                                                style={{ color: getAccentColor(category.accentColor) }}
                                            />
                                        </div>

                                        <ArrowUpRight size={20} weight="bold" className=" text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                                    </div>

                                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-zinc-500 mb-4 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                        {category.description}
                                    </p>

                                    <div className="pt-4 border-t border-white/[0.04]">
                                        <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                            {category.offers}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Browse All Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <Link
                        to="/offers"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group cursor-pointer"
                    >
                        <span className="text-sm font-medium">View all categories</span>
                        <ArrowUpRight size={16} weight="bold" className=" group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function getAccentColor(color: string): string {
    const colors: Record<string, string> = {
        violet: "#8B5CF6",
        cyan: "#06B6D4",
        amber: "#F59E0B",
        emerald: "#10B981",
        rose: "#F43F5E",
        slate: "#64748B",
    };
    return colors[color] || "#8B5CF6";
}
