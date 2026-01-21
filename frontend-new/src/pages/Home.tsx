import { PremiumHero } from "@/components/ui/premium-hero"
import { SmartEscrow } from "@/components/ui/smart-escrow"
import { PremiumCategories } from "@/components/ui/premium-categories"
import { PremiumFeatures } from "@/components/ui/premium-features"
import { PremiumBenefits } from "@/components/ui/premium-benefits"
import { PremiumCTA } from "@/components/ui/premium-cta"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

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

    // Dynamic content based on audience
    const heroContent = {
        client: {
            eyebrow: "Live on Solana Mainnet",
            main: "Build your dream",
            highlight: "launch team.",
            subtitle: "The first professional marketplace powered by on-chain escrow. Post jobs, fund securely, release payment when satisfied.",
            cta: "Post a Job"
        },
        freelancer: {
            eyebrow: "Live on Solana Mainnet",
            main: "Get hired.",
            highlight: "Get paid in SOL.",
            subtitle: "Find real work, get paid instantly in SOL. No banks, no delays—just connect your wallet and start earning.",
            cta: "Browse Jobs"
        }
    }

    const content = heroContent[audienceType]

    return (
        <div className="min-h-screen bg-[#020204] text-white antialiased">

            {/* 1. Premium Hero */}
            <PremiumHero
                headline={{
                    eyebrow: content.eyebrow,
                    main: content.main,
                    highlight: content.highlight
                }}
                subtitle={content.subtitle}
                primaryCTA={{
                    text: content.cta,
                    onClick: handlePrimaryCTA
                }}
                secondaryCTA={{
                    text: 'How It Works',
                    onClick: handleSecondaryCTA
                }}
                audienceToggle={{
                    audienceType,
                    setAudienceType
                }}
            />

            {/* 2. Bento Grid Categories */}
            <PremiumCategories />

            {/* 3. Smart Escrow Section */}
            <SmartEscrow />

            {/* 4. Interactive How It Works */}
            <PremiumFeatures />

            {/* 5. Benefits Cards */}
            <PremiumBenefits />

            {/* 6. Final Call To Action */}
            <PremiumCTA />
        </div>
    )
}
