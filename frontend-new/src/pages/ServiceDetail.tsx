import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
    Loader2, ArrowLeft, Star, Clock, User,
    CheckCircle, ChevronDown, MessageSquare, ShoppingBag,
    Eye, Tag, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ServiceAPI, ServiceOrderAPI, type Service, type ServiceFAQ, type ServiceReview, type PackageTier } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

// Mock services for fallback (same as Services.tsx)
const MOCK_SERVICES: Service[] = [
    {
        id: "1",
        freelancer_id: "f1",
        title: "I will build a professional Solana dApp with React & Anchor",
        description: "Full-stack Solana development including smart contracts, wallet integration, and beautiful UI. I specialize in DeFi protocols, NFT marketplaces, and custom blockchain solutions.\n\nWhat you'll get:\n• Custom Solana smart contract (Anchor/Rust)\n• React frontend with wallet integration\n• Complete deployment guide\n• 30 days of support\n\nI have 5+ years of experience building blockchain applications and have worked with major DeFi protocols. My code is clean, well-documented, and follows best practices.",
        thumbnail_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
        gallery_urls: [
            "https://images.unsplash.com/photo-1642104704074-907c0698b98d?w=800&q=80",
            "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80"
        ],
        category: { id: 1, name: "Blockchain & Web3", slug: "blockchain-web3" },
        skills: [{ id: 1, name: "Solana" }, { id: 2, name: "Rust" }, { id: 3, name: "React" }, { id: 4, name: "Anchor" }],
        basic_price_sol: 2.5,
        basic_description: "Simple dApp with 1 smart contract function",
        basic_delivery_days: 7,
        basic_revisions: 2,
        standard_price_sol: 5,
        standard_description: "Full dApp with up to 5 contract functions",
        standard_delivery_days: 14,
        standard_revisions: 3,
        premium_price_sol: 12,
        premium_description: "Complex dApp with unlimited functions + admin panel",
        premium_delivery_days: 21,
        premium_revisions: 5,
        status: "active",
        visibility: "public",
        average_rating: 4.9,
        total_reviews: 47,
        views_count: 1243,
        orders_count: 89,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-20T10:00:00Z",
        profile: { display_name: "Alex Chen", avatar_url: "https://i.pravatar.cc/150?u=alex" },
        freelancer: { id: "f1", username: "solana_dev", display_name: "Alex Chen" }
    },
    {
        id: "2",
        freelancer_id: "f2",
        title: "I will design a stunning Web3 landing page in Figma",
        description: "Modern, clean, and conversion-focused landing page designs for crypto projects, DeFi platforms, and NFT collections. Includes responsive designs and design system.\n\nDeliverables:\n• High-fidelity Figma designs\n• Desktop & mobile versions\n• Component library\n• Developer handoff ready\n\nI've designed for 50+ Web3 projects and understand what converts in this space.",
        thumbnail_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
        gallery_urls: [
            "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
            "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80"
        ],
        category: { id: 2, name: "Design", slug: "design" },
        skills: [{ id: 5, name: "Figma" }, { id: 6, name: "UI/UX" }, { id: 7, name: "Web Design" }],
        basic_price_sol: 1.5,
        basic_description: "Single page design (desktop only)",
        basic_delivery_days: 3,
        basic_revisions: 2,
        standard_price_sol: 3,
        standard_description: "Full landing page (desktop + mobile)",
        standard_delivery_days: 5,
        standard_revisions: 3,
        premium_price_sol: 6,
        premium_description: "Landing page + 3 inner pages + design system",
        premium_delivery_days: 7,
        premium_revisions: 5,
        status: "active",
        visibility: "public",
        average_rating: 5.0,
        total_reviews: 128,
        views_count: 2891,
        orders_count: 215,
        created_at: "2024-01-10T10:00:00Z",
        updated_at: "2024-01-18T10:00:00Z",
        profile: { display_name: "Sarah Kim", avatar_url: "https://i.pravatar.cc/150?u=sarah" },
        freelancer: { id: "f2", username: "pixel_perfect", display_name: "Sarah Kim" }
    },
    {
        id: "3",
        freelancer_id: "f3",
        title: "I will audit your Solana smart contract for security vulnerabilities",
        description: "Comprehensive security audit for Anchor/Rust programs. I'll identify vulnerabilities, provide detailed reports, and suggest fixes. Former security researcher at major DeFi protocol.\n\nAudit includes:\n• Line-by-line code review\n• Common vulnerability checks\n• Gas optimization suggestions\n• Detailed PDF report\n• Follow-up consultation",
        thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
        category: { id: 1, name: "Blockchain & Web3", slug: "blockchain-web3" },
        skills: [{ id: 1, name: "Solana" }, { id: 2, name: "Rust" }, { id: 8, name: "Security" }, { id: 9, name: "Audit" }],
        basic_price_sol: 8,
        basic_description: "Basic audit for small contracts (<500 lines)",
        basic_delivery_days: 5,
        basic_revisions: 1,
        standard_price_sol: 15,
        standard_description: "Full audit for medium contracts (<2000 lines)",
        standard_delivery_days: 10,
        standard_revisions: 2,
        premium_price_sol: 30,
        premium_description: "Enterprise audit with ongoing support",
        premium_delivery_days: 14,
        premium_revisions: 3,
        status: "active",
        visibility: "public",
        average_rating: 5.0,
        total_reviews: 23,
        views_count: 567,
        orders_count: 31,
        created_at: "2024-01-12T10:00:00Z",
        updated_at: "2024-01-19T10:00:00Z",
        profile: { display_name: "Marcus Black", avatar_url: "https://i.pravatar.cc/150?u=marcus" },
        freelancer: { id: "f3", username: "security_guru", display_name: "Marcus Black" }
    },
    {
        id: "4",
        freelancer_id: "f4",
        title: "I will create custom NFT artwork and generative collections",
        description: "Unique digital art for your NFT project. I create hand-drawn illustrations, 3D renders, and generative art collections with trait variations. PFP collections my specialty.",
        thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
        category: { id: 2, name: "Design", slug: "design" },
        skills: [{ id: 10, name: "NFT Art" }, { id: 11, name: "Illustration" }, { id: 12, name: "Generative Art" }],
        basic_price_sol: 0.8,
        basic_description: "5 unique NFT artworks",
        basic_delivery_days: 2,
        basic_revisions: 2,
        standard_price_sol: 2,
        standard_description: "20 artworks with trait variations",
        standard_delivery_days: 5,
        standard_revisions: 3,
        premium_price_sol: 8,
        premium_description: "Full 10k collection with all traits",
        premium_delivery_days: 14,
        premium_revisions: 5,
        status: "active",
        visibility: "public",
        average_rating: 4.8,
        total_reviews: 312,
        views_count: 4521,
        orders_count: 456,
        created_at: "2024-01-08T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
        profile: { display_name: "Luna Arts", avatar_url: "https://i.pravatar.cc/150?u=luna" },
        freelancer: { id: "f4", username: "nft_artist", display_name: "Luna Arts" }
    },
    {
        id: "5",
        freelancer_id: "f5",
        title: "I will build a responsive React frontend with TailwindCSS",
        description: "Pixel-perfect implementation of your designs. Expertise in React, Next.js, TypeScript, and modern CSS. Performance optimized and accessibility compliant.",
        thumbnail_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        category: { id: 3, name: "Web Development", slug: "web-development" },
        skills: [{ id: 3, name: "React" }, { id: 13, name: "TypeScript" }, { id: 14, name: "TailwindCSS" }, { id: 15, name: "Next.js" }],
        basic_price_sol: 1.2,
        basic_description: "Single page implementation",
        basic_delivery_days: 3,
        basic_revisions: 2,
        standard_price_sol: 2.5,
        standard_description: "Multi-page website (up to 5 pages)",
        standard_delivery_days: 7,
        standard_revisions: 3,
        premium_price_sol: 5,
        premium_description: "Full web app with API integration",
        premium_delivery_days: 14,
        premium_revisions: 5,
        status: "active",
        visibility: "public",
        average_rating: 4.9,
        total_reviews: 89,
        views_count: 1876,
        orders_count: 134,
        created_at: "2024-01-14T10:00:00Z",
        updated_at: "2024-01-21T10:00:00Z",
        profile: { display_name: "Dev Master", avatar_url: "https://i.pravatar.cc/150?u=devmaster" },
        freelancer: { id: "f5", username: "react_ninja", display_name: "Dev Master" }
    },
    {
        id: "6",
        freelancer_id: "f6",
        title: "I will write engaging copy for your crypto project",
        description: "Compelling website copy, whitepaper content, and marketing materials for blockchain projects. I translate complex tech into engaging narratives that convert.",
        thumbnail_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
        category: { id: 4, name: "Marketing", slug: "marketing" },
        skills: [{ id: 16, name: "Copywriting" }, { id: 17, name: "Content" }, { id: 18, name: "Marketing" }],
        basic_price_sol: 0.5,
        basic_description: "Landing page copy (up to 500 words)",
        basic_delivery_days: 2,
        basic_revisions: 2,
        standard_price_sol: 1.2,
        standard_description: "Full website copy + taglines",
        standard_delivery_days: 4,
        standard_revisions: 3,
        premium_price_sol: 3,
        premium_description: "Complete brand messaging + whitepaper",
        premium_delivery_days: 7,
        premium_revisions: 5,
        status: "active",
        visibility: "public",
        average_rating: 4.7,
        total_reviews: 156,
        views_count: 2134,
        orders_count: 198,
        created_at: "2024-01-11T10:00:00Z",
        updated_at: "2024-01-16T10:00:00Z",
        profile: { display_name: "Word Smith", avatar_url: "https://i.pravatar.cc/150?u=wordsmith" },
        freelancer: { id: "f6", username: "crypto_writer", display_name: "Word Smith" }
    },
    {
        id: "7",
        freelancer_id: "f7",
        title: "I will develop a Telegram trading bot for Solana tokens",
        description: "Custom Telegram bots for trading, sniping, and portfolio tracking on Solana. Integration with Jupiter, Raydium, and other DEXs. Fast execution and reliable uptime.",
        thumbnail_url: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&q=80",
        category: { id: 1, name: "Blockchain & Web3", slug: "blockchain-web3" },
        skills: [{ id: 1, name: "Solana" }, { id: 19, name: "Python" }, { id: 20, name: "Trading Bot" }, { id: 21, name: "Telegram" }],
        basic_price_sol: 3,
        basic_description: "Basic trading bot with buy/sell",
        basic_delivery_days: 5,
        basic_revisions: 2,
        standard_price_sol: 6,
        standard_description: "Advanced bot with alerts & tracking",
        standard_delivery_days: 10,
        standard_revisions: 3,
        premium_price_sol: 15,
        premium_description: "Full trading suite with sniping",
        premium_delivery_days: 21,
        premium_revisions: 5,
        status: "active",
        visibility: "public",
        average_rating: 4.6,
        total_reviews: 34,
        views_count: 987,
        orders_count: 52,
        created_at: "2024-01-09T10:00:00Z",
        updated_at: "2024-01-18T10:00:00Z",
        profile: { display_name: "Bot Builder", avatar_url: "https://i.pravatar.cc/150?u=botbuilder" },
        freelancer: { id: "f7", username: "trading_bots", display_name: "Bot Builder" }
    },
    {
        id: "8",
        freelancer_id: "f8",
        title: "I will create a professional logo and brand identity",
        description: "Memorable logos and complete brand identity packages for Web3 projects. Includes logo variations, color palette, typography, and brand guidelines document.",
        thumbnail_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
        category: { id: 2, name: "Design", slug: "design" },
        skills: [{ id: 22, name: "Logo Design" }, { id: 23, name: "Branding" }, { id: 24, name: "Identity" }],
        basic_price_sol: 0.6,
        basic_description: "Logo design (3 concepts)",
        basic_delivery_days: 2,
        basic_revisions: 2,
        standard_price_sol: 1.5,
        standard_description: "Logo + color palette + typography",
        standard_delivery_days: 4,
        standard_revisions: 3,
        premium_price_sol: 4,
        premium_description: "Full brand identity kit",
        premium_delivery_days: 7,
        premium_revisions: 5,
        status: "active",
        visibility: "public",
        average_rating: 4.9,
        total_reviews: 267,
        views_count: 3456,
        orders_count: 342,
        created_at: "2024-01-07T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        profile: { display_name: "Brand Studio", avatar_url: "https://i.pravatar.cc/150?u=brandstudio" },
        freelancer: { id: "f8", username: "logo_master", display_name: "Brand Studio" }
    },
    {
        id: "9",
        freelancer_id: "f9",
        title: "I will set up and manage your Discord community server",
        description: "Complete Discord server setup with custom bots, roles, channels, and engagement strategies. Ongoing moderation and community management services available.",
        thumbnail_url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80",
        category: { id: 4, name: "Marketing", slug: "marketing" },
        skills: [{ id: 25, name: "Discord" }, { id: 26, name: "Community" }, { id: 27, name: "Moderation" }],
        basic_price_sol: 0.4,
        basic_description: "Basic server setup with roles",
        basic_delivery_days: 1,
        basic_revisions: 1,
        standard_price_sol: 1,
        standard_description: "Full setup with bots + channels",
        standard_delivery_days: 3,
        standard_revisions: 2,
        premium_price_sol: 2.5,
        premium_description: "Complete setup + 1 month moderation",
        premium_delivery_days: 7,
        premium_revisions: 3,
        status: "active",
        visibility: "public",
        average_rating: 4.8,
        total_reviews: 89,
        views_count: 1234,
        orders_count: 112,
        created_at: "2024-01-13T10:00:00Z",
        updated_at: "2024-01-20T10:00:00Z",
        profile: { display_name: "Community Pro", avatar_url: "https://i.pravatar.cc/150?u=communitypro" },
        freelancer: { id: "f9", username: "discord_mod", display_name: "Community Pro" }
    },
    {
        id: "10",
        freelancer_id: "f10",
        title: "I will build a complete NFT marketplace on Solana",
        description: "Full-featured NFT marketplace with minting, listing, bidding, and royalty support. Built with Metaplex standards. Includes admin dashboard and analytics.",
        thumbnail_url: "https://images.unsplash.com/photo-1642104704074-907c0698b98d?w=800&q=80",
        category: { id: 1, name: "Blockchain & Web3", slug: "blockchain-web3" },
        skills: [{ id: 1, name: "Solana" }, { id: 2, name: "Rust" }, { id: 3, name: "React" }, { id: 28, name: "Metaplex" }],
        basic_price_sol: 10,
        basic_description: "Basic marketplace (list/buy)",
        basic_delivery_days: 14,
        basic_revisions: 2,
        standard_price_sol: 25,
        standard_description: "Full marketplace with auctions",
        standard_delivery_days: 30,
        standard_revisions: 3,
        premium_price_sol: 50,
        premium_description: "Enterprise with analytics + admin",
        premium_delivery_days: 45,
        premium_revisions: 5,
        status: "active",
        visibility: "public",
        average_rating: 5.0,
        total_reviews: 12,
        views_count: 876,
        orders_count: 18,
        created_at: "2024-01-06T10:00:00Z",
        updated_at: "2024-01-14T10:00:00Z",
        profile: { display_name: "NFT Labs", avatar_url: "https://i.pravatar.cc/150?u=nftlabs" },
        freelancer: { id: "f10", username: "marketplace_dev", display_name: "NFT Labs" }
    },
    {
        id: "11",
        freelancer_id: "f11",
        title: "I will create animated explainer videos for your project",
        description: "Engaging motion graphics and animated videos that explain your product or protocol. Perfect for landing pages, social media, and investor presentations.",
        thumbnail_url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
        category: { id: 2, name: "Design", slug: "design" },
        skills: [{ id: 29, name: "Motion Graphics" }, { id: 30, name: "After Effects" }, { id: 31, name: "Animation" }],
        basic_price_sol: 2,
        basic_description: "30-second animation",
        basic_delivery_days: 5,
        basic_revisions: 2,
        standard_price_sol: 4,
        standard_description: "1-minute explainer video",
        standard_delivery_days: 10,
        standard_revisions: 3,
        premium_price_sol: 10,
        premium_description: "2-3 minute full production",
        premium_delivery_days: 21,
        premium_revisions: 5,
        status: "active",
        visibility: "public",
        average_rating: 4.9,
        total_reviews: 67,
        views_count: 1567,
        orders_count: 89,
        created_at: "2024-01-10T10:00:00Z",
        updated_at: "2024-01-19T10:00:00Z",
        profile: { display_name: "Motion Studio", avatar_url: "https://i.pravatar.cc/150?u=motionstudio" },
        freelancer: { id: "f11", username: "animator_pro", display_name: "Motion Studio" }
    },
    {
        id: "12",
        freelancer_id: "f12",
        title: "I will integrate Solana Pay into your e-commerce store",
        description: "Seamless crypto payment integration for Shopify, WooCommerce, or custom stores. Support for SOL and SPL tokens with instant confirmations and low fees.",
        thumbnail_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
        category: { id: 1, name: "Blockchain & Web3", slug: "blockchain-web3" },
        skills: [{ id: 1, name: "Solana" }, { id: 32, name: "Solana Pay" }, { id: 33, name: "E-commerce" }],
        basic_price_sol: 1.5,
        basic_description: "Basic integration (SOL only)",
        basic_delivery_days: 3,
        basic_revisions: 1,
        standard_price_sol: 3,
        standard_description: "SOL + SPL tokens support",
        standard_delivery_days: 5,
        standard_revisions: 2,
        premium_price_sol: 6,
        premium_description: "Full integration + admin dashboard",
        premium_delivery_days: 10,
        premium_revisions: 3,
        status: "active",
        visibility: "public",
        average_rating: 4.7,
        total_reviews: 45,
        views_count: 789,
        orders_count: 67,
        created_at: "2024-01-05T10:00:00Z",
        updated_at: "2024-01-12T10:00:00Z",
        profile: { display_name: "Pay Dev", avatar_url: "https://i.pravatar.cc/150?u=paydev" },
        freelancer: { id: "f12", username: "payment_integrator", display_name: "Pay Dev" }
    }
]

