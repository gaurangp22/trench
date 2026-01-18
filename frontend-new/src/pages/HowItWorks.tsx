import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileText, Users, ShieldCheck, CheckCircle2, UserCircle, Search, Briefcase, Wallet } from "lucide-react"

export function HowItWorks() {
    const [activeTab, setActiveTab] = useState<'client' | 'freelancer'>('client')
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
            <div className="container max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                        How <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">TrenchJobs</span> Works
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        The first freelance marketplace with trustless Solana escrow.
                        Safe, fast, and transparent for everyone.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center mb-16">
                    <div className="bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800">
                        <button
                            onClick={() => setActiveTab('client')}
                            className={`px-8 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'client'
                                    ? "bg-zinc-800 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            For Clients
                        </button>
                        <button
                            onClick={() => setActiveTab('freelancer')}
                            className={`px-8 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'freelancer'
                                    ? "bg-zinc-800 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            For Freelancers
                        </button>
                    </div>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 -z-10" />

                    {activeTab === 'client' ? (
                        <>
                            <StepCard
                                number={1}
                                icon={FileText}
                                title="Post Your Job"
                                description="Describe your project, set your budget in SOL, and define milestones."
                            />
                            <StepCard
                                number={2}
                                icon={Users}
                                title="Review Proposals"
                                description="Get proposals from skilled freelancers. Review portfolios and ratings."
                            />
                            <StepCard
                                number={3}
                                icon={ShieldCheck}
                                title="Fund Escrow & Hire"
                                description="Fund the on-chain escrow with SOL. Your funds are secure until you approve work."
                            />
                            <StepCard
                                number={4}
                                icon={CheckCircle2}
                                title="Approve & Release"
                                description="Review completed milestones and release payments directly to the freelancer."
                            />
                        </>
                    ) : (
                        <>
                            <StepCard
                                number={1}
                                icon={UserCircle}
                                title="Create Your Profile"
                                description="Showcase your skills, portfolio, and set your hourly rate in SOL."
                            />
                            <StepCard
                                number={2}
                                icon={Search}
                                title="Find Jobs"
                                description="Browse jobs matching your skills. Submit compelling proposals."
                            />
                            <StepCard
                                number={3}
                                icon={Briefcase}
                                title="Complete Work"
                                description="Work on milestones and submit deliverables when ready."
                            />
                            <StepCard
                                number={4}
                                icon={Wallet}
                                title="Get Paid in SOL"
                                description="Receive instant SOL payments directly to your wallet when work is approved."
                            />
                        </>
                    )}
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center p-10 bg-zinc-900/30 border border-zinc-800 rounded-2xl backdrop-blur-sm">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
                    <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                        Join the next generation of work. Secure, decentralized, and borderless.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-zinc-200"
                            onClick={() => navigate('/auth')}
                        >
                            Create Account
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-zinc-700 text-white hover:bg-zinc-800"
                            onClick={() => navigate(activeTab === 'client' ? '/talent' : '/jobs')}
                        >
                            {activeTab === 'client' ? 'Find Talent' : 'Find Work'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StepCard({ number, icon: Icon, title, description }: any) {
    return (
        <div className="relative p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/60 transition-all group">
            <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white z-10 shadow-lg">
                {number}
            </div>
            <div className="mb-4 w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-colors">
                <Icon className="w-6 h-6 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>
    )
}
