import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { GradientSlideButton } from "./gradient-slide-button";
import { HyperspaceBackground } from "./hyperspace-background";

export function PremiumCTA() {
    const navigate = useNavigate();

    return (
        <section className="relative py-32 overflow-hidden bg-black">
            {/* Hyperspace Background */}
            <HyperspaceBackground
                starSpeed={1.03}
                starTrailOpacity={0.7}
                starColor="#10B981"
                starSize={0.8}
            />

            {/* Subtle gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 pointer-events-none" />

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
                    <GradientSlideButton
                        onClick={() => navigate('/auth')}
                        className="h-14 px-8 text-base font-medium rounded-full"
                        colorFrom="#10B981"
                        colorTo="#14F195"
                    >
                        Get Started Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </GradientSlideButton>

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
