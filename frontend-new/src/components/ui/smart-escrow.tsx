import { motion } from "framer-motion";
import { Shield, Check, Lock, Activity } from "lucide-react";


export function SmartEscrow() {
    return (
        <section className="py-24 sm:py-32 bg-[#020204] relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="container max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Content */}
                    <div className="order-2 lg:order-1 relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium uppercase tracking-wider mb-8">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Smart Contract Security</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold text-white mb-6 leading-[1.1] tracking-tight">
                            Your funds are <br />
                            <span className="text-white italic">protected</span> until <br />
                            you're satisfied.
                        </h2>

                        <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-xl">
                            Payments are held in a secure on-chain escrow. Funds are only released when you approve the completed work—no disputes, no chargebacks, no middleman.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 border-t border-white/5 pt-8">
                            {[
                                { value: "$24M+", label: "Volume Secured" },
                                { value: "1,200+", label: "Active Contracts" },
                                { value: "<1s", label: "Settlement Time" }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-3xl font-bold text-white font-heading mb-1">{stat.value}</div>
                                    <div className="text-sm text-zinc-500 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Visual - The HUD Card */}
                    <div className="order-1 lg:order-2 perspective-1000">
                        <motion.div
                            initial={{ transform: "rotateY(-10deg) rotateX(5deg)", opacity: 0 }}
                            whileInView={{ transform: "rotateY(0deg) rotateX(0deg)", opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Glow Behind */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 blur-2xl opacity-50 rounded-[2rem]" />

                            {/* Main Card */}
                            <div className="relative bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden group">
                                {/* Glossy Reflection */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/5 flex items-center justify-center">
                                            <Lock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-semibold text-lg">Escrow Contract</div>
                                            <div className="text-zinc-500 text-sm flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Active on Solana
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                        Status: Secured
                                    </div>
                                </div>

                                {/* Main Value Display */}
                                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-8 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                                    <div className="relative z-10">
                                        <div className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-2">Total Value Locked</div>
                                        <div className="text-5xl lg:text-6xl font-bold text-white mb-2 font-heading tracking-tight">
                                            ◎ 150.00
                                        </div>
                                        <div className="text-zinc-400 font-mono text-sm">≈ $22,500.00 USD</div>
                                    </div>
                                </div>

                                {/* Progress/Steps */}
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                                <Check className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <span className="text-zinc-300 font-medium">Funds Deposited</span>
                                        </div>
                                        <span className="text-white font-mono text-sm">100%</span>
                                    </div>

                                    <div className="flex items-center justify-between group/item relative">
                                        {/* Connecting Line */}
                                        <div className="absolute left-4 -top-5 bottom-5 w-px bg-white/10 -z-10" />

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-indigo-500/50 transition-colors">
                                                <Activity className="w-4 h-4 text-zinc-500 group-hover/item:text-indigo-400 transition-colors" />
                                            </div>
                                            <span className="text-zinc-300 font-medium">Work in Progress</span>
                                        </div>
                                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-[60%] bg-indigo-500 rounded-full animate-[shimmer_2s_infinite]" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between group/item opacity-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                                <div className="w-2 h-2 rounded-full bg-zinc-600" />
                                            </div>
                                            <span className="text-zinc-300 font-medium">Payment Release</span>
                                        </div>
                                        <span className="text-zinc-600 font-mono text-sm">Pending</span>
                                    </div>
                                </div>

                                {/* Bottom Info */}
                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                                    <div className="font-mono">TX: 8x...29f4</div>
                                    <div>Powered by Smart Contract</div>
                                </div>
                            </div>

                            {/* Floating decorative elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-8 top-20 bg-[#1a1a1e] border border-white/10 p-4 rounded-xl shadow-xl z-20 hidden lg:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <div className="text-sm font-medium text-white">Milestone 2 Approved</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
