import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, CheckCircle, LockKey, Pulse, ArrowRight, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function SmartEscrow() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-32 bg-[#020204] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/8 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="container max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7 }}
                        className="order-2 lg:order-1"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8">
                            <ShieldCheck size={14} weight="duotone" />
                            <span>On-Chain Security</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-[1.1] tracking-tight">
                            Your funds are
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                                protected
                            </span>
                            {" "}until
                            <br />
                            you're satisfied.
                        </h2>

                        <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-xl">
                            Payments are held in audited smart contracts on Solana. Funds are only released when you approve—no disputes, no chargebacks, no middleman required.
                        </p>

                        {/* Stats Row */}
                        <div className="flex flex-wrap gap-8 lg:gap-12 pb-8 border-b border-white/[0.06]">
                            {[
                                { value: "$24M+", label: "Volume Secured" },
                                { value: "1,200+", label: "Active Contracts" },
                                { value: "<1s", label: "Settlement Time" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                                >
                                    <div className="text-3xl md:text-4xl font-bold text-white font-heading mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-zinc-500 font-medium">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="mt-8"
                        >
                            <a
                                href="/how-it-works"
                                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
                            >
                                <span className="font-medium">Learn how escrow works</span>
                                <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Right Visual - Premium Escrow Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="order-1 lg:order-2"
                    >
                        <div className="relative">
                            {/* Glow */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl rounded-[2rem]" />

                            {/* Main Card */}
                            <div className="relative bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] overflow-hidden">
                                {/* Top gradient line */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                                <div className="p-8 md:p-10">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <LockKey size={28} weight="duotone" className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold text-lg">Escrow Contract</div>
                                                <div className="text-zinc-500 text-sm flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    Active on Solana
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="text-emerald-400 text-xs font-semibold">Secured</span>
                                        </div>
                                    </div>

                                    {/* Main Value Display */}
                                    <div className="relative bg-gradient-to-br from-black/60 to-black/40 rounded-2xl p-8 border border-white/[0.04] mb-8">
                                        {/* Subtle shimmer */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

                                        <div className="relative text-center">
                                            <div className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-3">
                                                Total Value Locked
                                            </div>
                                            <div className="text-5xl md:text-6xl font-bold text-white mb-2 font-heading tracking-tight">
                                                ◎ 150.00
                                            </div>
                                            <div className="text-zinc-400 font-mono text-sm">
                                                ≈ $22,500.00 USD
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Steps */}
                                    <div className="space-y-4">
                                        <EscrowStep
                                            Icon={CheckCircle}
                                            title="Funds Deposited"
                                            status="complete"
                                            value="100%"
                                        />
                                        <EscrowStep
                                            Icon={Pulse}
                                            title="Work in Progress"
                                            status="active"
                                            progress={60}
                                        />
                                        <EscrowStep
                                            Icon={Sparkle}
                                            title="Payment Release"
                                            status="pending"
                                            value="Pending"
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-8 pt-6 border-t border-white/[0.04] flex items-center justify-between">
                                        <div className="font-mono text-xs text-zinc-600">
                                            TX: 8x4f...29f4
                                        </div>
                                        <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Powered by Smart Contract
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating notification */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="absolute -right-4 top-24 hidden lg:block"
                            >
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="bg-[#111113] border border-white/[0.08] p-4 rounded-xl shadow-2xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle size={16} weight="duotone" className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">Milestone Approved</div>
                                            <div className="text-xs text-zinc-500">Just now</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function EscrowStep({
    Icon,
    title,
    status,
    value,
    progress
}: {
    Icon: React.ElementType;
    title: string;
    status: 'complete' | 'active' | 'pending';
    value?: string;
    progress?: number;
}) {
    const colors = {
        complete: {
            bg: "bg-emerald-500/20",
            border: "border-emerald-500/30",
            icon: "text-emerald-400",
            text: "text-white"
        },
        active: {
            bg: "bg-white/5",
            border: "border-white/10",
            icon: "text-white",
            text: "text-white"
        },
        pending: {
            bg: "bg-white/[0.02]",
            border: "border-white/[0.05]",
            icon: "text-zinc-600",
            text: "text-zinc-500"
        }
    };

    const style = colors[status];

    return (
        <div className={cn(
            "flex items-center justify-between p-4 rounded-xl border transition-colors",
            style.bg,
            style.border
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center",
                    status === 'complete' ? "bg-emerald-500/30" : "bg-white/5"
                )}>
                    <Icon size={16} weight="duotone" className={style.icon} />
                </div>
                <span className={cn("font-medium", style.text)}>{title}</span>
            </div>

            {progress !== undefined ? (
                <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        />
                    </div>
                    <span className="text-sm font-mono text-zinc-400">{progress}%</span>
                </div>
            ) : (
                <span className={cn(
                    "text-sm font-mono",
                    status === 'complete' ? "text-white" : "text-zinc-600"
                )}>
                    {value}
                </span>
            )}
        </div>
    );
}
