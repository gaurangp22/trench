import { useNavigate } from "react-router-dom";

import { ArrowRight, Sparkles } from "lucide-react";

export function PremiumCTA() {
    const navigate = useNavigate();

    return (
        <section className="relative py-32 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[#020204]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            </div>

            <div className="container relative z-10 max-w-4xl mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium mb-8">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Join the future of work</span>
                </div>

                <h2 className="text-4xl md:text-6xl font-heading font-semibold text-white mb-6 tracking-tight leading-tight">
                    Ready to launch your <br />
                    <span className="text-white">next big thing?</span>
                </h2>

                <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Whether you're building a protocol or designing a brand, TrenchJobs connects you with the best talent on Solana.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/auth')}
                        className="h-14 px-8 text-base font-medium bg-white text-black hover:bg-zinc-200 rounded-full transition-all flex items-center gap-2 group"
                    >
                        Get Started Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/jobs')}
                        className="h-14 px-8 text-base font-medium text-white border border-white/10 hover:bg-white/5 rounded-full transition-all"
                    >
                        Browse Opportunities
                    </button>
                </div>

                <p className="mt-8 text-sm text-zinc-600">
                    No credit card required • Instant wallet connection
                </p>
            </div>
        </section>
    );
}
