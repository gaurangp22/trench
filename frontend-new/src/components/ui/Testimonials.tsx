import { Star } from "lucide-react"

const testimonials = [
    {
        name: "Alex Chen",
        title: "Smart Contract Developer",
        avatar: "A",
        rating: 5,
        body: "Finally, a platform that gets crypto. Got paid 2.5 SOL for an Anchor program audit—funds hit my wallet in seconds, not weeks.",
    },
    {
        name: "Sarah Mitchell",
        title: "Founder, DeFi Protocol",
        avatar: "S",
        rating: 5,
        body: "Hired three devs for our token launch. The escrow system gave us confidence—we only released payment when each milestone was verified.",
    },
    {
        name: "Marcus Webb",
        title: "Full-Stack Web3 Dev",
        avatar: "M",
        rating: 5,
        body: "Other platforms take 20%. TrenchJobs takes 2%. On a 500 SOL contract, that's the difference between paying rent and not.",
    },
    {
        name: "Elena Rodriguez",
        title: "NFT Artist & Designer",
        avatar: "E",
        rating: 5,
        body: "Sold my first generative art collection through here. Client funded escrow, I delivered the art, payment released automatically.",
    },
    {
        name: "James Park",
        title: "CEO, Solana Startup",
        avatar: "J",
        rating: 5,
        body: "We've hired 12 contractors through TrenchJobs. The talent pool is insane—people who actually understand MEV and Jito bundles.",
    },
    {
        name: "Nina Kowalski",
        title: "Rust Developer",
        avatar: "N",
        rating: 5,
        body: "Left Upwork after they froze my earnings for 3 weeks. Here, my reputation is on-chain, my payments are instant.",
    },
]

function TestimonialCard({ item }: { item: typeof testimonials[0] }) {
    return (
        <div className="relative flex h-full flex-col items-start justify-between rounded-2xl border border-white/10 bg-zinc-900/80 p-5 transition-colors hover:border-white/20">
            {/* Rating */}
            <div className="flex gap-0.5 mb-3">
                {Array(item.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
            </div>

            {/* Body */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                "{item.body}"
            </p>

            {/* Author */}
            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-white/5 w-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
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
        <section className="relative py-24 bg-[#020204]">
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Trusted by Builders</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Real people. Real payments.{" "}
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Real fast.
                    </span>
                </h2>

                <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                    Join thousands of freelancers and clients who've discovered a better way to work in Web3.
                </p>
            </div>

            {/* Static Grid - No animations */}
            <div className="container max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonials.map((item, index) => (
                        <TestimonialCard key={index} item={item} />
                    ))}
                </div>
            </div>
        </section>
    )
}
