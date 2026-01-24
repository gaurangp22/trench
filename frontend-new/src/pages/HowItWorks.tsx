import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useInView } from "framer-motion"
import { GradientSlideButton } from "@/components/ui/gradient-slide-button"
import {
    FileText, Users, ShieldCheck, CheckCircle2, UserCircle, Search,
    Briefcase, Wallet, ArrowRight, Sparkles, Lock, Zap, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

const clientSteps = [
    {
        number: "01",
        icon: FileText,
        title: "Post Your Project",
        description: "Define your requirements, set milestones, and specify your budget in SOL. Our smart posting system helps you attract the right talent.",
        accent: "#3B82F6"
    },
    {
        number: "02",
        icon: Users,
        title: "Review Proposals",
        description: "Receive proposals from verified freelancers. Review portfolios, on-chain ratings, and work history to find your perfect match.",
        accent: "#8B5CF6"
    },
    {
        number: "03",
        icon: ShieldCheck,
        title: "Fund Escrow & Hire",
        description: "Deposit funds into our audited smart contract. Your SOL is cryptographically secured—only you control when it's released.",
        accent: "#F59E0B"
    },
    {
        number: "04",
        icon: CheckCircle2,
        title: "Approve & Release",
        description: "Review completed milestones and release payment with one click. Funds arrive in the freelancer's wallet instantly.",
        accent: "#10B981"
    }
]

const freelancerSteps = [
    {
        number: "01",
        icon: UserCircle,
        title: "Build Your Profile",
        description: "Showcase your skills and portfolio. Every completed project adds to your verifiable on-chain reputation.",
        accent: "#EC4899"
    },
    {
        number: "02",
        icon: Search,
        title: "Discover Opportunities",
        description: "Browse curated contracts filtered by your expertise. Get matched with projects that value your skills.",
        accent: "#6366F1"
    },
    {
        number: "03",
        icon: Briefcase,
        title: "Deliver Excellence",
        description: "Submit milestones with built-in progress tracking. Communicate directly with clients through secure channels.",
        accent: "#06B6D4"
    },
    {
        number: "04",
        icon: Wallet,
        title: "Get Paid Instantly",
        description: "Receive SOL directly to your wallet the moment work is approved. No holds, no minimums, no delays.",
        accent: "#22C55E"
    }
]

const features = [
    {
        icon: Lock,
        title: "Trustless Security",
        description: "Smart contracts hold funds until milestones are approved. No middleman required."
    },
    {
        icon: Zap,
        title: "Instant Payments",
        description: "Get paid in seconds, not days. Direct wallet-to-wallet transfers on Solana."
    },
    {
        icon: Globe,
        title: "Global Access",
        description: "Work with anyone, anywhere. All you need is a wallet—no borders, no limits."
    }
]

export function HowItWorks() {
    const [activeTab, setActiveTab] = useState<'client' | 'freelancer'>('client')
    const navigate = useNavigate()
    const heroRef = useRef<HTMLDivElement>(null)
    const isHeroInView = useInView(heroRef, { once: true })

    const steps = activeTab === 'client' ? clientSteps : freelancerSteps

    return (
        <div className="min-h-screen bg-[#020204] pt-24 pb-20">
            {/* Hero Section */}
            <section ref={heroRef} className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[150px]" />
                </div>

                <div className="container max-w-5xl mx-auto px-6 py-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-zinc-300">The Process</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-[1.1]">
                            How{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                                TrenchJobs
                            </span>
                            {" "}Works
                        </h1>

                        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
                            The first freelance marketplace with trustless Solana escrow.
                            Safe, fast, and transparent for everyone.
                        </p>

                        {/* Tab Switcher */}
                        <div className="inline-flex p-1.5 bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-full">
                            <button
                                onClick={() => setActiveTab('client')}
                                className={cn(
                                    "relative px-8 py-3 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === 'client'
                                        ? "text-white"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {activeTab === 'client' && (
                                    <motion.div
                                        layoutId="activeTabHIW"
                                        className="absolute inset-0 bg-white/10 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">I'm Hiring</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('freelancer')}
                                className={cn(
                                    "relative px-8 py-3 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === 'freelancer'
                                        ? "text-white"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {activeTab === 'freelancer' && (
                                    <motion.div
                                        layoutId="activeTabHIW"
                                        className="absolute inset-0 bg-white/10 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">I'm a Freelancer</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="container max-w-5xl mx-auto px-6 py-16">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid md:grid-cols-2 gap-6"
                >
                    {steps.map((step, index) => (
                        <StepCard key={step.number} step={step} index={index} />
                    ))}
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="container max-w-5xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-heading font-bold text-white mb-4">
                        Built Different
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        Everything traditional platforms got wrong, we got right.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} />
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container max-w-5xl mx-auto px-6 py-16">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-[#0c0c10] to-[#080809]">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />

                    <div className="relative p-10 md:p-16 text-center">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                            Ready to get started?
                        </h2>
                        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
                            Join the next generation of work. Secure, decentralized, and borderless.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <GradientSlideButton
                                className="h-14 px-8 text-base font-semibold rounded-xl"
                                colorFrom="#10B981"
                                colorTo="#14F195"
                                onClick={() => navigate('/auth')}
                            >
                                Create Account
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </GradientSlideButton>

                            <button
                                onClick={() => navigate(activeTab === 'client' ? '/talent' : '/jobs')}
                                className="h-14 px-8 text-base font-semibold rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all"
                            >
                                {activeTab === 'client' ? 'Find Talent' : 'Find Work'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function StepCard({ step, index }: { step: typeof clientSteps[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative p-8 rounded-2xl border border-white/[0.06] bg-[#0a0a0c] hover:border-white/15 transition-all duration-300"
        >
            {/* Number badge */}
            <div
                className="absolute -top-4 -left-2 px-3 py-1 rounded-full text-sm font-bold font-mono"
                style={{
                    backgroundColor: `${step.accent}20`,
                    color: step.accent,
                    border: `1px solid ${step.accent}40`
                }}
            >
                {step.number}
            </div>

            {/* Icon */}
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{
                    backgroundColor: `${step.accent}15`,
                    border: `1px solid ${step.accent}30`
                }}
            >
                <step.icon className="w-7 h-7" style={{ color: step.accent }} />
            </div>

            <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
            </h3>

            <p className="text-zinc-400 leading-relaxed">
                {step.description}
            </p>
        </motion.div>
    )
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group p-6 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03] transition-all text-center"
        >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-emerald-400" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
            </h3>

            <p className="text-sm text-zinc-500 leading-relaxed">
                {feature.description}
            </p>
        </motion.div>
    )
}
