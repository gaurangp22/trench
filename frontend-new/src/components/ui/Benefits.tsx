import { ShieldCheck, Lightning, GlobeHemisphereWest, SealCheck } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

// Optimized hook - only triggers once when element enters viewport
function useInViewOnce(threshold = 0.2) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Stop observing after first trigger
                }
            },
            { threshold }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}

const benefits = [
    {
        Icon: ShieldCheck,
        title: "Trustless Escrow",
        headline: "Your money, your control.",
        description: "Funds are held in audited smart contracts—not our database. Release payment only when you're 100% satisfied with the delivered work.",
        stats: [
            { value: "$24M+", label: "Secured" },
            { value: "0", label: "Disputes" }
        ],
        accent: "#06B6D4",
        gradient: "from-cyan-500 to-blue-600"
    },
    {
        Icon: Lightning,
        title: "Instant Settlement",
        headline: "Seconds, not business days.",
        description: "The moment you approve work, payment hits the freelancer's wallet. No 3-5 day holds, no frozen accounts, no banking hours.",
        stats: [
            { value: "<1s", label: "Transfer" },
            { value: "24/7", label: "Availability" }
        ],
        accent: "#F59E0B",
        gradient: "from-amber-500 to-orange-600"
    },
    {
        Icon: GlobeHemisphereWest,
        title: "Borderless by Default",
        headline: "One wallet, infinite reach.",
        description: "Hire talent from 150+ countries without wire fees, currency conversion, or international payment headaches. Just connect and transact.",
        stats: [
            { value: "150+", label: "Countries" },
            { value: "$0", label: "Wire Fees" }
        ],
        accent: "#8B5CF6",
        gradient: "from-violet-500 to-purple-600"
    },
    {
        Icon: SealCheck,
        title: "Verified Reputation",
        headline: "Trust built on-chain.",
        description: "Every completed project adds to your immutable reputation. Verified reviews, transparent history, and credentials that follow you across the ecosystem.",
        stats: [
            { value: "100%", label: "On-Chain" },
            { value: "Immutable", label: "History" }
        ],
        accent: "#10B981",
        gradient: "from-emerald-500 to-teal-600"
    }
];

