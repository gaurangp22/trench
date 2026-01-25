import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, UsersThree, LockKey, CheckCircle, UserCircle, MagnifyingGlass, Briefcase, Coins, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const clientSteps = [
    {
        title: "Post Your Project",
        description: "Define your requirements with precision. Set milestones, budget in SOL, and timeline. Our AI helps you craft the perfect brief.",
        Icon: FileText,
        accent: "#3B82F6",
        visual: "post"
    },
    {
        title: "Curate Your Team",
        description: "Review verified proposals backed by on-chain reputation. See real work history, ratings, and past earnings transparency.",
        Icon: UsersThree,
        accent: "#8B5CF6",
        visual: "select"
    },
    {
        title: "Fund Securely",
        description: "Deposit funds into audited smart contract escrow. Your money is cryptographically secured—only you control the release.",
        Icon: LockKey,
        accent: "#F59E0B",
        visual: "escrow"
    },
    {
        title: "Approve & Pay",
        description: "Review deliverables at each milestone. Approve work and release payment instantly—funds arrive in seconds, not days.",
        Icon: CheckCircle,
        accent: "#10B981",
        visual: "release"
    }
];

const freelancerSteps = [
    {
        title: "Showcase Expertise",
        description: "Build your on-chain portfolio. Every completed project adds to your verifiable reputation that follows you everywhere.",
        Icon: UserCircle,
        accent: "#EC4899",
        visual: "profile"
    },
    {
        title: "Discover Opportunities",
        description: "Browse curated contracts filtered by your skills and rate. Get matched with projects that value your expertise.",
        Icon: MagnifyingGlass,
        accent: "#6366F1",
        visual: "search"
    },
    {
        title: "Deliver Excellence",
        description: "Submit milestones with built-in progress tracking. Communicate directly with clients through encrypted channels.",
        Icon: Briefcase,
        accent: "#06B6D4",
        visual: "work"
    },
    {
        title: "Get Paid Instantly",
        description: "Receive SOL directly to your wallet the moment work is approved. No holds, no minimums, no questions asked.",
        Icon: Coins,
        accent: "#22C55E",
        visual: "paid"
    }
];

export function Features() {
    const [activeTab, setActiveTab] = useState<'client' | 'freelancer'>('client');
    const containerRef = useRef<HTMLDivElement>(null);
    const steps = activeTab === 'client' ? clientSteps : freelancerSteps;

    return (
        <section className="py-32 bg-[#020204] relative overflow-hidden">
            {/* Background gradient - removed blur for performance */}

            <div className="container max-w-6xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="text-sm font-mono text-emerald-400 tracking-wider uppercase mb-4 block">
                        The Process
                    </span>
                    <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
                        Four steps to
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                            trustless work.
                        </span>
                    </h2>

                    {/* Toggle */}
                    <div className="inline-flex mt-8 p-1.5 bg-[#0a0a0c] border border-white/[0.06] rounded-full">
                        <button
                            onClick={() => setActiveTab('client')}
                            className={cn(
                                "relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer",
                                activeTab === 'client'
                                    ? "text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {activeTab === 'client' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/10 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">I'm Hiring</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('freelancer')}
                            className={cn(
                                "relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer",
                                activeTab === 'freelancer'
                                    ? "text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {activeTab === 'freelancer' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/10 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">I'm a Freelancer</span>
                        </button>
                    </div>
                </motion.div>

                {/* Timeline */}
                <div ref={containerRef} className="relative">
                    {/* Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8 lg:space-y-0"
                    >
                        {steps.map((step, index) => (
                            <TimelineStep
                                key={step.title}
                                step={step}
                                index={index}
                                isLeft={index % 2 === 0}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function TimelineStep({
    step,
    index,
    isLeft
}: {
    step: typeof clientSteps[0];
    index: number;
    isLeft: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div
            ref={ref}
            className={cn(
                "relative lg:grid lg:grid-cols-2 lg:gap-16 items-center",
                "py-8 lg:py-16"
            )}
        >
            {/* Timeline Node */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative"
                >
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center border-2"
                        style={{
                            backgroundColor: `${step.accent}15`,
                            borderColor: `${step.accent}40`
                        }}
                    >
                        <span
                            className="text-lg font-bold font-mono"
                            style={{ color: step.accent }}
                        >
                            {String(index + 1).padStart(2, '0')}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 }}
                className={cn(
                    "relative",
                    isLeft ? "lg:pr-20 lg:text-right" : "lg:col-start-2 lg:pl-20"
                )}
            >
                {/* Mobile number badge */}
                <div
                    className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center mb-4 border"
                    style={{
                        backgroundColor: `${step.accent}15`,
                        borderColor: `${step.accent}40`
                    }}
                >
                    <span className="text-sm font-bold font-mono" style={{ color: step.accent }}>
                        {String(index + 1).padStart(2, '0')}
                    </span>
                </div>

                <div
                    className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4",
                    )}
                    style={{
                        backgroundColor: `${step.accent}10`,
                        color: step.accent
                    }}
                >
                    <step.Icon size={14} weight="duotone" />
                    <span>Step {index + 1}</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {step.title}
                </h3>

                <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                    {step.description}
                </p>
            </motion.div>

            {/* Visual/Card side */}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? 50 : -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 }}
                className={cn(
                    "mt-8 lg:mt-0",
                    isLeft ? "lg:col-start-2 lg:pl-20" : "lg:pr-20 lg:row-start-1"
                )}
            >
                <StepVisual step={step} />
            </motion.div>
        </div>
    );
}

function StepVisual({ step }: { step: typeof clientSteps[0] }) {
    return (
        <div
            className="relative p-6 rounded-2xl border overflow-hidden group"
            style={{
                backgroundColor: `${step.accent}05`,
                borderColor: `${step.accent}15`
            }}
        >

            <div className="relative">
                {/* Icon */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                        backgroundColor: `${step.accent}15`,
                        border: `1px solid ${step.accent}30`
                    }}
                >
                    <step.Icon size={24} weight="duotone" style={{ color: step.accent }} />
                </div>

                {/* Simulated UI elements */}
                <div className="space-y-3">
                    <div className="h-3 bg-white/10 rounded-full w-3/4" />
                    <div className="h-3 bg-white/5 rounded-full w-full" />
                    <div className="h-3 bg-white/5 rounded-full w-2/3" />
                </div>

                {/* Action hint */}
                <div className="mt-6 flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity" style={{ color: step.accent }}>
                    <span className="font-medium">Learn more</span>
                    <CaretRight size={16} weight="bold" />
                </div>
            </div>
        </div>
    );
}
