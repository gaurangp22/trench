import { Hero } from "@/components/ui/Hero"
import { FeaturedGigs } from "@/components/ui/FeaturedGigs"
import { SmartEscrow } from "@/components/ui/SmartEscrow"
import { Categories } from "@/components/ui/Categories"
import { Features } from "@/components/ui/Features"
import { Benefits } from "@/components/ui/Benefits"
import { CallToAction } from "@/components/ui/CallToAction"
import { Testimonials } from "@/components/ui/Testimonials"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export function Home() {
    const [audienceType, setAudienceType] = useState<'client' | 'freelancer'>('client')
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const handlePrimaryCTA = () => {
        if (!isAuthenticated) {
            // Not logged in - go to auth page
            navigate('/auth?mode=signup')
        } else {
            // Logged in - navigate based on audience
            if (audienceType === 'client') {
                navigate('/client/post-job')
            } else {
                navigate('/offers')
            }
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
            subtitle: "The first professional marketplace powered by on-chain escrow. Post offers, fund securely, release payment when satisfied.",
            cta: isAuthenticated ? "Post an Offer" : "Get Started"
        },
        freelancer: {
            eyebrow: "Live on Solana Mainnet",
            main: "Get hired.",
            highlight: "Get paid in SOL.",
            subtitle: "Find real work, get paid instantly in SOL. No banks, no delays—just connect your wallet and start earning.",
            cta: isAuthenticated ? "Browse Offers" : "Get Started"
        }
    }

    const content = heroContent[audienceType]

    return (
        <div className="min-h-screen bg-[#020204] text-white antialiased">

            {/* 1. Premium Hero */}
            <Hero
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

            {/* 2. Featured Gigs by Category */}
            <FeaturedGigs />

            {/* 3. Bento Grid Categories */}
            <Categories />

            {/* 3. Smart Escrow Section */}
            <SmartEscrow />

            {/* 4. Interactive How It Works */}
            <Features />

            {/* 5. Benefits Cards */}
            <Benefits />

            {/* 6. Testimonials */}
            <Testimonials />

            {/* 7. Final Call To Action */}
            <CallToAction />
        </div>
    )
}
