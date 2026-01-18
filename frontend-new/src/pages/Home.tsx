import { ArrowRight, Shield, Zap, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Aurora from "@/components/ui/Aurora"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
}

export function Home() {
    const [audienceType, setAudienceType] = useState<'client' | 'freelancer'>('client')
    const navigate = useNavigate()

    const handlePrimaryCTA = () => {
        if (audienceType === 'client') {
            navigate('/client/post-job')
        } else {
            navigate('/jobs')
        }
    }

    const handleSecondaryCTA = () => {
        navigate('/how-it-works')
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

                {/* Aurora Background - Full Vibrant */}
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
                        blend={0.6}
                        amplitude={1.2}
                        speed={0.4}
                    />
                </div>

                {/* Subtle gradient for text readability - minimal overlay */}
                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0a0a]/70 via-transparent to-[#0a0a0a]/90" />

                {/* Content */}
                <div className="relative z-10 container max-w-5xl mx-auto px-6 py-32">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="text-center"
                    >
                        {/* Badge */}
                        <motion.div variants={fadeInUp} className="mb-8">
                            <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-800 rounded-full px-4 py-1.5 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                Now live on Solana Mainnet
                            </span>
                        </motion.div>

                        {/* Audience Toggle */}
                        <motion.div variants={fadeInUp} className="mb-8">
                            <div className="inline-flex items-center p-1 bg-zinc-900/80 rounded-full border border-zinc-800 backdrop-blur-sm">
                                <button
                                    onClick={() => setAudienceType('client')}
                                    className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${audienceType === 'client'
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    I'm a Client
                                </button>
                                <button
                                    onClick={() => setAudienceType('freelancer')}
                                    className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${audienceType === 'freelancer'
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    I'm a Freelancer
                                </button>
                            </div>
                        </motion.div>

                        {/* Headline - Changes based on audience */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white leading-[1.1] mb-8"
                        >
                            {audienceType === 'client' ? (
                                <>
                                    Hire talent.
                                    <br />
                                    <span className="text-zinc-400">Pay in crypto.</span>
                                </>
                            ) : (
                                <>
                                    Get hired.
                                    <br />
                                    <span className="text-zinc-400">Get paid in SOL.</span>
                                </>
                            )}
                        </motion.h1>

                        {/* Subheadline - Changes based on audience */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                        >
                            {audienceType === 'client' ? (
                                <>
                                    The first professional marketplace powered by on-chain escrow.
                                    Post jobs, fund securely, release payment when satisfied.
                                </>
                            ) : (
                                <>
                                    Find real work, get paid instantly in SOL.
                                    No banks, no delays—just connect your wallet and start earning.
                                </>
                            )}
                        </motion.p>

                        {/* CTAs - Changes based on audience */}
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                size="lg"
                                onClick={handlePrimaryCTA}
                                className="h-12 px-8 text-base font-medium bg-white text-black hover:bg-zinc-200 rounded-lg transition-all duration-200 shadow-lg shadow-white/10"
                            >
                                {audienceType === 'client' ? 'Post a Job' : 'Browse Jobs'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleSecondaryCTA}
                                className="h-12 px-8 text-base font-medium border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg transition-all duration-200"
                            >
                                How It Works
                            </Button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            variants={fadeInUp}
                            className="mt-20 pt-12 border-t border-zinc-800/50 grid grid-cols-2 md:grid-cols-4 gap-8"
                        >
                            <Stat value="$24M+" label="Volume" />
                            <Stat value="1,200+" label="Contracts" />
                            <Stat value="50K+" label="Talent" />
                            <Stat value="<1s" label="Settlement" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>


            {/* Platform Showcase */}
            <section className="py-32 bg-[#0a0a0a] relative overflow-hidden">
                {/* Subtle gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent" />

                <div className="container max-w-6xl mx-auto px-6 relative">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        {/* Left: Content */}
                        <div>
                            <p className="text-sm font-medium text-purple-400 mb-4">
                                Smart Escrow
                            </p>
                            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
                                Your funds are protected until you're satisfied.
                            </h2>
                            <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
                                Payments are held in a secure on-chain escrow. Funds are only released when you approve the completed work—no disputes, no chargebacks, no middleman.
                            </p>

                            {/* Simple stats row */}
                            <div className="flex gap-12">
                                <div>
                                    <div className="text-3xl font-semibold text-white">$24M+</div>
                                    <div className="text-sm text-zinc-500">Volume secured</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-semibold text-white">1,200+</div>
                                    <div className="text-sm text-zinc-500">Active contracts</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-semibold text-white">&lt;1s</div>
                                    <div className="text-sm text-zinc-500">Settlement</div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Escrow Card */}
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-transparent blur-3xl opacity-50" />

                            {/* Card */}
                            <div className="relative bg-[#111] rounded-2xl p-6 shadow-2xl shadow-black/50">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">Escrow Contract</div>
                                            <div className="text-xs text-zinc-500">Project Payment</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                        Active
                                    </div>
                                </div>

                                {/* Amount display */}
                                <div className="text-center py-8 border-y border-zinc-800/50">
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Value</div>
                                    <div className="text-5xl font-semibold text-white mb-1">
                                        <span className="text-purple-400">◎</span> 150.00
                                    </div>
                                    <div className="text-sm text-zinc-500">≈ $22,500 USD</div>
                                </div>

                                {/* Breakdown */}
                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-zinc-400">In Escrow</span>
                                        <span className="text-sm font-medium text-amber-400">◎ 100.00</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-zinc-400">Released</span>
                                        <span className="text-sm font-medium text-emerald-400">◎ 50.00</span>
                                    </div>

                                    {/* Progress */}
                                    <div className="pt-4">
                                        <div className="flex justify-between text-xs text-zinc-500 mb-2">
                                            <span>Progress</span>
                                            <span>33%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features - Simple 3-column */}
            <section className="py-24 bg-[#0a0a0a] border-t border-zinc-800/30">
                <div className="container max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12 md:gap-8">
                        <div>
                            <Zap className="w-8 h-8 text-amber-400 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Instant Settlement</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Payments settle in under 1 second via Solana. No banks, no delays.
                            </p>
                        </div>
                        <div>
                            <Globe className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Global by Default</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Work with anyone, anywhere. No borders, no KYC requirements.
                            </p>
                        </div>
                        <div>
                            <Shield className="w-8 h-8 text-purple-400 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Audited Security</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Smart contracts audited by leading security firms. Your funds are safe.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - Tabbed */}
            <HowItWorks />

            {/* Popular Categories */}
            <PopularCategories />

            {/* Why TrenchJobs */}
            <WhyTrenchJobs />

            {/* CTA Section */}
            <GetStartedCTA />
        </div>
    )
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-2xl md:text-3xl font-semibold text-white mb-1">{value}</div>
            <div className="text-sm text-zinc-500">{label}</div>
        </div>
    )
}

// useState imported at top of file
import { FileText, Users, Lock, CheckCircle, User, Search, Briefcase, Coins } from "lucide-react"

const clientSteps = [
    { icon: FileText, title: "Post Your Job", description: "Describe your project, set your budget in SOL, and define milestones." },
    { icon: Users, title: "Review Proposals", description: "Get proposals from skilled freelancers. Review portfolios and ratings." },
    { icon: Lock, title: "Fund Escrow", description: "Fund the on-chain escrow. Your funds are secure until you approve work." },
    { icon: CheckCircle, title: "Approve & Release", description: "Review completed milestones and release payments directly to the freelancer." },
]

const freelancerSteps = [
    { icon: User, title: "Create Profile", description: "Showcase your skills, portfolio, and set your hourly rate in SOL." },
    { icon: Search, title: "Find Jobs", description: "Browse jobs matching your skills. Submit compelling proposals." },
    { icon: Briefcase, title: "Complete Work", description: "Work on milestones and submit deliverables when ready." },
    { icon: Coins, title: "Get Paid", description: "Receive instant SOL payments directly to your wallet when work is approved." },
]

function HowItWorks() {
    const [activeTab, setActiveTab] = useState<'clients' | 'freelancers'>('clients')
    const steps = activeTab === 'clients' ? clientSteps : freelancerSteps

    return (
        <section className="py-24 md:py-32 bg-[#0a0a0a]">
            <div className="container max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-8">
                        How it works
                    </h2>

                    {/* Tabs */}
                    <div className="inline-flex items-center p-1 bg-zinc-900 rounded-full border border-zinc-800">
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all ${activeTab === 'clients'
                                ? 'bg-white text-black'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            For Clients
                        </button>
                        <button
                            onClick={() => setActiveTab('freelancers')}
                            className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all ${activeTab === 'freelancers'
                                ? 'bg-white text-black'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            For Freelancers
                        </button>
                    </div>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <div key={index} className="relative text-center group">
                            {/* Step number */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white z-10">
                                {index + 1}
                            </div>

                            {/* Card */}
                            <div className="pt-8 pb-6 px-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-all h-full">
                                {/* Icon */}
                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                                    <step.icon className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                                </div>

                                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

import { Link2, Monitor, Palette, PenTool, Megaphone, BarChart3 } from "lucide-react"

const categories = [
    { icon: Link2, name: "Blockchain & Web3", skills: "Solana, Smart Contracts, DeFi" },
    { icon: Monitor, name: "Web Development", skills: "React, Node.js, Full Stack" },
    { icon: Palette, name: "Design", skills: "UI/UX, Branding, Graphics" },
    { icon: PenTool, name: "Writing", skills: "Content, Technical, Copy" },
    { icon: Megaphone, name: "Marketing", skills: "SEO, Social Media, Growth" },
    { icon: BarChart3, name: "Data & Analytics", skills: "Analysis, ML, Visualization" },
]

import { Link } from "react-router-dom"

function PopularCategories() {
    return (
        <section className="py-24 md:py-32 bg-[#0a0a0a] border-t border-zinc-800/30">
            <div className="container max-w-5xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white text-center mb-12">
                    Popular categories
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            to={`/jobs?filter=${category.name === 'Web Development' ? 'Development' : category.name}`}
                            className="group p-6 bg-zinc-900/50 rounded-xl border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all text-center"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                                <category.icon className="w-7 h-7 text-zinc-400 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-base font-semibold text-white mb-1">{category.name}</h3>
                            <p className="text-xs text-zinc-500">{category.skills}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

import { ShieldCheck, Banknote, DollarSign, Globe2 } from "lucide-react"

const benefits = [
    {
        icon: ShieldCheck,
        title: "Trustless Escrow",
        description: "Funds are secured in on-chain Solana escrow. No middleman holding your money."
    },
    {
        icon: Banknote,
        title: "Instant Payments",
        description: "Get paid in seconds, not days. SOL transfers directly to your wallet."
    },
    {
        icon: DollarSign,
        title: "Low Fees",
        description: "Only 5% platform fee. Solana transaction costs are fractions of a cent."
    },
    {
        icon: Globe2,
        title: "Global Access",
        description: "No bank accounts needed. Work and get paid from anywhere with just a wallet."
    },
]

function WhyTrenchJobs() {
    return (
        <section className="py-24 md:py-32 bg-[#0a0a0a] border-t border-zinc-800/30">
            <div className="container max-w-5xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white text-center mb-12">
                    Why TrenchJobs?
                </h2>

                <div className="grid md:grid-cols-4 gap-4 md:gap-6">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-all text-center"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-zinc-800 flex items-center justify-center">
                                <benefit.icon className="w-7 h-7 text-purple-400" />
                            </div>
                            <h3 className="text-base font-semibold text-white mb-2">{benefit.title}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function GetStartedCTA() {
    const navigate = useNavigate()

    return (
        <section className="py-24 md:py-32 bg-[#0a0a0a] border-t border-zinc-800/30">
            <div className="container max-w-3xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
                    Ready to Get Started?
                </h2>
                <p className="text-lg text-zinc-400 mb-10">
                    Join thousands of freelancers and clients building the future of work.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                    <Button
                        size="lg"
                        onClick={() => navigate('/auth')}
                        className="h-12 px-8 text-base font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all"
                    >
                        Create Account
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/jobs')}
                        className="h-12 px-8 text-base font-medium border-purple-500/50 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                    >
                        Browse Jobs
                    </Button>
                </div>

                {/* Supported Wallets */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-sm text-zinc-500">Supported Wallets:</span>
                    <div className="flex items-center justify-center gap-6">
                        {/* Phantom */}
                        <div className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" viewBox="0 0 128 128" fill="none">
                                <circle cx="64" cy="64" r="64" fill="#AB9FF2" />
                                <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3057 14.4118 64.0026C13.936 87.4928 33.5465 107.667 57.2255 107.667H60.8344C81.3332 107.667 110.584 88.4501 110.584 64.9142Z" fill="url(#paint0_linear)" />
                                <path d="M77.8896 59.5065C77.8896 63.2054 74.8476 66.2052 71.0966 66.2052C67.3456 66.2052 64.3037 63.2054 64.3037 59.5065C64.3037 55.8076 67.3456 52.8079 71.0966 52.8079C74.8476 52.8079 77.8896 55.8076 77.8896 59.5065Z" fill="#FFFDF8" />
                                <path d="M52.1859 59.5065C52.1859 63.2054 49.144 66.2052 45.393 66.2052C41.642 66.2052 38.6 63.2054 38.6 59.5065C38.6 55.8076 41.642 52.8079 45.393 52.8079C49.144 52.8079 52.1859 55.8076 52.1859 59.5065Z" fill="#FFFDF8" />
                                <defs>
                                    <linearGradient id="paint0_linear" x1="62.4981" y1="107.667" x2="62.4981" y2="23" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#534BB1" />
                                        <stop offset="1" stopColor="#551BF9" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="text-sm font-medium">Phantom</span>
                        </div>

                        {/* Solflare */}
                        <div className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" viewBox="0 0 101 88" fill="none">
                                <path d="M100.48 69.3817L83.8068 86.3186C83.4444 86.6936 82.9388 86.9074 82.4058 86.9128H1.47845C1.24 86.9128 1.00627 86.8429 0.805699 86.7117C0.605127 86.5805 0.446448 86.3938 0.348506 86.174C0.250563 85.9542 0.217549 85.7111 0.253547 85.4727C0.289546 85.2343 0.39295 85.0113 0.551 84.8318L17.1863 67.8949C17.5509 67.5203 18.0585 67.3086 18.5926 67.3069H99.5207C99.7596 67.3069 99.9937 67.3777 100.195 67.5095C100.395 67.6414 100.554 67.8289 100.652 68.0493C100.749 68.2696 100.782 68.5131 100.746 68.7518C100.71 68.9905 100.606 69.2137 100.448 69.3929L100.48 69.3817Z" fill="url(#solflare_paint0_linear)" />
                                <path d="M83.8068 0.593983C83.4444 0.219027 82.9388 0.00524236 82.4058 0H1.47845C1.24 0 1.00627 0.0699178 0.805699 0.201117C0.605127 0.332317 0.446448 0.519017 0.348506 0.738797C0.250563 0.958577 0.217549 1.20169 0.253547 1.44009C0.289546 1.6785 0.39295 1.90151 0.551 2.08099L17.1863 19.0179C17.5509 19.3925 18.0585 19.6042 18.5926 19.6059H99.5207C99.7596 19.6059 99.9937 19.5351 100.195 19.4033C100.395 19.2715 100.554 19.0838 100.652 18.8635C100.749 18.6432 100.782 18.3997 100.746 18.161C100.71 17.9222 100.606 17.6991 100.448 17.5199L83.8068 0.593983Z" fill="url(#solflare_paint1_linear)" />
                                <path d="M0.551 43.6516C0.39295 43.8311 0.289546 44.0541 0.253547 44.2925C0.217549 44.5309 0.250563 44.774 0.348506 44.9938C0.446448 45.2136 0.605127 45.4003 0.805699 45.5315C1.00627 45.6627 1.24 45.7326 1.47845 45.7326H99.5207C99.7596 45.7326 99.9937 45.6618 100.195 45.53C100.395 45.3982 100.554 45.2105 100.652 44.9902C100.749 44.7699 100.782 44.5264 100.746 44.2877C100.71 44.049 100.606 43.8258 100.448 43.6466L83.8068 26.7097C83.4444 26.3347 82.9388 26.1209 82.4058 26.1155H18.5926C18.0585 26.1172 17.5509 26.329 17.1863 26.7035L0.551 43.6516Z" fill="url(#solflare_paint2_linear)" />
                                <defs>
                                    <linearGradient id="solflare_paint0_linear" x1="8.5287" y1="90.0973" x2="88.9933" y2="64.3118" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#00FFA3" />
                                        <stop offset="1" stopColor="#DC1FFF" />
                                    </linearGradient>
                                    <linearGradient id="solflare_paint1_linear" x1="34.5207" y1="-3.18538" x2="113.835" y2="22.8027" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#00FFA3" />
                                        <stop offset="1" stopColor="#DC1FFF" />
                                    </linearGradient>
                                    <linearGradient id="solflare_paint2_linear" x1="21.6587" y1="22.3847" x2="101.549" y2="48.1693" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#00FFA3" />
                                        <stop offset="1" stopColor="#DC1FFF" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="text-sm font-medium">Solflare</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
