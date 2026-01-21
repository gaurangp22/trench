import { ShieldCheck, Banknote, DollarSign, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

const benefits = [
    {
        icon: ShieldCheck,
        title: "Trustless Escrow",
        description: "Smart contracts hold funds until milestones are approved.",
        gradient: "from-blue-500/20 to-cyan-500/20",
        iconColor: "text-cyan-400",
        meteorColor: "#22d3ee"
    },
    {
        icon: Banknote,
        title: "Instant Settlement",
        description: "Get paid in seconds via Solana. No 3-5 day bank holds.",
        gradient: "from-green-500/20 to-emerald-500/20",
        iconColor: "text-emerald-400",
        meteorColor: "#34d399"
    },
    {
        icon: Globe2,
        title: "Global Access",
        description: "Work with anyone, anywhere. All you need is a wallet.",
        gradient: "from-purple-500/20 to-pink-500/20",
        iconColor: "text-pink-400",
        meteorColor: "#f472b6"
    },
    {
        icon: DollarSign,
        title: "Low Fees",
        description: "Just 5% platform fee. Save more of what you earn.",
        gradient: "from-amber-500/20 to-orange-500/20",
        iconColor: "text-amber-400",
        meteorColor: "#fbbf24"
    }
];

export function PremiumBenefits() {
    return (
        <section className="py-24 bg-[#0a0a0c] border-y border-white/5 relative overflow-hidden">
            {/* Background Mesh/Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

            <div className="container max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, i) => (
                        <div key={i} className="group relative p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">

                            {/* Meteor Effect in Background */}
                            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                                <MeteorEffect color={benefit.meteorColor} />
                            </div>

                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br relative z-10",
                                benefit.gradient
                            )}>
                                <benefit.icon className={cn("w-6 h-6", benefit.iconColor)} />
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors relative z-10">
                                {benefit.title}
                            </h3>
                            <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors relative z-10">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function MeteorEffect({ number = 10, color = "#ffffff" }: { number?: number, color?: string }) {
    return (
        <>
            {[...new Array(number || 5)].map((_, idx) => (
                <span
                    key={idx}
                    className={cn(
                        "animate-meteor absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
                        "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-transparent before:to-transparent"
                    )}
                    style={{
                        top: 0,
                        left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
                        animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
                        animationDuration: Math.floor(Math.random() * (8 - 2) + 2) + "s",
                        backgroundColor: color, // Head color
                        // We use a CSS variable or direct style for the tail gradient if we wanted to be perfectly dynamic, 
                        // but specifically setting the before element's gradient via style is tricky without styled-components.
                        // Instead, we trust the base CSS `meteor` animation and just tint the head.
                    }}
                />
            ))}
        </>
    );
}
