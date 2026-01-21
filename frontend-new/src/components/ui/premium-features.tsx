import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Users, Lock, CheckCircle, User, Search, Briefcase, Coins, ArrowRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const features = {
    client: [
        {
            title: "Post Your Vision",
            description: "Describe your project requirements. Set a fixed price or hourly rate in SOL.",
            icon: FileText,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20"
        },
        {
            title: "Select Top Talent",
            description: "Review proposals, portfolios, and on-chain reputation scores.",
            icon: Users,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            border: "border-purple-400/20"
        },
        {
            title: "Secure Funding",
            description: "Deposit funds into a smart contract escrow. Money is safe until you approve.",
            icon: Lock,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20"
        },
        {
            title: "Approve & Release",
            description: "Review deliverables. Release payment instantly with zero friction.",
            icon: CheckCircle,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20"
        }
    ],
    freelancer: [
        {
            title: "Build Profile",
            description: "Showcase your skills and previous on-chain work history.",
            icon: User,
            color: "text-pink-400",
            bg: "bg-pink-400/10",
            border: "border-pink-400/20"
        },
        {
            title: "Find Contracts",
            description: "Browse curated jobs matching your expertise and rate expectations.",
            icon: Search,
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
            border: "border-indigo-400/20"
        },
        {
            title: "Deliver Work",
            description: "Submit milestones and track progress directly on the dashboard.",
            icon: Briefcase,
            color: "text-cyan-400",
            bg: "bg-cyan-400/10",
            border: "border-cyan-400/20"
        },
        {
            title: "Get Paid Instantly",
            description: "Receive SOL directly to your wallet. No platform hold periods.",
            icon: Coins,
            color: "text-green-400",
            bg: "bg-green-400/10",
            border: "border-green-400/20"
        }
    ]
};

export function PremiumFeatures() {
    const [activeTab, setActiveTab] = useState<'client' | 'freelancer'>('client');

    return (
        <section className="py-24 sm:py-32 bg-[#020204] relative">
            <div className="container max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-heading font-semibold text-white mb-6">
                        How it works
                    </h2>

                    {/* Premium Segmented Control */}
                    <div className="p-1 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full inline-flex relative">
                        {/* Sliding Background */}
                        <motion.div
                            className="absolute top-1 bottom-1 bg-white/10 rounded-full"
                            initial={false}
                            animate={{
                                x: activeTab === 'client' ? 0 : '100%',
                                width: '50%'
                            }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />

                        <button
                            onClick={() => setActiveTab('client')}
                            className={cn(
                                "relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-colors duration-300",
                                activeTab === 'client' ? "text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            For Clients
                        </button>
                        <button
                            onClick={() => setActiveTab('freelancer')}
                            className={cn(
                                "relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-colors duration-300",
                                activeTab === 'freelancer' ? "text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            For Freelancers
                        </button>
                    </div>
                </div>

                {/* Steps Display */}
                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="grid md:grid-cols-4 gap-8"
                        >
                            {features[activeTab].map((step, i) => (
                                <div key={i} className="relative group">
                                    {/* Step Number Badge */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0a0a0c] border border-white/10 flex items-center justify-center z-10 shadow-xl">
                                        <span className="text-xs font-bold text-zinc-500 font-mono">0{i + 1}</span>
                                    </div>

                                    {/* Card */}
                                    <div className="pt-12 p-6 h-full rounded-2xl bg-[#0a0a0c] border border-white/5 hover:border-white/10 transition-all duration-300 group-hover:translate-y-[-4px]">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300",
                                            step.bg,
                                            step.border,
                                            "border"
                                        )}>
                                            <step.icon className={cn("w-6 h-6", step.color)} />
                                        </div>

                                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-white/90">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Mobile Arrow */}
                                    {i < 3 && (
                                        <div className="md:hidden flex justify-center py-4 text-zinc-700">
                                            <ArrowRight className="w-5 h-5 rotate-90" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Integration/Wallet Hint */}
                <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <Wallet className="w-4 h-4" />
                        <span>Seamlessly integrated with top wallets</span>
                    </div>
                    <div className="flex items-center gap-8 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Simple text representation if SVGs are too complex, or reuse SVGs */}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#AB9FF2] rounded-full" />
                            <span className="text-sm font-medium text-white">Phantom</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#FC7227] rounded-full" />
                            <span className="text-sm font-medium text-white">Solflare</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#000] border border-white/20 rounded-full" />
                            <span className="text-sm font-medium text-white">Backpack</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