export function Benefits() {
    const headerView = useInViewOnce(0.3);

    return (
        <section className="py-32 bg-[#020204] relative overflow-hidden">
            {/* CSS Keyframes for animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes fadeInRight {
                    from {
                        opacity: 0;
                        transform: translateX(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes growBar {
                    from {
                        transform: scaleY(0);
                    }
                    to {
                        transform: scaleY(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s ease-out forwards;
                }
                .animate-fade-in-left {
                    animation: fadeInLeft 0.7s ease-out forwards;
                }
                .animate-fade-in-right {
                    animation: fadeInRight 0.7s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scaleIn 0.6s ease-out forwards;
                }
                .animate-grow-bar {
                    transform-origin: bottom;
                    animation: growBar 0.8s ease-out forwards;
                }
            `}</style>

            <div className="container max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div
                    ref={headerView.ref}
                    className={cn(
                        "max-w-3xl mb-24 opacity-0",
                        headerView.isVisible && "animate-fade-in-up"
                    )}
                >
                    <span className="text-sm font-mono text-emerald-400 tracking-wider uppercase mb-4 block">
                        Why TrenchJobs
                    </span>
                    <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-[1.1]">
                        Built for how
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400">
                            work should work.
                        </span>
                    </h2>
                    <p className="text-xl text-zinc-400 leading-relaxed">
                        Everything traditional platforms got wrong—the fees, the delays, the trust issues—we engineered away.
                    </p>
                </div>

                {/* Benefits - Alternating Layout */}
                <div className="space-y-32">
                    {benefits.map((benefit, index) => (
                        <BenefitRow
                            key={benefit.title}
                            benefit={benefit}
                            isReversed={index % 2 === 1}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function BenefitRow({
    benefit,
    isReversed,
    index
}: {
    benefit: typeof benefits[0];
    isReversed: boolean;
    index: number;
}) {
    const rowView = useInViewOnce(0.2);
    const contentAnimation = isReversed ? 'animate-fade-in-right' : 'animate-fade-in-left';
    const visualAnimation = isReversed ? 'animate-fade-in-left' : 'animate-fade-in-right';

    return (
        <div
            ref={rowView.ref}
            className={cn(
                "grid lg:grid-cols-2 gap-12 lg:gap-20 items-center",
                isReversed && "lg:grid-flow-dense"
            )}
        >
            {/* Content */}
            <div
                className={cn(
                    "opacity-0",
                    isReversed ? "lg:col-start-2" : "",
                    rowView.isVisible && contentAnimation
                )}
                style={{ animationDelay: '0.1s' }}
            >
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
                    style={{
                        backgroundColor: `${benefit.accent}15`,
                        color: benefit.accent
                    }}
                >
                    <benefit.Icon size={14} weight="duotone" />
                    {benefit.title}
                </div>

                <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    {benefit.headline}
                </h3>

                <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-lg">
                    {benefit.description}
                </p>

                {/* Stats */}
                <div className="flex gap-12">
                    {benefit.stats.map((stat, i) => (
                        <div key={i}>
                            <div
                                className="text-4xl font-bold font-heading mb-1"
                                style={{ color: benefit.accent }}
                            >
                                {stat.value}
                            </div>
                            <div className="text-sm text-zinc-500 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual */}
            <div
                className={cn(
                    "opacity-0",
                    isReversed ? "lg:col-start-1 lg:row-start-1" : "",
                    rowView.isVisible && visualAnimation
                )}
                style={{ animationDelay: '0.2s' }}
            >
                <BenefitVisual benefit={benefit} isVisible={rowView.isVisible} />
            </div>
        </div>
    );
}

function BenefitVisual({ benefit, isVisible }: { benefit: typeof benefits[0]; isVisible: boolean }) {
    return (
        <div className="relative">
            {/* Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0c0c10] to-[#080809] transition-all duration-500 hover:border-white/[0.15]">
                {/* Gradient accent line */}
                <div
                    className={cn(
                        "absolute top-0 left-0 right-0 h-1",
                        `bg-gradient-to-r ${benefit.gradient}`
                    )}
                />

                <div className="p-8 md:p-10">
                    {/* Large Icon */}
                    <div
                        className={cn(
                            "w-20 h-20 rounded-2xl flex items-center justify-center mb-8 opacity-0",
                            isVisible && "animate-scale-in"
                        )}
                        style={{
                            background: `linear-gradient(135deg, ${benefit.accent}20, ${benefit.accent}05)`,
                            border: `1px solid ${benefit.accent}30`,
                            animationDelay: '0.3s'
                        }}
                    >
                        <benefit.Icon
                            size={40}
                            weight="duotone"
                            style={{ color: benefit.accent }}
                        />
                    </div>

                    {/* Abstract visualization */}
                    <div className="space-y-4">
                        {/* Animated bars */}
                        <div className="flex items-end gap-2 h-20">
                            {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.5].map((height, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex-1 rounded-full",
                                        isVisible && "animate-grow-bar"
                                    )}
                                    style={{
                                        height: `${height * 100}%`,
                                        backgroundColor: i % 2 === 0 ? benefit.accent : `${benefit.accent}40`,
                                        animationDelay: `${0.4 + i * 0.08}s`,
                                        transform: isVisible ? undefined : 'scaleY(0)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Stat highlight */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                            <span className="text-sm text-zinc-500">
                                {benefit.stats[0].label}
                            </span>
                            <span
                                className="text-2xl font-bold font-mono"
                                style={{ color: benefit.accent }}
                            >
                                {benefit.stats[0].value}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Corner decoration */}
                <div
                    className="absolute bottom-0 right-0 w-40 h-40 rounded-tl-full opacity-10"
                    style={{ backgroundColor: benefit.accent }}
                />
            </div>
        </div>
    );
}