interface PackageInfo {
    tier: PackageTier
    name: string
    price?: number
    description?: string
    deliveryDays?: number
    revisions?: number
    color: string
}

export function ServiceDetail() {
    const { serviceId } = useParams<{ serviceId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [service, setService] = useState<Service | null>(null)
    const [faqs, setFaqs] = useState<ServiceFAQ[]>([])
    const [reviews, setReviews] = useState<ServiceReview[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPackage, setSelectedPackage] = useState<PackageTier>('basic')
    const [requirements, setRequirements] = useState('')
    const [ordering, setOrdering] = useState(false)
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
    const [activeImage, setActiveImage] = useState(0)

    useEffect(() => {
        if (serviceId) {
            loadService()
        }
    }, [serviceId])

    const loadService = async () => {
        if (!serviceId) return
        setLoading(true)
        try {
            const data = await ServiceAPI.getById(serviceId)
            if (data.service) {
                setService(data.service)
                setFaqs(data.faqs || [])
                setReviews(data.reviews || [])

                // Select first available package
                if (data.service.basic_price_sol) setSelectedPackage('basic')
                else if (data.service.standard_price_sol) setSelectedPackage('standard')
                else if (data.service.premium_price_sol) setSelectedPackage('premium')
            } else {
                // Fallback to mock data
                loadMockService()
            }
        } catch (error) {
            console.error("Failed to load service from API, using mock data:", error)
            loadMockService()
        } finally {
            setLoading(false)
        }
    }

    const loadMockService = () => {
        const mockService = MOCK_SERVICES.find(s => s.id === serviceId)
        if (mockService) {
            setService(mockService)
            // Mock FAQs for demo
            setFaqs([
                { id: "faq1", question: "What's included in this gig?", answer: "Everything mentioned in the package description. I'll also provide documentation and support during the delivery period.", service_id: serviceId || "", sort_order: 1, created_at: "2024-01-10T10:00:00Z" },
                { id: "faq2", question: "Can you customize this for my needs?", answer: "Absolutely! Contact me before ordering and we can discuss your specific requirements.", service_id: serviceId || "", sort_order: 2, created_at: "2024-01-10T10:00:00Z" },
                { id: "faq3", question: "What if I need revisions?", answer: "Revisions are included based on your package tier. Additional revisions can be purchased if needed.", service_id: serviceId || "", sort_order: 3, created_at: "2024-01-10T10:00:00Z" }
            ])
            // Mock reviews for demo
            setReviews([
                { id: "r1", rating: 5, review_text: "Excellent work! Delivered on time and exceeded expectations. Will definitely work with again.", created_at: "2024-01-18T10:00:00Z", reviewer: { id: "u1", username: "happy_client", display_name: "John D.", avatar_url: "https://i.pravatar.cc/150?u=john" }, service_id: serviceId || "", order_id: "o1", reviewer_id: "u1" },
                { id: "r2", rating: 5, review_text: "Very professional and responsive. The quality of work is outstanding.", created_at: "2024-01-15T10:00:00Z", reviewer: { id: "u2", username: "web3_startup", display_name: "Sarah M.", avatar_url: "https://i.pravatar.cc/150?u=sarahm" }, service_id: serviceId || "", order_id: "o2", reviewer_id: "u2" },
                { id: "r3", rating: 4, review_text: "Great communication and solid delivery. Would recommend!", created_at: "2024-01-12T10:00:00Z", reviewer: { id: "u3", username: "defi_builder", display_name: "Mike T.", avatar_url: "https://i.pravatar.cc/150?u=miket" }, service_id: serviceId || "", order_id: "o3", reviewer_id: "u3" }
            ])

            // Select first available package
            if (mockService.basic_price_sol) setSelectedPackage('basic')
            else if (mockService.standard_price_sol) setSelectedPackage('standard')
            else if (mockService.premium_price_sol) setSelectedPackage('premium')
        }
    }

    const getPackages = (): PackageInfo[] => {
        if (!service) return []
        const packages: PackageInfo[] = [
            {
                tier: 'basic' as PackageTier,
                name: 'Basic',
                price: service.basic_price_sol,
                description: service.basic_description,
                deliveryDays: service.basic_delivery_days,
                revisions: service.basic_revisions,
                color: 'zinc'
            },
            {
                tier: 'standard' as PackageTier,
                name: 'Standard',
                price: service.standard_price_sol,
                description: service.standard_description,
                deliveryDays: service.standard_delivery_days,
                revisions: service.standard_revisions,
                color: 'indigo'
            },
            {
                tier: 'premium' as PackageTier,
                name: 'Premium',
                price: service.premium_price_sol,
                description: service.premium_description,
                deliveryDays: service.premium_delivery_days,
                revisions: service.premium_revisions,
                color: 'violet'
            }
        ]
        return packages.filter(p => p.price != null && p.price > 0)
    }

    const handleOrder = async () => {
        if (!serviceId || !user) return

        if (user.role !== 'client') {
            alert('Only clients can place orders')
            return
        }

        setOrdering(true)
        try {
            const response = await ServiceOrderAPI.placeOrder(serviceId, {
                package_tier: selectedPackage,
                requirements: requirements || undefined
            })
            navigate(`/client/orders/${response.order.id}`)
        } catch (error) {
            console.error("Failed to place order:", error)
            alert("Failed to place order. Please try again.")
        } finally {
            setOrdering(false)
        }
    }

    const packages = getPackages()
    const currentPackage = packages.find(p => p.tier === selectedPackage) || packages[0]
    const allImages = service?.thumbnail_url
        ? [service.thumbnail_url, ...(service.gallery_urls || [])]
        : service?.gallery_urls || []

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
        )
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">Gig not found</h2>
                    <Link to="/services" className="text-indigo-400 hover:underline">
                        Browse gigs
                    </Link>
                </div>
            </div>
        )
    }

    const tags = service.skills?.map(s => s.name) || []

    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate('/services')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to gigs
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - WORK MAXIMIZED */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Large Gallery - Most Prominent */}
                        {allImages.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative"
                            >
                                <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 overflow-hidden relative group">
                                    <img
                                        src={allImages[activeImage]}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Category Badge Overlay */}
                                    {service.category && (
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1.5 text-sm font-medium bg-black/70 backdrop-blur-sm text-white rounded-lg border border-white/10">
                                                {service.category.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* View Count Overlay */}
                                    <div className="absolute top-4 right-4">
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-black/70 backdrop-blur-sm text-white rounded-lg border border-white/10">
                                            <Eye className="w-4 h-4" />
                                            {service.views_count || 0} views
                                        </span>
                                    </div>

                                    {/* Navigation Arrows */}
                                    {allImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setActiveImage(activeImage === 0 ? allImages.length - 1 : activeImage - 1)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setActiveImage(activeImage === allImages.length - 1 ? 0 : activeImage + 1)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}

                                    {/* Image Counter */}
                                    {allImages.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                            <span className="px-3 py-1 text-xs bg-black/70 backdrop-blur-sm text-white rounded-full">
                                                {activeImage + 1} / {allImages.length}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Strip */}
                                {allImages.length > 1 && (
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                        {allImages.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImage(i)}
                                                className={cn(
                                                    "w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all",
                                                    activeImage === i
                                                        ? "border-indigo-500 ring-2 ring-indigo-500/20"
                                                        : "border-white/10 opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Title & Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                {service.title}
                            </h1>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                {service.average_rating > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] rounded-lg">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-white font-medium">{service.average_rating.toFixed(1)}</span>
                                        <span className="text-zinc-500">({service.total_reviews})</span>
                                    </div>
                                )}
                                {service.orders_count > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] rounded-lg text-zinc-400">
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>{service.orders_count} orders</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {tags.map((tag: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-white/[0.04] text-zinc-400 rounded-lg border border-white/[0.06]"
                                        >
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Minimal Seller Info - Small */}
                            <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {service.profile?.avatar_url ? (
                                            <img
                                                src={service.profile.avatar_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[10px] font-bold text-zinc-400">
                                                {(service.profile?.display_name || 'A')[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-zinc-500">
                                        by <span className="text-zinc-400">@{service.freelancer?.username || 'creator'}</span>
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4">About This Gig</h2>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        </motion.div>

                        {/* FAQs */}
                        {faqs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4">FAQ</h2>
                                <div className="space-y-3">
                                    {faqs.map((faq) => (
                                        <div
                                            key={faq.id}
                                            className="border border-white/[0.06] rounded-xl overflow-hidden"
                                        >
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                                            >
                                                <span className="font-medium text-white">{faq.question}</span>
                                                <ChevronDown className={cn(
                                                    "w-4 h-4 text-zinc-400 transition-transform",
                                                    expandedFaq === faq.id && "rotate-180"
                                                )} />
                                            </button>
                                            {expandedFaq === faq.id && (
                                                <div className="px-4 pb-4 text-sm text-zinc-400">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Reviews ({reviews.length})
                                </h2>
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                                                    {review.reviewer?.avatar_url ? (
                                                        <img
                                                            src={review.reviewer.avatar_url}
                                                            alt=""
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-4 h-4 text-zinc-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-white text-sm">
                                                        {review.reviewer?.display_name || review.reviewer?.username}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "w-3 h-3",
                                                                    i < review.rating
                                                                        ? "text-amber-400 fill-amber-400"
                                                                        : "text-zinc-600"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.review_text && (
                                                <p className="text-sm text-zinc-400">{review.review_text}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar - Pricing Tiers */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="sticky top-8 space-y-4"
                        >
                            {/* Package Cards */}
                            {packages.length > 1 ? (
                                <div className="space-y-3">
                                    {packages.map((pkg) => {
                                        const isSelected = selectedPackage === pkg.tier
                                        const tierColors = {
                                            basic: { border: 'border-zinc-500/30', bg: 'bg-zinc-500/10', text: 'text-zinc-400', badge: 'bg-zinc-500/20 text-zinc-300' },
                                            standard: { border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
                                            premium: { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300' }
                                        }
                                        const colors = tierColors[pkg.tier]

                                        return (
                                            <button
                                                key={pkg.tier}
                                                onClick={() => setSelectedPackage(pkg.tier)}
                                                className={cn(
                                                    "w-full text-left rounded-2xl border-2 p-5 transition-all",
                                                    isSelected
                                                        ? `${colors.border} ${colors.bg}`
                                                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-lg", colors.badge)}>
                                                        {pkg.name}
                                                    </span>
                                                    <span className={cn("text-2xl font-bold", isSelected ? colors.text : "text-white")}>
                                                        {pkg.price} SOL
                                                    </span>
                                                </div>

                                                {pkg.description && (
                                                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                                                        {pkg.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                                    {pkg.deliveryDays && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {pkg.deliveryDays}d delivery
                                                        </span>
                                                    )}
                                                    {pkg.revisions != null && (
                                                        <span className="flex items-center gap-1">
                                                            <RefreshCw className="w-3.5 h-3.5" />
                                                            {pkg.revisions} revisions
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                /* Single Package Display */
                                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                                    <div className="flex items-baseline justify-between mb-3">
                                        <span className="text-3xl font-bold text-white">
                                            {currentPackage?.price} SOL
                                        </span>
                                        <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-lg">
                                            {currentPackage?.name}
                                        </span>
                                    </div>

                                    {currentPackage?.description && (
                                        <p className="text-sm text-zinc-400 mb-4">
                                            {currentPackage.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                                        {currentPackage?.deliveryDays && (
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {currentPackage.deliveryDays}d delivery
                                            </span>
                                        )}
                                        {currentPackage?.revisions != null && (
                                            <span className="flex items-center gap-1.5">
                                                <RefreshCw className="w-4 h-4" />
                                                {currentPackage.revisions} revisions
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Order Card */}
                            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
                                {/* Selected Package Summary */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Selected package</p>
                                        <p className="font-semibold text-white capitalize">{currentPackage?.name}</p>
                                    </div>
                                    <p className="text-2xl font-bold text-indigo-400">
                                        {currentPackage?.price} SOL
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="space-y-2 text-sm">
                                    {currentPackage?.deliveryDays && (
                                        <div className="flex items-center gap-3 text-zinc-300">
                                            <CheckCircle className="w-4 h-4 text-indigo-400" />
                                            {currentPackage.deliveryDays} day{currentPackage.deliveryDays > 1 ? 's' : ''} delivery
                                        </div>
                                    )}
                                    {currentPackage?.revisions != null && (
                                        <div className="flex items-center gap-3 text-zinc-300">
                                            <CheckCircle className="w-4 h-4 text-indigo-400" />
                                            {currentPackage.revisions} revision{currentPackage.revisions !== 1 ? 's' : ''} included
                                        </div>
                                    )}
                                </div>

                                {/* Requirements */}
                                {user?.role === 'client' && (
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">
                                            Requirements (optional)
                                        </label>
                                        <textarea
                                            value={requirements}
                                            onChange={(e) => setRequirements(e.target.value)}
                                            placeholder="Describe what you need..."
                                            rows={3}
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
                                        />
                                    </div>
                                )}

                                {/* Order Button */}
                                {user?.role === 'client' ? (
                                    <Button
                                        onClick={handleOrder}
                                        disabled={ordering}
                                        className="w-full h-12 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 font-semibold shadow-lg shadow-indigo-500/20"
                                    >
                                        {ordering ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingBag className="w-5 h-5 mr-2" />
                                                Order Now - {currentPackage?.price} SOL
                                            </>
                                        )}
                                    </Button>
                                ) : user?.role === 'freelancer' ? (
                                    <p className="text-sm text-zinc-500 text-center py-2">
                                        Switch to client mode to place orders
                                    </p>
                                ) : (
                                    <Link to="/auth/login">
                                        <Button className="w-full h-12 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 font-semibold shadow-lg shadow-indigo-500/20">
                                            Login to Order
                                        </Button>
                                    </Link>
                                )}

                                {/* Contact */}
                                <Button
                                    variant="outline"
                                    className="w-full h-10 rounded-xl border-white/10 text-zinc-300 hover:text-white hover:bg-white/5"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Contact Creator
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
