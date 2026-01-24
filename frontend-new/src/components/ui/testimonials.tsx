import { Marquee } from "@/components/ui/marquee"
import { Star } from "lucide-react"

const testimonials = [
    {
        name: "Alex Chen",
        title: "Smart Contract Developer",
        avatar: "A",
        rating: 5,
        body: "Finally, a platform that gets crypto. Got paid 2.5 SOL for an Anchor program audit—funds hit my wallet in seconds, not weeks. No PayPal, no banks, just code and cash.",
    },
    {
        name: "Sarah Mitchell",
        title: "Founder, DeFi Protocol",
        avatar: "S",
        rating: 5,
        body: "Hired three devs for our token launch. The escrow system gave us confidence—we only released payment when each milestone was verified on-chain. Game changer.",
    },
    {
        name: "Marcus Webb",
        title: "Full-Stack Web3 Dev",
        avatar: "M",
        rating: 5,
        body: "Other platforms take 20%. TrenchJobs takes 2%. On a 500 SOL contract, that's the difference between paying rent and not. Math doesn't lie.",
    },
    {
        name: "Elena Rodriguez",
        title: "NFT Artist & Designer",
        avatar: "E",
        rating: 5,
        body: "Sold my first generative art collection through here. Client funded escrow, I delivered the art, payment released automatically. No chargebacks, no disputes.",
    },
    {
        name: "James Park",
        title: "CEO, Solana Startup",
        avatar: "J",
        rating: 5,
        body: "We've hired 12 contractors through TrenchJobs. The talent pool is insane—people who actually understand MEV, Jito bundles, and on-chain analytics.",
    },
    {
        name: "Nina Kowalski",
        title: "Rust & Move Developer",
        avatar: "N",
        rating: 5,
        body: "Left Upwork after they froze my earnings for 'review' for 3 weeks. Here, my reputation is on-chain, my payments are instant, and nobody can freeze my wallet.",
    },
    {
        name: "David Thompson",
        title: "DAO Treasury Lead",
        avatar: "D",
        rating: 5,
        body: "We pay contributors directly from our multisig. TrenchJobs escrow integrates perfectly with our workflow. Transparent, auditable, trustless.",
    },
    {
        name: "Priya Sharma",
        title: "Technical Writer",
        avatar: "P",
        rating: 5,
        body: "Wrote docs for three DeFi protocols last month. Getting paid in SOL means I'm not losing 5% to currency conversion fees. Small wins add up.",
    },
]

function TestimonialCard({ item }: { item: typeof testimonials[0] }) {
    return (
        <div className="relative flex h-full w-[340px] flex-col items-start justify-between rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-5 transition-all hover:border-white/20 hover:bg-zinc-900/80">
            {/* Rating */}
            <div className="flex gap-0.5 mb-3">
                {Array(item.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
            </div>

            {/* Body */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-4 line-clamp-4">
                "{item.body}"
            </p>

            {/* Author */}
            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-white/5 w-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                    {item.avatar}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                        {item.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                        {item.title}
                    </span>
                </div>
            </div>
        </div>
    )
}

export function Testimonials() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Trusted by Builders</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Real people. Real payments.{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Real fast.
                    </span>
                </h2>

                <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                    Join thousands of freelancers and clients who've discovered a better way to work in Web3.
                </p>
            </div>

            {/* Marquee */}
            <div className="relative">
                {/* Gradient overlays */}
                <div className="absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#020204] to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#020204] to-transparent pointer-events-none" />

                <Marquee className="py-4" direction="left" duration={20}>
                    {testimonials.slice(0, 4).map((item, index) => (
                        <TestimonialCard key={index} item={item} />
                    ))}
                </Marquee>

                <Marquee className="py-4" direction="right" duration={25}>
                    {testimonials.slice(4).map((item, index) => (
                        <TestimonialCard key={index} item={item} />
                    ))}
                </Marquee>
            </div>
        </section>
    )
}
